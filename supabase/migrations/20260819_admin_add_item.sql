-- 관리자 발주 품목 추가 (B2B 발주)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- 선행: 20260818_admin_orders.sql
-- 기존 발주에 품목을 추가하고 공급가·부가세·입금액을 재계산한다.
-- 발주 가능(orderable) 여부와 무관 — 관리자 재량.

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

  -- 같은 와인이 이미 있으면 수량을 합치고 단가는 새 값으로
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
