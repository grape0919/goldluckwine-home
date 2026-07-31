-- 와인 공개/숨김 설정 (관리자 '노출' 토글)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- 기존 와인은 모두 노출(true) 상태로 유지됩니다.

alter table public.wines
  add column if not exists is_visible boolean not null default true;

create index if not exists wines_visible_idx on public.wines(is_visible);
