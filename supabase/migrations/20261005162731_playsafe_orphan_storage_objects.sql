-- 업로드 후 등록이 끝나지 않아 어떤 행에도 연결되지 않은 사진 파일을 찾는다. 삭제는 Storage API로 한다.

create or replace function app_private.playsafe_orphan_storage_objects(min_age interval, max_rows integer)
returns table (bucket_id text, name text)
language sql
stable
security definer
set search_path = ''
as $$
  select o.bucket_id, o.name
  from storage.objects o
  where o.bucket_id in ('playsafe-equipment-photos', 'playsafe-checklist-photos')
    and o.created_at < now() - min_age
    and not exists (
      select 1 from public.playsafe_registration_equipment e
      where o.name = e.photo_path or o.name = e.thumb_path
    )
    and not exists (
      select 1 from public.playsafe_assessment_photos p
      where o.name = p.storage_path or o.name = p.thumb_path
    )
  order by o.created_at
  limit greatest(1, least(max_rows, 1000));
$$;

create or replace function public.playsafe_orphan_storage_objects(min_age interval, max_rows integer)
returns table (bucket_id text, name text)
language sql stable security definer set search_path = ''
as $$ select * from app_private.playsafe_orphan_storage_objects(min_age, max_rows); $$;

revoke all on function app_private.playsafe_orphan_storage_objects(interval, integer) from public, anon, authenticated;
revoke all on function public.playsafe_orphan_storage_objects(interval, integer) from public, anon, authenticated;
grant execute on function public.playsafe_orphan_storage_objects(interval, integer) to service_role;
