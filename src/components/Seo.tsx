import React, { useEffect } from 'react';

const BASE_URL = 'https://goldluckwine.com';
const SITE_NAME = '골드럭와인 Gold Luck Wine';
const DEFAULT_TITLE = `${SITE_NAME} | 와인수입사`;
const DEFAULT_DESCRIPTION =
  '골드럭 와인은 슈냉 블랑 중심의 깨끗하고 우아한 내추럴 와인을 양조하는 와인메이커들과 함께 소개합니다.';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

const upsertMeta = (
  attr: 'name' | 'property',
  key: string,
  content: string,
) => {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

interface SeoProps {
  /** 페이지 제목 — "{title} | 골드럭와인 Gold Luck Wine"로 조합. 생략 시 기본 타이틀 */
  title?: string;
  description?: string;
  /** canonical 경로 (예: '/winelist'). 생략 시 현재 pathname */
  path?: string;
  /** OG 이미지 — 절대 URL 또는 사이트 루트 기준 경로 */
  image?: string;
  noindex?: boolean;
}

/** 라우트별 title/description/canonical/OG 메타 갱신 (SPA용 경량 헬멧) */
const Seo: React.FC<SeoProps> = ({
  title,
  description,
  path,
  image,
  noindex,
}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESCRIPTION;
    const url = `${BASE_URL}${path ?? window.location.pathname}`;
    const img = !image
      ? DEFAULT_IMAGE
      : image.startsWith('http')
        ? image
        : `${BASE_URL}${image}`;

    document.title = fullTitle;
    upsertMeta('name', 'description', desc);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', img);
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', img);

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    const robots =
      document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (noindex) {
      upsertMeta('name', 'robots', 'noindex, nofollow');
    } else if (robots) {
      robots.remove();
    }
  }, [title, description, path, image, noindex]);

  return null;
};

export default Seo;
