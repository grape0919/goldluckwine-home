import { useLoaderData } from 'react-router-dom';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
import HeroSection from '@/page/home/HeroSection';
import IntroSection from '@/page/home/IntroSection';
import GermanySection from '@/page/home/GermanySection';
import GallerySection from '@/page/home/GallerySection';
import { fetchFeaturedWines, fetchWineries } from '@/api/wines';
import type { WineInfoType } from '@/types/wine';
import Seo from '@/components/Seo';

interface HomeLoaderData {
  featuredWines: WineInfoType[];
  wineryNameById: Record<number, string>;
}

/** 빌드(SSG) 시점에 추천 와인을 로드 → 홈 HTML의 OUR COLLECTION 카드와
 *  상세 페이지 링크가 프리렌더된다 (크롤러의 첫 진입 경로가 홈이므로 중요) */
export async function homeLoader() {
  const [featuredWines, wineries] = await Promise.all([
    fetchFeaturedWines(),
    fetchWineries(),
  ]);
  return {
    featuredWines,
    wineryNameById: Object.fromEntries(wineries.map((w) => [w.id, w.domaine])),
  };
}

function HomePage() {
  const { featuredWines, wineryNameById } = useLoaderData() as HomeLoaderData;

  return (
    <Wrapper>
      <Seo path='/' />
      <HeroSection />
      <IntroSection
        featuredWines={featuredWines}
        wineryNameById={wineryNameById}
      />
      <GermanySection />
      <GallerySection />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: ${customedTheme.home.cream};
`;

export default HomePage;
