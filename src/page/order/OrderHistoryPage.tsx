import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Seo from '@/components/Seo';
import OrderShell from '@/page/order/OrderShell';
import { useOrderAuth } from '@/page/order/useOrderAuth';
import { customedTheme } from '@/styles/theme';
import {
  listMyOrders,
  cancelMyOrder,
  refillCartFromOrder,
  ORDER_STATUS_LABEL,
} from '@/api/orders';
import type { OrderRow } from '@/api/orders';
import { fetchOrderSettings, ORDER_SETTING_DEFAULTS } from '@/api/pricing';
import type { OrderSettings } from '@/api/pricing';
import { openStatement } from '@/utils/statement';

const { home } = customedTheme;

/** 내 발주 내역 — 상태 확인, 입금대기 취소, 재발주 */
const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { partner, loading } = useOrderAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<OrderSettings>({
    ...ORDER_SETTING_DEFAULTS,
  });

  const load = useCallback(() => {
    listMyOrders()
      .then(setOrders)
      .catch((e) => setError(`불러오기 실패: ${(e as Error).message}`));
  }, []);

  useEffect(() => {
    if (!partner) return;
    load();
    fetchOrderSettings()
      .then(setSettings)
      .catch(() => undefined);
  }, [partner, load]);

  const handleCancel = async (id: number) => {
    if (!window.confirm(`발주 No.${id} 를 취소할까요?`)) return;
    try {
      await cancelMyOrder(id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleReorder = async (order: OrderRow) => {
    if (!partner) return;
    try {
      await refillCartFromOrder(partner.id, order);
      navigate('/order');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (loading) return <OrderShell />;

  return (
    <OrderShell>
      <Seo
        title='발주 내역'
        noindex
      />
      <p className='order-eyebrow'>FOR BUSINESS</p>
      <h1>ORDER HISTORY</h1>
      {error && <p className='order-error'>{error}</p>}
      <List>
        {orders.map((o) => (
          <li key={o.id}>
            <button
              type='button'
              className='row'
              onClick={() => setOpen(open === o.id ? null : o.id)}
            >
              <span className='no'>No.{o.id}</span>
              <span>{new Date(o.created_at).toLocaleDateString('ko-KR')}</span>
              <span>{o.total_bottles}병</span>
              <span className='amt'>{o.total_amount.toLocaleString()}원</span>
              <span className={`badge st-${o.status}`}>
                {ORDER_STATUS_LABEL[o.status]}
              </span>
              {o.invoiced_at && <span className='badge st-done'>계산서 ✓</span>}
            </button>
            {open === o.id && (
              <div className='detail'>
                {o.order_items.map((i) => (
                  <div key={i.id}>
                    {i.name_en} × {i.qty}병 = {i.amount.toLocaleString()}원
                  </div>
                ))}
                <div className='detail-meta'>
                  배송지 {o.address}
                  {o.memo && <> · 메모 {o.memo}</>}
                  {o.deposit_deadline && o.status === 'awaiting_deposit' && (
                    <>
                      {' '}
                      · 입금 기한{' '}
                      {new Date(o.deposit_deadline).toLocaleDateString('ko-KR')}
                    </>
                  )}
                  {o.invoiced_at && (
                    <>
                      {' '}
                      · 세금계산서 발행{' '}
                      {new Date(o.invoiced_at).toLocaleDateString('ko-KR')}
                    </>
                  )}
                </div>
                <div className='actions'>
                  {o.status === 'awaiting_deposit' && (
                    <button
                      type='button'
                      onClick={() => handleCancel(o.id)}
                    >
                      발주 취소
                    </button>
                  )}
                  <button
                    type='button'
                    onClick={() => handleReorder(o)}
                  >
                    재발주 (장바구니에 담기)
                  </button>
                  {o.status !== 'canceled' && partner && (
                    <button
                      type='button'
                      onClick={() =>
                        openStatement(
                          o,
                          {
                            business_name: partner.business_name,
                            business_no: partner.business_no,
                            ceo_name: partner.ceo_name,
                            address: o.address || partner.address,
                            phone: partner.phone,
                          },
                          settings,
                        )
                      }
                    >
                      거래명세표
                    </button>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
        {orders.length === 0 && (
          <p className='order-hint'>
            발주 내역이 없습니다. <Link to='/order'>첫 발주 하러 가기</Link>
          </p>
        )}
      </List>
    </OrderShell>
  );
};

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid ${home.dark};

  li {
    border-bottom: 1px solid ${home.dark};
  }

  .row {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 14px 4px;
    border: none;
    background: none;
    font-size: 14.5px;
    color: ${home.ink};
    cursor: pointer;
    text-align: left;

    .no {
      font-weight: 700;
      color: ${home.brown};
    }

    .amt {
      margin-left: auto;
      font-weight: 600;
    }
  }

  .badge {
    padding: 2px 10px;
    border: 1px solid ${home.dark};
    font-size: 12px;

    &.st-awaiting_deposit {
      background: ${home.yellow};
    }
    &.st-paid,
    &.st-shipping {
      background: ${home.blueTint};
    }
    &.st-done {
      background: #e4efe4;
    }
    &.st-canceled {
      opacity: 0.5;
    }
  }

  .detail {
    padding: 4px 4px 16px 4px;
    font-size: 13.5px;
    color: ${home.gray};
  }

  .detail-meta {
    margin-top: 8px;
    font-size: 12.5px;
    color: ${home.grayLight};
  }

  .actions {
    display: flex;
    gap: 10px;
    margin-top: 12px;

    button {
      padding: 7px 16px;
      border: 1px solid ${home.brown};
      background: transparent;
      color: ${home.brown};
      font-size: 13px;
      cursor: pointer;
    }
  }
`;

export default OrderHistoryPage;
