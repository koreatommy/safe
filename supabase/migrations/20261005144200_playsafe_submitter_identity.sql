-- 이메일 인증 대신 입력자 이름·이메일·시설명을 등록 고유 키로 쓴다.
-- 사용자 쓰기는 서버 라우트(service_role)만 수행하고, authenticated는 관리자 열람만 남긴다.

alter table public.playsafe_registrations
  add column if not exists submitter_name text not null default '',
  add column if not exists submitter_email text not null default '',
  alter column owner_id drop not null,
  alter column email set default '';

alter table public.playsafe_registrations
  alter column submitter_name drop default,
  alter column submitter_email drop default;

alter table public.playsafe_registrations
  add constraint playsafe_registrations_submitter_check
  check (
    btrim(submitter_name) <> ''
    and submitter_name = btrim(submitter_name)
    and submitter_email = lower(btrim(submitter_email))
    and submitter_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  );

create unique index if not exists playsafe_registrations_submitter_key
  on public.playsafe_registrations (submitter_email, submitter_name, facility_name);

alter table public.playsafe_assessments
  alter column owner_id drop not null;

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
    if v_status not in ('draft', 'assessment_ready') then raise exception 'registration_not_editable'; end if;
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

create or replace function app_private.save_playsafe_answers(p_assessment_id uuid, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
  conflict_codes text[] := '{}';
  updated_count integer := 0;
  revisions jsonb := '{}'::jsonb;
  new_revision integer;
begin
  perform 1 from public.playsafe_assessments
    where id = p_assessment_id and status = 'draft'
    for update;
  if not found then raise exception 'assessment_not_editable'; end if;

  for item in select * from jsonb_array_elements(p_answers)
  loop
    update public.playsafe_assessment_answers
      set status = item ->> 'status',
          memo = coalesce(item ->> 'memo', ''),
          revision = revision + 1,
          updated_at = now()
      where assessment_id = p_assessment_id
        and item_code = item ->> 'itemCode'
        and revision = (item ->> 'revision')::integer
      returning revision into new_revision;
    if found then
      updated_count := updated_count + 1;
      revisions := revisions || jsonb_build_object(item ->> 'itemCode', new_revision);
    else
      conflict_codes := conflict_codes || (item ->> 'itemCode');
    end if;
  end loop;

  return jsonb_build_object(
    'updated', updated_count,
    'conflicts', to_jsonb(conflict_codes),
    'revisions', revisions
  );
end;
$$;

create or replace function app_private.submit_playsafe_assessment(
  p_assessment_id uuid,
  p_revision integer,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  assessment public.playsafe_assessments%rowtype;
  missing integer;
begin
  select * into assessment
  from public.playsafe_assessments
  where id = p_assessment_id
  for update;
  if not found then raise exception 'assessment_not_found'; end if;

  if assessment.status = 'submitted' and assessment.submit_request_id = p_request_id then
    return jsonb_build_object('ok', true, 'idempotent', true, 'assessmentId', assessment.id);
  end if;
  if assessment.status = 'submitted' then raise exception 'already_submitted'; end if;
  if assessment.revision <> p_revision then raise exception 'revision_conflict'; end if;

  select count(*) into missing
  from public.playsafe_checklist_template_items i
  left join public.playsafe_assessment_answers a
    on a.assessment_id = p_assessment_id and a.item_code = i.item_code
  where i.template_version = assessment.checklist_version
    and (a.item_code is null or a.status = 'unrecorded');
  if missing > 0 then raise exception 'unrecorded_items'; end if;

  perform 1 from public.playsafe_assessment_photos
    where assessment_id = p_assessment_id and status = 'pending';
  if found then raise exception 'photos_pending'; end if;

  update public.playsafe_assessments
    set status = 'submitted', submitted_at = now(), submit_request_id = p_request_id
    where id = p_assessment_id;
  update public.playsafe_registrations
    set status = 'submitted', submitted_at = now()
    where id = assessment.registration_id;

  return jsonb_build_object('ok', true, 'idempotent', false, 'assessmentId', p_assessment_id);
end;
$$;

revoke all on function public.begin_playsafe_assessment(jsonb) from public, anon, authenticated;
revoke all on function public.save_playsafe_answers(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.submit_playsafe_assessment(uuid, integer, uuid) from public, anon, authenticated;
grant execute on function public.begin_playsafe_assessment(jsonb) to service_role;
grant execute on function public.save_playsafe_answers(uuid, jsonb) to service_role;
grant execute on function public.submit_playsafe_assessment(uuid, integer, uuid) to service_role;

revoke insert, update, delete on table
  public.playsafe_registration_equipment,
  public.playsafe_assessments,
  public.playsafe_assessment_answers,
  public.playsafe_assessment_photos
from authenticated;

drop policy if exists playsafe_equipment_write on public.playsafe_registration_equipment;
drop policy if exists playsafe_assessments_update on public.playsafe_assessments;
drop policy if exists playsafe_answers_write on public.playsafe_assessment_answers;
drop policy if exists playsafe_photos_write on public.playsafe_assessment_photos;

drop policy if exists playsafe_equipment_photos_write on storage.objects;
drop policy if exists playsafe_equipment_photos_update on storage.objects;
drop policy if exists playsafe_equipment_photos_delete on storage.objects;
drop policy if exists playsafe_checklist_photos_write on storage.objects;
drop policy if exists playsafe_checklist_photos_update on storage.objects;
drop policy if exists playsafe_checklist_photos_delete on storage.objects;
