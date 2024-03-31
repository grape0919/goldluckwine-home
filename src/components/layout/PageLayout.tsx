import { useCallback, useState } from 'react';
import { Flex, Layout, Menu, theme } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import { MenuItemType } from 'antd/es/menu/hooks/useItems';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { customedTheme } from '@/styles/theme';

const { Header, Content, Footer } = Layout;

const PageLayout = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems: MenuItemType[] = [
    {
      key: '/importer',
      label: <Link to='/importer'>Importer Introduction</Link>,
    },
    {
      key: '/wineries',
      label: <Link to='/wineries'>Wineries</Link>,
    },
    {
      key: '/order',
      label: <Link to='/importer'>Order Wine</Link>,
    },
  ];

  const [selectedMenu, setSelectedMenu] = useState(location.pathname);

  const handleSelectMenu = useCallback(
    (value: ItemType<MenuItemType>) => {
      console.log(value);
      if (value && value.key) {
        setSelectedMenu(value.key.toString());
      }
    },
    [setSelectedMenu],
  );

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
          style={{
            color: customedTheme.color.black,
            display: 'flex',
            justifyContent: 'center',
          }}
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
          style={{ flex: 1, gap: '1rem', justifyContent: 'center' }}
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
        }}
      >
        2024.04.20 Created by Gold Luck Wine
      </Footer>
    </Layout>
  );
};

export default PageLayout;
