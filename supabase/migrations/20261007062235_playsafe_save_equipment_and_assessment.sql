-- 3단계 '저장'에서 시설정보·등록신청과 함께 기구정보를 한 트랜잭션으로 저장한다.
-- payload에 equipment 키가 있을 때만 기구를 교체하므로 2단계 '선택 확인' 호출은 기존 기구를 그대로 둔다.
-- 사진 경로가 비어 있는 기구는 이미 저장된 같은 기구의 사진을 유지한다(기구 행은 추가 후 수정되지 않는다).
-- 안전성평가 등록은 DB에 저장된 시설·기구를 그대로 쓰고 평가만 추가한다(submit_playsafe_assessment).

create or replace function app_private.save_playsafe_application(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(payload -> 'submitter' ->> 'name', ''));
  v_email text := lower(btrim(coalesce(payload -> 'submitter' ->> 'email', '')));
  info jsonb := coalesce(payload -> 'information', '{}'::jsonb);
  v_facility text := btrim(coalesce(payload -> 'information' ->> 'facilityName', ''));
  v_equipment jsonb := payload -> 'equipment';
  v_status text;
  v_next_status text;
  v_registration_id uuid;
  pending_count integer;
  all_yes boolean;
begin
  if v_name = '' or v_email = '' then raise exception 'submitter_required'; end if;
  if coalesce(payload ->> 'consentAt', '') = '' then raise exception 'consent_required'; end if;
  if v_facility = '' then raise exception 'facility_name_required'; end if;
  if jsonb_array_length(coalesce(payload -> 'facilityPhotos', '[]'::jsonb)) > 2 then
    raise exception 'facility_photo_count_invalid';
  end if;

  select bool_and(coalesce(item ->> 'answer', '') = 'yes') into all_yes
  from jsonb_array_elements(coalesce(payload -> 'answers', '[]'::jsonb)) as item;
  if all_yes is null then raise exception 'eligibility_required'; end if;
  v_next_status := case when all_yes then 'registered' else 'not_target' end;

  if v_equipment is not null then
    if not all_yes then raise exception 'not_eligible'; end if;
    if jsonb_typeof(v_equipment) <> 'array' or jsonb_array_length(v_equipment) < 1 then
      raise exception 'equipment_count_invalid';
    end if;
  end if;

  if coalesce(payload ->> 'id', '') <> '' then
    select r.id, r.status into v_registration_id, v_status
    from public.playsafe_registrations r
    where r.id = (payload ->> 'id')::uuid
      and r.submitter_email = v_email
      and r.submitter_name = v_name
    for update;
    if v_registration_id is null then raise exception 'registration_not_found'; end if;
  else
    select r.id, r.status into v_registration_id, v_status
    from public.playsafe_registrations r
    where r.submitter_email = v_email
      and r.submitter_name = v_name
      and r.facility_name = v_facility
    for update;
  end if;

  if v_registration_id is not null then
    if v_status not in ('registered', 'not_target') then raise exception 'registration_has_assessment'; end if;
    begin
      update public.playsafe_registrations set
        status = v_next_status,
        manager_name = coalesce(info ->> 'managerName', ''),
        phone = coalesce(info ->> 'phone', ''),
        email = coalesce(info ->> 'email', ''),
        facility_name = v_facility,
        facility_no = coalesce(info ->> 'facilityNo', ''),
        place = coalesce(info ->> 'place', ''),
        place_etc = coalesce(info ->> 'placeEtc', ''),
        postcode = coalesce(info ->> 'postcode', ''),
        address = coalesce(info ->> 'address', ''),
        detail_address = coalesce(info ->> 'detailAddress', ''),
        water = coalesce(info ->> 'water', ''),
        indoor = coalesce(info ->> 'indoor', ''),
        eligibility_answers = coalesce(payload -> 'answers', '[]'::jsonb),
        eligibility_version = coalesce(payload ->> 'eligibilityVersion', 'v1'),
        all_eligible = all_yes,
        consent_at = (payload ->> 'consentAt')::timestamptz
      where id = v_registration_id;
    exception when unique_violation then
      raise exception 'submitter_key_conflict';
    end;
  else
    select count(*) into pending_count
    from public.playsafe_registrations
    where submitter_email = v_email and status in ('registered', 'not_target');
    if pending_count >= 10 then raise exception 'too_many_pending_registrations'; end if;
    insert into public.playsafe_registrations (
      status, submitter_name, submitter_email, manager_name, phone, email, facility_name, facility_no,
      place, place_etc, postcode, address, detail_address, water, indoor, eligibility_answers,
      eligibility_version, all_eligible, consent_at
    ) values (
      v_next_status, v_name, v_email,
      coalesce(info ->> 'managerName', ''), coalesce(info ->> 'phone', ''), coalesce(info ->> 'email', ''),
      v_facility, coalesce(info ->> 'facilityNo', ''), coalesce(info ->> 'place', ''),
      coalesce(info ->> 'placeEtc', ''), coalesce(info ->> 'postcode', ''), coalesce(info ->> 'address', ''),
      coalesce(info ->> 'detailAddress', ''), coalesce(info ->> 'water', ''), coalesce(info ->> 'indoor', ''),
      coalesce(payload -> 'answers', '[]'::jsonb), coalesce(payload ->> 'eligibilityVersion', 'v1'),
      all_yes, (payload ->> 'consentAt')::timestamptz
    ) returning id into v_registration_id;
  end if;

  delete from public.playsafe_registration_photos where registration_id = v_registration_id;
  begin
    insert into public.playsafe_registration_photos (
      id, registration_id, slot, photo_path, thumb_path, bytes, mime_type
    )
    select
      (photo ->> 'id')::uuid, v_registration_id, (photo ->> 'slot')::smallint, photo ->> 'photoPath',
      nullif(photo ->> 'thumbPath', ''), (photo ->> 'bytes')::integer, photo ->> 'mimeType'
    from jsonb_array_elements(coalesce(payload -> 'facilityPhotos', '[]'::jsonb)) photo;
  exception when unique_violation then
    raise exception 'facility_photo_conflict';
  end;

  if v_next_status = 'not_target' then
    delete from public.playsafe_registration_equipment where registration_id = v_registration_id;
  elsif v_equipment is not null then
    if exists (
      select 1
      from public.playsafe_registration_equipment e
      join jsonb_array_elements(v_equipment) item on e.id = (item ->> 'id')::uuid
      where e.registration_id <> v_registration_id
    ) then
      raise exception 'equipment_id_conflict';
    end if;

    delete from public.playsafe_registration_equipment e
    where e.registration_id = v_registration_id
      and not exists (
        select 1 from jsonb_array_elements(v_equipment) item where (item ->> 'id')::uuid = e.id
      );

    begin
      insert into public.playsafe_registration_equipment as e (
        id, registration_id, type_code, type_label, installed_on, memo, photo_path, thumb_path, sort_order
      )
      select
        (item ->> 'id')::uuid, v_registration_id, coalesce(item ->> 'typeCode', ''), item ->> 'type',
        nullif(item ->> 'date', '')::date, coalesce(item ->> 'memo', ''), nullif(item ->> 'photoPath', ''),
        nullif(item ->> 'thumbPath', ''), ordinality::integer
      from jsonb_array_elements(v_equipment) with ordinality as t(item, ordinality)
      on conflict (id) do update set
        type_code = excluded.type_code,
        type_label = excluded.type_label,
        installed_on = excluded.installed_on,
        memo = excluded.memo,
        sort_order = excluded.sort_order,
        photo_path = coalesce(excluded.photo_path, e.photo_path),
        thumb_path = coalesce(excluded.thumb_path, e.thumb_path);
    exception when unique_violation then
      raise exception 'equipment_id_conflict';
    end;
  end if;

  return jsonb_build_object(
    'registrationId', v_registration_id,
    'registrationRevision', (select r.revision from public.playsafe_registrations r where r.id = v_registration_id),
    'status', v_next_status
  );
end;
$$;

create or replace function app_private.submit_playsafe_assessment(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(payload -> 'submitter' ->> 'name', ''));
  v_email text := lower(btrim(coalesce(payload -> 'submitter' ->> 'email', '')));
  v_submission uuid := nullif(payload ->> 'submissionId', '')::uuid;
  checklist jsonb := coalesce(payload -> 'checklist', '{}'::jsonb);
  v_registration_id uuid;
  v_status text;
  v_all_eligible boolean;
  v_assessment_id uuid;
  equipment_count integer;
  missing integer;
  answer_count integer;
  invalid_photos integer;
begin
  if v_submission is null then raise exception 'submission_required'; end if;
  if v_name = '' or v_email = '' then raise exception 'submitter_required'; end if;
  if coalesce(payload ->> 'id', '') = '' then raise exception 'registration_not_found'; end if;
  if coalesce(checklist ->> 'version', '') <> 'v1' then raise exception 'checklist_version_mismatch'; end if;

  select a.registration_id into v_registration_id
  from public.playsafe_assessments a
  where a.submit_request_id = v_submission;
  if v_registration_id is not null then
    return jsonb_build_object('registrationId', v_registration_id, 'idempotent', true);
  end if;

  select r.id, r.status, r.all_eligible into v_registration_id, v_status, v_all_eligible
  from public.playsafe_registrations r
  where r.id = (payload ->> 'id')::uuid
    and r.submitter_email = v_email
    and r.submitter_name = v_name
  for update;
  if v_registration_id is null then raise exception 'registration_not_found'; end if;
  if v_status <> 'registered' then raise exception 'registration_not_editable'; end if;
  if v_all_eligible is not true then raise exception 'not_eligible'; end if;

  select count(*) into equipment_count
  from public.playsafe_registration_equipment
  where registration_id = v_registration_id;
  if equipment_count < 1 then raise exception 'equipment_count_invalid'; end if;

  answer_count := jsonb_array_length(coalesce(checklist -> 'answers', '[]'::jsonb));
  select count(*) into missing
  from public.playsafe_checklist_template_items t
  where t.template_version = 'v1'
    and not exists (
      select 1
      from jsonb_array_elements(coalesce(checklist -> 'answers', '[]'::jsonb)) item
      where item ->> 'itemCode' = t.item_code
        and item ->> 'status' in ('risk_found', 'no_risk', 'not_applicable')
    );
  if missing > 0 or answer_count <> (
    select count(*) from public.playsafe_checklist_template_items where template_version = 'v1'
  ) then
    raise exception 'unrecorded_items';
  end if;

  select count(*) into invalid_photos
  from jsonb_array_elements(coalesce(checklist -> 'photos', '[]'::jsonb)) photo
  where not exists (
    select 1
    from jsonb_array_elements(checklist -> 'answers') item
    where item ->> 'itemCode' = photo ->> 'itemCode' and item ->> 'status' = 'risk_found'
  );
  if invalid_photos > 0 then raise exception 'photo_item_invalid'; end if;

  update public.playsafe_registrations
  set status = 'submitted', submitted_at = now()
  where id = v_registration_id;

  insert into public.playsafe_assessments (
    registration_id, status, checklist_version, assessor, eval_date, submit_request_id, submitted_at
  ) values (
    v_registration_id, 'submitted', 'v1', left(coalesce(checklist ->> 'assessor', ''), 100),
    nullif(checklist ->> 'evalDate', '')::date, v_submission, now()
  ) returning id into v_assessment_id;

  insert into public.playsafe_assessment_answers (assessment_id, item_code, status, memo)
  select v_assessment_id, item ->> 'itemCode', item ->> 'status', left(coalesce(item ->> 'memo', ''), 2000)
  from jsonb_array_elements(checklist -> 'answers') item;

  insert into public.playsafe_assessment_photos (
    id, assessment_id, item_code, slot, storage_path, thumb_path, bytes, mime_type, status
  )
  select
    (photo ->> 'id')::uuid, v_assessment_id, photo ->> 'itemCode', (photo ->> 'slot')::smallint,
    photo ->> 'storagePath', nullif(photo ->> 'thumbPath', ''), (photo ->> 'bytes')::integer,
    photo ->> 'mimeType', 'attached'
  from jsonb_array_elements(coalesce(checklist -> 'photos', '[]'::jsonb)) photo;

  return jsonb_build_object(
    'registrationId', v_registration_id,
    'assessmentId', v_assessment_id,
    'idempotent', false
  );
end;
$$;

create or replace function public.submit_playsafe_assessment(payload jsonb)
returns jsonb language sql security definer set search_path = ''
as $$ select app_private.submit_playsafe_assessment(payload); $$;

revoke all on function app_private.submit_playsafe_assessment(jsonb) from public, anon, authenticated;
revoke all on function public.submit_playsafe_assessment(jsonb) from public, anon, authenticated;
grant execute on function public.submit_playsafe_assessment(jsonb) to service_role;
