import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchWines, fetchWineryById } from '@/api/wines';
import type { WineInfoType } from '@/types/wine';
import type { WineryInfoType } from '@/types/winery';
import { customedTheme } from '@/styles/theme';
import WineCard from '@/components/WineCard';
import Seo from '@/components/Seo';

const { home, font } = customedTheme;

/** 와이너리 상세 (Figma 3525 wineries_depth) — 목록과 같은 스플릿 타이틀 헤더 +
 *  블루 밴드(좌 도멘 소개 / 우 420px 사진) + 와인 카드 그리드 */
const WineryIntroPage: React.FC = () => {
  const { wineryId } = useParams<{ wineryId: string }>();
  const navigate = useNavigate();
  const [winery, setWinery] = useState<WineryInfoType | null>(null);
  const [wineList, setWineList] = useState<WineInfoType[]>([]);
  const [winesLoading, setWinesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchWineryById(Number(wineryId)).then((found) => {
      if (cancelled) return;
      if (!found) {
        // 존재하지 않는 도멘 id — 이전 페이지로 복귀
        navigate(-1);
        return;
      }
      setWinery(found);
      fetchWines().then((all) => {
        if (cancelled) return;
        setWineList(all.filter((wine) => wine.wineryId === found.id));
        setWinesLoading(false);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate, wineryId]);

  return (
    <Wrapper>
      <Seo
        title={
          winery ? `${winery.domaine} ${winery.domaineKR}`.trim() : undefined
        }
        description={winery?.description?.slice(0, 160)}
        path={`/wineries/${wineryId}`}
        image={winery?.imagePath || undefined}
      />
      <header className='list-header'>
        <img
          className='glasses-deco'
          src='/home/wineries/glasses-deco.png'
          alt=''
          aria-hidden
        />
        <p aria-hidden>
          <span className='t-our'>OUR</span>
          <span className='t-wineries'>WINERIES</span>
        </p>
      </header>

      <section className='winery-band'>
        {winery ? (
          <>
            <div className='band-text'>
              <h1 className='name-en'>{winery.domaine}</h1>
              <span className='name-kr'>{winery.domaineKR}</span>
              <span className='location'>{winery.location}</span>
              <p className='description'>{winery.description}</p>
            </div>
            {winery.imagePath && (
              <img
                className='band-photo'
                src={winery.imagePath}
                alt={`${winery.domaine} ${winery.domaineKR} 와이너리`}
                onError={(e) => {
                  // 사진이 없으면 밴드는 텍스트만으로 유지
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </>
        ) : (
          <div
            className='band-text'
            aria-hidden
          >
            <span className='skeleton skeleton-title' />
            <span className='skeleton skeleton-sub' />
            <span className='skeleton skeleton-text' />
          </div>
        )}
      </section>

      {winesLoading ? (
        <div
          className='wine-grid'
          aria-hidden
        >
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className='skeleton-cell'
            />
          ))}
        </div>
      ) : (
        wineList.length > 0 && (
          <div className='wine-grid'>
            {wineList.map((wine) => (
              <WineCard
                key={wine.wineId}
                wine={wine}
                wineryName={winery?.domaine}
              />
            ))}
          </div>
        )
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

  .list-header p {
    margin: 0;
  }

  /* 목록 페이지와 동일한 에디토리얼 스플릿 타이틀 (Figma x=80/785) */
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

  /* 샴페인잔 데코 — 헤더를 넘어 밴드까지 내려오고, 사진이 그 위를 덮는다 */
  .glasses-deco {
    position: absolute;
    top: 57px;
    right: 133px;
    width: 329px;
    pointer-events: none;
    z-index: 1;
  }

  .winery-band {
    position: relative;
    display: flex;
    justify-content: space-between;
    min-height: 420px;
    background: ${home.blueTint};
    border-bottom: 1px solid ${home.dark};
  }

  .band-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    box-sizing: border-box;
    max-width: 900px;
    padding: 52px 80px 48px;
  }

  .name-en {
    margin: 0;
    color: ${home.brown};
    font-family: ${font.display};
    font-weight: 400;
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

  .description {
    margin: 46px 0 0;
    max-width: 740px;
    color: ${home.gray};
    font-family: ${font.kr};
    font-size: 15px;
    line-height: 28px;
    word-break: keep-all;
    white-space: pre-line;
  }

  .band-photo {
    position: relative;
    z-index: 2;
    flex-shrink: 0;
    width: 420px;
    min-height: 420px;
    align-self: stretch;
    object-fit: cover;
  }

  /* 와인 리스트와 동일한 풀블리드 카드 그리드 (그리드 상단 보더는 밴드가 그린다) */
  .wine-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    > * {
      border-right: 1px solid ${home.dark};
      border-bottom: 1px solid ${home.dark};
    }
  }

  .skeleton,
  .skeleton-cell {
    display: block;
    background: linear-gradient(
      100deg,
      rgba(38, 35, 34, 0.04) 40%,
      rgba(38, 35, 34, 0.09) 50%,
      rgba(38, 35, 34, 0.04) 60%
    );
    background-size: 200% 100%;
    animation: winery-shimmer 1.6s linear infinite;
  }

  .skeleton-title {
    width: 280px;
    height: 48px;
  }

  .skeleton-sub {
    width: 140px;
    height: 21px;
    margin-top: 12px;
  }

  .skeleton-text {
    width: min(740px, 60vw);
    height: 140px;
    margin-top: 46px;
  }

  .skeleton-cell {
    height: 656px;
  }

  @keyframes winery-shimmer {
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

    .band-text {
      padding: 36px 24px;
    }

    .name-en {
      font-size: 32px;
      line-height: 40px;
    }

    .band-photo {
      width: 320px;
    }

    .wine-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .skeleton-cell {
      height: 476px;
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

    .winery-band {
      flex-direction: column;
    }

    .band-photo {
      width: 100%;
      min-height: 0;
      height: 320px;
      align-self: auto;
    }

    .wine-grid {
      grid-template-columns: 1fr;

      > * {
        border-right: none;
      }
    }
  }
`;

export default WineryIntroPage;
