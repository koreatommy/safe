-- 대상 아님 종결에도 시설 전경사진(최대 2장)을 함께 저장한다. 다시 종결하면 사진 행을 새 값으로 바꾼다.

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
  if jsonb_array_length(coalesce(payload -> 'facilityPhotos', '[]'::jsonb)) > 2 then
    raise exception 'facility_photo_count_invalid';
  end if;

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

  return jsonb_build_object(
    'registrationId', v_registration_id,
    'registrationRevision', (select r.revision from public.playsafe_registrations r where r.id = v_registration_id)
  );
end;
$$;
