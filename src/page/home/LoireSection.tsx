import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { customedTheme } from '@/styles/theme';

const { home, font } = customedTheme;

/** 추천 와인 피처 섹션 — ALL THAT LOIRE HAD THAT YEAR */
const LoireSection = () => {
  return (
    <Wrapper>
      <div className='loire-copy'>
        <h2 className='font-display'>
          All That Loire
          <br />
          Had
          <br />
          That Year
        </h2>
        <p>
          2021년, 기후 재난이 루아르를 덮친 그해 —
          <br />
          다미앙은 단 하나의 화이트 와인을 양조했습니다. 30년, 그리고 65년
          수령의 슈냉 블랑이 함께 압착되어 9개월간 퀴브 안에서 천천히 완성된,
          농익은 핵과일과 자몽의 쌉싸름한 산미 — 지금도, 오랜 시간이 흘러도
          빛을 잃지 않을 와인.
        </p>
        <Link
          to='/winelist'
          className='loire-button'
        >
          VIEW MORE
        </Link>
      </div>
      <div className='loire-photo' />
    </Wrapper>
  );
};

const Wrapper = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 140px;

  .loire-copy {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 40px;
    padding: 100px 56px;
    background: ${home.yellow};
    text-align: center;
  }

  .loire-copy h2 {
    margin: 0;
    color: ${home.brown};
    font-size: 58px;
    font-weight: 400;
    line-height: 1.4;
    letter-spacing: -0.02em;
    text-transform: uppercase;
  }

  .loire-copy p {
    margin: 40px 0 0;
    max-width: 460px;
    color: ${home.ink};
    font-family: ${font.kr};
    font-size: 16px;
    line-height: 26px;
  }

  .loire-button {
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

  .loire-photo {
    min-height: 820px;
    background: url('/home/loire/loire-bottle.jpeg') center / cover no-repeat;
  }

  @media (max-width: 1024px) {
    .loire-copy h2 {
      font-size: 44px;
    }
    .loire-photo {
      min-height: 640px;
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    margin-top: 80px;

    .loire-copy {
      padding: 72px 24px;
    }

    .loire-copy h2 {
      font-size: 36px;
    }

    .loire-photo {
      min-height: 420px;
    }
  }
`;

export default LoireSection;
