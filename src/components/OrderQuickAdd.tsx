import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchMyPartner } from '@/api/partners';
import type { PartnerRow } from '@/api/partners';
import { fetchWinePrices, effectiveUnitPrice } from '@/api/pricing';
import type { WinePriceRow } from '@/api/pricing';
import { fetchCartItems, setCartQty } from '@/api/orders';

const { home, font } = customedTheme;

/** 승인 거래처 세션 + 가격·장바구니 — 카탈로그 여러 카드가 공유하도록 모듈 캐시 */
interface QuickAddContext {
  partner: PartnerRow | null;
  prices: Record<number, WinePriceRow>;
  cart: Record<number, number>;
}
let cache: QuickAddContext | null = null;
let inflight: Promise<QuickAddContext> | null = null;

async function loadContext(): Promise<QuickAddContext> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return { partner: null, prices: {}, cart: {} };
    const partner = await fetchMyPartner().catch(() => null);
    if (!partner || partner.status !== 'approved') {
      return { partner: null, prices: {}, cart: {} };
    }
    const [prices, cartRows] = await Promise.all([
      fetchWinePrices().catch(() => ({}) as Record<number, WinePriceRow>),
      fetchCartItems().catch(() => []),
    ]);
    const cart: Record<number, number> = {};
    for (const c of cartRows) cart[c.wine_id] = c.qty;
    return { partner, prices, cart };
  })();
  cache = await inflight;
  inflight = null;
  return cache;
}

/** 로그아웃·발주 제출 등으로 상태가 바뀌면 다음 마운트에서 다시 읽는다 */
export const resetQuickAddCache = () => {
  cache = null;
};

interface Props {
  wineId: number;
  soldOut?: boolean;
  /** 상세 페이지용 — 여백·크기를 키운다 */
  large?: boolean;
}

/**
 * 카탈로그(와인 리스트·상세)에서 바로 담는 컨트롤.
 * 승인 거래처로 로그인한 경우에만 공급가와 스테퍼가 보이고,
 * 그 외(비로그인·미승인)에는 아무것도 렌더하지 않는다.
 */
const OrderQuickAdd = ({ wineId, soldOut, large }: Props) => {
  const [ready, setReady] = useState(false);
  const [partner, setPartner] = useState<PartnerRow | null>(null);
  const [price, setPrice] = useState<WinePriceRow | null>(null);
  const [qty, setQty] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let alive = true;
    loadContext().then((ctx) => {
      if (!alive || !ctx) return;
      setPartner(ctx.partner);
      setPrice(ctx.prices[wineId] ?? null);
      setQty(ctx.cart[wineId] ?? 0);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [wineId]);

  // 비로그인·미승인·가격 미설정이면 공개 화면과 동일하게 아무것도 노출하지 않는다
  if (!ready || !partner || !price) return null;

  const unit = effectiveUnitPrice(price, partner.discount_rate);

  const change = (next: number) => {
    const v = Math.max(0, Math.min(999, next));
    setQty(v);
    if (cache) cache.cart[wineId] = v;
    setCartQty(partner.id, wineId, v).catch(() => undefined);
  };

  return (
    <Wrapper
      $large={large}
      // 카드 전체가 링크인 곳에서도 스테퍼 클릭이 페이지 이동으로 이어지지 않게
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <span className='price'>
        {unit.toLocaleString()}원<em> 부가세 별도</em>
      </span>
      {soldOut ? (
        <span className='sold'>SOLD OUT</span>
      ) : (
        <span className='stepper'>
          <button
            type='button'
            aria-label='한 병 빼기'
            disabled={qty === 0}
            onClick={() => change(qty - 1)}
          >
            −
          </button>
          <span className='qty'>{qty}</span>
          <button
            type='button'
            aria-label='한 병 더하기'
            onClick={() => change(qty + 1)}
          >
            +
          </button>
        </span>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ $large?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: ${({ $large }) => ($large ? '14px 0 0' : '10px 24px')};
  border-top: ${({ $large }) => ($large ? 'none' : `1px solid ${home.dark}`)};
  background: ${({ $large }) => ($large ? 'transparent' : '#ffffff')};

  .price {
    color: ${home.brown};
    font-family: ${font.en};
    font-size: ${({ $large }) => ($large ? '20px' : '15px')};
    font-weight: 700;

    em {
      font-style: normal;
      font-family: ${font.kr};
      font-size: 12px;
      font-weight: 400;
      color: ${home.gray};
      margin-left: 6px;
    }
  }

  .sold {
    color: ${home.grayLight};
    font-family: ${font.en};
    font-size: 13px;
  }

  .stepper {
    display: inline-flex;
    align-items: center;

    button {
      width: ${({ $large }) => ($large ? '38px' : '32px')};
      height: ${({ $large }) => ($large ? '38px' : '32px')};
      border: 1px solid ${home.brown};
      background: transparent;
      color: ${home.brown};
      font-size: 16px;
      cursor: pointer;

      &:disabled {
        opacity: 0.35;
        cursor: default;
      }
    }

    .qty {
      min-width: ${({ $large }) => ($large ? '44px' : '38px')};
      height: ${({ $large }) => ($large ? '38px' : '32px')};
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-top: 1px solid ${home.brown};
      border-bottom: 1px solid ${home.brown};
      font-family: ${font.en};
      font-size: 15px;
    }
  }
`;

export default OrderQuickAdd;
