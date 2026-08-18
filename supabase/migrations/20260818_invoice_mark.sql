-- 세금계산서 발행 기록 (B2B 발주 시스템 Phase 4 — 홈택스 반자동)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- 발행은 홈택스에서 하고(무료), 시스템은 대장 생성과 발행 여부 기록을 담당한다.

alter table public.orders
  add column if not exists invoiced_at timestamptz;  -- null = 미발행

-- 거래처 update 가드(orders_guard)는 관리자 외 변경을 이미 차단하므로 추가 정책 불필요
