import React from 'react';
import { Card, Flex } from 'antd';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
import { wines } from '@/dummy/wines';
import WineList from '@/components/WineList';

const WineListPage: React.FC = () => {
  return (
    <Wrapper
      vertical
      align={'center'}
      gap={customedTheme.space.xxl}
    >
      <div className={'page-title'}>Wine List</div>
      <WineList wineList={wines} />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  padding: 50px;
  .page-title {
    font-size: ${customedTheme.fontSize.s7};
    font-weight: ${customedTheme.fontWeight.bolder};
  }
  @media (max-width: 1023px) {
    .profile-list {
      flex-direction: row;
    }
  }
  @media (max-width: 767px) {
    .card-profile-layout {
      flex-direction: column;
      align-items: center;
    }
  }
`;
export default WineListPage;
