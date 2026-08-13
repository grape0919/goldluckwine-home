import { useEffect, useRef, useState } from 'react';
import { HiMenu } from 'react-icons/hi';
import {
  Link,
  Outlet,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
import SiteFooter from '@/components/layout/SiteFooter';
import ErrorBoundary from '@/components/ErrorBoundary';

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
  const navigationType = useNavigationType();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 라우트 이동 시 모바일 메뉴 닫기
  useEffect(() => setMenuOpen(false), [pathname]);

  // 라우트 이동 시 스크롤 최상단으로 (뒤로가기 POP은 브라우저 위치 복원에 맡김)
  useEffect(() => {
    if (navigationType !== 'POP') window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  return (
    <Wrapper>
      <header className='gnb'>
        <Link
          to='/'
          className='gnb-logo'
        >
          <img
            src='/home/brand/logo-wordmark.svg'
            alt='골드럭와인 GOLDLUCKWINE 와인수입사'
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

        <div
          className='gnb-mobile'
          ref={menuRef}
        >
          <button
            className='gnb-mobile-button'
            aria-label='메뉴 열기'
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <HiMenu />
          </button>
          {menuOpen && (
            <div className='gnb-mobile-menu'>
              {NAV_ITEMS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={isActive(pathname, to) ? 'active' : ''}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className='content'>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
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
    position: relative;
  }

  .gnb-mobile-button {
    display: flex;
    align-items: center;
    border: none;
    background: none;
    font-size: 22px;
    color: ${home.ink};
    cursor: pointer;
    padding: 8px;
  }

  .gnb-mobile-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    z-index: 200;
    display: flex;
    flex-direction: column;
    min-width: 160px;
    padding: 8px 0;
    background: #ffffff;
    border: 1px solid ${home.dark};
    box-shadow: 0 8px 24px rgba(38, 35, 34, 0.12);

    a {
      padding: 10px 20px;
      color: ${home.gray};
      text-decoration: none;
      font-family: ${font.en};
      font-size: 15px;
      letter-spacing: 0.02em;

      &:hover {
        background: ${home.cream};
        color: ${home.ink};
      }

      &.active {
        color: ${home.ink};
        font-weight: 700;
      }
    }
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
