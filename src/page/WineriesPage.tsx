import React from 'react';
import { Card, Flex } from 'antd';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
const { Meta } = Card;
import { wineriesData } from '@/dummy/wineries';
import { useNavigate } from 'react-router-dom';

const WineriesPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Wrapper
      vertical
      align={'center'}
      gap={customedTheme.space.xxl}
    >
      <div className={'page-title'}>Wineries</div>

      <Flex
        className={'profile-list'}
        gap={customedTheme.space.md}
        justify={'center'}
        wrap={'wrap'}
        style={{ padding: customedTheme.space.md }}
      >
        {wineriesData.map((item) => {
          return (
            <Card
              key={item.id}
              hoverable
              style={{ width: 240 }}
              cover={
                <img
                  alt={'골드럭와인 Gold Luck Wine 와인수입사 : ' + item.domaine}
                  src={item.imagePath}
                />
              }
              onClick={() => navigate('/wineries/' + item.id)}
            >
              <Meta
                title={item.domaine}
                description={item.location}
              />
            </Card>
          );
        })}
      </Flex>
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
export default WineriesPage;
