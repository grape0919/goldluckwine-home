import React from 'react';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';

const HomePageSection1 = () => {
  return (
    <Wrapper>
      <div className={'landing-top'}>
        <div
          className={'font-lora'}
          style={{
            color: customedTheme.color.white,
            fontWeight: customedTheme.fontWeight.bolder,
            textAlign: 'center',
          }}
        >
          <img
            src={import.meta.env.VITE_PUBLIC_URL + '/main-background.png'}
            width={'100%'}
            alt={''}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: '0.8',
              zIndex: '5',
            }}
          />
          <div
            style={{
              position: 'relative',
              top: 0,
              zIndex: '10',

              fontSize: '5rem',
            }}
          >
            GOLD LUCK WINE
          </div>
        </div>
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

    padding: 2rem 0;
    height: fit-content;
  }
`;
export default HomePageSection1;
