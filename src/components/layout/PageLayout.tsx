import React, { useCallback, useState } from 'react';
import { Layout, Menu, MenuProps, theme } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import { customedTheme } from '@/styles/theme';

const { Header, Content, Footer } = Layout;

const PageLayout = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems: MenuProps['items'] = [
    {
      key: '/importer',
      label: <Link to='/importer'>Gold Luck Wine</Link>,
    },
    {
      key: '/wineries',
      label: <Link to='/wineries'>Wineries</Link>,
    },
    {
      key: '/order',
      label: <Link to='/importer'>Contect</Link>,
    },
  ];

  const [selectedMenu, setSelectedMenu] = useState(location.pathname);

  const handleSelectMenu: MenuProps['onClick'] = useCallback(
    (e: { key: React.SetStateAction<string> }) => {
      if (e.key) {
        setSelectedMenu(e.key);
      }
    },
    [setSelectedMenu],
  );

  return (
    <Layout>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: customedTheme.color.white,
          position: 'sticky',
          top: '0px',
          zIndex: '10',
        }}
      >
        <Link
          to={'/'}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <img
            src={import.meta.env.VITE_PUBLIC_URL + '/goldluckwine-logo.png'}
            height={'48px'}
            alt=''
          />
        </Link>
        <Menu
          theme='light'
          mode='horizontal'
          selectedKeys={[selectedMenu]}
          onSelect={handleSelectMenu}
          items={menuItems}
          style={{
            flex: 0.5,
            minWidth: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            fontWeight: customedTheme.fontWeight.bold,
          }}
        />
      </Header>
      <Content
        style={{ background: customedTheme.color.white, minHeight: '85vh' }}
      >
        <div
          style={{
            minHeight: '100%',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </div>
      </Content>

      <Footer
        style={{
          textAlign: 'center',
          fontSize: customedTheme.fontSize.s1,
          color: customedTheme.color.text.mute,
          background: customedTheme.color.primaryLight,
          borderTop: customedTheme.border.default,
        }}
      >
        2024.04.20 Created by Gold Luck Wine
      </Footer>
    </Layout>
  );
};

export default PageLayout;
