import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Col, Flex, Image, Row, Typography } from 'antd';

import { IoIosWine } from 'react-icons/io';
import { fetchWineById, fetchWineryById } from '@/api/wines';
import type { WineInfoType } from '@/types/wine';
import type { WineryInfoType } from '@/types/winery';
import { customedTheme, failImage } from '@/styles/theme';
const { Text, Link, Title, Paragraph } = Typography;
const WineIntroPage: React.FC = () => {
  const { wineId } = useParams<{ wineId: string }>();
  const navigate = useNavigate();
  const [wine, setWine] = useState<WineInfoType | null>(null);
  const [winery, setWinery] = useState<WineryInfoType | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchWineById(Number(wineId)).then((found) => {
      if (cancelled) return;
      if (!found) {
        // 존재하지 않는 와인 id — 이전 페이지로 복귀
        navigate(-1);
        return;
      }
      setWine(found);
      fetchWineryById(found.wineryId).then((w) => {
        if (!cancelled) setWinery(w);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate, wineId]);

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
                height: 300,
                objectFit: 'contain',
              }}
              fallback={'/wines/default.png'}
            />
          </Flex>
        </Col>
        <Col
          span={20}
          md={12}
        >
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
