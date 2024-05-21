import React from 'react';
import styled from 'styled-components';
import { Divider } from 'antd';
import { customedTheme } from '@/styles/theme';
import { wines } from '@/dummy/wines';
import WineList from '@/components/WineList';
const HomePageSection2: React.FC = () => {
  return (
    <Wrapper>
      <Divider
        orientation='left'
        className={['section2-title'].join(',')}
      >
        WINE
      </Divider>
      <WineList wineList={wines} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 1rem 20%;
  .section2-title {
    margin-bottom: 60px;
    font-family: 'Lora', serif;
    font-size: ${customedTheme.fontSize.s6};
    font-weight: ${customedTheme.fontWeight.semiBold};
  }

  .domain-text {
    font-family: 'Lora', serif;
    font-size: ${customedTheme.fontSize.s3};
    font-weight: ${customedTheme.fontWeight.semiBold};
  }
`;
export default HomePageSection2;
