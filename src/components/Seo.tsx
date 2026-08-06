import React from 'react';
import { Head } from 'vite-react-ssg';

export const BASE_URL = 'https://goldluckwine.com';
const SITE_NAME = '골드럭와인 GOLDLUCKWINE';
const DEFAULT_TITLE = `${SITE_NAME} | 와인수입사`;
const DEFAULT_DESCRIPTION =
  '골드럭와인은 슈냉 블랑 중심의 깨끗하고 우아한 내추럴 와인을 소개하는 와인 수입사입니다.';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

interface SeoProps {
  /** 페이지 제목 — "{title} | 골드럭와인 GOLDLUCKWINE"로 조합. 생략 시 기본 타이틀 */
  title?: string;
  description?: string;
  /** canonical 경로 (예: '/winelist'). 생략 시 현재 pathname */
  path?: string;
  /** OG 이미지 — 절대 URL 또는 사이트 루트 기준 경로 */
  image?: string;
  noindex?: boolean;
  /** schema.org 구조화 데이터 (JSON-LD) — 프리렌더 HTML에 <script>로 박힌다 */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/** 라우트별 title/description/canonical/OG 메타.
 *  vite-react-ssg의 Head를 사용해 SSR(프리렌더) 시점에 HTML <head>에 박힌다. */
const Seo: React.FC<SeoProps> = ({
  title,
  description,
  path,
  image,
  noindex,
  jsonLd,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;
  const pathname =
    path ??
    (typeof window !== 'undefined' ? window.location.pathname : '/');
  const url = `${BASE_URL}${pathname}`;
  const rawImg = !image
    ? DEFAULT_IMAGE
    : image.startsWith('http')
      ? image
      : `${BASE_URL}${image}`;
  // 이미지 경로에 공백/한글이 있어도 크롤러가 읽도록 URL 인코딩 (구조문자는 보존)
  const img = encodeURI(rawImg);

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta
        name='description'
        content={desc}
      />
      <link
        rel='canonical'
        href={url}
      />
      <meta
        property='og:title'
        content={fullTitle}
      />
      <meta
        property='og:description'
        content={desc}
      />
      <meta
        property='og:url'
        content={url}
      />
      <meta
        property='og:image'
        content={img}
      />
      <meta
        name='twitter:title'
        content={fullTitle}
      />
      <meta
        name='twitter:description'
        content={desc}
      />
      <meta
        name='twitter:image'
        content={img}
      />
      {noindex && (
        <meta
          name='robots'
          content='noindex, nofollow'
        />
      )}
      {jsonLd && (
        <script type='application/ld+json'>
          {/* '<' 이스케이프로 스크립트 조기 종료·XSS 방지 */}
          {JSON.stringify(jsonLd).replace(/</g, '\\u003c')}
        </script>
      )}
    </Head>
  );
};

export default Seo;
