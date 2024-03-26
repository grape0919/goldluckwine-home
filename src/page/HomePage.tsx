import React from 'react';
import { GiWineBottle } from 'react-icons/gi';
import FeaturedWines from './FeaturedWines';
import PageLayout from '@/components/layout/PageLayout.tsx';
import { WineType } from '@/types/wine.ts';
import { customedTheme } from '@/styles/theme.ts';

// Mock data for featured wines
const wines: WineType[] = [
  // Add your wine items here
  {
    id: 1,
    name: 'GoldLuckWine1',
    price: '1,000,000',
    image: (
      <GiWineBottle
        style={{ fontSize: '100px', color: customedTheme.color.primary }}
      />
    ),
  },
];

function HomePage() {
  return (
    <PageLayout>
      <div className='main-content'>
        <FeaturedWines wines={wines} />
        {/* Additional content can be added here */}
      </div>
    </PageLayout>
  );
}

export default HomePage;
