import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
import HeroSection from '@/page/home/HeroSection';
import IntroSection from '@/page/home/IntroSection';
import LoireSection from '@/page/home/LoireSection';
import GallerySection from '@/page/home/GallerySection';
import { fetchFeaturedWines, fetchWineries } from '@/api/wines';
import type { WineInfoType } from '@/types/wine';

function HomePage() {
  const [featuredWines, setFeaturedWines] = useState<WineInfoType[]>([]);
  const [wineryNameById, setWineryNameById] = useState<Record<number, string>>(
    {},
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchFeaturedWines(), fetchWineries()]).then(
      ([wines, wineries]) => {
        if (cancelled) return;
        setFeaturedWines(wines);
        setWineryNameById(
          Object.fromEntries(wineries.map((w) => [w.id, w.domaine])),
        );
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Wrapper>
      <HeroSection />
      <IntroSection
        featuredWines={featuredWines}
        wineryNameById={wineryNameById}
      />
      <LoireSection />
      <GallerySection />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: ${customedTheme.home.cream};
`;

export default HomePage;
