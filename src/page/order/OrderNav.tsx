import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
import { supabase } from '@/lib/supabase';

const { home, font } = customedTheme;

const TABS = [
  { to: '/order', label: '발주하기', end: true },
  { to: '/order/history', label: '발주 내역', end: false },
  { to: '/order/account', label: '내 정보', end: false },
];

/** 로그인한 거래처의 /order 공통 탭 내비게이션 —
 *  어느 화면에서도 다른 화면으로 바로 이동할 수 있게 한다. */
const OrderNav = ({ email }: { email?: string }) => (
  <Wrapper>
    <nav className='tabs'>
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
    <div className='account'>
      {email && <span className='email'>{email}</span>}
      <button
        type='button'
        onClick={() => supabase.auth.signOut()}
      >
        로그아웃
      </button>
    </div>
  </Wrapper>
);

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 24px;
  border-bottom: 1px solid ${home.dark};

  .tabs {
    display: flex;
    gap: 4px;
  }

  .tab {
    padding: 10px 18px;
    border: 1px solid transparent;
    border-bottom: none;
    color: ${home.gray};
    font-family: ${font.en};
    font-size: 15px;
    letter-spacing: 0.02em;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: ${home.ink};
    }

    &.active {
      border-color: ${home.dark};
      background: #ffffff;
      color: ${home.brown};
      font-weight: 700;
      margin-bottom: -1px;
      padding-bottom: 11px;
    }
  }

  .account {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 8px;
    font-size: 13px;
    color: ${home.gray};

    .email {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    button {
      padding: 6px 14px;
      border: 1px solid ${home.brown};
      background: transparent;
      color: ${home.brown};
      font-size: 12.5px;
      cursor: pointer;

      &:hover {
        background: ${home.brown};
        color: ${home.cream};
      }
    }
  }

  @media (max-width: 640px) {
    .tabs {
      width: 100%;
    }

    .tab {
      flex: 1;
      padding: 10px 6px;
      text-align: center;
      font-size: 14px;
    }

    .account {
      width: 100%;
      justify-content: flex-end;
    }
  }
`;

export default OrderNav;
