import React from 'react';
import styled from 'styled-components';
import FeaturedWines from './FeaturedWines';
import { WineType } from '@/types/wine';
// Mock data for featured wines
const wines: WineType[] = [
  // Add your wine items here
  {
    id: 1,
    name: 'GoldLuckWine1',
    description: 'this wine is good.',
    image: (
      <img
        src={'/mille-sabords.png'}
        alt=''
      />
    ),
  },
  {
    id: 2,
    name: 'GoldLuckWine1',
    description: 'this wine is good.',
    image: (
      <img
        src={import.meta.env.VITE_PUBLIC_URL + 'mille-sabords.png'}
        alt=''
      />
    ),
  },
  {
    id: 3,
    name: 'GoldLuckWine1',
    description: 'this wine is good.',
    image: (
      <img
        src={import.meta.env.VITE_PUBLIC_URL + 'mille-sabords.png'}
        alt=''
      />
    ),
  },
  {
    id: 4,
    name: 'GoldLuckWine1',
    description: 'this wine is good.',
    image: (
      <img
        src={import.meta.env.VITE_PUBLIC_URL + 'mille-sabords.png'}
        alt=''
      />
    ),
  },
  {
    id: 5,
    name: 'GoldLuckWine1',
    description: 'this wine is good.',
    image: (
      <img
        src={import.meta.env.VITE_PUBLIC_URL + 'mille-sabords.png'}
        alt=''
      />
    ),
  },
];

function TestPage() {
  return (
    <Wrapper>
      <div className='main-content'>
        <FeaturedWines wines={wines} />
        {/* Additional content can be added here */}
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: rgb(228, 235, 75);
  background: radial-gradient(
    circle,
    rgba(228, 235, 75, 0.5999825955772935) 0%,
    rgba(228, 210, 247, 0.6) 69%
  );
  padding: 24px 0;

  height: 150vh;
  .main-content {
    padding: 0 130px;
  }
`;

export default TestPage;
