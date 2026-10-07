-- 임시시설번호는 입력받지 않고 DB가 8자리 난수로 부여한다. 한 번 부여된 번호는 이후 저장에서 바뀌지 않는다.

create or replace function app_private.playsafe_new_facility_no()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  candidate text;
begin
  loop
    candidate := lpad((floor(random() * 100000000))::bigint::text, 8, '0');
    exit when not exists (select 1 from public.playsafe_registrations where facility_no = candidate);
  end loop;
  return candidate;
end;
$$;

create or replace function app_private.playsafe_assign_facility_no()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and coalesce(old.facility_no, '') <> '' then
    new.facility_no := old.facility_no;
  else
    new.facility_no := app_private.playsafe_new_facility_no();
  end if;
  return new;
end;
$$;

revoke all on function app_private.playsafe_new_facility_no() from public, anon, authenticated;
revoke all on function app_private.playsafe_assign_facility_no() from public, anon, authenticated;

drop trigger if exists playsafe_registrations_facility_no on public.playsafe_registrations;
create trigger playsafe_registrations_facility_no
  before insert or update on public.playsafe_registrations
  for each row execute function app_private.playsafe_assign_facility_no();

update public.playsafe_registrations set facility_no = '' where coalesce(facility_no, '') = '';

create unique index if not exists playsafe_registrations_facility_no_key
  on public.playsafe_registrations (facility_no)
  where facility_no <> '';
