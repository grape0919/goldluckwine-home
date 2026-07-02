import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { customedTheme, failImage } from '@/styles/theme';
import CloverIcon from '@/components/CloverIcon';
import type { WineInfoType } from '@/types/wine';

const { home, font, color } = customedTheme;

const STRIP_IMAGES = [1, 2, 3, 4, 5, 6].map(
  (n) => `/home/strip/strip-0${n}.png`,
);

interface IntroSectionProps {
  featuredWines: WineInfoType[];
  /** wineryId → 도멘 이름 */
  wineryNameById: Record<number, string>;
}

/** 크림 배경 소개 + 포토 스트립 + OUR COLLECTION 카드 */
const IntroSection = ({ featuredWines, wineryNameById }: IntroSectionProps) => {
  return (
    <Wrapper>
      <div className='intro-clovers' aria-hidden>
        <CloverIcon
          color={home.greenSoft}
          size={110}
          style={{ opacity: 0.28, transform: 'rotate(-14deg)' }}
        />
        <CloverIcon
          color={home.greenSoft}
          size={330}
          stem
          style={{ opacity: 0.28, transform: 'rotate(10deg)' }}
        />
      </div>

      <div className='intro-copy'>
        <h2>
          골드럭 와인은 프랑스의 보석같은 소규모 농부들의 와인을 소개하는
          <br />
          내추럴 와인 전문 수입사입니다.
        </h2>
        <p>
          루아르 지역의 대표 화이트 품종인 슈냉 블랑의 다채로운 퍼포먼스를
          보여주는 와인들을 위주로,
          <br />
          특히 ‘깨끗함’과 ‘우아함’ 의 강점을 가진 와인들을 선보입니다.
          골드럭와인은 포도 본연의 순수함과
          <br />
          떼루아를 존중하며 최소한의 개입으로 양조하는, 진솔한 와인 메이커들과
          함께합니다.
        </p>
      </div>

      <div className='intro-strip'>
        {STRIP_IMAGES.map((src) => (
          <img
            key={src}
            src={src}
            alt=''
            loading='lazy'
          />
        ))}
      </div>

      <h3 className='collection-title font-display'>OUR COLLECTION</h3>

      <div className='collection-grid'>
        {featuredWines.slice(0, 3).map((wine) => (
          <Link
            key={wine.wineId}
            to={`/wines/${wine.wineId}`}
            className='collection-card'
          >
            <div className='card-image'>
              <img
                src={wine.wineImagePath || failImage}
                alt={`${wine.wineNameEN} ${wine.wineNameKR}`}
                loading='lazy'
                onError={(e) => {
                  // 무한 onError 루프 방지: 디폴트 이미지로는 한 번만 교체
                  if (e.currentTarget.src !== failImage) {
                    e.currentTarget.src = failImage;
                  }
                }}
              />
            </div>
            <div className='card-caption'>
              <div className='card-names'>
                <span>{wine.wineNameEN}</span>
                <span>{wine.wineNameKR}</span>
              </div>
              <div className='card-meta'>
                <span>{wineryNameById[wine.wineryId] ?? ''}</span>
                <span className='card-type'>
                  <CloverIcon
                    color={
                      color.wine[wine.wineType as keyof typeof color.wine] ??
                      home.greenSoft
                    }
                    size={15}
                  />
                  {wine.wineType}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  position: relative;
  padding: 120px 0 0;
  background: ${home.cream};
  overflow: hidden;

  .intro-clovers {
    position: absolute;
    top: 40px;
    right: -40px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    pointer-events: none;
  }

  .intro-copy {
    padding: 0 80px;

    h2 {
      margin: 0 0 28px;
      color: ${home.green};
      font-family: ${font.kr};
      font-size: 22px;
      font-weight: 600;
      line-height: 34px;
      letter-spacing: -0.04em;
    }

    p {
      margin: 0;
      color: ${home.gray};
      font-family: ${font.kr};
      font-size: 16px;
      line-height: 28px;
      letter-spacing: -0.02em;
    }
  }

  .intro-strip {
    display: flex;
    gap: 18px;
    width: 112%;
    margin: 110px 0 0 -6%;

    img {
      flex: 1;
      min-width: 0;
      height: 420px;
      object-fit: cover;
    }
  }

  .collection-title {
    margin: 130px 0 0;
    color: ${home.ink};
    font-size: 28px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-align: center;
  }

  .collection-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 56px;
    border-top: 1px solid rgba(38, 35, 34, 0.35);
    border-bottom: 1px solid rgba(38, 35, 34, 0.35);
  }

  .collection-card {
    display: flex;
    flex-direction: column;
    text-decoration: none;

    & + .collection-card {
      border-left: 1px solid rgba(38, 35, 34, 0.35);
    }
  }

  .card-image {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 520px;
    padding: 44px 0;
    box-sizing: border-box;

    img {
      max-height: 100%;
      max-width: 60%;
      object-fit: contain;
      transition: transform 0.3s;
    }
  }

  .collection-card:hover .card-image img {
    transform: scale(1.03);
  }

  .card-caption {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 18px 24px 22px;
    border-top: 1px solid rgba(38, 35, 34, 0.35);
    font-family: ${font.en};
    font-size: 16px;
  }

  .card-names {
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: ${home.brown};

    span:last-child {
      font-family: ${font.kr};
      font-size: 15px;
    }
  }

  .card-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    color: ${home.gray};
  }

  .card-type {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  @media (max-width: 1024px) {
    .intro-copy {
      padding: 0 24px;
    }

    .intro-strip {
      overflow-x: auto;
      width: 100%;
      margin-left: 0;

      img {
        flex: 0 0 260px;
        height: 320px;
      }
    }

    .card-image {
      height: 380px;
    }
  }

  @media (max-width: 768px) {
    padding-top: 72px;

    .intro-clovers {
      opacity: 0.6;
      top: auto;
      bottom: -60px;
    }

    .intro-copy {
      h2 {
        font-size: 19px;
        line-height: 30px;

        br {
          display: none;
        }
      }

      p br {
        display: none;
      }
    }

    .intro-strip {
      margin-top: 56px;
    }

    .collection-title {
      margin-top: 72px;
    }

    .collection-grid {
      grid-template-columns: 1fr;
    }

    .collection-card + .collection-card {
      border-left: none;
      border-top: 1px solid rgba(38, 35, 34, 0.35);
    }
  }
`;

export default IntroSection;
