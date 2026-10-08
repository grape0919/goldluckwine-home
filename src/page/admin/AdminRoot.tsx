import { lazy, Suspense } from 'react';
import { App as AntdApp, ConfigProvider } from 'antd';
import { createGlobalStyle } from 'styled-components';
import { customedTheme } from '@/styles/theme';

/** 모달·드로어는 body 포털로 렌더되어 AdminPage Wrapper 의 미디어 쿼리가 닿지 않는다.
 *  좁은 화면에서 고정폭 모달(기본 520px 등)이 화면 밖으로 넘치는 것을 막는다. */
const AdminGlobal = createGlobalStyle`
  @media (max-width: 768px) {
    .ant-modal {
      max-width: calc(100vw - 24px) !important;
      margin: 0 auto;
    }
    .ant-modal .ant-modal-content {
      padding: 16px;
    }
    .ant-drawer-content-wrapper {
      max-width: 100vw;
    }
  }
`;

// 관리자 화면은 방문자 번들에서 분리 (antd Form/Table 등 큰 의존성 포함)
const AdminPage = lazy(() => import('@/page/admin/AdminPage'));

/** /admin 전용 루트 — antd ConfigProvider/App(message)를 이 서브트리에만 적용.
 *  공개 페이지는 antd 의존이 없어 SSG(프리렌더) 대상이 된다. */
const AdminRoot = () => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: customedTheme.color.primary,
        colorInfo: customedTheme.color.info,
        colorSuccess: customedTheme.color.success,
        colorWarning: customedTheme.color.warning,
        colorError: customedTheme.color.error,
        fontFamily:
          '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
      },
      components: {
        Layout: {
          footerPadding: '12px 50px',
          headerPadding: '0px 130px',
          headerBg: customedTheme.color.white,
        },
      },
    }}
  >
    <AntdApp message={{ maxCount: 1 }}>
      <AdminGlobal />
      <Suspense fallback={null}>
        <AdminPage />
      </Suspense>
    </AntdApp>
  </ConfigProvider>
);

export default AdminRoot;
