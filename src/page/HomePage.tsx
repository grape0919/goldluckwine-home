import React from 'react';
import styled from 'styled-components';
import { Flex } from 'antd';
import { customedTheme } from '@/styles/theme';
import HomePageSection1 from '@/page/home/section1';
import HomePageSection2 from '@/page/home/section2';
function HomePage() {
  return (
    <Wrapper
      vertical
      gap={'1rem'}
    >
      <div style={{ height: 'fit-content' }}>
        <HomePageSection1 />
      </div>
      <HomePageSection2 />
    </Wrapper>
  );
}

const Wrapper = styled(Flex)`
  .main-content {
    padding: 0 130px;
  }
`;

export default HomePage;
