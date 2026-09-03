-- 환불·세금계산서 수정발행 추적 (전체/부분 환불 기능)
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- 선행: 20260818_invoice_mark.sql (orders.invoiced_at)
--
-- 전체 환불 = 완료 발주를 취소로 전환 (재고 복구는 기존 restore_stock_on_cancel
-- 트리거가 처리, paid_at 은 유지해 "입금 받았던 발주가 취소됨 = 환불"이 기록에 남는다)
-- 부분 환불 = 기존 admin_update_order_item 으로 수량 축소 (재고·금액 자동 조정)
--
-- 세금계산서를 이미 발행한 발주가 취소되거나 금액이 바뀌면 홈택스에서
-- 수정(취소)세금계산서를 수기로 발행해야 한다. 그 필요 여부를 자동 감지하기 위해
-- 발행 시점의 금액을 스냅샷으로 남기고, 수기 처리 완료를 기록한다.

alter table public.orders
  add column if not exists invoiced_amount int,            -- 계산서 발행 시점의 입금액 스냅샷
  add column if not exists invoice_amended_at timestamptz; -- 수정(취소)세금계산서 수기 처리 완료 시각

-- 기존 발행 건은 현재 금액을 발행 금액으로 간주 (발행 후 수정된 건이 있다면
-- 관리자 화면에서 다시 표시되지 않도록 현재 값으로 맞춘다)
update public.orders
   set invoiced_amount = total_amount
 where invoiced_at is not null
   and invoiced_amount is null;
