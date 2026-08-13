-- B2B·일반 문의 (공개 /contact 폼 → 관리자 '문의' 탭)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run

create table if not exists public.inquiries (
  id         bigint generated always as identity primary key,
  name       text not null,                 -- 담당자 이름
  company    text not null default '',      -- 업장/회사명 (선택)
  contact    text not null,                 -- 이메일 또는 전화
  message    text not null,                 -- 문의 내용
  status     text not null default 'new',   -- new | done
  created_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;

-- 방문자는 등록만 가능 (조회 불가 — 개인정보 보호)
drop policy if exists "public insert inquiries" on public.inquiries;
create policy "public insert inquiries" on public.inquiries
  for insert to anon, authenticated with check (true);

-- 관리자(로그인 사용자)만 조회·상태 변경·삭제
drop policy if exists "admin read inquiries" on public.inquiries;
create policy "admin read inquiries" on public.inquiries
  for select to authenticated using (true);

drop policy if exists "admin update inquiries" on public.inquiries;
create policy "admin update inquiries" on public.inquiries
  for update to authenticated using (true) with check (true);

drop policy if exists "admin delete inquiries" on public.inquiries;
create policy "admin delete inquiries" on public.inquiries
  for delete to authenticated using (true);
