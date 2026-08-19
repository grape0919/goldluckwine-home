import { Link, redirect, useLoaderData, useParams } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import { fetchWineById, fetchWineryById } from '@/api/wines';
import { trackEvent } from '@/lib/analytics';
import type { WineInfoType } from '@/types/wine';
import type { WineryInfoType } from '@/types/winery';
import { customedTheme } from '@/styles/theme';
import CloverIcon from '@/components/CloverIcon';
import Seo, { BASE_URL } from '@/components/Seo';
import OrderQuickAdd from '@/components/OrderQuickAdd';

const { home, font, color } = customedTheme;

/** 이미지 로딩 실패 시 대체 이미지 (와인 카드와 동일) */
const DEFAULT_WINE_IMAGE = '/wines/default.png';

interface WineLoaderData {
  wine: WineInfoType;
  winery: WineryInfoType | null;
}

/** 빌드(SSG)·클라이언트 네비게이션 시점에 와인 데이터를 미리 로드 →
 *  프리렌더 HTML에 본문·메타가 박힌다. */
export async function wineLoader({ params }: LoaderFunctionArgs) {
  const wine = await fetchWineById(Number(params.wineId));
  // 존재하지 않는 id (클라이언트에서 직접 접근) — 404 로 (SSG 빌드 중엔 발생 안 함)
  if (!wine) throw redirect('/not-found');
  const winery = await fetchWineryById(wine.wineryId);
  return { wine, winery };
}

/** 와인 상세 (Figma 3557:5871) — 리스트와 같은 스플릿 타이틀 헤더 +
 *  풀블리드 프로덕트 로우(좌 보틀 / 우 반투명 정보 패널 + 스펙 테이블) */
const WineIntroPage: React.FC = () => {
  const { wineId } = useParams<{ wineId: string }>();
  const { wine, winery } = useLoaderData() as WineLoaderData;

  // GA4: 어떤 와인이 조회되는지 수집 (SSG 빌드 시점엔 실행 안 됨)
  useEffect(() => {
    trackEvent('view_item', {
      item_id: String(wine.wineId),
      item_name: wine.wineNameEN,
      item_category: wine.wineType,
      item_brand: winery?.domaine,
    });
  }, [wine.wineId, wine.wineNameEN, wine.wineType, winery?.domaine]);

  // schema.org Product — 검색엔진이 와인을 '제품'으로 구조적으로 인식
  const productJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${wine.wineNameEN} ${wine.wineNameKR}`.trim(),
    ...(wine.wineDescription && { description: wine.wineDescription }),
    ...(wine.wineImagePath && {
      image: encodeURI(`${BASE_URL}${wine.wineImagePath}`),
    }),
    ...(winery && { brand: { '@type': 'Brand', name: winery.domaine } }),
    ...(wine.wineType && { category: `내추럴 와인 · ${wine.wineType}` }),
    additionalProperty: [
      ...wine.wineVariety.map((v) => ({
        '@type': 'PropertyValue',
        name: '품종',
        value: v,
      })),
      ...(wine.vintage
        ? [{ '@type': 'PropertyValue', name: '빈티지', value: wine.vintage }]
        : []),
      ...(wine.volumeMl != null
        ? [
            {
              '@type': 'PropertyValue',
              name: '용량',
              value: `${wine.volumeMl}ml`,
            },
          ]
        : []),
      ...(wine.abv != null
        ? [
            {
              '@type': 'PropertyValue',
              name: '알코올 도수',
              value: `${wine.abv}%`,
            },
          ]
        : []),
    ],
    // 가격 미표기(수입사) — availability 만으로도 솔드아웃 상태를 구조적으로 전달
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/wines/${wine.wineId}`,
      availability: wine.soldOut
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
    },
    url: `${BASE_URL}/wines/${wine.wineId}`,
  };

  return (
    <Wrapper>
      <Seo
        title={`${wine.wineNameEN} ${wine.wineNameKR}`.trim()}
        description={wine.wineDescription?.slice(0, 160)}
        path={`/wines/${wineId}`}
        image={wine.wineImagePath || undefined}
        jsonLd={productJsonLd}
      />
      <header className='detail-header'>
        <img
          className='grape-deco'
          src='/home/winelist/grape-deco.svg'
          alt=''
          aria-hidden
        />
        <p aria-hidden>
          <span className='t-wine'>WINE</span>
          <span className='t-list'>LIST</span>
        </p>
      </header>

      <section className='product-row'>
        <div className='thumbnail'>
          {wine && (
            <img
              src={wine.wineImagePath || DEFAULT_WINE_IMAGE}
              alt={`${wine.wineNameEN} ${wine.wineNameKR} 와인 보틀`}
              onError={(e) => {
                // 무한 onError 루프 방지: 디폴트 이미지로는 한 번만 교체
                if (!e.currentTarget.src.endsWith(DEFAULT_WINE_IMAGE)) {
                  e.currentTarget.src = DEFAULT_WINE_IMAGE;
                }
              }}
            />
          )}
        </div>

        <div className='info-panel'>
          {wine ? (
            <div className='info-body'>
              <div className='names'>
                {wine.soldOut && (
                  <span className='sold-out-badge'>SOLD OUT</span>
                )}
                <h1>{wine.wineNameEN}</h1>
                <span>{wine.wineNameKR}</span>
              </div>
              <p className='description'>{wine.wineDescription}</p>
            </div>
          ) : (
            <div
              className='info-body'
              aria-hidden
            >
              <div className='names'>
                <span className='skeleton skeleton-title' />
                <span className='skeleton skeleton-sub' />
              </div>
              <span className='skeleton skeleton-text' />
            </div>
          )}

          {/* 승인 거래처에게만 공급가·담기 노출 */}
          <OrderQuickAdd
            wineId={wine.wineId}
            soldOut={wine.soldOut}
            large
          />

          <dl className='spec-table'>
            <div className='spec-row'>
              <dt>WINE MAKER</dt>
              <dd>
                {winery ? (
                  <Link to={`/wineries/${winery.id}`}>{winery.domaine}</Link>
                ) : null}
              </dd>
            </div>
            <div className='spec-row'>
              <dt>WINE TYPE</dt>
              <dd>
                {wine && (
                  <span className='type-value'>
                    <CloverIcon
                      color={
                        color.wine[wine.wineType as keyof typeof color.wine] ??
                        home.greenSoft
                      }
                      size={18}
                    />
                    {wine.wineType}
                  </span>
                )}
              </dd>
            </div>
            <div className='spec-row'>
              <dt>GRAPE</dt>
              <dd>{wine?.wineVariety.join(', ')}</dd>
            </div>
            {wine.vintage && (
              <div className='spec-row'>
                <dt>VINTAGE</dt>
                <dd>{wine.vintage}</dd>
              </div>
            )}
            {wine.volumeMl != null && (
              <div className='spec-row'>
                <dt>VOLUME</dt>
                <dd>{wine.volumeMl}ml</dd>
              </div>
            )}
            {wine.abv != null && (
              <div className='spec-row'>
                <dt>ALC.</dt>
                <dd>{wine.abv}%</dd>
              </div>
            )}
            {wine.servingTemp && (
              <div className='spec-row'>
                <dt>SERVING</dt>
                <dd>{wine.servingTemp}</dd>
              </div>
            )}
            {wine.foodPairing && (
              <div className='spec-row'>
                <dt>PAIRING</dt>
                <dd>{wine.foodPairing}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  background: ${home.cream};
  overflow: hidden;
  padding-bottom: 200px;

  .detail-header {
    position: relative;
    height: 339px;
  }

  .detail-header p {
    margin: 0;
  }

  /* 리스트 페이지와 동일한 에디토리얼 스플릿 타이틀 (Figma x=80/830) */
  .t-wine,
  .t-list {
    position: absolute;
    top: 200px;
    color: ${home.purple};
    font-family: ${font.en};
    font-size: 24px;
    line-height: 29px;
    letter-spacing: 0.02em;
  }

  .t-wine {
    left: 80px;
  }

  .t-list {
    left: 57.6%;
  }

  .grape-deco {
    position: absolute;
    top: 39px;
    right: 27px;
    width: 447px;
    pointer-events: none;
  }

  .product-row {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 640px;
    border-top: 1px solid ${home.dark};
    border-bottom: 1px solid ${home.dark};
  }

  .thumbnail {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;

    img {
      max-height: 480px;
      max-width: 60%;
      object-fit: contain;
      filter: drop-shadow(14px 18px 22px rgba(38, 35, 34, 0.35));
    }
  }

  .info-panel {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.9);
    border-left: 1px solid ${home.dark};
  }

  .info-body {
    display: flex;
    flex-direction: column;
    gap: 52px;
    padding: 40px;
  }

  .names {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    color: ${home.brown};

    .sold-out-badge {
      margin-bottom: 4px;
      padding: 5px 12px;
      border: 1px solid ${home.dark};
      color: ${home.ink};
      font-family: ${font.en};
      font-style: italic;
      font-size: 13px;
      line-height: 16px;
      letter-spacing: 0.08em;
    }

    h1 {
      margin: 0;
      font-family: ${font.en};
      font-weight: 400;
      font-size: 26px;
      line-height: 31px;
    }

    span {
      font-family: ${font.kr};
      font-size: 18px;
      line-height: 21px;
    }
  }

  .description {
    margin: 0;
    color: ${home.brown};
    font-family: ${font.kr};
    font-size: 15px;
    line-height: 28px;
    word-break: keep-all;
  }

  .spec-table {
    margin: 0;
  }

  .spec-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    min-height: 54px;
    box-sizing: border-box;
    padding: 16px 40px;
    border-top: 1px solid ${home.dark};
    color: ${home.ink};
    font-family: ${font.en};
    font-size: 18px;
    line-height: 22px;

    dt {
      font-weight: 500;
    }

    dd {
      margin: 0;
      text-align: right;

      a {
        color: ${home.ink};
        text-decoration: underline;
        text-underline-offset: 4px;
        transition: color 0.2s;

        &:hover {
          color: ${home.purple};
        }
      }
    }
  }

  .type-value {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  /* 로딩 스켈레톤 (리스트 페이지 shimmer와 동일 톤) */
  .skeleton {
    display: block;
    background: linear-gradient(
      100deg,
      rgba(38, 35, 34, 0.06) 40%,
      rgba(38, 35, 34, 0.12) 50%,
      rgba(38, 35, 34, 0.06) 60%
    );
    background-size: 200% 100%;
    animation: winedetail-shimmer 1.6s linear infinite;
  }

  .skeleton-title {
    width: 240px;
    height: 31px;
  }

  .skeleton-sub {
    width: 120px;
    height: 21px;
  }

  .skeleton-text {
    width: 100%;
    height: 140px;
  }

  @keyframes winedetail-shimmer {
    from {
      background-position: 120% 0;
    }
    to {
      background-position: -80% 0;
    }
  }

  @media (max-width: 1024px) {
    padding-bottom: 120px;

    .detail-header {
      height: 220px;
    }

    .t-wine,
    .t-list {
      top: 140px;
    }

    .t-wine {
      left: 24px;
    }

    .grape-deco {
      top: 24px;
      right: 0;
      width: min(360px, 40vw);
    }

    .info-body {
      gap: 36px;
      padding: 32px 24px;
    }

    .spec-row {
      padding: 16px 24px;
    }
  }

  @media (max-width: 768px) {
    .detail-header {
      height: 170px;
    }

    .t-wine,
    .t-list {
      top: 104px;
    }

    .product-row {
      grid-template-columns: 1fr;
    }

    .thumbnail {
      padding: 40px 24px;

      img {
        max-height: 360px;
      }
    }

    .info-panel {
      border-left: none;
      border-top: 1px solid ${home.dark};
    }
  }
`;

export default WineIntroPage;
