import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { customedTheme } from '@/styles/theme';
import WineriesPage from '@/page/WineriesPage';
import ImporterIntroPage from '@/page/ImporterIntroPage';
import WineIntroPage from '@/page/WineIntroPage';
import OrderWinePage from '@/page/OrderWinePage';
import HomePage from '@/page/HomePage';
import PageLayout from '@/components/layout/PageLayout';
import TestPage from '@/page/TestPage';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: customedTheme.color.primary,
          colorInfo: customedTheme.color.info,
          colorSuccess: customedTheme.color.success,
          colorWarning: customedTheme.color.warning,
          colorError: customedTheme.color.error,
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
      <BrowserRouter>
        <Routes>
          <Route
            path='/'
            element={<PageLayout />}
          >
            <Route
              path='/'
              element={<HomePage />}
            />
            <Route
              path='/importer'
              element={<ImporterIntroPage />}
            />
            <Route
              path='/wineries'
              element={<WineriesPage />}
            />
            <Route
              path='/wineries/:wineryId'
              element={<WineIntroPage />}
            />
            <Route
              path='/order'
              element={<OrderWinePage />}
            />
            <Route
              path='/test'
              element={<TestPage />}
            />
          </Route>
          <Route
            path='*'
            element={<>Not Found Page</>}
          />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
