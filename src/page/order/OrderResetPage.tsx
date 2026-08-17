import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';
import OrderShell from '@/page/order/OrderShell';
import { supabase } from '@/lib/supabase';

/** 비밀번호 재설정 요청 — 메일의 링크로 로그인되며 /order/account 에서 새 비밀번호를 설정한다 */
const OrderResetPage = () => {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email') ?? '');
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/order/account`,
    });
    setBusy(false);
    if (err) {
      setError(`요청 실패: ${err.message}`);
      return;
    }
    setSent(true);
  };

  return (
    <OrderShell>
      <Seo
        title='비밀번호 재설정'
        noindex
      />
      <p className='order-eyebrow'>FOR BUSINESS</p>
      <h1>RESET PASSWORD</h1>
      {sent ? (
        <div className='status-card'>
          재설정 메일을 보냈습니다. 메일의 링크를 열면 로그인되며, 내 정보
          화면에서 새 비밀번호를 설정할 수 있습니다.
        </div>
      ) : (
        <form
          className='order-form'
          onSubmit={handleSubmit}
        >
          <label>
            가입한 이메일
            <input
              name='email'
              type='email'
              required
              autoComplete='username'
            />
          </label>
          {error && <p className='order-error'>{error}</p>}
          <button
            type='submit'
            className='order-button'
            disabled={busy}
          >
            {busy ? '…' : 'SEND'}
          </button>
        </form>
      )}
      <div className='order-links'>
        <Link to='/order/login'>로그인으로 돌아가기</Link>
      </div>
    </OrderShell>
  );
};

export default OrderResetPage;
