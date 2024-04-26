import { useNavigate, useParams } from 'react-router-dom';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Col, Flex, Row, Typography } from 'antd';

import { Space } from 'antd/lib';
import { IoIosWine } from 'react-icons/io';
import { wines } from '@/dummy/wines';
import { wineriesData } from '@/dummy/wineries';
import { customedTheme } from '@/styles/theme';
const { Text, Title } = Typography;
const WineIntroPage: React.FC = () => {
  const { wineId } = useParams<{ wineId: string }>();
  const navigate = useNavigate();
  const wine = useMemo(() => {
    const foundWine = wines.find((item) => item.wineId === Number(wineId));
    if (foundWine) {
      return foundWine;
    } else {
      return navigate(-1);
    }
  }, [wineId]);

  const winery = useMemo(() => {
    return wineriesData.find((winery) => winery.id === Number(wine?.wineryId));
  }, [wine?.wineryId]);

  return (
    <Wrapper>
      <Row
        align={'middle'}
        justify={'center'}
        gutter={[16, 32]}
      >
        <Col
          span={24}
          md={12}
        >
          <Flex
            justify={'center'}
            style={{ padding: '3rem' }}
          >
            <img
              src={'/' + wine?.wineImagePath}
              alt={''}
              style={{
                maxHeight: 500,
                objectFit: 'contain',
              }}
            />
          </Flex>
        </Col>
        <Col span={12}>
          <Flex
            vertical
            style={{
              fontWeight: customedTheme.fontWeight.bold,
              fontSize: customedTheme.fontSize.s5,
              color: customedTheme.color.primary,
            }}
          >
            <div>{wine?.wineNameKR}</div>
            <div>{wine?.wineNameEN}</div>
          </Flex>
          <Flex
            align={'center'}
            gap={customedTheme.space.md}
            style={{
              color: customedTheme.color.primary,
            }}
          >
            <h4>WINE TYPE</h4>
            <Text>
              {wine?.wineType}
              {wine ? (
                <IoIosWine
                  style={{
                    fontSize: customedTheme.fontSize.s5,
                    color: customedTheme.color.wine[wine.wineType],
                  }}
                />
              ) : (
                <></>
              )}
            </Text>
          </Flex>
          <Space direction={'horizontal'}>
            <h4>GRAPE</h4>
            <div>{wine?.wineVariety}</div>
          </Space>
          <div>{wine?.wineDescription}</div>
        </Col>
      </Row>
      {/*<h3>Wines</h3>*/}
      {/*<ul>*/}
      {/*  {winery.wines.map((wine) => (*/}
      {/*    <li key={wine.id}>*/}
      {/*      <h4>{wine.name}</h4>*/}
      {/*      <p>{wine.description}</p>*/}
      {/*    </li>*/}
      {/*  ))}*/}
      {/*</ul>*/}
    </Wrapper>
  );
};

const Wrapper = styled.div``;

export default WineIntroPage;
