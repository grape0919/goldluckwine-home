import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
import { fetchWineries, fetchWines } from '@/api/wines';
import type { WineInfoType } from '@/types/wine';
import type { WineryInfoType } from '@/types/winery';
import { WineTypes } from '@/enum/wine';
import WineCard from '@/components/WineCard';

const { home, font } = customedTheme;

/** 드롭다운 화살표 (Figma chevron-down, #101010 stroke) */
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpath d='M4 6l4 4 4-4' fill='none' stroke='%23101010'/%3E%3C/svg%3E\")";

/** 와인 리스트 (Figma 3557:345) — 스플릿 타이틀 + 밑줄 드롭다운 필터 + 풀블리드 카드 그리드 */
const WineListPage: React.FC = () => {
  const [wines, setWines] = useState<WineInfoType[]>([]);
  const [wineries, setWineries] = useState<WineryInfoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // 필터 상태는 URL 쿼리에 보관 — 뒤로가기·링크 공유 시 유지
  const typeFilter = searchParams.get('type') ?? '';
  const grapeFilter = searchParams.get('grape') ?? '';
  const makerFilter = searchParams.get('maker') ?? '';

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchWines(), fetchWineries()]).then(
      ([wineList, wineryList]) => {
        if (cancelled) return;
        setWines(wineList);
        setWineries(wineryList);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const wineryNameById = useMemo(() => {
    const map: Record<number, string> = {};
    wineries.forEach((winery) => {
      map[winery.id] = winery.domaine;
    });
    return map;
  }, [wineries]);

  const grapeOptions = useMemo(() => {
    const set = new Set<string>();
    wines.forEach((wine) =>
      wine.wineVariety.forEach((v) => {
        const name = v.trim();
        if (name) set.add(name);
      }),
    );
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [wines]);

  const filtered = wines.filter(
    (wine) =>
      (!typeFilter || wine.wineType === typeFilter) &&
      (!grapeFilter || wine.wineVariety.some((v) => v.trim() === grapeFilter)) &&
      (!makerFilter || wine.wineryId === Number(makerFilter)),
  );

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => setSearchParams({}, { replace: true });
  const hasFilter = Boolean(typeFilter || grapeFilter || makerFilter);

  return (
    <Wrapper>
      <header className='list-header'>
        <img
          className='grape-deco'
          src='/home/winelist/grape-deco.svg'
          alt=''
          aria-hidden
        />
        <h1 aria-label='WINE LIST'>
          <span
            className='t-wine'
            aria-hidden
          >
            WINE
          </span>
          <span
            className='t-list'
            aria-hidden
          >
            LIST
          </span>
        </h1>
      </header>

      <div className='list-filters'>
        <select
          value={typeFilter}
          onChange={(e) => setFilter('type', e.target.value)}
          aria-label='와인 타입 필터'
        >
          <option value=''>TYPE</option>
          {Object.values(WineTypes).map((type) => (
            <option
              key={type}
              value={type}
            >
              {type}
            </option>
          ))}
        </select>
        <select
          value={grapeFilter}
          onChange={(e) => setFilter('grape', e.target.value)}
          aria-label='포도 품종 필터'
        >
          <option value=''>GRAPE</option>
          {grapeOptions.map((grape) => (
            <option
              key={grape}
              value={grape}
            >
              {grape}
            </option>
          ))}
        </select>
        <select
          value={makerFilter}
          onChange={(e) => setFilter('maker', e.target.value)}
          aria-label='와인 메이커 필터'
        >
          <option value=''>WINE MAKER</option>
          {wineries.map((winery) => (
            <option
              key={winery.id}
              value={winery.id}
            >
              {winery.domaine}
            </option>
          ))}
        </select>
        {hasFilter && (
          <button
            type='button'
            className='filter-reset'
            onClick={resetFilters}
          >
            RESET
          </button>
        )}
        {!loading && (
          <span className='filter-count'>
            {filtered.length} WINE{filtered.length === 1 ? '' : 'S'}
          </span>
        )}
      </div>

      {loading ? (
        <div
          className='wine-grid'
          aria-hidden
        >
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className='skeleton-cell'
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className='empty-state'>
          <p>조건에 맞는 와인이 없습니다.</p>
          <button
            type='button'
            onClick={resetFilters}
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className='wine-grid'>
          {filtered.map((wine) => (
            <WineCard
              key={wine.wineId}
              wine={wine}
              wineryName={wineryNameById[wine.wineryId]}
            />
          ))}
        </div>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background: ${home.cream};
  overflow: hidden;

  .list-header {
    position: relative;
    height: 309px;
  }

  .list-header h1 {
    margin: 0;
    font-weight: 400;
  }

  /* 에디토리얼 스플릿 타이틀: WINE은 좌측 여백, LIST는 57.6% 지점 (Figma x=80/830) */
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
    width: 378px;
    pointer-events: none;
  }

  .list-filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding: 16px 80px;
  }

  .list-filters select {
    appearance: none;
    -webkit-appearance: none;
    background: transparent ${CHEVRON} no-repeat right 12px center;
    border: none;
    border-bottom: 1px solid ${home.dark};
    border-radius: 0;
    padding: 12px 40px 12px 12px;
    color: ${home.ink};
    font-family: ${font.en};
    font-style: italic;
    font-size: 16px;
    text-transform: uppercase;
    cursor: pointer;
  }

  .filter-reset {
    background: none;
    border: none;
    padding: 4px 0;
    color: ${home.gray};
    font-family: ${font.en};
    font-style: italic;
    font-size: 14px;
    letter-spacing: 0.04em;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .filter-count {
    margin-left: auto;
    color: ${home.grayLight};
    font-family: ${font.en};
    font-style: italic;
    font-size: 14px;
    letter-spacing: 0.06em;
  }

  .wine-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-top: 1px solid ${home.dark};
    margin-bottom: 200px;

    > * {
      border-right: 1px solid ${home.dark};
      border-bottom: 1px solid ${home.dark};
    }
  }

  .skeleton-cell {
    height: 656px;
    background: linear-gradient(
      100deg,
      rgba(38, 35, 34, 0.04) 40%,
      rgba(38, 35, 34, 0.09) 50%,
      rgba(38, 35, 34, 0.04) 60%
    );
    background-size: 200% 100%;
    animation: winelist-shimmer 1.6s linear infinite;
  }

  @keyframes winelist-shimmer {
    from {
      background-position: 120% 0;
    }
    to {
      background-position: -80% 0;
    }
  }

  .empty-state {
    padding: 140px 24px 220px;
    text-align: center;
    color: ${home.gray};
    font-family: ${font.kr};
    font-size: 17px;

    p {
      margin: 0 0 24px;
    }

    button {
      background: none;
      border: 1px solid ${home.dark};
      padding: 12px 36px;
      color: ${home.ink};
      font-family: ${font.kr};
      font-size: 15px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #ffffff;
      }
    }
  }

  @media (max-width: 1024px) {
    .list-header {
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
      width: min(320px, 36vw);
    }

    .list-filters {
      padding: 16px 24px;
    }

    .wine-grid {
      grid-template-columns: repeat(2, 1fr);
      margin-bottom: 120px;
    }

    .skeleton-cell {
      height: 476px;
    }
  }

  @media (max-width: 768px) {
    .list-header {
      height: 170px;
    }

    .t-wine,
    .t-list {
      top: 104px;
    }

    .wine-grid {
      grid-template-columns: 1fr;

      > * {
        border-right: none;
      }
    }
  }
`;

export default WineListPage;
