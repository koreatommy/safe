-- PlaySafe 테이블 RLS: 본인 소유 행과 관리자 열람만 허용한다.

create policy playsafe_templates_read on public.playsafe_checklist_templates
  for select to authenticated using (true);
create policy playsafe_template_items_read on public.playsafe_checklist_template_items
  for select to authenticated using (true);

create policy playsafe_registrations_select on public.playsafe_registrations
  for select to authenticated
  using ((select auth.uid()) = owner_id or (select app_private.is_playsafe_admin()));

create policy playsafe_equipment_select on public.playsafe_registration_equipment
  for select to authenticated
  using (exists (
    select 1 from public.playsafe_registrations r
    where r.id = registration_id and ((select auth.uid()) = r.owner_id or (select app_private.is_playsafe_admin()))
  ));
create policy playsafe_equipment_write on public.playsafe_registration_equipment
  for all to authenticated
  using (exists (
    select 1 from public.playsafe_registrations r
    where r.id = registration_id and r.owner_id = (select auth.uid()) and r.status in ('draft', 'assessment_ready')
  ))
  with check (exists (
    select 1 from public.playsafe_registrations r
    where r.id = registration_id and r.owner_id = (select auth.uid()) and r.status in ('draft', 'assessment_ready')
  ));

create policy playsafe_assessments_select on public.playsafe_assessments
  for select to authenticated
  using ((select auth.uid()) = owner_id or (select app_private.is_playsafe_admin()));
create policy playsafe_assessments_update on public.playsafe_assessments
  for update to authenticated
  using ((select auth.uid()) = owner_id and status = 'draft')
  with check ((select auth.uid()) = owner_id and status = 'draft');

create policy playsafe_answers_select on public.playsafe_assessment_answers
  for select to authenticated
  using (exists (
    select 1 from public.playsafe_assessments a
    where a.id = assessment_id and (a.owner_id = (select auth.uid()) or (select app_private.is_playsafe_admin()))
  ));
create policy playsafe_answers_write on public.playsafe_assessment_answers
  for all to authenticated
  using (exists (
    select 1 from public.playsafe_assessments a
    where a.id = assessment_id and a.owner_id = (select auth.uid()) and a.status = 'draft'
  ))
  with check (exists (
    select 1 from public.playsafe_assessments a
    where a.id = assessment_id and a.owner_id = (select auth.uid()) and a.status = 'draft'
  ));

create policy playsafe_photos_select on public.playsafe_assessment_photos
  for select to authenticated
  using (exists (
    select 1 from public.playsafe_assessments a
    where a.id = assessment_id and (a.owner_id = (select auth.uid()) or (select app_private.is_playsafe_admin()))
  ));
create policy playsafe_photos_write on public.playsafe_assessment_photos
  for all to authenticated
  using (exists (
    select 1 from public.playsafe_assessments a
    where a.id = assessment_id and a.owner_id = (select auth.uid()) and a.status = 'draft'
  ))
  with check (exists (
    select 1 from public.playsafe_assessments a
    where a.id = assessment_id and a.owner_id = (select auth.uid()) and a.status = 'draft'
  ));
