-- 홈 화면 문구·이미지 관리 (관리자 '홈 콘텐츠' 탭)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- key-value 구조 — 값이 없는 키는 코드에 하드코딩된 기본값으로 폴백됩니다.

create table if not exists public.home_content (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_home_content_updated on public.home_content;
create trigger trg_home_content_updated before update on public.home_content
  for each row execute function public.set_updated_at();

alter table public.home_content enable row level security;

-- 누구나 조회 (공개 홈페이지)
drop policy if exists "public read home_content" on public.home_content;
create policy "public read home_content" on public.home_content
  for select using (true);

-- 로그인한 관리자만 쓰기
drop policy if exists "admin write home_content" on public.home_content;
create policy "admin write home_content" on public.home_content
  for all to authenticated using (true) with check (true);
