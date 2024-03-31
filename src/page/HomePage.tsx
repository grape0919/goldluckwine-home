import React from 'react';
import styled from 'styled-components';
import FeaturedWines from './FeaturedWines';
function HomePage() {
  return (
    <Wrapper>
      <video
        src={import.meta.env.VITE_PUBLIC_URL + 'video-sample.mp4'}
        autoPlay
        loop
        muted
        width={'100%'}
      />
      <div className='main-content'>aa</div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  .main-content {
    padding: 0 130px;
  }
`;

export default HomePage;
