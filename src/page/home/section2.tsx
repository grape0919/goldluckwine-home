import React from 'react';
import styled from 'styled-components';
import { Card, Divider, Flex, List } from 'antd';
import { IoIosWine } from 'react-icons/io';
import { customedTheme } from '@/styles/theme';
import { wines } from '@/dummy/wines';
const HomePageSection2 = () => {
  return (
    <Wrapper>
      <Divider
        orientation='left'
        className={['section2-title'].join(',')}
      >
        WINE
      </Divider>
      <Flex
        vertical
        gap={customedTheme.space.lg}
      >
        <Flex
          vertical
          gap={customedTheme.space.md}
          style={{ width: '100%' }}
        >
          <div className={'wine-list'}>
            <List
              grid={{
                gutter: 25,
                xs: 1,
                sm: 2,
                md: 4,
                lg: 4,
                xl: 4,
                xxl: 3,
              }}
              dataSource={wines}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    style={{
                      background: customedTheme.color.white,
                      padding: customedTheme.space.md,
                    }}
                    hoverable
                    cover={
                      <img
                        alt={item.wineNameEN}
                        src={item.wineImagePath}
                        style={{
                          height: 350,
                          objectFit: 'contain',
                        }}
                      />
                    }
                    onClick={() => {
                      console.log(item.wineId);
                    }}
                  >
                    <Flex
                      gap={'0.5rem'}
                      align={'center'}
                      justify={'center'}
                    >
                      <div
                        style={{
                          fontSize: customedTheme.fontSize.s5,
                          color: customedTheme.color.wine[item.wineType],
                        }}
                      >
                        <IoIosWine />
                      </div>
                      <Flex
                        vertical
                        style={{
                          fontWeight: customedTheme.fontWeight.semiBold,
                        }}
                      >
                        <div>{item.wineNameEN}</div>
                        <div>{item.wineNameKR}</div>
                      </Flex>
                    </Flex>
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
