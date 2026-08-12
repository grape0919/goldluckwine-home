import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { customedTheme } from '@/styles/theme';
import { renderLines } from '@/utils/lines';
import type { HomeContent } from '@/api/homeContent';

const { home, font } = customedTheme;

/** 주력 와인 피처 섹션 — GERMAN WINE, NATURALLY (슈나이더) */
const GermanySection = ({ content }: { content: HomeContent }) => {
  return (
    <Wrapper>
      <div className='germany-copy'>
        <h2 className='font-display'>{renderLines(content.feature_title)}</h2>
        <p>{renderLines(content.feature_body)}</p>
        <Link
          to='/winelist'
          className='germany-button'
        >
          VIEW MORE
        </Link>
      </div>
      <div
        className='germany-photo'
        style={{ backgroundImage: `url('${content.feature_photo}')` }}
      />
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
