-- 재고 연동 (B2B 발주)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- 선행: 20260819_order_flow.sql
--
-- 정책: 발주 제출과 동시에 재고 차감, 발주 취소 시 복구.
--       wines.stock 이 null 이면 그 품목은 재고 관리를 하지 않는다(무제한).

alter table public.wines
  add column if not exists stock int;

-- ────────────────────────────────────────────────────────────
-- 취소 시 재고 복구 — 거래처 취소·관리자 취소 모두 이 트리거를 탄다
-- ────────────────────────────────────────────────────────────
create or replace function public.restore_stock_on_cancel()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  if new.status = 'canceled' and old.status <> 'canceled' then
    update public.wines w
       set stock = w.stock + i.qty
      from public.order_items i
     where i.order_id = new.id
       and w.id = i.wine_id
       and w.stock is not null;
  end if;
  return new;
end $$;

drop trigger if exists trg_orders_restore_stock on public.orders;
create trigger trg_orders_restore_stock after update on public.orders
  for each row execute function public.restore_stock_on_cancel();

-- ────────────────────────────────────────────────────────────
-- 거래처 발주 제출 — 재고 검사 + 차감 추가
-- ────────────────────────────────────────────────────────────
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
  v_short     record;
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

  create temp table tmp_items on commit drop as
  select c.wine_id, c.qty, w.name_en, w.name_kr, w.stock,
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

  -- 재고 부족 검사 (stock is null 은 재고 관리 대상 아님)
  select name_en, stock, qty into v_short
    from tmp_items where stock is not null and stock < qty limit 1;
  if found then
    raise exception '재고가 부족합니다: % (남은 수량 %병, 발주 %병)',
      v_short.name_en, v_short.stock, v_short.qty;
  end if;

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

  -- 재고 차감 (발주와 동시에 선점)
  update public.wines w
     set stock = w.stock - t.qty
    from tmp_items t
   where w.id = t.wine_id and w.stock is not null;

  delete from public.cart_items c
  using tmp_items t
  where c.partner_id = v_partner.id and c.wine_id = t.wine_id;

  return v_order_id;
end $$;

revoke all on function public.submit_order(text, text) from public;
grant execute on function public.submit_order(text, text) to authenticated;

-- ────────────────────────────────────────────────────────────
-- 관리자 대리 발주 — 재고 차감 (부족해도 관리자 재량으로 진행, 음수 허용 안 함)
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

  update public.wines w
     set stock = greatest(w.stock - t.qty, 0)
    from tmp_admin_items t
   where w.id = t.wine_id and w.stock is not null;

  return v_order_id;
end $$;

revoke all on function public.admin_submit_order(bigint, jsonb, text, text) from public;
grant execute on function public.admin_submit_order(bigint, jsonb, text, text) to authenticated;

-- ────────────────────────────────────────────────────────────
-- 관리자 품목 추가 — 추가분만큼 차감
-- ────────────────────────────────────────────────────────────
create or replace function public.admin_add_order_item(
  p_order_id bigint,
  p_wine_id bigint,
  p_qty int,
  p_unit_price int
)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_supply   int;
  v_vat      int;
  v_discount int;
begin
  if not public.is_admin() then
    raise exception '관리자만 사용할 수 있습니다.';
  end if;
  if p_qty <= 0 or p_unit_price < 0 then
    raise exception '수량과 단가를 확인하세요.';
  end if;
  if not exists (select 1 from public.orders where id = p_order_id) then
    raise exception '발주를 찾을 수 없습니다.';
  end if;

  if exists (
    select 1 from public.order_items
    where order_id = p_order_id and wine_id = p_wine_id
  ) then
    update public.order_items
       set qty = qty + p_qty,
           unit_price = p_unit_price,
           amount = (qty + p_qty) * p_unit_price
     where order_id = p_order_id and wine_id = p_wine_id;
  else
    insert into public.order_items
      (order_id, wine_id, name_en, name_kr, unit_price, qty, amount)
    select p_order_id, w.id, w.name_en, w.name_kr, p_unit_price, p_qty,
           p_unit_price * p_qty
    from public.wines w where w.id = p_wine_id;
    if not found then
      raise exception '와인을 찾을 수 없습니다.';
    end if;
  end if;

  update public.wines
     set stock = greatest(stock - p_qty, 0)
   where id = p_wine_id and stock is not null;

  select coalesce(sum(amount), 0),
         coalesce(sum(round(amount * 0.1)), 0)
    into v_supply, v_vat
    from public.order_items where order_id = p_order_id;

  select discount_amount into v_discount
    from public.orders where id = p_order_id;

  update public.orders
     set subtotal = v_supply + coalesce(v_discount, 0),
         vat_amount = v_vat,
         total_amount = v_supply + v_vat,
         total_bottles = (
           select coalesce(sum(qty), 0)
           from public.order_items where order_id = p_order_id
         )
   where id = p_order_id;
end $$;

revoke all on function public.admin_add_order_item(bigint, bigint, int, int) from public;
grant execute on function public.admin_add_order_item(bigint, bigint, int, int) to authenticated;

-- ────────────────────────────────────────────────────────────
-- 관리자 품목 수정 — 수량 증감분만큼 재고 조정 (0 = 삭제 시 전량 복구)
-- ────────────────────────────────────────────────────────────
create or replace function public.admin_update_order_item(
  p_item_id bigint,
  p_qty int,
  p_unit_price int
)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_order_id bigint;
  v_wine_id  bigint;
  v_old_qty  int;
  v_supply   int;
  v_vat      int;
  v_discount int;
begin
  if not public.is_admin() then
    raise exception '관리자만 사용할 수 있습니다.';
  end if;
  if p_qty < 0 or p_unit_price < 0 then
    raise exception '수량과 단가를 확인하세요.';
  end if;

  select order_id, wine_id, qty into v_order_id, v_wine_id, v_old_qty
    from public.order_items where id = p_item_id;
  if not found then
    raise exception '품목을 찾을 수 없습니다.';
  end if;

  if p_qty = 0 then
    delete from public.order_items where id = p_item_id;
  else
    update public.order_items
       set qty = p_qty,
           unit_price = p_unit_price,
           amount = p_qty * p_unit_price
     where id = p_item_id;
  end if;

  -- 증가분은 차감, 감소분은 복구
  if v_wine_id is not null then
    update public.wines
       set stock = greatest(stock - (p_qty - v_old_qty), 0)
     where id = v_wine_id and stock is not null;
  end if;

  select coalesce(sum(amount), 0),
         coalesce(sum(round(amount * 0.1)), 0)
    into v_supply, v_vat
    from public.order_items where order_id = v_order_id;

  select discount_amount into v_discount
    from public.orders where id = v_order_id;

  update public.orders
     set subtotal = v_supply + coalesce(v_discount, 0),
         vat_amount = v_vat,
         total_amount = v_supply + v_vat,
         total_bottles = (
           select coalesce(sum(qty), 0)
           from public.order_items where order_id = v_order_id
         )
   where id = v_order_id;
end $$;

revoke all on function public.admin_update_order_item(bigint, int, int) from public;
grant execute on function public.admin_update_order_item(bigint, int, int) to authenticated;
