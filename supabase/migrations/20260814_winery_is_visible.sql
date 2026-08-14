-- 도멘(와이너리) 노출/숨김 토글 (관리자 '도멘 관리' 탭)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- 숨긴 도멘은 공개 사이트의 도멘 목록·상세에서 빠지고, 소속 와인도 함께 숨겨진다.

alter table public.wineries
  add column if not exists is_visible boolean not null default true;
