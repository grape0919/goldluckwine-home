import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
  },

  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    dedupe: ['styled-components'],
  },
  // styled-components v6는 SSR 번들에 포함해야 ESM interop이 맞는다
  // (external로 두면 styled.footer is not a function)
  ssr: {
    noExternal: ['styled-components'],
  },
  build: {
    rollupOptions: {},
  },
  ssgOptions: {
    // /wines/1 -> dist/wines/1/index.html (Vercel이 확장자 없이 서빙)
    dirStyle: 'nested',
    formatting: 'none',
    // /admin 은 antd(CJS) SSR 이슈로 프리렌더 제외 (CSR + rewrite).
    // /order 는 프리렌더 포함 — 초기 렌더가 로딩 셸이라 세션과 무관하게 결정적이고,
    // rewrite 로 홈 HTML 을 서빙하면 hydration 불일치(React #418/#423)가 난다.
    // 하위 라우트 경로는 슬래시 없이 올 수 있어 정규화 후 비교한다
    includedRoutes: (paths) =>
      paths.filter((p) => !p.replace(/^\//, '').startsWith('admin')),
  },
});
