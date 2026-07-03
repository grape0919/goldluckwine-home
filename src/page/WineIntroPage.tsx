import { Link, useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { fetchWineById, fetchWineryById } from '@/api/wines';
import type { WineInfoType } from '@/types/wine';
import type { WineryInfoType } from '@/types/winery';
import { customedTheme } from '@/styles/theme';
import CloverIcon from '@/components/CloverIcon';

const { home, font, color } = customedTheme;

/** 이미지 로딩 실패 시 대체 이미지 (와인 카드와 동일) */
const DEFAULT_WINE_IMAGE = '/wines/default.png';

/** 와인 상세 (Figma 3557:5871) — 리스트와 같은 스플릿 타이틀 헤더 +
 *  풀블리드 프로덕트 로우(좌 보틀 / 우 반투명 정보 패널 + 스펙 테이블) */
const WineIntroPage: React.FC = () => {
  const { wineId } = useParams<{ wineId: string }>();
  const navigate = useNavigate();
  const [wine, setWine] = useState<WineInfoType | null>(null);
  const [winery, setWinery] = useState<WineryInfoType | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchWineById(Number(wineId)).then((found) => {
      if (cancelled) return;
      if (!found) {
        // 존재하지 않는 와인 id — 이전 페이지로 복귀
        navigate(-1);
        return;
      }
      setWine(found);
      fetchWineryById(found.wineryId).then((w) => {
        if (!cancelled) setWinery(w);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate, wineId]);

  return (
    <Wrapper>
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
              alt={
                '골드럭와인 Gold Luck Wine 와인수입사 : ' +
                wine.wineNameKR +
                ', ' +
                wine.wineNameEN
              }
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
    gap: 8px;
    color: ${home.brown};

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
