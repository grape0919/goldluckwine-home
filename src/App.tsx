import type { RouteRecord } from 'vite-react-ssg';
import PageLayout from '@/components/layout/PageLayout';
import HomePage from '@/page/HomePage';
import WineListPage from '@/page/WineListPage';
import WineriesPage from '@/page/WineriesPage';
import WineryIntroPage, { wineryLoader } from '@/page/WIneryIntroPage';
import WineIntroPage, { wineLoader } from '@/page/WineIntroPage';
import ContactFooter from '@/page/ContactFooter';
import NotFoundPage from '@/page/NotFoundPage';
import AdminRoot from '@/page/admin/AdminRoot';
import { fetchWineIds, fetchWineryIds } from '@/api/wines';

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <PageLayout />,
    children: [
      { index: true, element: <HomePage /> },
      // '/importer'(About)는 콘텐츠가 준비되면 다시 추가 — 현재 스텁이라 라우트 미노출
      { path: 'winelist', element: <WineListPage /> },
      { path: 'wineries', element: <WineriesPage /> },
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
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '/admin', element: <AdminRoot /> },
];
