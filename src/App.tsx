import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App as AntdApp, ConfigProvider } from 'antd';
import { customedTheme } from '@/styles/theme';
import WineriesPage from '@/page/WineriesPage';
import ImporterIntroPage from '@/page/ImporterIntroPage';
import WineIntroPage from '@/page/WineIntroPage';
import HomePage from '@/page/HomePage';
import PageLayout from '@/components/layout/PageLayout';
import TestPage from '@/page/TestPage';
import ContactFooter from '@/page/ContactFooter';

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
        <BrowserRouter>
          <Routes>
            <Route element={<PageLayout />}>
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
                path='/contect'
                element={<ContactFooter />}
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
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
