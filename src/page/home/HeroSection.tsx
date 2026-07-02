import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';

const { font } = customedTheme;

/** 풀블리드 히어로: 와인병 사진 + 로고 워터마크 + 영문 태그라인 */
const HeroSection = () => {
  return (
    <Wrapper>
      <div className='hero-divider' />
      <img
        className='hero-symbol'
        src='/home/brand/logo-symbol-hero.svg'
        alt=''
        aria-hidden
      />
      <p className='hero-tagline'>
        Goldluck Wine is a natural wine
        <br />
        importer that introduces the wines
        <br />
        of small farmers, such as the jewels of France.
      </p>
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
  background: url('/home/hero/hero-bg-1.jpeg') center / cover no-repeat;

  .hero-divider {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
    background: rgba(255, 255, 255, 0.75);
  }

  .hero-symbol {
    justify-self: center;
    width: 230px;
    max-width: 40%;
  }

  .hero-tagline {
    justify-self: center;
    margin: 0;
    color: #ffffff;
    font-family: ${font.display};
    font-size: 21px;
    line-height: 34px;
    letter-spacing: 0.02em;
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
