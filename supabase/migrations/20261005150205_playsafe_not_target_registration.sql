-- 자격 문항에 '아니요'가 하나라도 있으면 기구·안전성평가 없이 시설정보와 자격 답변만 'not_target'으로 저장한다.

alter table public.playsafe_registrations
  drop constraint if exists playsafe_registrations_status_check;

alter table public.playsafe_registrations
  add constraint playsafe_registrations_status_check
  check (status in ('draft', 'assessment_ready', 'submitted', 'approved', 'rejected', 'not_target'));

create or replace function app_private.close_playsafe_registration(payload jsonb)
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
  closed_count integer;
  all_yes boolean;
  info jsonb;
begin
  if v_name = '' or v_email = '' then raise exception 'submitter_required'; end if;
  info := payload -> 'information';
  v_facility := btrim(coalesce(info ->> 'facilityName', ''));
  if coalesce(payload ->> 'consentAt', '') = '' then raise exception 'consent_required'; end if;
  if v_facility = '' then raise exception 'facility_name_required'; end if;

  select bool_and(coalesce(item ->> 'answer', '') = 'yes') into all_yes
  from jsonb_array_elements(coalesce(payload -> 'answers', '[]'::jsonb)) as item;
  if all_yes is not false then raise exception 'eligible_not_closable'; end if;

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
    if v_status <> 'not_target' then raise exception 'registration_has_assessment'; end if;
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
        all_eligible = false,
        consent_at = (payload ->> 'consentAt')::timestamptz
      where id = v_registration_id;
    exception when unique_violation then
      raise exception 'submitter_key_conflict';
    end;
  else
    select count(*) into closed_count
    from public.playsafe_registrations
    where submitter_email = v_email and status = 'not_target';
    if closed_count >= 10 then raise exception 'too_many_closed_registrations'; end if;
    insert into public.playsafe_registrations (
      status, submitter_name, submitter_email, manager_name, phone, email, facility_name, facility_no,
      place, place_etc, postcode, address, detail_address, water, indoor, eligibility_answers,
      eligibility_version, all_eligible, consent_at
    ) values (
      'not_target', v_name, v_email,
      coalesce(info ->> 'managerName', ''), coalesce(info ->> 'phone', ''), coalesce(info ->> 'email', ''),
      v_facility, coalesce(info ->> 'facilityNo', ''), coalesce(info ->> 'place', ''),
      coalesce(info ->> 'placeEtc', ''), coalesce(info ->> 'postcode', ''), coalesce(info ->> 'address', ''),
      coalesce(info ->> 'detailAddress', ''), coalesce(info ->> 'water', ''), coalesce(info ->> 'indoor', ''),
      coalesce(payload -> 'answers', '[]'::jsonb), coalesce(payload ->> 'eligibilityVersion', 'v1'),
      false, (payload ->> 'consentAt')::timestamptz
    ) returning id into v_registration_id;
  end if;

  return jsonb_build_object(
    'registrationId', v_registration_id,
    'registrationRevision', (select r.revision from public.playsafe_registrations r where r.id = v_registration_id)
  );
end;
$$;

create or replace function public.close_playsafe_registration(payload jsonb)
returns jsonb language sql security definer set search_path = ''
as $$ select app_private.close_playsafe_registration(payload); $$;

revoke all on function app_private.close_playsafe_registration(jsonb) from public, anon, authenticated;
revoke all on function public.close_playsafe_registration(jsonb) from public, anon, authenticated;
grant execute on function public.close_playsafe_registration(jsonb) to service_role;
