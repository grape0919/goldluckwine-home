import { Link, Navigate } from 'react-router-dom';
import Seo from '@/components/Seo';
import OrderShell from '@/page/order/OrderShell';
import { useOrderAuth } from '@/page/order/useOrderAuth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/** /order — 발주 홈. 로그인·거래처 상태에 따라 분기한다.
 *  발주 품목 화면은 Phase 2(PR 2-B)에서 이 자리에 들어온다. */
const OrderPage = () => {
  const { session, partner, loading } = useOrderAuth();

  if (!isSupabaseConfigured) return null;
  if (loading) return <OrderShell />;

  // 미로그인 — 서비스 소개
  if (!session) {
    return (
      <OrderShell>
        <Seo
          title='ORDER 발주'
          noindex
        />
        <p className='order-eyebrow'>FOR BUSINESS</p>
        <h1>ORDER</h1>
        <p>
          골드럭와인 거래처 전용 온라인 발주 서비스입니다. 사업자 회원으로
          가입하고 관리자 승인을 받으면 공급가 확인과 발주가 가능합니다.
        </p>
        <p className='order-hint'>
          발주 → 계좌 입금 → 배송 순서로 진행되며, 배송 완료 후 전자세금계산서가
          발행됩니다. 최소 발주 수량이 있습니다.
        </p>
        <div className='order-links'>
          <Link to='/order/login'>로그인</Link>
          <Link to='/order/signup'>사업자 회원가입</Link>
        </div>
      </OrderShell>
    );
  }

  // 로그인했지만 사업자 정보 미등록 — 가입 2단계로
  if (!partner) return <Navigate to='/order/signup' replace />;

  if (partner.status === 'pending') {
    return (
      <OrderShell>
        <Seo
          title='승인 대기'
          noindex
        />
        <p className='order-eyebrow'>FOR BUSINESS</p>
        <h1>ORDER</h1>
        <div className='status-card'>
          <strong>{partner.business_name}</strong> 님의 가입 신청을 확인하고
          있습니다.
          <br />
          관리자 승인이 완료되면 이메일로 안내드리며, 승인 후 공급가 확인과
          발주가 가능합니다.
        </div>
        <div className='order-links'>
          <Link to='/order/account'>내 정보</Link>
          <button
            type='button'
            className='verify-button'
            onClick={() => supabase.auth.signOut()}
          >
            로그아웃
          </button>
        </div>
      </OrderShell>
    );
  }

  if (partner.status === 'rejected' || partner.status === 'suspended') {
    return (
      <OrderShell>
        <Seo
          title='발주 이용 안내'
          noindex
        />
        <p className='order-eyebrow'>FOR BUSINESS</p>
        <h1>ORDER</h1>
        <div className='status-card'>
          {partner.status === 'rejected' ? (
            <>가입 신청이 반려되었습니다.</>
          ) : (
            <>거래가 일시 중단된 상태입니다.</>
          )}
          {partner.status_reason && (
            <>
              <br />
              사유: {partner.status_reason}
            </>
          )}
          <br />
          문의: goldluckwine@gmail.com
        </div>
        <div className='order-links'>
          <button
            type='button'
            className='verify-button'
            onClick={() => supabase.auth.signOut()}
          >
            로그아웃
          </button>
        </div>
      </OrderShell>
    );
  }

  // 승인 완료 — Phase 2 에서 발주 품목 화면으로 교체된다
  return (
    <OrderShell>
      <Seo
        title='ORDER 발주'
        noindex
      />
      <p className='order-eyebrow'>FOR BUSINESS</p>
      <h1>ORDER</h1>
      <div className='status-card'>
        <strong>{partner.business_name}</strong> 님, 거래처 승인이
        완료되었습니다.
        <br />
        온라인 발주 기능을 준비하고 있습니다. 오픈 전까지는 기존 방식(전화·카톡)
        으로 발주해 주세요.
      </div>
      <div className='order-links'>
        <Link to='/order/account'>내 정보</Link>
        <button
          type='button'
          className='verify-button'
          onClick={() => supabase.auth.signOut()}
        >
          로그아웃
        </button>
      </div>
    </OrderShell>
  );
};

export default OrderPage;
