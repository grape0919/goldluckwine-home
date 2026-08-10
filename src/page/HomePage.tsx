import { useLoaderData } from 'react-router-dom';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
import HeroSection from '@/page/home/HeroSection';
import IntroSection from '@/page/home/IntroSection';
import GermanySection from '@/page/home/GermanySection';
import GallerySection from '@/page/home/GallerySection';
import { fetchFeaturedWines, fetchWineries } from '@/api/wines';
import { fetchHomeContent } from '@/api/homeContent';
import type { HomeContent } from '@/api/homeContent';
import type { WineInfoType } from '@/types/wine';
import Seo from '@/components/Seo';

interface HomeLoaderData {
  featuredWines: WineInfoType[];
  wineryNameById: Record<number, string>;
  content: HomeContent;
}

/** 빌드(SSG) 시점에 추천 와인·홈 콘텐츠를 로드 → 홈 HTML의 문구·이미지와
 *  OUR COLLECTION 카드가 프리렌더된다 (크롤러의 첫 진입 경로가 홈이므로 중요) */
export async function homeLoader() {
  const [featuredWines, wineries, content] = await Promise.all([
    fetchFeaturedWines(),
    fetchWineries(),
    fetchHomeContent(),
  ]);
  return {
    featuredWines,
    wineryNameById: Object.fromEntries(wineries.map((w) => [w.id, w.domaine])),
    content,
  };
}

function HomePage() {
  const { featuredWines, wineryNameById, content } =
    useLoaderData() as HomeLoaderData;

  return (
    <Wrapper>
      <Seo path='/' />
      <HeroSection content={content} />
      <IntroSection
        featuredWines={featuredWines}
        wineryNameById={wineryNameById}
        content={content}
      />
      <GermanySection content={content} />
      <GallerySection content={content} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: ${customedTheme.home.cream};
`;

export default HomePage;
