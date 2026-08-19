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
  isUnpaid,
} from '@/api/orders';
import type { OrderRow } from '@/api/orders';
import { fetchOrderSettings, ORDER_SETTING_DEFAULTS } from '@/api/pricing';
import type { OrderSettings } from '@/api/pricing';
import { openStatement } from '@/utils/statement';
import OrderNav from '@/page/order/OrderNav';

const { home } = customedTheme;

/** 내 발주 내역 — 상태 확인, 입금대기 취소, 재발주 */
const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { session, partner, loading } = useOrderAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<OrderSettings>({
    ...ORDER_SETTING_DEFAULTS,
  });

  const [listLoaded, setListLoaded] = useState(false);
  // 액션 결과는 해당 발주 상세 안에 표시한다 (페이지 상단은 시야 밖일 수 있음)
  const [actionMsg, setActionMsg] = useState<{
    id: number;
    text: string;
    isError: boolean;
  } | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<number | null>(null);
  const [confirmReorder, setConfirmReorder] = useState<number | null>(null);

  const load = useCallback(() => {
    listMyOrders()
      .then(setOrders)
      .catch((e) => setError(`불러오기 실패: ${(e as Error).message}`))
      .finally(() => setListLoaded(true));
  }, []);

  useEffect(() => {
    if (!partner) return;
    load();
    fetchOrderSettings()
      .then(setSettings)
      .catch(() => undefined);
  }, [partner, load]);

  const handleCancel = async (id: number) => {
    setConfirmCancel(null);
    try {
      await cancelMyOrder(id);
      load();
      setActionMsg({ id, text: '발주를 취소했습니다.', isError: false });
    } catch (e) {
      setActionMsg({ id, text: (e as Error).message, isError: true });
    }
  };

  const handleReorder = async (order: OrderRow) => {
    if (!partner) return;
    setConfirmReorder(null);
    try {
      await refillCartFromOrder(partner.id, order);
      navigate('/order');
    } catch (e) {
      setActionMsg({
        id: order.id,
        text: (e as Error).message,
        isError: true,
      });
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
      <OrderNav email={session?.user.email} />
      {error && <p className='order-error'>{error}</p>}
      <List>
        {orders.map((o) => (
          <li key={o.id}>
            <button
              type='button'
              className='row'
              aria-expanded={open === o.id}
              onClick={() => setOpen(open === o.id ? null : o.id)}
            >
              <span
                className='chevron'
                aria-hidden
              >
                {open === o.id ? '▾' : '▸'}
              </span>
              <span className='no'>No.{o.id}</span>
              <span>{new Date(o.created_at).toLocaleDateString('ko-KR')}</span>
              <span>{o.total_bottles}병</span>
              <span className='amt'>{o.total_amount.toLocaleString()}원</span>
              <span className={`badge st-${o.status}`}>
                {ORDER_STATUS_LABEL[o.status]}
              </span>
              {o.status !== 'canceled' && (
                <span
                  className={`badge ${o.paid_at ? 'st-done' : 'st-awaiting_deposit'}`}
                >
                  {o.paid_at ? '입금완료' : '미입금'}
                </span>
              )}
              {o.invoiced_at && <span className='badge st-done'>계산서 ✓</span>}
            </button>
            {open === o.id && (
              <div className='detail'>
                {o.order_items.map((i) => (
                  <div key={i.id}>
                    {i.name_en} × {i.qty}병 = {i.amount.toLocaleString()}원
                  </div>
                ))}
                {o.vat_amount > 0 && (
                  <div>
                    공급가{' '}
                    {(o.total_amount - o.vat_amount).toLocaleString()}원 +
                    부가세 {o.vat_amount.toLocaleString()}원 = 입금액{' '}
                    <b>{o.total_amount.toLocaleString()}원</b>
                  </div>
                )}
                {isUnpaid(o) && (
                  <div className='pay-info'>
                    입금 계좌: {settings.bank_name} {settings.bank_account}{' '}
                    (예금주 {settings.bank_holder}) · 입금자명은 상호로
                  </div>
                )}
                <div className='detail-meta'>
                  배송지 {o.address}
                  {o.memo && <> · 메모 {o.memo}</>}
                  {o.deposit_deadline && isUnpaid(o) && (
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
                {actionMsg?.id === o.id && (
                  <p
                    className={actionMsg.isError ? 'order-error' : 'verify-ok'}
                    role='status'
                  >
                    {actionMsg.text}
                  </p>
                )}
                <div className='actions'>
                  {o.status === 'awaiting_deposit' &&
                    (confirmCancel === o.id ? (
                      <>
                        <span className='confirm-ask'>정말 취소할까요?</span>
                        <button
                          type='button'
                          onClick={() => handleCancel(o.id)}
                        >
                          네, 취소합니다
                        </button>
                        <button
                          type='button'
                          onClick={() => setConfirmCancel(null)}
                        >
                          아니오
                        </button>
                      </>
                    ) : (
                      <button
                        type='button'
                        onClick={() => setConfirmCancel(o.id)}
                      >
                        발주 취소
                      </button>
                    ))}
                  {confirmReorder === o.id ? (
                    <>
                      <span className='confirm-ask'>
                        지금 장바구니에 같은 품목이 있으면 이 발주의 수량으로
                        바뀝니다.
                      </span>
                      <button
                        type='button'
                        onClick={() => handleReorder(o)}
                      >
                        담기
                      </button>
                      <button
                        type='button'
                        onClick={() => setConfirmReorder(null)}
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <button
                      type='button'
                      onClick={() => setConfirmReorder(o.id)}
                    >
                      재발주 (장바구니에 담기)
                    </button>
                  )}
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
      </List>
      {!listLoaded && !error && (
        <p className='order-hint'>발주 내역을 불러오는 중…</p>
      )}
      {listLoaded && orders.length === 0 && !error && (
        <p className='order-hint'>
          발주 내역이 없습니다. <Link to='/order'>첫 발주 하러 가기</Link>
        </p>
      )}
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
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 14px;
    width: 100%;
    padding: 14px 4px;
    border: none;
    background: none;
    font-size: 14.5px;
    color: ${home.ink};
    cursor: pointer;
    text-align: left;

    .chevron {
      color: ${home.grayLight};
      font-size: 12px;
    }

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

  .pay-info {
    margin-top: 8px;
    padding: 8px 12px;
    background: ${home.blueTint};
    color: ${home.ink};
    font-size: 13px;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-top: 12px;

    .confirm-ask {
      color: ${home.brown};
      font-size: 13px;
    }

    button {
      padding: 7px 16px;
      border: 1px solid ${home.brown};
      background: transparent;
      color: ${home.brown};
      font-size: 13px;
      cursor: pointer;
    }
  }

  @media (max-width: 640px) {
    .row {
      font-size: 13.5px;

      .amt {
        margin-left: 0;
      }
    }
  }
`;

export default OrderHistoryPage;
