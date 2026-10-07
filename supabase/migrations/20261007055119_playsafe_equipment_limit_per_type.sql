-- 등록수량은 기구유형당 최대 10대, 유형은 최대 5개이므로 시설당 놀이기구 상한을 50대(5 × 10)로 올린다.

create or replace function app_private.submit_playsafe_registration(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(payload -> 'submitter' ->> 'name', ''));
  v_email text := lower(btrim(coalesce(payload -> 'submitter' ->> 'email', '')));
  v_submission uuid := nullif(payload ->> 'submissionId', '')::uuid;
  info jsonb := coalesce(payload -> 'information', '{}'::jsonb);
  checklist jsonb := coalesce(payload -> 'checklist', '{}'::jsonb);
  v_facility text := btrim(coalesce(payload -> 'information' ->> 'facilityName', ''));
  v_status text;
  v_registration_id uuid;
  v_assessment_id uuid;
  equipment_count integer;
  all_yes boolean;
  missing integer;
  answer_count integer;
  invalid_photos integer;
begin
  if v_submission is null then raise exception 'submission_required'; end if;
  if v_name = '' or v_email = '' then raise exception 'submitter_required'; end if;
  if coalesce(payload ->> 'consentAt', '') = '' then raise exception 'consent_required'; end if;
  if coalesce(checklist ->> 'version', '') <> 'v1' then raise exception 'checklist_version_mismatch'; end if;
  if v_facility = '' then raise exception 'facility_name_required'; end if;

  select a.registration_id into v_registration_id
  from public.playsafe_assessments a
  where a.submit_request_id = v_submission;
  if v_registration_id is not null then
    return jsonb_build_object('registrationId', v_registration_id, 'idempotent', true);
  end if;

  select bool_and(coalesce(item ->> 'answer', '') = 'yes') into all_yes
  from jsonb_array_elements(coalesce(payload -> 'answers', '[]'::jsonb)) as item;
  if all_yes is not true then raise exception 'not_eligible'; end if;

  equipment_count := jsonb_array_length(coalesce(payload -> 'equipment', '[]'::jsonb));
  if equipment_count < 1 or equipment_count > 50 then raise exception 'equipment_count_invalid'; end if;

  if jsonb_array_length(coalesce(payload -> 'facilityPhotos', '[]'::jsonb)) > 2 then
    raise exception 'facility_photo_count_invalid';
  end if;

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

  if coalesce(payload ->> 'id', '') <> '' then
    select r.id, r.status into v_registration_id, v_status
    from public.playsafe_registrations r
    where r.id = (payload ->> 'id')::uuid
      and r.submitter_email = v_email
      and r.submitter_name = v_name
    for update;
  end if;
  if v_registration_id is null then
    select r.id, r.status into v_registration_id, v_status
    from public.playsafe_registrations r
    where r.submitter_email = v_email
      and r.submitter_name = v_name
      and r.facility_name = v_facility
    for update;
  end if;
  if v_registration_id is not null and v_status not in ('registered', 'not_target') then
    raise exception 'registration_not_editable';
  end if;

  begin
    if v_registration_id is not null then
      update public.playsafe_registrations set
        status = 'submitted',
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
        all_eligible = true,
        consent_at = (payload ->> 'consentAt')::timestamptz,
        submitted_at = now()
      where id = v_registration_id;
    else
      insert into public.playsafe_registrations (
        status, submitter_name, submitter_email, manager_name, phone, email, facility_name, facility_no,
        place, place_etc, postcode, address, detail_address, water, indoor, eligibility_answers,
        eligibility_version, all_eligible, consent_at, submitted_at
      ) values (
        'submitted', v_name, v_email,
        coalesce(info ->> 'managerName', ''), coalesce(info ->> 'phone', ''), coalesce(info ->> 'email', ''),
        v_facility, coalesce(info ->> 'facilityNo', ''), coalesce(info ->> 'place', ''),
        coalesce(info ->> 'placeEtc', ''), coalesce(info ->> 'postcode', ''), coalesce(info ->> 'address', ''),
        coalesce(info ->> 'detailAddress', ''), coalesce(info ->> 'water', ''), coalesce(info ->> 'indoor', ''),
        coalesce(payload -> 'answers', '[]'::jsonb), coalesce(payload ->> 'eligibilityVersion', 'v1'),
        true, (payload ->> 'consentAt')::timestamptz, now()
      ) returning id into v_registration_id;
    end if;
  exception when unique_violation then
    raise exception 'submitter_key_conflict';
  end;

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

  delete from public.playsafe_registration_equipment where registration_id = v_registration_id;
  begin
    insert into public.playsafe_registration_equipment (
      id, registration_id, type_code, type_label, installed_on, memo, photo_path, thumb_path, sort_order
    )
    select
      (item ->> 'id')::uuid, v_registration_id, coalesce(item ->> 'typeCode', ''), item ->> 'type',
      nullif(item ->> 'date', '')::date, coalesce(item ->> 'memo', ''), nullif(item ->> 'photoPath', ''),
      nullif(item ->> 'thumbPath', ''), ordinality::integer
    from jsonb_array_elements(payload -> 'equipment') with ordinality as t(item, ordinality);
  exception when unique_violation then
    raise exception 'equipment_id_conflict';
  end;

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
