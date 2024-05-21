import React from 'react';
import styled from 'styled-components';
import { Flex, Typography } from 'antd';
import { customedTheme } from '@/styles/theme';

const { Paragraph } = Typography;

const HomePageSection3: React.FC = () => {
  return (
    <Wrapper
      gap={100}
      justify={'center'}
    >
      <Flex
        vertical
        align={'center'}
        justify={'center'}
      >
        <Paragraph
          style={{
            fontSize: '1.4em',
            fontWeight: customedTheme.fontWeight.semiBold,
            textAlign: 'center',
          }}
        >
          <span style={{ color: customedTheme.color.primary }}>
            골드럭 와인
          </span>
          은 프랑스의 보석같은 소규모 농부들의 와인을 소개하는
          <br />
          내추럴 와인 전문 수입사입니다.{' '}
        </Paragraph>
        <Paragraph
          style={{
            lineHeight: '1.6',
            fontSize: customedTheme.fontSize.s3,
            textAlign: 'center',
            overflowWrap: 'break-word',
          }}
        >
          <span style={{ color: customedTheme.color.primary }}>루아르</span>{' '}
          지역의 대표 화이트 품종인{' '}
          <span style={{ color: customedTheme.color.primary }}>슈냉 블랑</span>
          의 다채로운 퍼포먼스를 보여주는 와인들을 위주로, 특히 ‘깨끗함’과
          ‘우아함’ 의 강점을 가진 와인들을 선보입니다.
          <span style={{ color: customedTheme.color.primary }}>
            {' '}
            골드럭와인
          </span>
          은 포도 본연의 순수함과 떼루아를 존중하며 최소한의 개입으로 양조하는,
          진솔한 와인 메이커들과 함께합니다.
        </Paragraph>
      </Flex>
      {/*<img*/}
      {/*  src={'/contents/4.png'}*/}
      {/*  alt={'goldluckwin 골드럭와인'}*/}
      {/*  style={{*/}
      {/*    height: 500,*/}
      {/*    objectFit: 'contain',*/}
      {/*  }}*/}
      {/*/>*/}
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  font-weight: ${customedTheme.fontWeight.medium};
  padding: 1rem 25%;

  @media (max-width: 1535px) {
    padding: 1rem 20%;
  }

  @media (max-width: 1023px) {
    padding: 1rem 20%;
  }
  @media (max-width: 767px) {
    padding: 1rem 15%;
  }
`;
export default HomePageSection3;
