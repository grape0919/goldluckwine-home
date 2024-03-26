import { PropsWithChildren } from 'react';
import { Layout, Menu, theme } from 'antd';
import { Link } from 'react-router-dom';
import { IoIosWine } from 'react-icons/io';
import { customedTheme } from '@/styles/theme';

const { Header, Content, Footer } = Layout;

const PageLayout = ({ children }: PropsWithChildren) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Link
          to={'/'}
          style={{ color: customedTheme.color.black }}
        >
          <IoIosWine fontSize={customedTheme.fontSize.s6} />
        </Link>
        <Menu
          theme='light'
          mode='horizontal'
          selectedKeys={[location.pathname]}
          defaultSelectedKeys={['/']}
          style={{
            flex: 1,
            minWidth: 0,
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <Menu.Item key='/importer'>
            <Link to='/importer'>Importer Introduction</Link>
          </Menu.Item>
          <Menu.Item key='/wineries'>
            <Link to='/wineries'>Wineries</Link>
          </Menu.Item>
          <Menu.Item key='/order'>
            <Link to='/order'>Order Wine</Link>
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{ height: '85vh' }}>
        <div
          style={{
            padding: 24,
            minHeight: '100%',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </div>
      </Content>

      <Footer
        style={{
          textAlign: 'center',
          fontSize: customedTheme.fontSize.s1,
          color: customedTheme.color.text.mute,
        }}
      >
        2024.04.20 Created by Gold Luck Wine
      </Footer>
    </Layout>
  );
};

export default PageLayout;
