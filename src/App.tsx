import type { RouteRecord } from 'vite-react-ssg';
import PageLayout from '@/components/layout/PageLayout';
import HomePage, { homeLoader } from '@/page/HomePage';
import WineListPage, { wineListLoader } from '@/page/WineListPage';
import WineriesPage, { wineriesLoader } from '@/page/WineriesPage';
import WineryIntroPage, { wineryLoader } from '@/page/WIneryIntroPage';
import WineIntroPage, { wineLoader } from '@/page/WineIntroPage';
import ContactFooter from '@/page/ContactFooter';
import NotFoundPage from '@/page/NotFoundPage';
import OrderPage from '@/page/order/OrderPage';
import OrderLoginPage from '@/page/order/OrderLoginPage';
import OrderSignupPage from '@/page/order/OrderSignupPage';
import OrderResetPage from '@/page/order/OrderResetPage';
import OrderAccountPage from '@/page/order/OrderAccountPage';
import OrderCheckoutPage from '@/page/order/OrderCheckoutPage';
import OrderCompletePage from '@/page/order/OrderCompletePage';
import OrderHistoryPage from '@/page/order/OrderHistoryPage';
import OrderTermsPage from '@/page/order/OrderTermsPage';
import OrderPrivacyPage from '@/page/order/OrderPrivacyPage';
import AdminRoot from '@/page/admin/AdminRoot';
import { fetchWineIds, fetchWineryIds } from '@/api/wines';

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <PageLayout />,
    children: [
      { index: true, element: <HomePage />, loader: homeLoader },
      // '/importer'(About)는 콘텐츠가 준비되면 다시 추가 — 현재 스텁이라 라우트 미노출
      { path: 'winelist', element: <WineListPage />, loader: wineListLoader },
      { path: 'wineries', element: <WineriesPage />, loader: wineriesLoader },
      {
        path: 'wineries/:wineryId',
        element: <WineryIntroPage />,
        loader: wineryLoader,
        getStaticPaths: async () =>
          (await fetchWineryIds()).map((id) => `/wineries/${id}`),
      },
      {
        path: 'wines/:wineId',
        element: <WineIntroPage />,
        loader: wineLoader,
        getStaticPaths: async () =>
          (await fetchWineIds()).map((id) => `/wines/${id}`),
      },
      { path: 'contact', element: <ContactFooter /> },
      // 거래처 발주 영역 — 세션 의존이라 프리렌더 제외(vite.config), vercel.json rewrite 로 서빙
      { path: 'order', element: <OrderPage /> },
      { path: 'order/login', element: <OrderLoginPage /> },
      { path: 'order/signup', element: <OrderSignupPage /> },
      { path: 'order/reset', element: <OrderResetPage /> },
      { path: 'order/checkout', element: <OrderCheckoutPage /> },
      { path: 'order/complete', element: <OrderCompletePage /> },
      { path: 'order/history', element: <OrderHistoryPage /> },
      { path: 'order/account', element: <OrderAccountPage /> },
      { path: 'order/terms', element: <OrderTermsPage /> },
      { path: 'order/privacy', element: <OrderPrivacyPage /> },
      // 명시 라우트라 프리렌더된다 — 빌드 후 dist/404.html 로 복사돼 Vercel 404 응답에 쓰인다
      { path: 'not-found', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '/admin', element: <AdminRoot /> },
];
