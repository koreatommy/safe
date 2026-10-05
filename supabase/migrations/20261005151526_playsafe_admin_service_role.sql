-- /admin은 비밀번호 세션으로 인증하고 서버 라우트가 service_role로 호출하므로, service_role도 PlaySafe 관리자로 인정한다.
-- 검토(승인·반려)는 제출된 등록에만 허용한다.

create or replace function app_private.is_playsafe_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.jwt()) ->> 'role', '') = 'service_role'
    or exists (select 1 from public.app_admin_user_ids a where a.user_id = (select auth.uid()));
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
  if not app_private.is_playsafe_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_decision not in ('approved', 'rejected') then raise exception 'invalid_decision'; end if;

  perform 1 from public.playsafe_registrations where id = p_id;
  if not found then raise exception 'registration_not_found'; end if;

  if p_decision = 'approved' then
    update public.playsafe_registrations
      set status = 'approved', matched_facility_sn = p_facility_sn, review_note = p_note,
          reviewed_by = uid, reviewed_at = now()
      where id = p_id and status = 'submitted';
    if not found then raise exception 'registration_not_reviewable'; end if;
  else
    update public.playsafe_registrations
      set status = 'assessment_ready', review_note = p_note, reviewed_by = uid, reviewed_at = now()
      where id = p_id and status = 'submitted';
    if not found then raise exception 'registration_not_reviewable'; end if;
    update public.playsafe_assessments
      set status = 'draft', submitted_at = null, submit_request_id = null
      where registration_id = p_id;
  end if;

  return jsonb_build_object('ok', true, 'decision', p_decision);
end;
$$;

grant execute on function public.review_playsafe_registration(uuid, text, text, text) to service_role;
grant execute on function public.search_playsafe_facilities(text) to service_role;
