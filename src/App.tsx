import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import PageLayout from './components/layout/PageLayout';

function ProductPage() {
  return (
    <PageLayout>
      <>PRODUCT</>
    </PageLayout>
  );
}

function HomePage() {
  return <PageLayout>Main Content</PageLayout>;
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#7e6ac9',
          colorInfo: '#0d6efd',
          colorSuccess: '#198754',
          colorWarning: '#ffc107',
          colorError: '#dc3545',
        },
        components: {
          Layout: {
            footerPadding: '12px 50px',
          },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          {/* Main route */}
          <Route path='/'>
            {/* Child routes */}
            <Route
              index
              element={<HomePage />}
            />
            <Route
              path='product'
              element={<ProductPage />}
            />
          </Route>

          {/* Not Found route */}
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
