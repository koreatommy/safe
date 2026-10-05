-- PlaySafe staging 워크플로우 테이블. playapi 원본(facilities/equipment)은 참조만 하고 변경하지 않는다.

create table if not exists public.playsafe_checklist_templates (
  version text primary key,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.playsafe_checklist_template_items (
  template_version text not null references public.playsafe_checklist_templates(version),
  item_code text not null,
  sort_order smallint not null,
  category text not null,
  label text not null,
  primary key (template_version, item_code),
  unique (template_version, sort_order)
);

create table if not exists public.playsafe_registrations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft'
    check (status in ('draft', 'assessment_ready', 'submitted', 'approved', 'rejected')),
  manager_name text not null default '',
  phone text not null default '',
  email text not null,
  facility_name text not null,
  facility_no text not null default '',
  place text not null default '',
  place_etc text not null default '',
  postcode text not null default '',
  address text not null default '',
  detail_address text not null default '',
  water text not null default '',
  indoor text not null default '',
  eligibility_answers jsonb not null default '[]'::jsonb,
  eligibility_version text not null default 'v1',
  all_eligible boolean not null default false,
  consent_at timestamptz not null,
  matched_facility_sn text references playapi.facilities(pfct_sn) on delete set null,
  review_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  submitted_at timestamptz,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playsafe_registration_equipment (
  id uuid primary key,
  registration_id uuid not null references public.playsafe_registrations(id) on delete cascade,
  type_code text not null default '',
  type_label text not null,
  installed_on date,
  memo text not null default '',
  photo_path text,
  sort_order integer not null default 0,
  matched_equipment_id bigint references playapi.equipment(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playsafe_assessments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.playsafe_registrations(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  checklist_version text not null references public.playsafe_checklist_templates(version),
  assessor text not null default '',
  eval_date date,
  submit_request_id uuid,
  revision integer not null default 1,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playsafe_assessment_answers (
  assessment_id uuid not null references public.playsafe_assessments(id) on delete cascade,
  item_code text not null,
  status text not null default 'unrecorded'
    check (status in ('unrecorded', 'risk_found', 'no_risk', 'not_applicable')),
  memo text not null default '',
  revision integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (assessment_id, item_code)
);

create table if not exists public.playsafe_assessment_photos (
  id uuid primary key,
  assessment_id uuid not null references public.playsafe_assessments(id) on delete cascade,
  item_code text not null,
  slot smallint not null check (slot between 1 and 3),
  storage_path text not null unique,
  bytes integer not null check (bytes > 0 and bytes <= 307200),
  mime_type text not null check (mime_type in ('image/webp', 'image/jpeg')),
  status text not null default 'pending' check (status in ('pending', 'attached')),
  created_at timestamptz not null default now(),
  unique (assessment_id, item_code, slot)
);

create index if not exists playsafe_registrations_owner_idx
  on public.playsafe_registrations (owner_id);
create index if not exists playsafe_registrations_status_submitted_idx
  on public.playsafe_registrations (status, submitted_at desc);
create index if not exists playsafe_registrations_matched_facility_idx
  on public.playsafe_registrations (matched_facility_sn);
create index if not exists playsafe_registrations_reviewed_by_idx
  on public.playsafe_registrations (reviewed_by);
create index if not exists playsafe_equipment_registration_idx
  on public.playsafe_registration_equipment (registration_id);
create index if not exists playsafe_equipment_matched_idx
  on public.playsafe_registration_equipment (matched_equipment_id);
create index if not exists playsafe_assessments_owner_idx
  on public.playsafe_assessments (owner_id);
create index if not exists playsafe_assessments_checklist_version_idx
  on public.playsafe_assessments (checklist_version);
create index if not exists playsafe_photos_assessment_item_idx
  on public.playsafe_assessment_photos (assessment_id, item_code);

alter table public.playsafe_checklist_templates enable row level security;
alter table public.playsafe_checklist_template_items enable row level security;
alter table public.playsafe_registrations enable row level security;
alter table public.playsafe_registration_equipment enable row level security;
alter table public.playsafe_assessments enable row level security;
alter table public.playsafe_assessment_answers enable row level security;
alter table public.playsafe_assessment_photos enable row level security;

insert into public.playsafe_checklist_templates (version, title)
values ('v1', '신종·유사 놀이시설 안전성평가 18항목')
on conflict (version) do nothing;

insert into public.playsafe_checklist_template_items
  (template_version, item_code, sort_order, category, label)
values
  ('v1', 'drowning-01', 1, '익수', '시설물의 사용연령 및 인원과 함께 안전한 이용수칙의 표시 및 안내 여부'),
  ('v1', 'drowning-02', 2, '익수', '시설물의 사용으로 발생될 수 있는 위험에 대한 사전 안내 여부'),
  ('v1', 'drowning-03', 3, '익수', '익수 위험 방지를 위한 시설물 관리: 수심 표시, 감시 사각지대, 마개 여부'),
  ('v1', 'fall-01', 4, '추락', '오르거나 매달리는 것을 유도하는 시설 및 놀이 중 추락 위험 여부'),
  ('v1', 'fall-02', 5, '추락', '사용 연령·인원 및 영유아 사용 위험 안내 여부'),
  ('v1', 'fall-03', 6, '추락', '추락방지 보호 조치: 난간, 울타리, 안전공간 여부'),
  ('v1', 'electric-01', 7, '감전', '전기·조명·기타 관리용 설비에 대한 어린이 접근 위험 여부'),
  ('v1', 'collision-01', 8, '충돌', '그네·미끄럼틀·회전 등 강제적 움직임이 발생하는 공간의 장애물 여부'),
  ('v1', 'collision-02', 9, '충돌', '동선 겹침 또는 잘못된 배치로 인한 충돌 위험 여부'),
  ('v1', 'collision-03', 10, '충돌', '어두운 조명 및 놀이행위를 관찰할 수 없는 사각공간 여부'),
  ('v1', 'slip-01', 11, '미끄러짐·넘어짐', '계단·경사로의 습기, 물기, 미고정 물체 여부'),
  ('v1', 'slip-02', 12, '미끄러짐·넘어짐', '이용 동선 및 비상구의 걸림·미끄러짐 위험 여부'),
  ('v1', 'entrapment-01', 13, '얽매임·짓눌림', '추락할 수 있는 높이에서 머리 등 신체 끼임 위험 여부'),
  ('v1', 'entrapment-02', 14, '얽매임·짓눌림', '어린이 눈높이 틈새의 손가락 끼임 위험 여부'),
  ('v1', 'entrapment-03', 15, '얽매임·짓눌림', '움직이는 놀이요소·부품 사이의 짓눌림 위험 여부'),
  ('v1', 'puncture-01', 16, '찔림·긁힘', '낮은 천정 또는 날카로운 시설물 마감에 의한 부상 위험 여부'),
  ('v1', 'escape-01', 17, '비상탈출', '폐쇄형 공간의 출입구 배치 및 크기 여부'),
  ('v1', 'escape-02', 18, '비상탈출', '비상통로·비상출입구 확보 및 장애물 여부')
on conflict (template_version, item_code) do nothing;
