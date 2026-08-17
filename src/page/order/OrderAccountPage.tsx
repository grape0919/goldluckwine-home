import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import Seo from '@/components/Seo';
import OrderShell from '@/page/order/OrderShell';
import { useOrderAuth } from '@/page/order/useOrderAuth';
import { supabase } from '@/lib/supabase';
import { updateMyPartner } from '@/api/partners';

/** 마이페이지 — 사업자 정보 수정 + 비밀번호 변경 (재설정 링크 착지점 겸용) */
const OrderAccountPage = () => {
  const { session, partner, loading, refresh } = useOrderAuth();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const handleProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await updateMyPartner({
        business_name: String(data.get('business_name') ?? '').trim(),
        ceo_name: String(data.get('ceo_name') ?? '').trim(),
        contact_name: String(data.get('contact_name') ?? '').trim(),
        phone: String(data.get('phone') ?? '').trim(),
        invoice_email: String(data.get('invoice_email') ?? '').trim(),
        address: String(data.get('address') ?? '').trim(),
      });
      await refresh();
      setNotice('저장했습니다.');
    } catch (err) {
      setError(`저장 실패: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const handlePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const password = String(data.get('new_password') ?? '');
    if (password !== String(data.get('new_password2') ?? '')) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(`변경 실패: ${err.message}`);
      return;
    }
    form.reset();
    setNotice('비밀번호를 변경했습니다.');
  };

  if (loading) return <OrderShell />;
  if (!session) return <Navigate to='/order/login' replace />;

  return (
    <OrderShell>
      <Seo
        title='내 정보'
        noindex
      />
      <p className='order-eyebrow'>FOR BUSINESS</p>
      <h1>ACCOUNT</h1>

      {partner ? (
        <form
          className='order-form'
          onSubmit={handleProfile}
        >
          <p className='order-hint'>
            사업자등록번호({partner.business_no})는 변경할 수 없습니다. 변경이
            필요하면 문의해 주세요.
          </p>
          <div className='field-row'>
            <label>
              상호
              <input
                name='business_name'
                required
                defaultValue={partner.business_name}
              />
            </label>
            <label>
              대표자명
              <input
                name='ceo_name'
                required
                defaultValue={partner.ceo_name}
              />
            </label>
          </div>
          <div className='field-row'>
            <label>
              담당자명
              <input
                name='contact_name'
                required
                defaultValue={partner.contact_name}
              />
            </label>
            <label>
              담당자 휴대폰
              <input
                name='phone'
                required
                type='tel'
                defaultValue={partner.phone}
              />
            </label>
          </div>
          <label>
            세금계산서 수신 이메일
            <input
              name='invoice_email'
              type='email'
              defaultValue={partner.invoice_email}
            />
          </label>
          <label>
            배송지 주소
            <input
              name='address'
              required
              defaultValue={partner.address}
            />
          </label>
          <button
            type='submit'
            className='order-button'
            disabled={busy}
          >
            SAVE
          </button>
        </form>
      ) : (
        <p className='order-hint'>
          사업자 정보가 아직 등록되지 않았습니다. 가입을 마저 진행해 주세요.
        </p>
      )}

      <h2>비밀번호 변경</h2>
      <form
        className='order-form'
        onSubmit={handlePassword}
      >
        <div className='field-row'>
          <label>
            새 비밀번호 (8자 이상)
            <input
              name='new_password'
              type='password'
              required
              minLength={8}
              autoComplete='new-password'
            />
          </label>
          <label>
            새 비밀번호 확인
            <input
              name='new_password2'
              type='password'
              required
              minLength={8}
              autoComplete='new-password'
            />
          </label>
        </div>
        {error && <p className='order-error'>{error}</p>}
        {notice && <p className='verify-ok'>{notice}</p>}
        <button
          type='submit'
          className='order-button'
          disabled={busy}
        >
          CHANGE
        </button>
      </form>
    </OrderShell>
  );
};

export default OrderAccountPage;
