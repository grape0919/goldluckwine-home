import { Card, Flex, List } from 'antd';
import { IoIosWine } from 'react-icons/io';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { customedTheme } from '@/styles/theme';
import { WineInfoType } from '@/types/wine';

interface Props {
  wineList: WineInfoType[];
}
const WineList = ({ wineList }: Props) => {
  const navigate = useNavigate();
  return (
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
            dataSource={wineList}
            renderItem={(item: WineInfoType) => (
              <List.Item
                onClick={() => {
                  navigate(`/wines/${item.wineId}`);
                }}
              >
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
  );
};

export default WineList;
