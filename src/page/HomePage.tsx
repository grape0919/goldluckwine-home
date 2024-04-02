import React from 'react';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
function HomePage() {
  return (
    <Wrapper>
      {/*<video*/}
      {/*  src={import.meta.env.VITE_PUBLIC_URL + 'video-sample.mp4'}*/}
      {/*  autoPlay*/}
      {/*  loop*/}
      {/*  muted*/}
      {/*  width={'100%'}*/}
      {/*/>*/}
      <div
        className={'landing-top'}
        style={{ position: 'relative' }}
      >
        <img
          src={import.meta.env.VITE_PUBLIC_URL + 'main-background.png'}
          width={'100%'}
          style={{
            position: 'absolute',
            top: 0,
            opacity: '0.7',
            zIndex: '1',
          }}
        />
        <div
          className={'landing-top-over'}
          style={{
            position: 'relative',
            top: '90px',
            zIndex: '2',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            className={'main-company-text'}
            style={{
              color: customedTheme.color.white,
              fontSize: '6rem',
              fontWeight: customedTheme.fontWeight.bolder,
              textAlign: 'center',
            }}
          >
            GOLD LUCK WINE
          </div>
        </div>
      </div>
      <div className='main-content'></div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  .main-content {
    padding: 0 130px;
  }
`;

export default HomePage;
