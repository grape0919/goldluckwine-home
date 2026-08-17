import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
import type { WineRow } from '@/lib/supabase';
import type { PartnerRow } from '@/api/partners';
import {
  fetchWinePrices,
  fetchOrderSettings,
  effectiveUnitPrice,
} from '@/api/pricing';
import type { WinePriceRow, OrderSettings } from '@/api/pricing';
import {
  fetchOrderableWines,
  fetchCartItems,
  setCartQty,
} from '@/api/orders';

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
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetchOrderableWines(),
      fetchWinePrices(),
      fetchCartItems(),
      fetchOrderSettings(),
    ])
      .then(([wineRows, priceMap, cart, s]) => {
        setWines(wineRows);
        setPrices(priceMap);
        setSettings(s);
        const map: Record<number, number> = {};
        for (const c of cart) map[c.wine_id] = c.qty;
        setQty(map);
      })
      .catch((e) => setError(`불러오기 실패: ${(e as Error).message}`));
  }, []);

  const changeQty = (wineId: number, next: number) => {
    const value = Math.max(0, Math.min(999, next));
    setQty((m) => ({ ...m, [wineId]: value }));
    // 즉시 저장 — 실패해도 화면 값은 유지하고 다음 조작에서 재시도된다
    setCartQty(partner.id, wineId, value).catch(() => undefined);
  };

  const unitOf = (wineId: number) => {
    const p = prices[wineId];
    return p ? effectiveUnitPrice(p, partner.discount_rate) : null;
  };

  const { bottles, total } = useMemo(() => {
    let b = 0;
    let t = 0;
    for (const w of wines) {
      const q = qty[w.id] ?? 0;
      const u = unitOf(w.id);
      if (q > 0 && u != null && w.sold_out !== true) {
        b += q;
        t += u * q;
      }
    }
    return { bottles: b, total: t };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wines, qty, prices]);

  const minBottles = Number(settings?.min_bottles) || 6;
  const short = Math.max(0, minBottles - bottles);

  return (
    <Wrapper>
      {settings?.notice && <div className='notice'>{settings.notice}</div>}
      {error && <p className='error'>{error}</p>}
      <p className='hint'>
        {partner.business_name} · 할인율 {partner.discount_rate}% 적용가 기준 ·
        병 단위 발주 · 최소 {minBottles}병
      </p>

      <div className='items'>
        {wines.map((w) => {
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
                    'SOLD OUT'
                  ) : (
                    <>
                      {unit.toLocaleString()}원
                      {unit !== prices[w.id].price && (
                        <s> {prices[w.id].price.toLocaleString()}원</s>
                      )}
                      {unit !== base && partner.discount_rate > 0 && (
                        <i> (거래처가)</i>
                      )}
                    </>
                  )}
                </span>
              </div>
              <div className='stepper'>
                <button
                  type='button'
                  aria-label='빼기'
                  disabled={soldOut || q === 0}
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
                  aria-label='더하기'
                  disabled={soldOut}
                  onClick={() => changeQty(w.id, q + 1)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
        {wines.length === 0 && !error && (
          <p className='hint'>발주 가능한 품목을 준비 중입니다.</p>
        )}
      </div>

      <div className='total-bar'>
        <span>
          합계 <b>{bottles}</b>병
          {short > 0 && <em> · 최소 {minBottles}병까지 {short}병 부족</em>}
        </span>
        <span className='amount'>{total.toLocaleString()}원</span>
        <button
          type='button'
          disabled={bottles === 0 || short > 0}
          onClick={() => navigate('/order/checkout')}
        >
          발주서 확인
        </button>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
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
    align-items: center;
    gap: 16px;
    padding: 14px 24px;
    background: ${home.ink};
    color: ${home.cream};
    font-size: 14.5px;

    em {
      font-style: normal;
      color: ${home.yellow};
    }

    .amount {
      margin-left: auto;
      font-size: 17px;
      font-weight: 700;
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
`;

export default OrderCatalog;
