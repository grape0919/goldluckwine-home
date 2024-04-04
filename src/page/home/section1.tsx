import React from 'react';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';

const HomePageSection1 = () => {
  return (
    <Wrapper>
      <div className={'landing-top'}>
        <img
          src={import.meta.env.VITE_PUBLIC_URL + '/main-background.png'}
          width={'100%'}
          alt={''}
        />
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  .landing-top {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    padding: 0;
    height: fit-content;
  }
`;
export default HomePageSection1;
