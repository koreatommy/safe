-- 'not_target'으로 종결한 등록도 자격 문항을 모두 충족하면 같은 등록 키로 안전성평가를 시작할 수 있게 한다.

create or replace function app_private.begin_playsafe_assessment(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(payload -> 'submitter' ->> 'name', ''));
  v_email text := lower(btrim(coalesce(payload -> 'submitter' ->> 'email', '')));
  v_facility text;
  v_status text;
  v_registration_id uuid;
  v_assessment_id uuid;
  equipment_count integer;
  open_count integer;
  all_yes boolean;
  info jsonb;
  v_removed_paths text[] := '{}';
  upserted integer := 0;
begin
  if v_name = '' or v_email = '' then raise exception 'submitter_required'; end if;
  info := payload -> 'information';
  v_facility := btrim(coalesce(info ->> 'facilityName', ''));
  if coalesce(payload ->> 'consentAt', '') = '' then raise exception 'consent_required'; end if;
  if coalesce(payload ->> 'checklistVersion', '') <> 'v1' then raise exception 'checklist_version_mismatch'; end if;
  if v_facility = '' then raise exception 'facility_name_required'; end if;

  select bool_and(coalesce(item ->> 'answer', '') = 'yes') into all_yes
  from jsonb_array_elements(coalesce(payload -> 'answers', '[]'::jsonb)) as item;
  if all_yes is not true then raise exception 'not_eligible'; end if;

  equipment_count := jsonb_array_length(coalesce(payload -> 'equipment', '[]'::jsonb));
  if equipment_count < 1 or equipment_count > 5 then raise exception 'equipment_count_invalid'; end if;

  if coalesce(payload ->> 'id', '') <> '' then
    select r.id, r.status into v_registration_id, v_status
    from public.playsafe_registrations r
    where r.id = (payload ->> 'id')::uuid
      and r.submitter_email = v_email
      and r.submitter_name = v_name
    for update;
  else
    select r.id, r.status into v_registration_id, v_status
    from public.playsafe_registrations r
    where r.submitter_email = v_email
      and r.submitter_name = v_name
      and r.facility_name = v_facility
    for update;
  end if;

  if v_registration_id is null and coalesce(payload ->> 'id', '') <> '' then
    raise exception 'registration_not_found';
  end if;

  if v_registration_id is not null then
    if v_status not in ('draft', 'assessment_ready', 'not_target') then
      raise exception 'registration_not_editable';
    end if;
    if v_status = 'not_target' then
      select count(*) into open_count
      from public.playsafe_registrations
      where submitter_email = v_email and status in ('draft', 'assessment_ready');
      if open_count >= 3 then raise exception 'too_many_open_registrations'; end if;
    end if;
    begin
      update public.playsafe_registrations set
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
        status = 'assessment_ready'
      where id = v_registration_id;
    exception when unique_violation then
      raise exception 'submitter_key_conflict';
    end;
  else
    select count(*) into open_count
    from public.playsafe_registrations
    where submitter_email = v_email and status in ('draft', 'assessment_ready');
    if open_count >= 3 then raise exception 'too_many_open_registrations'; end if;
    insert into public.playsafe_registrations (
      status, submitter_name, submitter_email, manager_name, phone, email, facility_name, facility_no,
      place, place_etc, postcode, address, detail_address, water, indoor, eligibility_answers,
      eligibility_version, all_eligible, consent_at
    ) values (
      'assessment_ready', v_name, v_email,
      coalesce(info ->> 'managerName', ''), coalesce(info ->> 'phone', ''), coalesce(info ->> 'email', ''),
      v_facility, coalesce(info ->> 'facilityNo', ''), coalesce(info ->> 'place', ''),
      coalesce(info ->> 'placeEtc', ''), coalesce(info ->> 'postcode', ''), coalesce(info ->> 'address', ''),
      coalesce(info ->> 'detailAddress', ''), coalesce(info ->> 'water', ''), coalesce(info ->> 'indoor', ''),
      coalesce(payload -> 'answers', '[]'::jsonb), coalesce(payload ->> 'eligibilityVersion', 'v1'),
      true, (payload ->> 'consentAt')::timestamptz
    ) returning id into v_registration_id;
  end if;

  with removed as (
    delete from public.playsafe_registration_equipment e
    where e.registration_id = v_registration_id
      and not exists (
        select 1
        from jsonb_array_elements(coalesce(payload -> 'equipment', '[]'::jsonb)) item
        where (item ->> 'id')::uuid = e.id
      )
    returning e.photo_path
  )
  select coalesce(array_agg(photo_path) filter (where photo_path is not null and photo_path <> ''), '{}')
    into v_removed_paths
  from removed;

  insert into public.playsafe_registration_equipment (
    id, registration_id, type_code, type_label, installed_on, memo, sort_order
  )
  select
    (item ->> 'id')::uuid, v_registration_id, coalesce(item ->> 'typeCode', ''), item ->> 'type',
    nullif(item ->> 'date', '')::date, coalesce(item ->> 'memo', ''), ordinality::integer
  from jsonb_array_elements(payload -> 'equipment') with ordinality as t(item, ordinality)
  on conflict (id) do update set
    type_code = excluded.type_code,
    type_label = excluded.type_label,
    installed_on = excluded.installed_on,
    memo = excluded.memo,
    sort_order = excluded.sort_order,
    updated_at = now()
  where public.playsafe_registration_equipment.registration_id = v_registration_id;

  get diagnostics upserted = row_count;
  if upserted <> equipment_count then raise exception 'equipment_id_conflict'; end if;

  select a.id into v_assessment_id
  from public.playsafe_assessments a
  where a.registration_id = v_registration_id
  for update;
  if v_assessment_id is null then
    insert into public.playsafe_assessments (registration_id, status, checklist_version)
    values (v_registration_id, 'draft', 'v1')
    returning id into v_assessment_id;
    insert into public.playsafe_assessment_answers (assessment_id, item_code)
    select v_assessment_id, item_code
    from public.playsafe_checklist_template_items
    where template_version = 'v1';
  else
    update public.playsafe_assessments set status = 'draft' where id = v_assessment_id;
  end if;

  return jsonb_build_object(
    'registrationId', v_registration_id,
    'assessmentId', v_assessment_id,
    'registrationRevision', (select r.revision from public.playsafe_registrations r where r.id = v_registration_id),
    'assessmentRevision', (select a.revision from public.playsafe_assessments a where a.id = v_assessment_id),
    'removedPhotoPaths', to_jsonb(v_removed_paths)
  );
end;
$$;
