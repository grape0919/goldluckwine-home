import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
import type { WineRow } from '@/lib/supabase';
import type { PartnerRow } from '@/api/partners';
import {
  fetchWinePrices,
  fetchOrderSettings,
  effectiveUnitPrice,
  vatOf,
} from '@/api/pricing';
import type { WinePriceRow, OrderSettings } from '@/api/pricing';
import {
  fetchOrderableWines,
  fetchCartItems,
  setCartQty,
  listMyOrders,
} from '@/api/orders';
import type { OrderRow } from '@/api/orders';

const { home, font } = customedTheme;

interface OrderCatalogProps {
  partner: PartnerRow;
}

/** 승인 거래처의 발주 화면 — 화면이 곧 장바구니다.
 *  병수 변경은 즉시 DB(cart_items)에 저장돼 기기·세션을 넘어 유지된다. */
const OrderCatalog = ({ partner }: OrderCatalogProps) => {
  const navigate = useNavigate();
  const [wines, setWines] = useState<WineRow[]>([]);
  const [prices, setPrices] = useState<Record<number, WinePriceRow>>({});
  const [qty, setQty] = useState<Record<number, number>>({});
  const [settings, setSettings] = useState<OrderSettings | null>(null);
  const [awaiting, setAwaiting] = useState<OrderRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // 저장 신뢰성 — 변경은 순서대로 저장(체인)하고, 실패분은 dirty 로 남겨
  // '발주서 확인' 시 전부 재동기화한 뒤에만 다음 화면으로 넘어간다
  const qtyRef = useRef<Record<number, number>>({});
  const dirty = useRef<Set<number>>(new Set());
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());
  const [saveError, setSaveError] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchOrderableWines(),
      fetchWinePrices(),
      fetchCartItems(),
      fetchOrderSettings(),
      listMyOrders().catch(() => [] as OrderRow[]),
    ])
      .then(([wineRows, priceMap, cart, s, orders]) => {
        setWines(wineRows);
        setPrices(priceMap);
        setSettings(s);
        setAwaiting(
          orders.filter((o) => !o.paid_at && o.status !== 'canceled'),
        );
        const map: Record<number, number> = {};
        for (const c of cart) map[c.wine_id] = c.qty;
        setQty(map);
        qtyRef.current = map;
      })
      .catch((e) => setError(`불러오기 실패: ${(e as Error).message}`))
      .finally(() => setLoaded(true));
  }, []);

  const changeQty = (wineId: number, next: number) => {
    const value = Math.max(0, Math.min(999, next));
    setQty((m) => ({ ...m, [wineId]: value }));
    qtyRef.current = { ...qtyRef.current, [wineId]: value };
    dirty.current.add(wineId);
    saveQueue.current = saveQueue.current.then(async () => {
      try {
        await setCartQty(partner.id, wineId, value);
        // 저장 사이에 값이 또 바뀌지 않았을 때만 완료 처리
        if (qtyRef.current[wineId] === value) dirty.current.delete(wineId);
        if (dirty.current.size === 0) setSaveError(false);
      } catch {
        setSaveError(true);
      }
    });
  };

  /** 미저장분을 전부 동기화한 뒤 발주서 확인으로 이동 — 유실·레이스 차단 */
  const goCheckout = async () => {
    setCheckingOut(true);
    await saveQueue.current;
    let ok = true;
    for (const id of [...dirty.current]) {
      try {
        await setCartQty(partner.id, id, qtyRef.current[id] ?? 0);
        dirty.current.delete(id);
      } catch {
        ok = false;
      }
    }
    if (!ok) {
      setSaveError(true);
      setCheckingOut(false);
      return;
    }
    setSaveError(false);
    navigate('/order/checkout');
  };

  const copyAccount = async () => {
    if (!settings) return;
    try {
      await navigator.clipboard.writeText(settings.bank_account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 복사 불가 환경 — 계좌가 화면에 이미 보이므로 무시
    }
  };

  const unitOf = (wineId: number) => {
    const p = prices[wineId];
    return p ? effectiveUnitPrice(p, partner.discount_rate) : null;
  };

  const { bottles, supply, vat } = useMemo(() => {
    let b = 0;
    let s = 0;
    let v = 0;
    for (const w of wines) {
      const q = qty[w.id] ?? 0;
      const u = unitOf(w.id);
      if (q > 0 && u != null && w.sold_out !== true) {
        b += q;
        s += u * q;
        v += vatOf(u * q); // 행 단위 부가세 — 서버 계산과 동일 규칙
      }
    }
    return { bottles: b, supply: s, vat: v };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wines, qty, prices]);

  const minBottles = Number(settings?.min_bottles) || 6;
  const short = Math.max(0, minBottles - bottles);

  // 품절 품목은 하단으로 (담긴 것 정리용으로는 보이게 유지)
  const sortedWines = useMemo(
    () =>
      [...wines].sort(
        (a, b) => Number(a.sold_out === true) - Number(b.sold_out === true),
      ),
    [wines],
  );

  return (
    <Wrapper>
      {awaiting.length > 0 && settings && (
        <div className='deposit-banner'>
          <b>미입금 발주 {awaiting.length}건</b> · 합계{' '}
          {awaiting
            .reduce((s, o) => s + o.total_amount, 0)
            .toLocaleString()}
          원 → {settings.bank_name} {settings.bank_account} (예금주{' '}
          {settings.bank_holder}){' '}
          <button
            type='button'
            onClick={copyAccount}
          >
            {copied ? '복사됨 ✓' : '계좌 복사'}
          </button>{' '}
          <Link to='/order/history'>내역 보기</Link>
        </div>
      )}
      {settings?.notice && <div className='notice'>{settings.notice}</div>}
      {error && <p className='error'>{error}</p>}
      <p className='hint'>
        {partner.business_name} · 할인율 {partner.discount_rate}% 적용가 기준 ·
        가격은 <b>부가세 별도</b> (입금 시 10% 가산) · 병 단위 발주 · 최소{' '}
        {minBottles}병
      </p>

      <div className='items'>
        {sortedWines.map((w) => {
          const unit = unitOf(w.id);
          if (unit == null) return null; // 가격 미설정 품목은 숨김
          const q = qty[w.id] ?? 0;
          const soldOut = w.sold_out === true;
          const base = prices[w.id].sale_price ?? prices[w.id].price;
          return (
            <div
              key={w.id}
              className={`item${soldOut ? ' sold-out' : ''}`}
            >
              <div className='thumb'>
                {w.image_path && (
                  <img
                    src={w.image_path}
                    alt=''
                    loading='lazy'
                  />
                )}
              </div>
              <div className='info'>
                <span className='name'>
                  {w.name_en}
                  {w.name_kr && <em> {w.name_kr}</em>}
                </span>
                <span className='meta'>
                  {w.wine_type}
                  {w.vintage ? ` · ${w.vintage}` : ''}
                  {w.volume_ml ? ` · ${w.volume_ml}ml` : ''}
                </span>
                <span className='price'>
                  {soldOut ? (
                    <>
                      SOLD OUT
                      {q > 0 && (
                        <i> — 발주에서 제외됩니다. −로 정리해 주세요</i>
                      )}
                    </>
                  ) : (
                    <>
                      {unit.toLocaleString()}원
                      {unit !== prices[w.id].price && (
                        <s> {prices[w.id].price.toLocaleString()}원</s>
                      )}
                      {unit !== base && partner.discount_rate > 0 && (
                        <i> (거래처가)</i>
                      )}
                      {q > 0 && (
                        <em className='line-total'>
                          {' '}
                          · 소계 {(unit * q).toLocaleString()}원
                        </em>
                      )}
                    </>
                  )}
                </span>
              </div>
              <div className='stepper'>
                <button
                  type='button'
                  aria-label={`${w.name_en} 한 병 빼기`}
                  disabled={q === 0}
                  onClick={() => changeQty(w.id, q - 1)}
                >
                  −
                </button>
                <input
                  inputMode='numeric'
                  value={q}
                  disabled={soldOut}
                  aria-label={`${w.name_en} 병수`}
                  onChange={(e) =>
                    changeQty(w.id, Number(e.target.value.replace(/\D/g, '')))
                  }
                />
                <button
                  type='button'
                  aria-label={`${w.name_en} 한 병 더하기`}
                  disabled={soldOut}
                  onClick={() => changeQty(w.id, q + 1)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
        {!loaded && !error && <p className='hint'>불러오는 중…</p>}
        {loaded && wines.length === 0 && !error && (
          <p className='hint'>발주 가능한 품목을 준비 중입니다.</p>
        )}
      </div>

      <div className='total-bar'>
        {saveError && (
          <span className='save-error'>
            일부 병수 저장에 실패했습니다 — 아래 버튼을 누르면 다시 저장한 뒤
            진행합니다.
          </span>
        )}
        <span className='sum'>
          합계 <b>{bottles}</b>병
          {short > 0 && <em> · 최소 {minBottles}병까지 {short}병 부족</em>}
        </span>
        <span className='amount'>
          <small>
            공급가 {supply.toLocaleString()} + VAT {vat.toLocaleString()} ={' '}
          </small>
          {(supply + vat).toLocaleString()}원
        </span>
        <button
          type='button'
          disabled={bottles === 0 || short > 0 || checkingOut}
          onClick={goCheckout}
        >
          {checkingOut ? '저장 확인 중…' : '발주서 확인'}
        </button>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  .deposit-banner {
    border: 1px solid ${home.blue};
    background: ${home.blueTint};
    color: ${home.ink};
    padding: 12px 16px;
    margin-bottom: 12px;
    font-size: 14px;
    line-height: 1.7;

    button {
      padding: 3px 12px;
      border: 1px solid ${home.brown};
      background: transparent;
      color: ${home.brown};
      font-size: 12.5px;
      cursor: pointer;
    }

    a {
      color: ${home.purple};
      font-size: 13px;
    }
  }

  .notice {
    border: 1px solid ${home.brown};
    background: ${home.yellow};
    color: ${home.ink};
    padding: 12px 16px;
    margin-bottom: 20px;
    font-size: 14px;
    white-space: pre-wrap;
  }

  .hint {
    color: ${home.gray};
    font-size: 13.5px;
  }

  .error {
    color: #b0342a;
    font-size: 14px;
  }

  .items {
    display: flex;
    flex-direction: column;
    border-top: 1px solid ${home.dark};
    margin-top: 12px;
    margin-bottom: 96px;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 4px;
    border-bottom: 1px solid ${home.dark};

    &.sold-out {
      opacity: 0.5;
    }
  }

  .thumb {
    width: 56px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;

    .name {
      font-family: ${font.en};
      font-size: 16px;
      color: ${home.ink};

      em {
        font-style: normal;
        font-family: ${font.kr};
        font-size: 13.5px;
        color: ${home.gray};
      }
    }

    .meta {
      font-size: 12.5px;
      color: ${home.grayLight};
    }

    .price {
      font-size: 14.5px;
      color: ${home.brown};
      font-weight: 600;

      s {
        color: ${home.grayLight};
        font-weight: 400;
        font-size: 13px;
      }

      i {
        font-style: normal;
        color: ${home.purple};
        font-size: 12.5px;
        font-weight: 400;
      }

      .line-total {
        font-style: normal;
        color: ${home.ink};
        font-size: 13px;
        font-weight: 600;
      }
    }
  }

  .stepper {
    display: flex;
    align-items: center;

    button {
      width: 34px;
      height: 34px;
      border: 1px solid ${home.brown};
      background: transparent;
      color: ${home.brown};
      font-size: 17px;
      cursor: pointer;

      &:disabled {
        opacity: 0.35;
        cursor: default;
      }
    }

    input {
      width: 48px;
      height: 34px;
      border: 1px solid ${home.brown};
      border-left: none;
      border-right: none;
      background: transparent;
      text-align: center;
      font-size: 15px;
      color: ${home.ink};

      &:focus {
        outline: none;
      }
    }
  }

  .total-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 90;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 16px;
    padding: 14px 24px;
    padding-bottom: calc(14px + env(safe-area-inset-bottom));
    background: ${home.ink};
    color: ${home.cream};
    font-size: 14.5px;

    .save-error {
      width: 100%;
      color: ${home.yellow};
      font-size: 12.5px;
    }

    em {
      font-style: normal;
      color: ${home.yellow};
    }

    .amount {
      margin-left: auto;
      font-size: 17px;
      font-weight: 700;

      small {
        font-size: 12px;
        font-weight: 400;
        opacity: 0.85;
      }
    }

    button {
      padding: 10px 28px;
      border: 1px solid ${home.cream};
      background: transparent;
      color: ${home.cream};
      font-family: ${font.en};
      font-size: 14px;
      letter-spacing: 0.06em;
      cursor: pointer;

      &:disabled {
        opacity: 0.4;
        cursor: default;
      }

      &:hover:not(:disabled) {
        background: ${home.cream};
        color: ${home.ink};
      }
    }
  }

  @media (max-width: 640px) {
    .items {
      margin-bottom: 170px;
    }

    .stepper {
      button {
        width: 42px;
        height: 42px;
      }

      input {
        height: 42px;
      }
    }

    .total-bar {
      padding: 12px 16px;
      padding-bottom: calc(12px + env(safe-area-inset-bottom));

      .sum {
        flex: 1;
        font-size: 13px;
      }

      .amount {
        margin-left: 0;
        width: 100%;
        text-align: right;
        font-size: 15px;
      }

      button {
        width: 100%;
        padding: 12px;
      }
    }
  }
`;

export default OrderCatalog;
