-- 신종·유사놀이시설 대상여부 문의 (랜딩 About 섹션 → 관리자 데이터 관리)
create table if not exists public.safe_eligibility_inquiries (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  content text not null check (char_length(content) between 1 and 5000),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) <= 254),
  phone text not null check (char_length(phone) <= 20),
  attachments jsonb not null default '[]'::jsonb,
  privacy_agreed boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed')),
  admin_note text check (admin_note is null or char_length(admin_note) <= 5000),
  created_at timestamptz not null default now()
);

create index if not exists safe_eligibility_inquiries_created_at_idx
  on public.safe_eligibility_inquiries (created_at desc);
create index if not exists safe_eligibility_inquiries_status_idx
  on public.safe_eligibility_inquiries (status);

-- 모든 접근은 서버 API(service_role)로만 수행하므로 정책 없이 RLS만 활성화
alter table public.safe_eligibility_inquiries enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'eligibility-inquiry-attachments',
  'eligibility-inquiry-attachments',
  false,
  10485760,
  array[
    'application/pdf',
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/x-hwp', 'application/haansofthwp', 'application/vnd.hancom.hwpx',
    'application/zip',
    'text/plain'
  ]
)
on conflict (id) do nothing;
