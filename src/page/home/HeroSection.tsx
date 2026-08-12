import { useState } from 'react';
import styled from 'styled-components';
import { motion, useReducedMotion } from 'motion/react';
import { customedTheme } from '@/styles/theme';
import {
  LoadFade,
  MaskedLines,
  useIsoLayoutEffect,
} from '@/components/motion/reveal';
import type { HomeContent } from '@/api/homeContent';

const { font, home } = customedTheme;

/** 풀블리드 히어로: 와인병 사진 + 로고 워터마크 + 영문 태그라인.
 *  진입 연출 — 배경 미세 줌 정착(1.05→1) → 심볼 페이드 → 태그라인 마스크 리빌 */
const HeroSection = ({ content }: { content: HomeContent }) => {
  const reduce = useReducedMotion();
  const [armed, setArmed] = useState(false);

  useIsoLayoutEffect(() => {
    if (!reduce) setArmed(true);
  }, [reduce]);

  return (
    <Wrapper>
      <motion.div
        className='hero-bg'
        style={{ backgroundImage: `url('${content.hero_bg}')` }}
        initial={false}
        animate={armed ? { scale: [1.05, 1] } : undefined}
        transition={{ duration: 1.8, ease: 'easeOut' }}
      />
      <div className='hero-divider' />
      <LoadFade
        className='hero-symbol-cell'
        delay={0.2}
      >
        <img
          className='hero-symbol'
          src='/home/brand/logo-symbol-hero.svg'
          alt=''
          aria-hidden
        />
      </LoadFade>
      <h1 className='hero-tagline'>
        <MaskedLines
          text={content.hero_tagline}
          mode='load'
          delay={0.45}
        />
      </h1>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  min-height: 640px;
  height: calc(100vh - 80px);
  max-height: 900px;
  overflow: hidden;

  .hero-bg {
    position: absolute;
    inset: 0;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }

  .hero-divider {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
    background: ${home.dark};
  }

  .hero-symbol-cell {
    justify-self: center;
    position: relative;
  }

  .hero-symbol {
    display: block;
    width: 236px;
    max-width: 100%;
  }

  .hero-tagline {
    justify-self: center;
    position: relative;
    margin: 0;
    color: #ffffff;
    font-family: ${font.display};
    font-weight: 400;
    font-size: 20px;
    line-height: 34px;
    letter-spacing: 0;
    text-align: center;
    text-transform: uppercase;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 48px;
    height: auto;
    padding: 96px 24px;
    min-height: 480px;

    .hero-divider {
      display: none;
    }

    .hero-symbol {
      width: 160px;
    }

    .hero-tagline {
      font-size: 17px;
      line-height: 28px;
    }
  }
`;

export default HeroSection;
