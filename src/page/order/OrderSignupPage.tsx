import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '@/components/Seo';
import OrderShell from '@/page/order/OrderShell';
import { useOrderAuth } from '@/page/order/useOrderAuth';
import { supabase } from '@/lib/supabase';
import {
  createMyPartner,
  uploadPartnerDoc,
  verifyBusinessNo,
} from '@/api/partners';
import type { BusinessVerification } from '@/api/partners';

/** 사업자 회원가입 — 1단계: 계정 생성, 2단계: 사업자 정보 + 동의.
 *  이메일 인증이 켜져 있으면 1단계 후 인증 안내를 보여주고,
 *  인증을 마치고 로그인하면 이 페이지가 2단계부터 이어진다. */
const OrderSignupPage = () => {
  const navigate = useNavigate();
  const { session, partner, loading, refresh } = useOrderAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [mailSent, setMailSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState<BusinessVerification | null>(
    null,
  );

  const handleAccount = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = String(data.get('password') ?? '');
    if (password !== String(data.get('password2') ?? '')) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setBusy(true);
    setError('');
    const { data: result, error: err } = await supabase.auth.signUp({
      email: String(data.get('email') ?? ''),
      password,
    });
    setBusy(false);
    if (err) {
      setError(
        err.message.includes('Signups not allowed')
          ? '현재 가입이 비활성화되어 있습니다. 관리자에게 문의해 주세요.'
          : `가입 실패: ${err.message}`,
      );
      return;
    }
    // 이메일 인증이 켜져 있으면 세션이 없다 — 인증 안내
    if (!result.session) setMailSent(true);
    await refresh();
  };

  const handleVerify = async (businessNo: string) => {
    setVerifying(true);
    setError('');
    try {
      setVerification(await verifyBusinessNo(businessNo));
    } catch (e) {
      setError((e as Error).message);
      setVerification(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError('');
    try {
      const files = (data.getAll('licenses') as File[]).filter(
        (f) => f && f.size > 0,
      );
      const paths: string[] = [];
      for (const file of files) paths.push(await uploadPartnerDoc(file));
      await createMyPartner(
        {
          business_no: String(data.get('business_no') ?? '').replace(/\D/g, ''),
          business_name: String(data.get('business_name') ?? '').trim(),
          ceo_name: String(data.get('ceo_name') ?? '').trim(),
          contact_name: String(data.get('contact_name') ?? '').trim(),
          phone: String(data.get('phone') ?? '').trim(),
          invoice_email: String(data.get('invoice_email') ?? '').trim(),
          address: String(data.get('address') ?? '').trim(),
        },
        paths,
        verification?.status ?? '',
      );
      navigate('/order', { replace: true });
    } catch (e) {
      setError(`신청 실패: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <OrderShell />;

  // 이미 사업자 정보까지 등록된 계정
  if (session && partner) {
    return (
      <OrderShell>
        <Seo
          title='사업자 회원가입'
          noindex
        />
        <p className='order-eyebrow'>FOR BUSINESS</p>
        <h1>SIGN UP</h1>
        <div className='status-card'>
          이미 가입이 완료된 계정입니다.{' '}
          <Link to='/order'>발주 페이지로 이동</Link>
        </div>
      </OrderShell>
    );
  }

  // 1단계 — 계정 생성
  if (!session) {
    return (
      <OrderShell>
        <Seo
          title='사업자 회원가입'
          noindex
        />
        <p className='order-eyebrow'>FOR BUSINESS · STEP 1/2</p>
        <h1>SIGN UP</h1>
        {mailSent ? (
          <div className='status-card'>
            인증 메일을 보냈습니다. 메일의 링크로 인증을 마친 뒤{' '}
            <Link to='/order/login'>로그인</Link>하면 사업자 정보 입력이
            이어집니다.
          </div>
        ) : (
          <>
            <p className='order-hint'>
              사업자만 가입할 수 있습니다. 계정을 만들고 다음 단계에서 사업자
              정보를 등록하면, 관리자 승인 후 발주를 시작할 수 있습니다.
            </p>
            <form
              className='order-form'
              onSubmit={handleAccount}
            >
              <label>
                이메일 (로그인 계정)
                <input
                  name='email'
                  type='email'
                  required
                  autoComplete='username'
                />
              </label>
              <div className='field-row'>
                <label>
                  비밀번호 (8자 이상)
                  <input
                    name='password'
                    type='password'
                    required
                    minLength={8}
                    autoComplete='new-password'
                  />
                </label>
                <label>
                  비밀번호 확인
                  <input
                    name='password2'
                    type='password'
                    required
                    minLength={8}
                    autoComplete='new-password'
                  />
                </label>
              </div>
              {error && <p className='order-error'>{error}</p>}
              <button
                type='submit'
                className='order-button'
                disabled={busy}
              >
                {busy ? '…' : 'NEXT'}
              </button>
            </form>
            <div className='order-links'>
              <Link to='/order/login'>이미 계정이 있어요 — 로그인</Link>
            </div>
          </>
        )}
      </OrderShell>
    );
  }

  // 2단계 — 사업자 정보 + 동의
  return (
    <OrderShell>
      <Seo
        title='사업자 정보 등록'
        noindex
      />
      <p className='order-eyebrow'>FOR BUSINESS · STEP 2/2</p>
      <h1>BUSINESS INFO</h1>
      <form
        className='order-form'
        onSubmit={handleProfile}
      >
        <label>
          사업자등록번호 (숫자 10자리)
          <span className='verify-line'>
            <input
              name='business_no'
              required
              inputMode='numeric'
              pattern='[\d-]{10,12}'
              placeholder='000-00-00000'
              onChange={() => setVerification(null)}
            />
            <button
              type='button'
              className='verify-button'
              disabled={verifying}
              onClick={(e) => {
                const input = (e.currentTarget.parentElement
                  ?.querySelector('input') ?? null) as HTMLInputElement | null;
                if (input) handleVerify(input.value);
              }}
            >
              {verifying ? '조회 중…' : '국세청 조회'}
            </button>
          </span>
        </label>
        {verification &&
          (verification.available ? (
            <p
              className={verification.registered ? 'verify-ok' : 'verify-bad'}
            >
              {verification.registered ? '✓' : '✕'} {verification.status}
              {verification.taxType ? ` · ${verification.taxType}` : ''}
            </p>
          ) : (
            <p className='order-hint'>
              국세청 자동 조회가 아직 설정되지 않았습니다 — 가입 후 관리자가
              직접 확인합니다.
            </p>
          ))}
        <div className='field-row'>
          <label>
            상호
            <input
              name='business_name'
              required
              autoComplete='organization'
            />
          </label>
          <label>
            대표자명
            <input
              name='ceo_name'
              required
            />
          </label>
        </div>
        <div className='field-row'>
          <label>
            담당자명
            <input
              name='contact_name'
              required
              autoComplete='name'
            />
          </label>
          <label>
            담당자 휴대폰
            <input
              name='phone'
              required
              type='tel'
              autoComplete='tel'
              placeholder='010-0000-0000'
            />
          </label>
        </div>
        <label>
          세금계산서 수신 이메일 (비우면 로그인 이메일)
          <input
            name='invoice_email'
            type='email'
          />
        </label>
        <label>
          배송지 주소
          <input
            name='address'
            required
            autoComplete='street-address'
          />
        </label>
        <label>
          사업자등록증·영업신고증 등 서류 (이미지, 선택 — 승인 심사에 활용)
          <input
            name='licenses'
            type='file'
            accept='image/*'
            multiple
          />
        </label>
        <div className='check-group'>
          <label>
            <input
              type='checkbox'
              required
            />
            <span>
              <Link
                to='/order/terms'
                target='_blank'
              >
                이용약관
              </Link>
              에 동의합니다. (필수)
            </span>
          </label>
          <label>
            <input
              type='checkbox'
              required
            />
            <span>
              <Link
                to='/order/privacy'
                target='_blank'
              >
                개인정보 수집·이용
              </Link>
              에 동의합니다. (필수)
            </span>
          </label>
          <label>
            <input
              type='checkbox'
              required
            />
            <span>
              본인은 만 19세 이상이며, 주류 취급 자격을 갖춘 사업자의 권한 있는
              담당자임을 확인합니다. (필수)
            </span>
          </label>
        </div>
        {error && <p className='order-error'>{error}</p>}
        <button
          type='submit'
          className='order-button'
          disabled={busy}
        >
          {busy ? '신청 중…' : 'SUBMIT'}
        </button>
      </form>
    </OrderShell>
  );
};

export default OrderSignupPage;
