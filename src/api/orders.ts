import { supabase } from '@/lib/supabase';
import type { WineRow } from '@/lib/supabase';

/** 발주·장바구니 — 발주 생성은 submit_order RPC(서버 가격 계산)로만 한다 */

export type OrderStatus =
  | 'awaiting_deposit'
  | 'paid'
  | 'shipping'
  | 'done'
  | 'canceled';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  awaiting_deposit: '입금대기',
  paid: '입금확인',
  shipping: '배송중',
  done: '완료',
  canceled: '취소',
};

export interface CartItemRow {
  id: number;
  partner_id: number;
  wine_id: number;
  qty: number;
}

export interface OrderItemRow {
  id: number;
  order_id: number;
  wine_id: number | null;
  name_en: string;
  name_kr: string;
  unit_price: number;
  qty: number;
  amount: number;
}

export interface OrderRow {
  id: number;
  partner_id: number;
  status: OrderStatus;
  total_bottles: number;
  /** 할인 전 공급가 합계 (부가세 별도) */
  subtotal: number;
  discount_amount: number;
  /** 부가세 — 구버전(부가세 포함가 시절) 발주는 0 */
  vat_amount: number;
  /** 실제 입금 금액 = 공급가(할인 후) + 부가세 */
  total_amount: number;
  address: string;
  memo: string;
  deposit_deadline: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  done_at: string | null;
  canceled_at: string | null;
  /** 세금계산서 발행 시각 (홈택스 발행 후 관리자가 기록) — null = 미발행 */
  invoiced_at: string | null;
  created_at: string;
  order_items: OrderItemRow[];
}

/** GNB 배지 등이 장바구니 변경을 감지하는 브라우저 이벤트 */
export const CART_CHANGED_EVENT = 'glw:cart-changed';
export const notifyCartChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CART_CHANGED_EVENT));
  }
};

/** 발주 가능 품목 (관리자가 orderable 켠 것 — 솔드아웃은 표시용으로 포함) */
export async function fetchOrderableWines(): Promise<WineRow[]> {
  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .eq('orderable', true)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) throw error;
  return (data as WineRow[]).filter((w) => w.is_visible !== false);
}

export async function fetchCartItems(): Promise<CartItemRow[]> {
  const { data, error } = await supabase.from('cart_items').select('*');
  if (error) throw error;
  return data as CartItemRow[];
}

/** 병수 변경 — 0 이하면 삭제. RLS 가 본인·승인 거래처만 허용한다 */
export async function setCartQty(
  partnerId: number,
  wineId: number,
  qty: number,
): Promise<void> {
  if (qty <= 0) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('partner_id', partnerId)
      .eq('wine_id', wineId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('cart_items')
      .upsert(
        { partner_id: partnerId, wine_id: wineId, qty },
        { onConflict: 'partner_id,wine_id' },
      );
    if (error) throw error;
  }
  notifyCartChanged();
}

/** 발주 제출 — 서버가 가격·최소 병수를 계산·검증한다. 반환: 발주 id */
export async function submitOrder(
  address: string,
  memo: string,
): Promise<number> {
  const { data, error } = await supabase.rpc('submit_order', {
    p_address: address,
    p_memo: memo,
  });
  if (error) throw error;
  notifyCartChanged();
  return data as number;
}

export async function listMyOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as OrderRow[];
}

export async function fetchOrderById(id: number): Promise<OrderRow | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as OrderRow) ?? null;
}

/** 입금대기 상태에서만 성공한다 (DB 트리거가 강제) */
export async function cancelMyOrder(id: number): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'canceled' })
    .eq('id', id);
  if (error) throw error;
}

/** 재발주 — 이전 발주 품목을 장바구니에 다시 담는다 */
export async function refillCartFromOrder(
  partnerId: number,
  order: OrderRow,
): Promise<void> {
  const rows = order.order_items
    .filter((i) => i.wine_id != null)
    .map((i) => ({ partner_id: partnerId, wine_id: i.wine_id!, qty: i.qty }));
  if (rows.length === 0) throw new Error('다시 담을 수 있는 품목이 없습니다.');
  const { error } = await supabase
    .from('cart_items')
    .upsert(rows, { onConflict: 'partner_id,wine_id' });
  if (error) throw error;
  notifyCartChanged();
}

// ── 관리자용 ────────────────────────────────────────────────

export interface AdminOrderRow extends OrderRow {
  partners: {
    business_name: string;
    contact_name: string;
    phone: string;
    email: string;
    business_no: string;
    ceo_name: string;
    address: string;
    invoice_email: string;
  } | null;
}

export async function listOrders(): Promise<AdminOrderRow[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(
      '*, order_items(*), partners(business_name, contact_name, phone, email, business_no, ceo_name, address, invoice_email)',
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as AdminOrderRow[];
}

/** 세금계산서 발행 여부 기록 (홈택스 발행 후 체크) */
export async function markInvoiced(id: number, on: boolean): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ invoiced_at: on ? new Date().toISOString() : null })
    .eq('id', id);
  if (error) throw error;
}

/** 관리자 상태 변경 — 상태별 시각도 함께 기록 */
export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<void> {
  const stamp: Record<string, string> = {};
  const now = new Date().toISOString();
  if (status === 'paid') stamp.paid_at = now;
  if (status === 'shipping') stamp.shipped_at = now;
  if (status === 'done') stamp.done_at = now;
  if (status === 'canceled') stamp.canceled_at = now;
  const { error } = await supabase
    .from('orders')
    .update({ status, ...stamp })
    .eq('id', id);
  if (error) throw error;
}
