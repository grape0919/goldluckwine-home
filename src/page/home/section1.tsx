import React from 'react';
import styled from 'styled-components';
import { Flex } from 'antd';

const HomePageSection1 = () => {
  return (
    <Wrapper justify='center'>
      <div className={'landing-top'}>
        <img
          src={'/main-background.png'}
          width={'100%'}
          alt={'goldluckwin 골드럭와인'}
        />
      </div>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  .landing-top {
    display: flex;
    justify-content: center;
    align-items: center;

    padding: 0;
    width: 100%;
  }
`;
export default HomePageSection1;
