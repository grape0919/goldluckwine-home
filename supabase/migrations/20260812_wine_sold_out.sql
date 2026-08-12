-- 와인 솔드아웃 표시 (관리자 '솔드아웃' 토글)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- 기존 와인은 모두 판매 중(false) 상태로 유지됩니다.

alter table public.wines
  add column if not exists sold_out boolean not null default false;
