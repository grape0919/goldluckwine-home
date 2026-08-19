-- 발주 프로세스 변경: 입금확인을 상태 흐름에서 분리 (B2B 발주)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- 선행: 20260819_admin_add_item.sql
--
-- 수입사 실무는 "배송 먼저, 입금 나중"이 흔하다.
-- 상태 흐름은 접수 → 배송중 → 완료 로 단순화하고,
-- 입금 여부는 orders.paid_at (별도 플래그)로 관리한다.

-- 기존 '입금확인(paid)' 상태 발주를 접수로 되돌린다 (paid_at 은 이미 기록돼 있음)
update public.orders set status = 'awaiting_deposit' where status = 'paid';

-- ────────────────────────────────────────────────────────────
-- 발주 품목 일괄 수정 RPC — 수량·단가 변경, 수량 0 이면 삭제.
-- 변경 후 공급가·부가세·입금액·병수를 재계산한다.
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

  select order_id into v_order_id
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
