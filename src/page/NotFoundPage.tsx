import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
import Seo from '@/components/Seo';

const { home, font } = customedTheme;

const NotFoundPage: React.FC = () => (
  <Wrapper>
    <Seo
      title='페이지를 찾을 수 없습니다'
      noindex
    />
    <h1>404</h1>
    <p>요청하신 페이지를 찾을 수 없습니다.</p>
    <Link to='/'>홈으로 돌아가기</Link>
  </Wrapper>
);

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 60vh;
  background: ${home.cream};
  color: ${home.brown};

  h1 {
    margin: 0;
    font-family: ${font.en};
    font-weight: 400;
    font-size: 64px;
  }

  p {
    margin: 0;
    font-family: ${font.kr};
    font-size: 16px;
  }

  a {
    margin-top: 12px;
    color: ${home.purple};
    font-family: ${font.kr};
    text-decoration: underline;
    text-underline-offset: 4px;
  }
`;

export default NotFoundPage;
