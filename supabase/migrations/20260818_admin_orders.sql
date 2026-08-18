-- 관리자 대리 발주 + 수기 거래처 + 품목 단가 수정 (B2B 발주)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- 선행: 20260818_vat_exclusive.sql

-- 1) 계정 없는 수기 거래처 허용 — user_id 를 선택 항목으로.
--    본인용 RLS(user_id = auth.uid())는 null 행과 매치되지 않으므로
--    수기 거래처는 관리자만 조회·관리한다.
alter table public.partners alter column user_id drop not null;

-- ────────────────────────────────────────────────────────────
-- 2) 관리자 대리 발주 RPC
--    items: [{"wine_id":1,"qty":6,"unit_price":25000}, ...]
--    단가는 관리자 재량(전화 협의가), 최소 병수 미적용.
--    부가세는 품목 행별 10% 반올림 합 — submit_order 와 동일 규칙.
-- ────────────────────────────────────────────────────────────
create or replace function public.admin_submit_order(
  p_partner_id bigint,
  p_items jsonb,
  p_address text,
  p_memo text
)
returns bigint
language plpgsql security definer
set search_path = public
as $$
declare
  v_partner  public.partners%rowtype;
  v_days     int;
  v_bottles  int := 0;
  v_supply   int := 0;
  v_vat      int := 0;
  v_order_id bigint;
begin
  if not public.is_admin() then
    raise exception '관리자만 사용할 수 있습니다.';
  end if;

  select * into v_partner from public.partners where id = p_partner_id;
  if not found then
    raise exception '거래처를 찾을 수 없습니다.';
  end if;

  select coalesce(nullif(value, '')::int, 3) into v_days
    from public.order_settings where key = 'deposit_days';
  if not found then v_days := 3; end if;

  create temp table tmp_admin_items on commit drop as
  select (i->>'wine_id')::bigint as wine_id,
         (i->>'qty')::int as qty,
         (i->>'unit_price')::int as unit_price,
         w.name_en, w.name_kr
  from jsonb_array_elements(p_items) as i
  join public.wines w on w.id = (i->>'wine_id')::bigint;

  if exists (select 1 from tmp_admin_items where qty <= 0 or unit_price < 0) then
    raise exception '수량과 단가를 확인하세요.';
  end if;

  select coalesce(sum(qty), 0),
         coalesce(sum(unit_price * qty), 0),
         coalesce(sum(round(unit_price * qty * 0.1)), 0)
    into v_bottles, v_supply, v_vat from tmp_admin_items;

  if v_bottles = 0 then
    raise exception '품목이 없습니다.';
  end if;

  insert into public.orders
    (partner_id, total_bottles, subtotal, discount_amount, vat_amount,
     total_amount, address, memo, deposit_deadline)
  values
    (p_partner_id, v_bottles, v_supply, 0, v_vat, v_supply + v_vat,
     coalesce(nullif(trim(p_address), ''), v_partner.address),
     coalesce(p_memo, ''), (now() + make_interval(days => v_days))::date)
  returning id into v_order_id;

  insert into public.order_items
    (order_id, wine_id, name_en, name_kr, unit_price, qty, amount)
  select v_order_id, wine_id, name_en, name_kr, unit_price, qty,
         unit_price * qty
  from tmp_admin_items;

  return v_order_id;
end $$;

revoke all on function public.admin_submit_order(bigint, jsonb, text, text) from public;
grant execute on function public.admin_submit_order(bigint, jsonb, text, text) to authenticated;

-- ────────────────────────────────────────────────────────────
-- 3) 품목 단가 수정 RPC — 수정 후 발주 합계·부가세를 재계산해 일관성 유지
-- ────────────────────────────────────────────────────────────
create or replace function public.admin_update_item_price(
  p_item_id bigint,
  p_unit_price int
)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_order_id bigint;
  v_supply   int;
  v_vat      int;
  v_discount int;
begin
  if not public.is_admin() then
    raise exception '관리자만 사용할 수 있습니다.';
  end if;
  if p_unit_price < 0 then
    raise exception '단가는 0 이상이어야 합니다.';
  end if;

  update public.order_items
     set unit_price = p_unit_price,
         amount = p_unit_price * qty
   where id = p_item_id
   returning order_id into v_order_id;
  if not found then
    raise exception '품목을 찾을 수 없습니다.';
  end if;

  select coalesce(sum(amount), 0),
         coalesce(sum(round(amount * 0.1)), 0)
    into v_supply, v_vat
    from public.order_items where order_id = v_order_id;

  -- 할인액은 유지하고 할인 전 공급가를 역보정 (subtotal = 공급가 + 할인)
  select discount_amount into v_discount from public.orders where id = v_order_id;

  update public.orders
     set subtotal = v_supply + coalesce(v_discount, 0),
         vat_amount = v_vat,
         total_amount = v_supply + v_vat
   where id = v_order_id;
end $$;

revoke all on function public.admin_update_item_price(bigint, int) from public;
grant execute on function public.admin_update_item_price(bigint, int) to authenticated;
