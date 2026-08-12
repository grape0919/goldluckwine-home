import { useRef } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { customedTheme } from '@/styles/theme';
import { MaskedLines, Reveal } from '@/components/motion/reveal';
import { renderLines } from '@/utils/lines';
import type { HomeContent } from '@/api/homeContent';

const { home, font } = customedTheme;

/** 주력 와인 피처 섹션 — GERMAN WINE, NATURALLY (슈나이더).
 *  타이틀 마스크 리빌 + 사진은 스크롤 진행에 맞춰 아주 천천히 줌아웃 */
const GermanySection = ({ content }: { content: HomeContent }) => {
  const reduce = useReducedMotion();
  const photoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: photoRef,
    offset: ['start end', 'end start'],
  });
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);

  return (
    <Wrapper>
      <div className='germany-copy'>
        <h2 className='font-display'>
          <MaskedLines text={content.feature_title} />
        </h2>
        <Reveal delay={0.2}>
          <p>{renderLines(content.feature_body)}</p>
        </Reveal>
        <Reveal
          delay={0.3}
          className='germany-button-cell'
        >
          <Link
            to='/winelist'
            className='germany-button'
          >
            VIEW MORE
          </Link>
        </Reveal>
      </div>
      <div
        className='germany-photo'
        ref={photoRef}
      >
        <motion.div
          className='germany-photo-bg'
          style={{
            backgroundImage: `url('${content.feature_photo}')`,
            scale: reduce ? undefined : photoScale,
          }}
        />
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;

  .germany-copy {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 40px;
    padding: 100px 56px;
    background: ${home.yellow};
    text-align: center;
  }

  .germany-copy h2 {
    margin: 0;
    color: ${home.brown};
    font-size: 58px;
    font-weight: 400;
    line-height: 1.4;
    letter-spacing: -0.02em;
    text-transform: uppercase;
  }

  .germany-copy p {
    margin: 40px 0 0;
    max-width: 460px;
    color: ${home.ink};
    font-family: ${font.kr};
    font-size: 16px;
    line-height: 26px;
  }

  .germany-button-cell {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .germany-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: min(560px, 100%);
    height: 56px;
    margin-top: 32px;
    background: #ffffff;
    color: ${home.brown};
    font-family: ${font.en};
    font-size: 21px;
    letter-spacing: 0.03em;
    text-decoration: none;
    transition: background 0.2s;

    &:hover {
      background: ${home.cream};
    }
  }

  .germany-photo {
    position: relative;
    min-height: 820px;
    overflow: hidden;
  }

  .germany-photo-bg {
    position: absolute;
    inset: 0;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }

  @media (max-width: 1024px) {
    .germany-copy h2 {
      font-size: 44px;
    }
    .germany-photo {
      min-height: 640px;
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;

    .germany-copy {
      padding: 72px 24px;
    }

    .germany-copy h2 {
      font-size: 36px;
    }

    .germany-photo {
      min-height: 420px;
    }
  }
`;

export default GermanySection;
