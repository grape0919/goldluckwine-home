import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Col, Divider, Flex, Image, Row, Typography } from 'antd';
import { fetchWines, fetchWineryById } from '@/api/wines';
import type { WineInfoType } from '@/types/wine';
import { customedTheme, failImage } from '@/styles/theme';
import { WineryInfoType } from '@/types/winery';
import WineList from '@/components/WineList';
const { Text, Title, Paragraph } = Typography;
const WineryIntroPage: React.FC = () => {
  const { wineryId } = useParams<{ wineryId: string }>();
  const navigate = useNavigate();
  const [winery, setWinery] = useState<WineryInfoType | null>(null);
  const [wineList, setWineList] = useState<WineInfoType[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchWineryById(Number(wineryId)).then((found) => {
      if (cancelled) return;
      if (!found) {
        // 존재하지 않는 도멘 id — 이전 페이지로 복귀
        navigate(-1);
        return;
      }
      setWinery(found);
      fetchWines().then((all) => {
        if (!cancelled) {
          setWineList(all.filter((wine) => wine.wineryId === found.id));
        }
      });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate, wineryId]);

  return (
    <Wrapper>
      <Row
        align={'middle'}
        gutter={[80, 60]}
        style={{ marginTop: '80px', marginBottom: '80px' }}
      >
        <Col
          span={24}
          xl={10}
        >
          <Flex justify={'center'}>
            <Image
              src={winery?.imagePath}
              alt={'골드럭와인 Gold Luck Wine 와인수입사 : ' + winery?.domaine}
              style={{
                maxHeight: 500,
                objectFit: 'contain',
                borderRadius: 12,
              }}
              fallback={failImage}
            />
          </Flex>
        </Col>
        <Col
          span={24}
          xl={14}
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
              <div>{winery?.domaineKR}</div>
              <div>{winery?.domaine}</div>
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
                <Text type={'secondary'}>{winery?.location}</Text>
              </Flex>
            </Flex>
            <Paragraph strong={true}>{winery?.description}</Paragraph>
          </Flex>
        </Col>
      </Row>
      <Flex vertical>
        <Divider
          orientation='left'
          className={['section2-title'].join(',')}
          style={{
            marginBottom: customedTheme.space.lg,
            fontFamily: "'Lora', serif",
            fontSize: customedTheme.fontSize.s5,
            fontWeight: customedTheme.fontWeight.semiBold,
          }}
        >
          WINE
        </Divider>
        <WineList wineList={wineList} />
      </Flex>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: ${customedTheme.space.xxl} 20%;
`;

export default WineryIntroPage;
