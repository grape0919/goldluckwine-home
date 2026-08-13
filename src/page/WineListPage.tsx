import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLoaderData, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import type { ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from 'motion/react';
import { customedTheme } from '@/styles/theme';
import { fetchWineries, fetchWines } from '@/api/wines';
import type { WineInfoType } from '@/types/wine';
import type { WineryInfoType } from '@/types/winery';
import { WineTypes } from '@/enum/wine';
import { distinctVarieties, normalizeVariety } from '@/utils/variety';
import { trackEvent } from '@/lib/analytics';
import WineCard from '@/components/WineCard';
import Seo from '@/components/Seo';
import {
  EASE,
  LoadFade,
  MaskedLines,
  useIsoLayoutEffect,
} from '@/components/motion/reveal';

const { home, font } = customedTheme;

/** 그리드 셀: 첫 진입 시엔 스크롤 등장(Reveal과 동일한 SSG 안전 장치),
 *  필터 조작 후 마운트되는 카드는 페이드인. 필터 변경 시 남는 카드는
 *  layout 애니메이션으로 자리를 이동하고 빠지는 카드는 페이드아웃. */
const GridCell = ({
  children,
  column,
  filtered,
}: {
  children: ReactNode;
  /** 데스크톱 그리드 열 위치(0~2) — 열 기준 stagger */
  column: number;
  /** 필터 조작 이후 마운트되었는지 (마운트 시점 스냅샷) */
  filtered: boolean;
}) => {
  const reduce = useReducedMotion();
  const appear = useRef(filtered).current;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const [armed, setArmed] = useState(false);

  useIsoLayoutEffect(() => {
    if (reduce || appear) return;
    const el = ref.current;
    if (el && el.getBoundingClientRect().top > window.innerHeight * 0.85) {
      setArmed(true);
    }
  }, [reduce, appear]);

  return (
    <motion.div
      ref={ref}
      layout={!reduce}
      initial={appear && !reduce ? { opacity: 0 } : false}
      animate={
        appear
          ? { opacity: 1, transition: { duration: 0.35, ease: EASE } }
          : armed
            ? inView
              ? 'visible'
              : 'hidden'
            : undefined
      }
      exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.2 } }}
      variants={{
        hidden: { opacity: 0, y: 14, transition: { duration: 0 } },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.65, ease: EASE, delay: column * 0.08 },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

/** 드롭다운 화살표 (Figma chevron-down, #101010 stroke) */
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpath d='M4 6l4 4 4-4' fill='none' stroke='%23101010'/%3E%3C/svg%3E\")";

interface WineListLoaderData {
  wines: WineInfoType[];
  wineries: WineryInfoType[];
}

/** 빌드(SSG) 시점에 전체 와인·도멘을 로드 → 프리렌더 HTML에 카드와
 *  상세 페이지 링크가 박힌다 (크롤러가 /wines/:id 를 발견하는 경로).
 *  필터는 하이드레이션 후 클라이언트에서 URL 쿼리로 동작한다. */
export async function wineListLoader() {
  const [wines, wineries] = await Promise.all([fetchWines(), fetchWineries()]);
  return { wines, wineries };
}

/** 와인 리스트 (Figma 3557:345) — 스플릿 타이틀 + 밑줄 드롭다운 필터 + 풀블리드 카드 그리드 */
const WineListPage: React.FC = () => {
  const { wines, wineries } = useLoaderData() as WineListLoaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  // 필터 상태는 URL 쿼리에 보관 — 뒤로가기·링크 공유 시 유지
  const typeFilter = searchParams.get('type') ?? '';
  const grapeFilter = searchParams.get('grape') ?? '';
  const makerFilter = searchParams.get('maker') ?? '';
  const searchQuery = searchParams.get('q') ?? '';

  const wineryNameById = useMemo(() => {
    const map: Record<number, string> = {};
    wineries.forEach((winery) => {
      map[winery.id] = winery.domaine;
    });
    return map;
  }, [wineries]);

  // 대소문자·공백 표기 차이('Chenin Blanc' vs 'chenin blanc')는 같은 품종으로 취급
  const grapeOptions = useMemo(
    () => distinctVarieties(wines.map((wine) => wine.wineVariety)),
    [wines],
  );

  const grapeKey = normalizeVariety(grapeFilter);
  // 텍스트 검색 — 이름(영/한)·품종·도멘명을 부분 일치로 통합 검색
  const q = searchQuery.trim().toLowerCase();
  const matchesQuery = (wine: WineInfoType) =>
    !q ||
    wine.wineNameEN.toLowerCase().includes(q) ||
    wine.wineNameKR.toLowerCase().includes(q) ||
    wine.wineVariety.some((v) => v.toLowerCase().includes(q)) ||
    (wineryNameById[wine.wineryId] ?? '').toLowerCase().includes(q);

  const filtered = wines.filter(
    (wine) =>
      matchesQuery(wine) &&
      (!typeFilter || wine.wineType === typeFilter) &&
      (!grapeFilter ||
        wine.wineVariety.some((v) => normalizeVariety(v) === grapeKey)) &&
      (!makerFilter || wine.wineryId === Number(makerFilter)),
  );

  // 필터 조작 이후 마운트되는 카드를 구분 — 첫 진입 카드는 스크롤 등장,
  // 필터 결과로 나타나는 카드는 즉시 페이드인
  const interacted = useRef(false);

  const setFilter = (key: string, value: string) => {
    interacted.current = true;
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
    // GA4: 어떤 필터가 쓰이는지 수집 (해제·타이핑 중인 검색어는 제외)
    if (value && key !== 'q') trackEvent('filter_apply', { filter_type: key, value });
  };

  const resetFilters = () => {
    interacted.current = true;
    setSearchParams({}, { replace: true });
  };
  const hasFilter = Boolean(
    typeFilter || grapeFilter || makerFilter || searchQuery,
  );

  // GA4: 타이핑이 멈춘 검색어만 search 이벤트로 수집
  useEffect(() => {
    const term = searchQuery.trim();
    if (term.length < 2) return;
    const timer = setTimeout(
      () => trackEvent('search', { search_term: term }),
      1200,
    );
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <Wrapper>
      <Seo
        title='WINE LIST 와인 리스트'
        description='골드럭와인이 수입하는 내추럴 와인 리스트 — 와인 타입, 포도 품종, 와인메이커별로 살펴보세요.'
        path='/winelist'
      />
      <header className='list-header'>
        <LoadFade
          className='grape-deco'
          delay={0.3}
        >
          <img
            src='/home/winelist/grape-deco.svg'
            alt=''
            aria-hidden
          />
        </LoadFade>
        <h1 aria-label='WINE LIST'>
          <span
            className='t-wine'
            aria-hidden
          >
            <MaskedLines
              text='WINE'
              mode='load'
            />
          </span>
          <span
            className='t-list'
            aria-hidden
          >
            <MaskedLines
              text='LIST'
              mode='load'
              delay={0.12}
            />
          </span>
        </h1>
      </header>

      <LoadFade
        className='list-filters'
        delay={0.35}
      >
        <input
          className='filter-search'
          type='search'
          value={searchQuery}
          onChange={(e) => setFilter('q', e.target.value)}
          placeholder='SEARCH'
          aria-label='와인 검색 — 이름, 품종, 도멘'
        />
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
        <span className='filter-count'>
          {filtered.length} WINE{filtered.length === 1 ? '' : 'S'}
        </span>
      </LoadFade>

      {filtered.length === 0 ? (
        <motion.div
          className='empty-state'
          initial={false}
          animate={{ opacity: [0, 1] }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <p>조건에 맞는 와인이 없습니다.</p>
          <button
            type='button'
            onClick={resetFilters}
          >
            필터 초기화
          </button>
        </motion.div>
      ) : (
        <div className='wine-grid'>
          <AnimatePresence>
            {filtered.map((wine, i) => (
              <GridCell
                key={wine.wineId}
                column={i % 3}
                filtered={interacted.current}
              >
                <WineCard
                  wine={wine}
                  wineryName={wineryNameById[wine.wineryId]}
                />
              </GridCell>
            ))}
          </AnimatePresence>
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
    /* Figma Union 446.6px — 와인 상세 페이지와 동일 크기·위치 */
    width: 447px;
    pointer-events: none;

    img {
      display: block;
      width: 100%;
    }
  }

  .list-filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding: 16px 80px;
  }

  .filter-search {
    appearance: none;
    -webkit-appearance: none;
    background: transparent;
    border: none;
    border-bottom: 1px solid ${home.dark};
    border-radius: 0;
    padding: 12px;
    width: 180px;
    color: ${home.ink};
    font-family: ${font.en};
    font-style: italic;
    font-size: 16px;

    &::placeholder {
      color: ${home.ink};
      text-transform: uppercase;
    }

    &:focus {
      outline: none;
      border-bottom-color: ${home.purple};
    }

    &::-webkit-search-cancel-button {
      -webkit-appearance: none;
    }
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
      display: flex;
      flex-direction: column;
      border-right: 1px solid ${home.dark};
      border-bottom: 1px solid ${home.dark};

      > a {
        flex: 1;
      }
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
      width: min(360px, 40vw);
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

    .filter-search {
      width: 100%;
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
