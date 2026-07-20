import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './App';
import './index.css';
import { initAnalytics } from './lib/analytics';

export const createRoot = ViteReactSSG(
  { routes },
  ({ isClient }) => {
    // GA4는 브라우저에서만 (SSG 빌드 시점엔 실행 안 함)
    if (isClient) initAnalytics();
  },
  {
    getStyleCollector: () =>
      import('vite-react-ssg/style-collectors/styled-components').then(
        (m) => m.default(),
      ),
  },
);
