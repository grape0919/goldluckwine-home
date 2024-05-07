import { useNavigate, useParams } from 'react-router-dom';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Col, Flex, Image, Row, Typography } from 'antd';

import { IoIosWine } from 'react-icons/io';
import { wines } from '@/dummy/wines';
import { wineriesData } from '@/dummy/wineries';
import { customedTheme, failImage } from '@/styles/theme';
const { Text, Link, Title, Paragraph } = Typography;
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
          md={8}
        >
          <Flex
            justify={'center'}
            style={{ padding: '3rem' }}
          >
            <Image
              src={wine?.wineImagePath}
              alt={
                '골드럭와인 Gold Luck Wine 와인수입사 : ' +
                wine?.wineNameKR +
                ', ' +
                wine?.wineNameEN
              }
              style={{
                maxHeight: 500,
                objectFit: 'contain',
              }}
              fallback={failImage}
            />
          </Flex>
        </Col>
        <Col span={12}>
          <Flex
            vertical
            gap={customedTheme.space.md}
          >
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
              vertical
              gap={customedTheme.space.xs}
            >
              <Flex
                align={'center'}
                gap={customedTheme.space.md}
                style={{
                  color: customedTheme.color.primary,
                  fontWeight: customedTheme.fontWeight.semiBold,
                }}
              >
                <div>WINE MAKER</div>
                <Link href={`/wineries/${winery?.id}`}>{winery?.domaine}</Link>
              </Flex>
              <Flex
                align={'center'}
                gap={customedTheme.space.md}
                style={{
                  color: customedTheme.color.primary,
                  fontWeight: customedTheme.fontWeight.semiBold,
                }}
              >
                <div>WINE TYPE</div>
                <Text>
                  {wine ? (
                    <IoIosWine
                      style={{
                        fontSize: customedTheme.fontSize.s4,
                        color: customedTheme.color.wine[wine.wineType],
                        verticalAlign: 'middle',
                      }}
                    />
                  ) : (
                    <></>
                  )}
                  {wine?.wineType}
                </Text>
              </Flex>
              <Flex
                align={'center'}
                gap={customedTheme.space.md}
                style={{
                  color: customedTheme.color.primary,
                  fontWeight: customedTheme.fontWeight.semiBold,
                }}
              >
                <div>GRAPE</div>
                <Text>{wine?.wineVariety}</Text>
              </Flex>
            </Flex>
            <Paragraph strong={true}>{wine?.wineDescription}</Paragraph>
          </Flex>
        </Col>
      </Row>
    </Wrapper>
  );
};

const Wrapper = styled.div``;

export default WineIntroPage;
