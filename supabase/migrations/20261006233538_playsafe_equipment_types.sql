-- 기구유형 코드표. `unregistered`(미등록 놀이기구, 안전인증서 없는 제품)는 신종유사 놀이형태가 아닌 별도 관리 대상이다.
-- 코드·라벨은 src/data/playsafe/play-types.ts 와 일치해야 한다.

create table if not exists public.playsafe_equipment_types (
  code text primary key,
  label text not null,
  category text not null check (category in ('new_similar', 'unregistered')),
  sort_order smallint not null unique
);

insert into public.playsafe_equipment_types (code, label, category, sort_order)
values
  ('climb', '오르는놀이형', 'new_similar', 1),
  ('cross', '건너는놀이형', 'new_similar', 2),
  ('swing', '그네놀이형', 'new_similar', 3),
  ('slide', '미끄럼놀이형', 'new_similar', 4),
  ('rock', '흔들놀이형', 'new_similar', 5),
  ('water', '물놀이형', 'new_similar', 6),
  ('etc', '기타놀이형', 'new_similar', 7),
  ('combo', '조합형', 'new_similar', 8),
  ('unregistered', '미등록 놀이기구', 'unregistered', 9)
on conflict (code) do update set
  label = excluded.label,
  category = excluded.category,
  sort_order = excluded.sort_order;

alter table public.playsafe_equipment_types enable row level security;

create policy playsafe_equipment_types_read on public.playsafe_equipment_types
  for select to anon, authenticated using (true);

alter table public.playsafe_registration_equipment
  alter column type_code drop default;

alter table public.playsafe_registration_equipment
  add constraint playsafe_registration_equipment_type_code_fkey
  foreign key (type_code) references public.playsafe_equipment_types(code);

create index if not exists playsafe_equipment_type_code_idx
  on public.playsafe_registration_equipment (type_code);
