/** GA4 로더 — .env 에 VITE_GA4_ID(G-XXXXXXXXXX)를 설정하면 활성화됩니다. */

type GtagWindow = typeof window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

export function initAnalytics() {
  const gaId = import.meta.env.VITE_GA4_ID as string | undefined;
  if (!gaId || !import.meta.env.PROD) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  const w = window as GtagWindow;
  w.dataLayer = w.dataLayer ?? [];
  function gtag(...args: unknown[]) {
    w.dataLayer!.push(args);
  }
  w.gtag = gtag;
  gtag('js', new Date());
  gtag('config', gaId);
}

/**
 * GA4 커스텀 이벤트 전송 — GA4 미설정·개발 모드·SSG 빌드 시점에는 조용히 무시.
 * 이벤트명은 GA4 권장 이벤트(view_item, select_item 등)를 우선 사용한다.
 */
export function trackEvent(
  name: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;
  (window as GtagWindow).gtag?.('event', name, params);
}
