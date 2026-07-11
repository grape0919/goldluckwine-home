import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
import { fetchWineries } from '@/api/wines';
import type { WineryInfoType } from '@/types/winery';
import Seo from '@/components/Seo';

const { home, font } = customedTheme;

/** 와이너리 목록 (Figma 3525:13763) — 스플릿 타이틀(OUR/WINERIES) +
 *  풀블리드 도멘 행 리스트. 악센트는 이 페이지 전용 라이트 블루. */
const WineriesPage: React.FC = () => {
  const [wineries, setWineries] = useState<WineryInfoType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchWineries().then((list) => {
      if (cancelled) return;
      setWineries(list);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Wrapper>
      <Seo
        title='OUR WINERIES 와이너리'
        description='골드럭와인이 함께하는 와이너리와 도멘, 와인메이커들을 소개합니다.'
        path='/wineries'
      />
      <header className='list-header'>
        <img
          className='glasses-deco'
          src='/home/wineries/glasses-deco.png'
          alt=''
          aria-hidden
        />
        <h1 aria-label='OUR WINERIES'>
          <span
            className='t-our'
            aria-hidden
          >
            OUR
          </span>
          <span
            className='t-wineries'
            aria-hidden
          >
            WINERIES
          </span>
        </h1>
      </header>

      {loading ? (
        <div
          className='winery-list'
          aria-hidden
        >
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className='skeleton-row'
            />
          ))}
        </div>
      ) : (
        <div className='winery-list'>
          {wineries.map((winery) => (
            <Link
              key={winery.id}
              className='winery-row'
              to={`/wineries/${winery.id}`}
            >
              <div className='winery-names'>
                <span className='name-en'>{winery.domaine}</span>
                <span className='name-kr'>{winery.domaineKR}</span>
                <span className='location'>{winery.location}</span>
              </div>
              <span className='view-more'>VIEW MORE</span>
            </Link>
          ))}
        </div>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background: ${home.cream};
  overflow: hidden;
  padding-bottom: 200px;

  .list-header {
    position: relative;
    height: 339px;
  }

  .list-header h1 {
    margin: 0;
    font-weight: 400;
  }

  /* 에디토리얼 스플릿 타이틀: OUR 좌측 여백, WINERIES는 54.5% 지점 (Figma x=80/785) */
  .t-our,
  .t-wineries {
    position: absolute;
    top: 200px;
    color: ${home.blue};
    font-family: ${font.en};
    font-size: 24px;
    line-height: 29px;
    letter-spacing: 0.02em;
  }

  .t-our {
    left: 80px;
  }

  .t-wineries {
    left: 54.5%;
  }

  /* 샴페인잔 데코 — 헤더를 넘어 첫 행 밴드까지 내려온다 (Figma y=57~483) */
  .glasses-deco {
    position: absolute;
    top: 57px;
    right: 133px;
    width: 329px;
    pointer-events: none;
    z-index: 1;
  }

  .winery-list {
    display: flex;
    flex-direction: column;
  }

  .winery-row {
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    min-height: 202px;
    padding: 40px 80px;
    border-bottom: 1px solid ${home.dark};
    text-decoration: none;
    transition: background 0.25s;

    &:hover,
    &:focus-visible {
      background: ${home.blueTint};
    }
  }

  .winery-names {
    display: flex;
    flex-direction: column;
  }

  .name-en {
    color: ${home.brown};
    font-family: ${font.display};
    font-size: 40px;
    line-height: 48px;
  }

  .name-kr {
    margin-top: 8px;
    color: ${home.brown};
    font-family: ${font.kr};
    font-size: 18px;
    line-height: 21px;
  }

  .location {
    margin-top: 22px;
    color: ${home.grayLight};
    font-family: ${font.en};
    font-size: 18px;
    line-height: 22px;
  }

  .view-more {
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: flex-end;
    width: 306px;
    height: 60px;
    background: #ffffff;
    color: ${home.brown};
    font-family: ${font.en};
    font-size: 18px;
    letter-spacing: 0.02em;
  }

  .skeleton-row {
    height: 202px;
    border-bottom: 1px solid ${home.dark};
    background: linear-gradient(
      100deg,
      rgba(38, 35, 34, 0.04) 40%,
      rgba(38, 35, 34, 0.09) 50%,
      rgba(38, 35, 34, 0.04) 60%
    );
    background-size: 200% 100%;
    animation: wineries-shimmer 1.6s linear infinite;
  }

  @keyframes wineries-shimmer {
    from {
      background-position: 120% 0;
    }
    to {
      background-position: -80% 0;
    }
  }

  @media (max-width: 1024px) {
    padding-bottom: 120px;

    .list-header {
      height: 220px;
    }

    .t-our,
    .t-wineries {
      top: 140px;
    }

    .t-our {
      left: 24px;
    }

    .glasses-deco {
      top: 24px;
      right: 24px;
      width: min(240px, 28vw);
    }

    .winery-row {
      min-height: 160px;
      padding: 28px 24px;
    }

    .name-en {
      font-size: 32px;
      line-height: 40px;
    }

    .view-more {
      width: 200px;
      height: 48px;
      font-size: 16px;
    }

    .skeleton-row {
      height: 160px;
    }
  }

  @media (max-width: 768px) {
    .list-header {
      height: 170px;
    }

    .t-our,
    .t-wineries {
      top: 104px;
    }

    .winery-row {
      flex-direction: column;
      gap: 24px;
    }

    .view-more {
      align-self: flex-start;
      width: 100%;
    }

    .location {
      margin-top: 14px;
    }
  }
`;

export default WineriesPage;
