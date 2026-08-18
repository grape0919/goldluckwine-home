import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Seo from '@/components/Seo';
import OrderShell from '@/page/order/OrderShell';
import { useOrderAuth } from '@/page/order/useOrderAuth';
import {
  fetchWinePrices,
  fetchOrderSettings,
  effectiveUnitPrice,
  vatOf,
} from '@/api/pricing';
import type { WinePriceRow } from '@/api/pricing';
import {
  fetchOrderableWines,
  fetchCartItems,
  submitOrder,
} from '@/api/orders';
import type { WineRow } from '@/lib/supabase';

/** 발주 확인 — 품목·할인 내역·배송지 확인 후 제출.
 *  금액은 참고 표시일 뿐, 확정 계산은 서버(submit_order)가 한다. */
const OrderCheckoutPage = () => {
  const navigate = useNavigate();
  const { partner, loading } = useOrderAuth();
  const [wines, setWines] = useState<WineRow[]>([]);
  const [prices, setPrices] = useState<Record<number, WinePriceRow>>({});
  const [cart, setCart] = useState<Record<number, number>>({});
  const [minBottles, setMinBottles] = useState(6);
  const [busy, setBusy] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!partner) return;
    Promise.all([
      fetchOrderableWines(),
      fetchWinePrices(),
      fetchCartItems(),
      fetchOrderSettings(),
    ])
      .then(([wineRows, priceMap, cartRows, s]) => {
        setWines(wineRows);
        setPrices(priceMap);
        setMinBottles(Number(s.min_bottles) || 6);
        const map: Record<number, number> = {};
        for (const c of cartRows) map[c.wine_id] = c.qty;
        setCart(map);
      })
      .catch((e) => setError(`불러오기 실패: ${(e as Error).message}`))
      .finally(() => setDataLoaded(true));
  }, [partner]);

  const lines = useMemo(() => {
    if (!partner) return [];
    return wines
      .filter(
        (w) => (cart[w.id] ?? 0) > 0 && prices[w.id] && w.sold_out !== true,
      )
      .map((w) => {
        const unit = effectiveUnitPrice(prices[w.id], partner.discount_rate);
        const qty = cart[w.id];
        return { wine: w, unit, qty, amount: unit * qty };
      });
  }, [wines, prices, cart, partner]);

  const bottles = lines.reduce((s, l) => s + l.qty, 0);
  const supplyTotal = lines.reduce((s, l) => s + l.amount, 0);
  const vatTotal = lines.reduce((s, l) => s + vatOf(l.amount), 0);
  const total = supplyTotal + vatTotal;

  if (loading) return <OrderShell />;
  if (!partner || partner.status !== 'approved') {
    return <Navigate to='/order' replace />;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      const orderId = await submitOrder(
        String(data.get('address') ?? ''),
        String(data.get('memo') ?? ''),
      );
      navigate(`/order/complete?id=${orderId}`, { replace: true });
    } catch (err) {
      const msg = (err as Error).message;
      setError(
        msg.includes('Failed to fetch') || msg.includes('NetworkError')
          ? '네트워크 오류로 제출하지 못했습니다. 연결을 확인하고 다시 시도해 주세요.'
          : msg,
      );
      setBusy(false);
    }
  };

  return (
    <OrderShell>
      <Seo
        title='발주 확인'
        noindex
      />
      <p className='order-eyebrow'>FOR BUSINESS</p>
      <h1>CHECKOUT</h1>

      {!dataLoaded ? (
        <p className='order-hint'>발주서를 불러오는 중…</p>
      ) : lines.length === 0 ? (
        <div className='status-card'>
          담긴 품목이 없습니다. <Link to='/order'>발주 화면으로</Link>
        </div>
      ) : (
        <>
          <div className='order-links'>
            <Link to='/order'>← 수량 수정하러 가기</Link>
          </div>
          <div className='status-card'>
            {lines.map((l) => (
              <div key={l.wine.id}>
                {l.wine.name_en} × {l.qty}병 ={' '}
                <b>{l.amount.toLocaleString()}원</b>{' '}
                <span style={{ opacity: 0.6 }}>
                  (병당 {l.unit.toLocaleString()}원)
                </span>
              </div>
            ))}
            <hr />
            <div>
              합계 <b>{bottles}병</b> · 공급가 {supplyTotal.toLocaleString()}원
              + 부가세 {vatTotal.toLocaleString()}원 ={' '}
              <b>입금액 {total.toLocaleString()}원</b>
              {partner.discount_rate > 0 && (
                <span style={{ opacity: 0.6 }}>
                  {' '}
                  (거래처 할인 {partner.discount_rate}% 적용)
                </span>
              )}
            </div>
            {bottles < minBottles && (
              <p className='order-error'>
                최소 발주 수량 {minBottles}병에 {minBottles - bottles}병
                부족합니다. <Link to='/order'>더 담으러 가기</Link>
              </p>
            )}
          </div>

          <form
            className='order-form'
            onSubmit={handleSubmit}
          >
            <label>
              배송지 주소
              <input
                name='address'
                required
                defaultValue={partner.address}
              />
            </label>
            <label>
              요청 메모 (선택)
              <textarea
                name='memo'
                rows={3}
                placeholder='희망 배송일, 요청사항 등'
              />
            </label>
            {error && <p className='order-error'>{error}</p>}
            <button
              type='submit'
              className='order-button'
              disabled={busy || bottles < minBottles}
            >
              {busy ? '접수 중…' : '발주 제출'}
            </button>
            <p className='order-hint'>
              제출 후 안내되는 계좌로 입금해 주시면, 입금 확인 후 배송이
              시작됩니다.
            </p>
          </form>
        </>
      )}
    </OrderShell>
  );
};

export default OrderCheckoutPage;
