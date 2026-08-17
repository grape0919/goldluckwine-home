import { supabase } from '@/lib/supabase';

/** 발주 가격·운영 설정 — RLS: 조회는 관리자+승인 거래처, 쓰기는 관리자 */

export interface WinePriceRow {
  wine_id: number;
  price: number;
  sale_price: number | null;
}

/** 품목별 가격 맵 (wine_id → 가격) */
export async function fetchWinePrices(): Promise<Record<number, WinePriceRow>> {
  const { data, error } = await supabase.from('wine_prices').select('*');
  if (error) throw error;
  const map: Record<number, WinePriceRow> = {};
  for (const row of (data as WinePriceRow[]) ?? []) map[row.wine_id] = row;
  return map;
}

export async function upsertWinePrice(
  wineId: number,
  price: number,
  salePrice: number | null,
): Promise<void> {
  const { error } = await supabase
    .from('wine_prices')
    .upsert({ wine_id: wineId, price, sale_price: salePrice });
  if (error) throw error;
}

export async function deleteWinePrice(wineId: number): Promise<void> {
  const { error } = await supabase
    .from('wine_prices')
    .delete()
    .eq('wine_id', wineId);
  if (error) throw error;
}

/** 거래처 실구매 단가 — 품목 단가(할인가 우선) × (1 - 거래처 할인율%).
 *  할인 정책이 바뀌면 이 함수 한 곳만 고친다. 원 단위 절사. */
export function effectiveUnitPrice(
  price: WinePriceRow,
  partnerDiscountRate: number,
): number {
  const base = price.sale_price ?? price.price;
  return Math.floor(base * (1 - partnerDiscountRate / 100));
}

// ── 발주 운영 설정 ──────────────────────────────────────────

export const ORDER_SETTING_DEFAULTS = {
  min_bottles: '6',
  bank_name: '',
  bank_account: '',
  bank_holder: '',
  deposit_days: '3',
  notice: '',
  admin_email: '',
} as const;

export type OrderSettingKey = keyof typeof ORDER_SETTING_DEFAULTS;
export type OrderSettings = Record<OrderSettingKey, string>;

export async function fetchOrderSettings(): Promise<OrderSettings> {
  const settings: OrderSettings = { ...ORDER_SETTING_DEFAULTS };
  const { data, error } = await supabase.from('order_settings').select('*');
  if (error) throw error;
  for (const row of (data as { key: string; value: string }[]) ?? []) {
    if (row.key in settings) settings[row.key as OrderSettingKey] = row.value;
  }
  return settings;
}

export async function upsertOrderSettings(
  entries: Partial<OrderSettings>,
): Promise<void> {
  const rows = Object.entries(entries).map(([key, value]) => ({ key, value }));
  if (rows.length === 0) return;
  const { error } = await supabase.from('order_settings').upsert(rows);
  if (error) throw error;
}
