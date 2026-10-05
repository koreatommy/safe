-- PlaySafe 관리자 판정이 쓰는 목록. 이 프로젝트에는 이미 존재하므로 if not exists.

create table if not exists public.app_admin_user_ids (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.app_admin_user_ids enable row level security;

revoke all on table public.app_admin_user_ids from anon;
grant select on table public.app_admin_user_ids to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'app_admin_user_ids'
      and policyname = 'Authenticated can read admin list'
  ) then
    create policy "Authenticated can read admin list"
      on public.app_admin_user_ids
      for select to authenticated
      using (true);
  end if;
end $$;
