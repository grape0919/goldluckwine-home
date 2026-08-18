import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Seo from '@/components/Seo';
import OrderShell from '@/page/order/OrderShell';
import { fetchOrderById } from '@/api/orders';
import type { OrderRow } from '@/api/orders';
import { fetchOrderSettings } from '@/api/pricing';
import type { OrderSettings } from '@/api/pricing';
import { trackEvent } from '@/lib/analytics';

/** 발주 완료 — 입금 안내. RLS 로 본인 발주만 조회된다. */
const OrderCompletePage = () => {
  const [params] = useSearchParams();
  const id = Number(params.get('id'));
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [settings, setSettings] = useState<OrderSettings | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setLoaded(true);
      return;
    }
    Promise.all([fetchOrderById(id), fetchOrderSettings()])
      .then(([o, s]) => {
        setOrder(o);
        setSettings(s);
        // GA purchase — 새로고침·뒤로가기로 재방문해도 발주당 1회만
        const gaKey = `glw:purchase:${id}`;
        if (o && !sessionStorage.getItem(gaKey)) {
          sessionStorage.setItem(gaKey, '1');
          trackEvent('purchase', {
            transaction_id: String(o.id),
            value: o.total_amount,
            currency: 'KRW',
          });
        }
      })
      .catch((e) => setError(`불러오기 실패: ${(e as Error).message}`))
      .finally(() => setLoaded(true));
  }, [id]);

  return (
    <OrderShell>
      <Seo
        title='발주 완료'
        noindex
      />
      <p className='order-eyebrow'>FOR BUSINESS</p>
      <h1>ORDER PLACED</h1>
      {error && <p className='order-error'>{error}</p>}
      {!loaded && <p className='order-hint'>발주 정보를 불러오는 중…</p>}
      {loaded && !order && !error && (
        <div className='status-card'>
          발주 정보를 찾을 수 없습니다. 발주 내역에서 확인해 주세요.
        </div>
      )}
      {order && (
        <div className='status-card'>
          발주 No.{order.id} 이 접수되었습니다.
          <br />
          {order.order_items.map((i) => (
            <div key={i.id}>
              {i.name_en} × {i.qty}병
            </div>
          ))}
          <hr />
          합계 {order.total_bottles}병
          {order.vat_amount > 0 && (
            <>
              {' '}
              · 공급가 {(order.total_amount - order.vat_amount).toLocaleString()}
              원 + 부가세 {order.vat_amount.toLocaleString()}원
            </>
          )}{' '}
          · <b>입금액 {order.total_amount.toLocaleString()}원</b>
          <br />
          <br />
          <strong>입금 안내</strong>
          <br />
          {settings?.bank_name || settings?.bank_account ? (
            <>
              {settings.bank_name} {settings.bank_account} (예금주{' '}
              {settings.bank_holder})
            </>
          ) : (
            '입금 계좌는 별도로 안내드립니다.'
          )}
          <br />
          입금자명은 상호로 해주세요.
          {order.deposit_deadline && (
            <>
              {' '}
              기한:{' '}
              {new Date(order.deposit_deadline).toLocaleDateString('ko-KR')}
            </>
          )}
          <br />
          입금 확인 후 배송이 시작되며, 배송 완료 후 전자세금계산서가
          발행됩니다.
        </div>
      )}
      <div className='order-links'>
        <Link to='/order/history'>발주 내역 보기</Link>
        <Link to='/order'>발주 화면으로</Link>
      </div>
    </OrderShell>
  );
};

export default OrderCompletePage;
