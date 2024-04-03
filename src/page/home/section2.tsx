import React from 'react';
import styled from 'styled-components';
import { Button, Card, Flex, Typography } from 'antd';
import { customedTheme } from '@/styles/theme';

const HomePageSection2 = () => {
  return (
    <Wrapper>
      <div className={'profile-list'}>
        <Card
          hoverable
          style={{ width: 620 }}
          styles={{ body: { padding: 0, overflow: 'hidden' } }}
        >
          <Flex justify='space-between'>
            <img
              alt='avatar'
              src={import.meta.env.VITE_PUBLIC_URL + '/profile1.png'}
              style={{
                display: 'block',
                width: 273,
              }}
            />
            <Flex
              vertical
              align='flex-end'
              justify='space-between'
              style={{ padding: 32 }}
            >
              <Typography.Title level={3}>
                “antd is an enterprise-class UI design language and React UI
                library.”
              </Typography.Title>
              <Button
                type='primary'
                href='https://ant.design'
                target='_blank'
              >
                Get Started
              </Button>
            </Flex>
          </Flex>
        </Card>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  .landing-top {
    display: flex;
    justify-content: center;
    align-items: center;

    padding: 2rem 0;
  }
`;
export default HomePageSection2;
