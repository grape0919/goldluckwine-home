import { useNavigate, useParams } from 'react-router-dom';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Col, Divider, Flex, Image, Row, Typography } from 'antd';
import { wines } from '@/dummy/wines';
import { wineriesData } from '@/dummy/wineries';
import { customedTheme, failImage } from '@/styles/theme';
import { WineryInfoType } from '@/types/winery';
import WineList from '@/components/WineList';
const { Text, Title, Paragraph } = Typography;
const WineryIntroPage: React.FC = () => {
  const { wineryId } = useParams<{ wineryId: string }>();
  const navigate = useNavigate();
  const winery: WineryInfoType | void = useMemo(() => {
    const foundWine = wineriesData.find((item) => item.id === Number(wineryId));
    if (foundWine) {
      return foundWine;
    } else {
      return navigate(-1);
    }
  }, [wineryId]);

  const wineList = useMemo(() => {
    return wines.filter((wine) => wine.wineryId === Number(winery?.id));
  }, [winery?.id]);

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
  padding: ${customedTheme.space.md};
`;

export default WineryIntroPage;
