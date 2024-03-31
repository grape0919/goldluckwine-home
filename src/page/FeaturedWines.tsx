import React from 'react';
import { Card, Row, Col } from 'antd';
import styled from 'styled-components';
import { WineType } from '@/types/wine';

interface Props {
  wines: WineType[];
}

const FeaturedWines = ({ wines }: Props) => {
  return (
    <Wrapper className='featured-wines'>
      <h2>와인 리스트</h2>
      <Row gutter={[16, 16]}>
        {wines.map((wine) => (
          <Col
            xs={24}
            sm={12}
            md={8}
            key={wine.id}
          >
            <Card
              hoverable
              cover={wine.image}
              style={{ padding: '10px 20px 10px 20px' }}
            >
              <Card.Meta
                title={wine.name}
                description={`${wine.description}`}
              />
              {/*<Link to={`/wines/${wine.id}`}>Learn More</Link>*/}
            </Card>
          </Col>
        ))}
      </Row>
    </Wrapper>
  );
};
const Wrapper = styled.div`
  .featured-wines h2 {
    color: #7b2d26; /* Deep wine red */
    font-family: 'Playfair Display', serif;
    text-align: center;
    margin-bottom: 24px;
  }

  .featured-wines .ant-card {
    background: #f8f1f1; /* Light background for contrast */
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .featured-wines .ant-card-cover img {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  .featured-wines .ant-card-meta-title {
    color: #4a4a4a;
    font-weight: bold;
  }

  .featured-wines a {
    display: block;
    text-align: center;
    margin-top: 16px;
    color: #7b2d26; /* Wine red for call to action */
    font-weight: bold;
  }
`;
export default FeaturedWines;
