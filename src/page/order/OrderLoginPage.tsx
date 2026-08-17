import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '@/components/Seo';
import OrderShell from '@/page/order/OrderShell';
import { supabase } from '@/lib/supabase';

const OrderLoginPage = () => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    });
    setBusy(false);
    if (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : `로그인 실패: ${err.message}`,
      );
      return;
    }
    navigate('/order', { replace: true });
  };

  return (
    <OrderShell>
      <Seo
        title='거래처 로그인'
        noindex
      />
      <p className='order-eyebrow'>FOR BUSINESS</p>
      <h1>LOGIN</h1>
      <form
        className='order-form'
        onSubmit={handleSubmit}
      >
        <label>
          이메일
          <input
            name='email'
            type='email'
            required
            autoComplete='username'
          />
        </label>
        <label>
          비밀번호
          <input
            name='password'
            type='password'
            required
            autoComplete='current-password'
          />
        </label>
        {error && <p className='order-error'>{error}</p>}
        <button
          type='submit'
          className='order-button'
          disabled={busy}
        >
          {busy ? '…' : 'LOGIN'}
        </button>
      </form>
      <div className='order-links'>
        <Link to='/order/signup'>사업자 회원가입</Link>
        <Link to='/order/reset'>비밀번호 재설정</Link>
      </div>
    </OrderShell>
  );
};

export default OrderLoginPage;
