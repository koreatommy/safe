-- PlaySafe 비노출 스키마: 관리자 판정, revision 트리거, 등록 시작 RPC 본체.

create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create or replace function app_private.is_playsafe_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.app_admin_user_ids a where a.user_id = (select auth.uid())
  );
$$;

create or replace function app_private.playsafe_touch_revision()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.revision := coalesce(old.revision, 1) + 1;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists playsafe_registrations_revision on public.playsafe_registrations;
create trigger playsafe_registrations_revision
  before update on public.playsafe_registrations
  for each row execute function app_private.playsafe_touch_revision();

drop trigger if exists playsafe_assessments_revision on public.playsafe_assessments;
create trigger playsafe_assessments_revision
  before update on public.playsafe_assessments
  for each row execute function app_private.playsafe_touch_revision();

create or replace function app_private.begin_playsafe_assessment(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  session_email text := lower(coalesce((select auth.jwt() ->> 'email'), ''));
  v_registration_id uuid;
  v_assessment_id uuid;
  equipment_count integer;
  open_count integer;
  all_yes boolean;
  info jsonb;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  info := payload -> 'information';
  if coalesce(payload ->> 'consentAt', '') = '' then raise exception 'consent_required'; end if;
  if coalesce(payload ->> 'checklistVersion', '') <> 'v1' then raise exception 'checklist_version_mismatch'; end if;
  if coalesce(info ->> 'facilityName', '') = '' then raise exception 'facility_name_required'; end if;
  if lower(coalesce(info ->> 'email', '')) <> session_email then raise exception 'email_mismatch'; end if;

  select bool_and(coalesce(item ->> 'answer', '') = 'yes') into all_yes
  from jsonb_array_elements(coalesce(payload -> 'answers', '[]'::jsonb)) as item;
  if all_yes is not true then raise exception 'not_eligible'; end if;

  equipment_count := jsonb_array_length(coalesce(payload -> 'equipment', '[]'::jsonb));
  if equipment_count < 1 or equipment_count > 5 then raise exception 'equipment_count_invalid'; end if;

  if coalesce(payload ->> 'id', '') <> '' then
    v_registration_id := (payload ->> 'id')::uuid;
    perform 1 from public.playsafe_registrations
      where id = v_registration_id and owner_id = uid and status in ('draft', 'assessment_ready')
      for update;
    if not found then raise exception 'registration_not_editable'; end if;
    update public.playsafe_registrations set
      manager_name = coalesce(info ->> 'managerName', ''),
      phone = coalesce(info ->> 'phone', ''),
      email = info ->> 'email',
      facility_name = info ->> 'facilityName',
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
  else
    select count(*) into open_count
    from public.playsafe_registrations
    where owner_id = uid and status in ('draft', 'assessment_ready');
    if open_count >= 3 then raise exception 'too_many_open_registrations'; end if;
    insert into public.playsafe_registrations (
      owner_id, status, manager_name, phone, email, facility_name, facility_no, place, place_etc,
      postcode, address, detail_address, water, indoor, eligibility_answers, eligibility_version,
      all_eligible, consent_at
    ) values (
      uid, 'assessment_ready',
      coalesce(info ->> 'managerName', ''), coalesce(info ->> 'phone', ''), info ->> 'email',
      info ->> 'facilityName', coalesce(info ->> 'facilityNo', ''), coalesce(info ->> 'place', ''),
      coalesce(info ->> 'placeEtc', ''), coalesce(info ->> 'postcode', ''), coalesce(info ->> 'address', ''),
      coalesce(info ->> 'detailAddress', ''), coalesce(info ->> 'water', ''), coalesce(info ->> 'indoor', ''),
      coalesce(payload -> 'answers', '[]'::jsonb), coalesce(payload ->> 'eligibilityVersion', 'v1'),
      true, (payload ->> 'consentAt')::timestamptz
    ) returning id into v_registration_id;
  end if;

  delete from public.playsafe_registration_equipment e where e.registration_id = v_registration_id;
  insert into public.playsafe_registration_equipment (
    id, registration_id, type_code, type_label, installed_on, memo, sort_order
  )
  select
    (item ->> 'id')::uuid, v_registration_id, coalesce(item ->> 'typeCode', ''), item ->> 'type',
    nullif(item ->> 'date', '')::date, coalesce(item ->> 'memo', ''), ordinality::integer
  from jsonb_array_elements(payload -> 'equipment') with ordinality as t(item, ordinality);

  select a.id into v_assessment_id
  from public.playsafe_assessments a
  where a.registration_id = v_registration_id
  for update;
  if v_assessment_id is null then
    insert into public.playsafe_assessments (registration_id, owner_id, status, checklist_version)
    values (v_registration_id, uid, 'draft', 'v1')
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
    'assessmentRevision', (select a.revision from public.playsafe_assessments a where a.id = v_assessment_id)
  );
end;
$$;
