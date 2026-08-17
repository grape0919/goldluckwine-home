-- 관리자 권한 분리 (B2B 발주 시스템 PR 1-A)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
--
-- 배경: 지금까지는 "로그인(authenticated) = 관리자"였다. B2B 발주가 열리면
-- 거래처도 로그인 사용자가 되므로, 관리자 쓰기 권한을 admins 테이블 등재
-- 기준으로 전면 교체한다.
--
-- ⚠️ 실행 순서 중요:
--   1) 이 마이그레이션 실행
--   2) 맨 아래 안내대로 관리자 계정을 admins 에 등록
--   3) 그 다음에 코드(PR) 머지 — 등록 전에는 관리자 페이지 쓰기가 전부 거부된다

-- ────────────────────────────────────────────────────────────
-- 1) admins 테이블
-- ────────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '',
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- 본인 행 조회만 허용 — 클라이언트가 "내가 관리자인가"를 확인하는 용도.
-- 등록/삭제는 SQL Editor(service role)로만 한다.
drop policy if exists "self read admins" on public.admins;
create policy "self read admins" on public.admins
  for select to authenticated using (auth.uid() = user_id);

-- RLS 정책들이 참조할 헬퍼 — security definer 라 admins RLS 에 막히지 않는다
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- ────────────────────────────────────────────────────────────
-- 2) 기존 "authenticated = 관리자" 정책 전면 교체
--    (공개 read 정책은 그대로 둔다)
-- ────────────────────────────────────────────────────────────

-- wineries / wines (schema.sql)
drop policy if exists "admin write wineries" on public.wineries;
create policy "admin write wineries" on public.wineries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin write wines" on public.wines;
create policy "admin write wines" on public.wines
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- home_content
drop policy if exists "admin write home_content" on public.home_content;
create policy "admin write home_content" on public.home_content
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- site_meta
drop policy if exists "admin all site_meta" on public.site_meta;
create policy "admin all site_meta" on public.site_meta
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- back_labels
drop policy if exists "admin all back_labels" on public.back_labels;
create policy "admin all back_labels" on public.back_labels
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- inquiries (public insert 는 유지)
drop policy if exists "admin read inquiries" on public.inquiries;
create policy "admin read inquiries" on public.inquiries
  for select to authenticated using (public.is_admin());

drop policy if exists "admin update inquiries" on public.inquiries;
create policy "admin update inquiries" on public.inquiries
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin delete inquiries" on public.inquiries;
create policy "admin delete inquiries" on public.inquiries
  for delete to authenticated using (public.is_admin());

-- storage (wine-assets 버킷 업로드/수정/삭제)
drop policy if exists "admin write wine-assets" on storage.objects;
create policy "admin write wine-assets" on storage.objects
  for all to authenticated
  using (bucket_id = 'wine-assets' and public.is_admin())
  with check (bucket_id = 'wine-assets' and public.is_admin());

-- ────────────────────────────────────────────────────────────
-- 3) 관리자 계정 등록 (이메일을 실제 관리자 계정으로 바꿔서 실행)
-- ────────────────────────────────────────────────────────────
-- insert into public.admins (user_id, name)
-- select id, '관리자' from auth.users where email = 'admin@example.com'
-- on conflict (user_id) do nothing;
