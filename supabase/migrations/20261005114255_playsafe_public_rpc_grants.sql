-- PlaySafe 공개 RPC 래퍼와 권한. app_private 본체는 직접 호출할 수 없게 하고 RLS용 관리자 판정만 연다.

create or replace function public.begin_playsafe_assessment(payload jsonb)
returns jsonb language sql security definer set search_path = ''
as $$ select app_private.begin_playsafe_assessment(payload); $$;

create or replace function public.submit_playsafe_assessment(p_assessment_id uuid, p_revision integer, p_request_id uuid)
returns jsonb language sql security definer set search_path = ''
as $$ select app_private.submit_playsafe_assessment(p_assessment_id, p_revision, p_request_id); $$;

create or replace function public.save_playsafe_answers(p_assessment_id uuid, p_answers jsonb)
returns jsonb language sql security definer set search_path = ''
as $$ select app_private.save_playsafe_answers(p_assessment_id, p_answers); $$;

create or replace function public.review_playsafe_registration(p_id uuid, p_decision text, p_facility_sn text, p_note text)
returns jsonb language sql security definer set search_path = ''
as $$ select app_private.review_playsafe_registration(p_id, p_decision, p_facility_sn, p_note); $$;

create or replace function public.search_playsafe_facilities(p_query text)
returns table (id text, facility_no text, facility_name text, road_address text)
language sql stable security definer set search_path = ''
as $$ select * from app_private.search_playsafe_facilities(p_query); $$;

create or replace function public.is_playsafe_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select app_private.is_playsafe_admin(); $$;

revoke all on all functions in schema app_private from public, anon, authenticated;
grant execute on function app_private.is_playsafe_admin() to authenticated;

revoke all on function public.begin_playsafe_assessment(jsonb) from public, anon;
revoke all on function public.submit_playsafe_assessment(uuid, integer, uuid) from public, anon;
revoke all on function public.save_playsafe_answers(uuid, jsonb) from public, anon;
revoke all on function public.review_playsafe_registration(uuid, text, text, text) from public, anon;
revoke all on function public.search_playsafe_facilities(text) from public, anon;
revoke all on function public.is_playsafe_admin() from public, anon;
grant execute on function public.begin_playsafe_assessment(jsonb) to authenticated;
grant execute on function public.submit_playsafe_assessment(uuid, integer, uuid) to authenticated;
grant execute on function public.save_playsafe_answers(uuid, jsonb) to authenticated;
grant execute on function public.review_playsafe_registration(uuid, text, text, text) to authenticated;
grant execute on function public.search_playsafe_facilities(text) to authenticated;
grant execute on function public.is_playsafe_admin() to authenticated;

revoke all on table
  public.playsafe_checklist_templates,
  public.playsafe_checklist_template_items,
  public.playsafe_registrations,
  public.playsafe_registration_equipment,
  public.playsafe_assessments,
  public.playsafe_assessment_answers,
  public.playsafe_assessment_photos
from anon, authenticated;

grant select on table public.playsafe_checklist_templates to authenticated;
grant select on table public.playsafe_checklist_template_items to authenticated;
grant select on table public.playsafe_registrations to authenticated;
grant select, delete on table public.playsafe_registration_equipment to authenticated;
grant update (photo_path, updated_at) on table public.playsafe_registration_equipment to authenticated;
grant select on table public.playsafe_assessments to authenticated;
grant update (assessor, eval_date, updated_at) on table public.playsafe_assessments to authenticated;
grant select, insert, update, delete on table public.playsafe_assessment_answers to authenticated;
grant select, insert, update, delete on table public.playsafe_assessment_photos to authenticated;
