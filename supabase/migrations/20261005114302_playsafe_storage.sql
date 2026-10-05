-- PlaySafe 사진 버킷과 정책. 경로 첫 폴더는 업로더 uid여야 한다.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('playsafe-equipment-photos', 'playsafe-equipment-photos', false, 2097152, array['image/webp', 'image/jpeg']),
  ('playsafe-checklist-photos', 'playsafe-checklist-photos', false, 307200, array['image/webp', 'image/jpeg'])
on conflict (id) do nothing;

create policy playsafe_equipment_photos_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'playsafe-equipment-photos'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app_private.is_playsafe_admin()))
  );
create policy playsafe_equipment_photos_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'playsafe-equipment-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy playsafe_equipment_photos_update on storage.objects
  for update to authenticated
  using (bucket_id = 'playsafe-equipment-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy playsafe_equipment_photos_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'playsafe-equipment-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy playsafe_checklist_photos_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'playsafe-checklist-photos'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select app_private.is_playsafe_admin()))
  );
create policy playsafe_checklist_photos_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'playsafe-checklist-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy playsafe_checklist_photos_update on storage.objects
  for update to authenticated
  using (bucket_id = 'playsafe-checklist-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy playsafe_checklist_photos_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'playsafe-checklist-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
