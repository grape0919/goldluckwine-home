import { useRef } from 'react';
import styled from 'styled-components';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import type { MotionValue } from 'motion/react';
import { customedTheme } from '@/styles/theme';
import WineCard from '@/components/WineCard';
import { Reveal } from '@/components/motion/reveal';
import type { WineInfoType } from '@/types/wine';
import { renderLines } from '@/utils/lines';
import type { HomeContent } from '@/api/homeContent';

const { home, font } = customedTheme;

interface IntroSectionProps {
  featuredWines: WineInfoType[];
  /** wineryId → 도멘 이름 */
  wineryNameById: Record<number, string>;
  content: HomeContent;
}

/** 스트립 사진별 scrub 진폭(px) — 이웃끼리 반대 방향으로 미세하게 어긋난다 */
const STRIP_AMPS = [16, -12, 20, -18, 14, -20];

/** 포토 스트립 한 컷: 스크롤 진행에 따라 프레임 안에서 세로로 미세하게 흐른다.
 *  이미지를 프레임보다 크게(scale) 잡아 이동해도 여백이 드러나지 않는다. */
const StripImage = ({
  src,
  index,
  progress,
}: {
  src: string;
  index: number;
  progress: MotionValue<number>;
}) => {
  const reduce = useReducedMotion();
  const amp = STRIP_AMPS[index % STRIP_AMPS.length];
  const y = useTransform(progress, [0, 1], [amp, -amp]);
  return (
    <div className='strip-frame'>
      <motion.img
        src={src}
        alt=''
        loading='lazy'
        style={reduce ? undefined : { y, scale: 1.12 }}
      />
    </div>
  );
};

/** 크림 배경 소개 + 포토 스트립 + OUR COLLECTION 카드 */
const IntroSection = ({
  featuredWines,
  wineryNameById,
  content,
}: IntroSectionProps) => {
  const stripRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stripRef,
    offset: ['start end', 'end start'],
  });
  const stripImages = [
    content.strip_1,
    content.strip_2,
    content.strip_3,
    content.strip_4,
    content.strip_5,
    content.strip_6,
  ];
  return (
    <Wrapper>
      <div className='intro-clovers' aria-hidden>
        {/* 파일명 left/right가 실제 배치와 반대: right=작은 것(왼쪽), left=큰 것(오른쪽) */}
        <img
          className='clover-small'
          src='/home/clover/background-clover-right.png'
          alt=''
        />
        <img
          className='clover-big'
          src='/home/clover/background-clover-left.png'
          alt=''
        />
      </div>

      <div className='intro-copy'>
        <Reveal>
          <h2>{renderLines(content.intro_heading)}</h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p>{renderLines(content.intro_body)}</p>
        </Reveal>
      </div>

      <div
        className='intro-strip'
        ref={stripRef}
      >
        {stripImages.map((src, i) => (
          <StripImage
            key={`${i}-${src}`}
            src={src}
            index={i}
            progress={scrollYProgress}
          />
        ))}
      </div>

      <Reveal>
        <h3 className='collection-title font-display'>OUR COLLECTION</h3>
      </Reveal>

      <div className='collection-grid'>
        {featuredWines.slice(0, 3).map((wine, i) => (
          <Reveal
            key={wine.wineId}
            delay={i * 0.12}
            className='collection-cell'
          >
            <WineCard
              wine={wine}
              wineryName={wineryNameById[wine.wineryId]}
            />
          </Reveal>
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
    right: 40px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    pointer-events: none;

    .clover-small {
      width: 125px;
      margin-top: 12px;
    }

    .clover-big {
      width: 382px;
      margin-top: 48px;
    }
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

    .strip-frame {
      flex: 1;
      min-width: 0;
      height: 420px;
      overflow: hidden;
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
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
    border-top: 1px solid ${home.dark};
    border-bottom: 1px solid ${home.dark};

    > * + * {
      border-left: 1px solid ${home.dark};
    }
  }

  .collection-cell {
    display: flex;
    flex-direction: column;

    > a {
      flex: 1;
    }
  }

  @media (max-width: 1024px) {
    .intro-copy {
      padding: 0 24px;
    }

    .intro-strip {
      overflow-x: auto;
      width: 100%;
      margin-left: 0;

      .strip-frame {
        flex: 0 0 260px;
        height: 320px;
      }
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

      > * + * {
        border-left: none;
        border-top: 1px solid ${home.dark};
      }
    }
  }
`;

export default IntroSection;
