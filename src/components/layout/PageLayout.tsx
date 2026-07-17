import { Dropdown } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
import SiteFooter from '@/components/layout/SiteFooter';

const { home, font } = customedTheme;

const NAV_ITEMS = [
  { to: '/', label: 'HOME' },
  { to: '/winelist', label: 'WINE LIST' },
  { to: '/wineries', label: 'WINERIES' },
  { to: '/contact', label: 'CONTACT' },
];

const isActive = (pathname: string, to: string) =>
  to === '/' ? pathname === '/' : pathname.startsWith(to);

const PageLayout = () => {
  const { pathname } = useLocation();

  return (
    <Wrapper>
      <header className='gnb'>
        <Link
          to='/'
          className='gnb-logo'
        >
          <img
            src='/home/brand/logo-wordmark.svg'
            alt='골드럭와인 Gold Luck Wine 와인수입사'
            height={26}
          />
        </Link>

        <nav className='gnb-nav'>
          {NAV_ITEMS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={isActive(pathname, to) ? 'active' : ''}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className='gnb-mobile'>
          <Dropdown
            menu={{
              items: NAV_ITEMS.map(({ to, label }) => ({
                key: to,
                label: <Link to={to}>{label}</Link>,
              })),
              selectedKeys: NAV_ITEMS.filter(({ to }) =>
                isActive(pathname, to),
              ).map(({ to }) => to),
            }}
            trigger={['click']}
          >
            <button
              className='gnb-mobile-button'
              aria-label='메뉴 열기'
            >
              <MenuOutlined />
            </button>
          </Dropdown>
        </div>
      </header>

      <main className='content'>
        <Outlet />
      </main>

      <SiteFooter />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${home.cream};

  .gnb {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 80px;
    padding: 0 80px;
    background: ${home.cream};
  }

  .gnb-logo {
    display: flex;
    align-items: center;
  }

  .gnb-nav {
    display: flex;
    gap: 72px;
    font-family: ${font.en};
    font-size: 17px;
    letter-spacing: 0.02em;

    a {
      color: ${home.gray};
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: ${home.ink};
      }

      &.active {
        color: ${home.ink};
        font-weight: 700;
      }
    }
  }

  .gnb-mobile {
    display: none;
  }

  .gnb-mobile-button {
    border: none;
    background: none;
    font-size: 20px;
    color: ${home.ink};
    cursor: pointer;
    padding: 8px;
  }

  .content {
    flex: 1;
    background: ${home.cream};
  }

  @media (max-width: 1024px) {
    .gnb {
      padding: 0 24px;
    }
    .gnb-nav {
      gap: 40px;
    }
  }

  @media (max-width: 768px) {
    .gnb {
      height: 64px;
    }
    .gnb-nav {
      display: none;
    }
    .gnb-mobile {
      display: block;
    }
  }
`;

export default PageLayout;
