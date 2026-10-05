-- 관리자 승인·반려(검토) 기능을 제거한다. 'submitted'가 등록의 최종 상태가 된다.

drop function if exists public.review_playsafe_registration(uuid, text, text, text);
drop function if exists app_private.review_playsafe_registration(uuid, text, text, text);
drop function if exists public.search_playsafe_facilities(text);
drop function if exists app_private.search_playsafe_facilities(text);

update public.playsafe_registrations set status = 'submitted' where status = 'approved';
update public.playsafe_registrations set status = 'assessment_ready' where status = 'rejected';

alter table public.playsafe_registrations drop constraint if exists playsafe_registrations_status_check;
alter table public.playsafe_registrations
  add constraint playsafe_registrations_status_check
  check (status in ('draft', 'assessment_ready', 'submitted', 'not_target'));

drop index if exists public.playsafe_registrations_matched_facility_idx;
drop index if exists public.playsafe_registrations_reviewed_by_idx;

alter table public.playsafe_registrations
  drop column if exists matched_facility_sn,
  drop column if exists review_note,
  drop column if exists reviewed_by,
  drop column if exists reviewed_at;
