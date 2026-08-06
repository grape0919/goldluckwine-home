import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { customedTheme } from '@/styles/theme';

const { home, font } = customedTheme;

/** 주력 와인 피처 섹션 — GERMAN WINE, NATURALLY (슈나이더) */
const GermanySection = () => {
  return (
    <Wrapper>
      <div className='germany-copy'>
        <h2 className='font-display'>
          German
          <br />
          Wine,
          <br />
          Naturally
        </h2>
        <p>
          독일 최남서단, 스위스 국경과 맞닿은 언덕의 포도밭.
          <br />
          여섯 세대를 이어온 슈나이더 가문이 건강한 밭과 적은 수확량으로
          빚어내는 정직한 와인을 만나보세요.
        </p>
        <Link
          to='/winelist'
          className='germany-button'
        >
          VIEW MORE
        </Link>
      </div>
      <div className='germany-photo' />
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
    min-height: 820px;
    background: url('/home/germany/germany-wine.webp') center / cover no-repeat;
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
