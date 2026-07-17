/** GA4 로더 — .env 에 VITE_GA4_ID(G-XXXXXXXXXX)를 설정하면 활성화됩니다. */
export function initAnalytics() {
  const gaId = import.meta.env.VITE_GA4_ID as string | undefined;
  if (!gaId || !import.meta.env.PROD) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  const w = window as typeof window & { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer ?? [];
  function gtag(...args: unknown[]) {
    w.dataLayer!.push(args);
  }
  gtag('js', new Date());
  gtag('config', gaId);
}
