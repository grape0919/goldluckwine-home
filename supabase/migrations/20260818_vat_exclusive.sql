-- 부가세 별도 전환 (B2B 발주)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- 공급가(wine_prices)는 부가세 별도 가격이며, 발주 시 부가세 10% 를 더해
-- 입금 금액(total_amount)을 만든다.
--   subtotal        = 할인 전 공급가 합계
--   discount_amount = 공급가 기준 할인액
--   vat_amount      = 부가세 (품목 행별 10% 반올림의 합 — 거래명세표와 일치)
--   total_amount    = 공급가(할인 후) + 부가세 = 실제 입금 금액

alter table public.orders
  add column if not exists vat_amount int not null default 0;

create or replace function public.submit_order(p_address text, p_memo text)
returns bigint
language plpgsql security definer
set search_path = public
as $$
declare
  v_partner   public.partners%rowtype;
  v_min       int;
  v_days      int;
  v_bottles   int := 0;
  v_subtotal  int := 0;
  v_supply    int := 0;
  v_vat       int := 0;
  v_order_id  bigint;
begin
  select * into v_partner from public.partners
    where user_id = auth.uid() and status = 'approved';
  if not found then
    raise exception '승인된 거래처만 발주할 수 있습니다.';
  end if;

  select coalesce(nullif(value, '')::int, 6) into v_min
    from public.order_settings where key = 'min_bottles';
  if not found then v_min := 6; end if;
  select coalesce(nullif(value, '')::int, 3) into v_days
    from public.order_settings where key = 'deposit_days';
  if not found then v_days := 3; end if;

  -- 발주 가능·가격 있는 품목만 집계 (솔드아웃·숨김·가격삭제 품목은 제외)
  create temp table tmp_items on commit drop as
  select c.wine_id, c.qty, w.name_en, w.name_kr,
         floor((coalesce(p.sale_price, p.price))
               * (1 - v_partner.discount_rate / 100))::int as unit_price,
         coalesce(p.sale_price, p.price) as base_price
  from public.cart_items c
  join public.wines w on w.id = c.wine_id
  join public.wine_prices p on p.wine_id = c.wine_id
  where c.partner_id = v_partner.id
    and w.orderable = true
    and coalesce(w.is_visible, true) = true
    and coalesce(w.sold_out, false) = false;

  select coalesce(sum(qty), 0),
         coalesce(sum(base_price * qty), 0),
         coalesce(sum(unit_price * qty), 0),
         coalesce(sum(round(unit_price * qty * 0.1)), 0)
    into v_bottles, v_subtotal, v_supply, v_vat from tmp_items;

  if v_bottles = 0 then
    raise exception '발주 가능한 품목이 장바구니에 없습니다.';
  end if;
  if v_bottles < v_min then
    raise exception '최소 발주 수량(%병)에 %병이 부족합니다.', v_min, v_min - v_bottles;
  end if;

  insert into public.orders
    (partner_id, total_bottles, subtotal, discount_amount, vat_amount,
     total_amount, address, memo, deposit_deadline)
  values
    (v_partner.id, v_bottles, v_subtotal, v_subtotal - v_supply, v_vat,
     v_supply + v_vat,
     coalesce(nullif(trim(p_address), ''), v_partner.address),
     coalesce(p_memo, ''), (now() + make_interval(days => v_days))::date)
  returning id into v_order_id;

  insert into public.order_items
    (order_id, wine_id, name_en, name_kr, unit_price, qty, amount)
  select v_order_id, wine_id, name_en, name_kr, unit_price, qty,
         unit_price * qty
  from tmp_items;

  -- 제출된 품목만 장바구니에서 비운다
  delete from public.cart_items c
  using tmp_items t
  where c.partner_id = v_partner.id and c.wine_id = t.wine_id;

  return v_order_id;
end $$;

revoke all on function public.submit_order(text, text) from public;
grant execute on function public.submit_order(text, text) to authenticated;
