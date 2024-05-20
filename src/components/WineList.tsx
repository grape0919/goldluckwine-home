import { Card, Flex, List, Select } from 'antd';
import { IoIosWine } from 'react-icons/io';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customedTheme } from '@/styles/theme';
import { WineInfoType, WineType } from '@/types/wine';
import { WineTypes } from '@/enum/wine';
import { wineriesData } from '@/dummy/wineries';

interface Props {
  wineList: WineInfoType[];
  useFilter?: boolean;
}
const WineList = ({ wineList, useFilter }: Props) => {
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState<WineInfoType[]>(wineList);
  const [wineTypeFilterValue, setWineTypeFilterValue] = useState<string>('all');
  const [domaineFilterValue, setDomaineFilterValue] = useState<string>('all');
  useEffect(() => {
    if (wineTypeFilterValue === 'all' && domaineFilterValue === 'all') {
      setDataSource(wineList);
    } else {
      setDataSource(
        wineList.filter(
          (wine) =>
            (wineTypeFilterValue === 'all'
              ? true
              : wine.wineType === wineTypeFilterValue) &&
            (domaineFilterValue === 'all'
              ? true
              : parseInt(domaineFilterValue) === wine.wineryId),
        ),
      );
    }
  }, [domaineFilterValue, wineList, wineTypeFilterValue]);
  return (
    <Flex
      vertical
      gap={customedTheme.space.lg}
      style={{ width: '100%' }}
    >
      {useFilter ? (
        <Flex
          className={'wine-list-fileter'}
          justify={'flex-start'}
          gap={10}
        >
          <Select
            placeholder='품종'
            defaultValue='all'
            onChange={(value) => {
              setWineTypeFilterValue(value);
            }}
            style={{ width: '160px' }}
          >
            <Select.Option key={'all'}>품종</Select.Option>
            {Object.values(WineTypes).map((wineType) => {
              return <Select.Option key={wineType}>{wineType}</Select.Option>;
            })}
          </Select>
          <Select
            placeholder='메이커'
            defaultValue='all'
            onChange={(value) => {
              setDomaineFilterValue(value);
            }}
            style={{ width: '160px' }}
          >
            <Select.Option key={'all'}>도메인</Select.Option>
            {wineriesData.map((winery) => {
              return (
                <Select.Option key={winery.id}>{winery.domaine}</Select.Option>
              );
            })}
          </Select>
        </Flex>
      ) : (
        ''
      )}
      <Flex
        vertical
        gap={customedTheme.space.md}
      >
        <div className={'wine-list'}>
          <List
            grid={{
              gutter: 40,
              xs: 1,
              sm: 2,
              md: 3,
              lg: 3,
              xl: 4,
              xxl: 5,
            }}
            dataSource={dataSource}
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
                      alt={
                        '골드럭와인 Gold Luck Wine 와인수입사 : ' +
                        item.wineNameKR +
                        ', ' +
                        item.wineNameEN
                      }
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
