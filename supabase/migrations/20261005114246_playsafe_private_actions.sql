-- PlaySafe 비노출 RPC 본체: 답변 저장, 제출, 관리자 검토, 시설 검색.

create or replace function app_private.save_playsafe_answers(p_assessment_id uuid, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  item jsonb;
  conflict_codes text[] := '{}';
  updated_count integer := 0;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform 1 from public.playsafe_assessments
    where id = p_assessment_id and owner_id = uid and status = 'draft'
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
        and revision = (item ->> 'revision')::integer;
    if found then
      updated_count := updated_count + 1;
    else
      conflict_codes := conflict_codes || (item ->> 'itemCode');
    end if;
  end loop;

  return jsonb_build_object('updated', updated_count, 'conflicts', to_jsonb(conflict_codes));
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
  uid uuid := (select auth.uid());
  assessment public.playsafe_assessments%rowtype;
  missing integer;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;

  select * into assessment
  from public.playsafe_assessments
  where id = p_assessment_id and owner_id = uid
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
    where id = assessment.registration_id and owner_id = uid;

  return jsonb_build_object('ok', true, 'idempotent', false, 'assessmentId', p_assessment_id);
end;
$$;

create or replace function app_private.review_playsafe_registration(
  p_id uuid,
  p_decision text,
  p_facility_sn text,
  p_note text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null or not app_private.is_playsafe_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_decision not in ('approved', 'rejected') then raise exception 'invalid_decision'; end if;

  if p_decision = 'approved' then
    update public.playsafe_registrations
      set status = 'approved', matched_facility_sn = p_facility_sn, review_note = p_note,
          reviewed_by = uid, reviewed_at = now()
      where id = p_id;
    if not found then raise exception 'registration_not_found'; end if;
  else
    update public.playsafe_registrations
      set status = 'assessment_ready', review_note = p_note, reviewed_by = uid, reviewed_at = now()
      where id = p_id;
    if not found then raise exception 'registration_not_found'; end if;
    update public.playsafe_assessments
      set status = 'draft', submitted_at = null, submit_request_id = null
      where registration_id = p_id;
  end if;

  return jsonb_build_object('ok', true, 'decision', p_decision);
end;
$$;

create or replace function app_private.search_playsafe_facilities(p_query text)
returns table (id text, facility_no text, facility_name text, road_address text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not app_private.is_playsafe_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  return query
    select f.pfct_sn, f.pfct_sn, f.pfct_nm, f.rona_addr
    from playapi.facilities f
    where f.pfct_nm ilike '%' || p_query || '%' or f.pfct_sn ilike '%' || p_query || '%'
    order by f.pfct_nm
    limit 20;
end;
$$;
