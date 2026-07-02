import React, { useEffect, useState } from 'react';
import { Flex } from 'antd';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
import { fetchWines } from '@/api/wines';
import type { WineInfoType } from '@/types/wine';
import WineList from '@/components/WineList';

const WineListPage: React.FC = () => {
  const [wines, setWines] = useState<WineInfoType[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchWines().then((list) => {
      if (!cancelled) setWines(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Wrapper
      vertical
      align={'center'}
      gap={customedTheme.space.xxl}
    >
      <div className={'page-title'}>Wine List</div>
      <WineList
        wineList={wines}
        useFilter={true}
      />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  padding: 50px 20%;
  font-family: 'Lora', serif;
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
