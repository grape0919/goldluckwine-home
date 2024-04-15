import React from 'react';
import styled from 'styled-components';
import { Button, Card, Flex, Typography, List } from 'antd';
import { customedTheme } from '@/styles/theme';

const data: {
  id: number;
  wineNameKR: string;
  wineNameOrigin: string;
  wineImagePath: string;
  description: string;
}[] = [
  {
    id: 1,
    wineNameKR: '라 기마르디에',
    wineNameOrigin: 'La guimardiere 2020',
    wineImagePath: import.meta.env.VITE_PUBLIC_URL + '/wines/aozina/moon.png',
    description: '',
  },
  {
    id: 2,
    wineNameKR: '라 기마르디에',
    wineNameOrigin: 'La guimardiere 2020',
    wineImagePath: import.meta.env.VITE_PUBLIC_URL + '/wines/aozina/moon.png',
    description: '',
  },
];
const HomePageSection2 = () => {
  return (
    <Wrapper>
      <div className={'section2-title'}>와인리스트</div>
      <Flex
        vertical
        gap={customedTheme.space.lg}
      >
        <Flex
          vertical
          gap={customedTheme.space.md}
          style={{ width: '100%' }}
        >
          <div className={'domain-text'}>Domaine7</div>
          <div className={'wine-list'}>
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 4,
                lg: 4,
                xl: 6,
                xxl: 3,
              }}
              dataSource={data}
              renderItem={(item) => (
                <List.Item style={{ width: '300px' }}>
                  <Card
                    style={{
                      background: customedTheme.color.bg.light,
                      padding: customedTheme.space.md,
                    }}
                    hoverable
                    cover={
                      <img
                        alt={item.wineNameOrigin}
                        src={item.wineImagePath}
                        style={{
                          height: 300,
                          objectFit: 'contain',
                        }}
                      />
                    }
                    onClick={() => {
                      console.log(item.id);
                    }}
                  >
                    <div
                      style={{
                        fontWeight: customedTheme.fontWeight.semiBold,
                        textAlign: 'center',
                      }}
                    >
                      {item.wineNameOrigin}
                    </div>
                    <div
                      style={{
                        textAlign: 'center',
                      }}
                    >
                      {item.wineNameKR}
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        </Flex>
      </Flex>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 1rem 3rem;
  .section2-title {
    margin-bottom: ${customedTheme.space.lg};
    font-size: ${customedTheme.fontSize.s4};
    font-weight: ${customedTheme.fontWeight.bold};
  }

  .domain-text {
    font-size: ${customedTheme.fontSize.s3};
    font-weight: ${customedTheme.fontWeight.semiBold};
  }
`;
export default HomePageSection2;
