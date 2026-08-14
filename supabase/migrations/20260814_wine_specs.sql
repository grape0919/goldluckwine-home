-- 와인 상품 스펙 확장 (빈티지·용량·도수·서빙온도·푸드페어링)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- 모두 선택 입력 — 값이 없으면 상세 페이지 스펙표에서 해당 행이 숨겨진다.

alter table public.wines
  add column if not exists vintage      text not null default '',       -- '2023', 'NV' 등
  add column if not exists volume_ml    int,                             -- 750
  add column if not exists abv          numeric(4, 1),                   -- 12.5 (%)
  add column if not exists serving_temp text not null default '',        -- '10~12°C'
  add column if not exists food_pairing text not null default '';        -- 푸드 페어링 설명
