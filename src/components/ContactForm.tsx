import { useState } from 'react';
import type { FormEvent } from 'react';
import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';
import { isSupabaseConfigured } from '@/lib/supabase';
import { submitInquiry } from '@/api/inquiries';
import { trackEvent } from '@/lib/analytics';

const { home, font } = customedTheme;

/** /contact 문의 폼 — Supabase inquiries 테이블로 저장, 관리자 '문의' 탭에서 확인.
 *  antd 는 관리자 번들 전용이라 여기서는 쓰지 않는다. */
const ContactForm = () => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (!isSupabaseConfigured) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    // 허니팟 — 봇이 채우는 숨김 필드가 차 있으면 조용히 무시
    if (data.get('website')) {
      setSent(true);
      return;
    }
    setSending(true);
    setError('');
    try {
      await submitInquiry({
        name: String(data.get('name') ?? '').trim(),
        company: String(data.get('company') ?? '').trim(),
        contact: String(data.get('contact') ?? '').trim(),
        message: String(data.get('message') ?? '').trim(),
      });
      trackEvent('generate_lead', { method: 'contact_form' });
      setSent(true);
    } catch {
      setError(
        '전송에 실패했습니다. 잠시 후 다시 시도하거나 이메일로 문의해 주세요.',
      );
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Wrapper>
        <p
          className='form-done'
          role='status'
        >
          문의가 접수되었습니다. 확인 후 연락드리겠습니다.
        </p>
      </Wrapper>
    );
  }

  return (
    <Wrapper onSubmit={handleSubmit}>
      <div className='form-grid'>
        <label>
          이름 *
          <input
            name='name'
            required
            maxLength={50}
            autoComplete='name'
          />
        </label>
        <label>
          업장/회사명
          <input
            name='company'
            maxLength={100}
            autoComplete='organization'
          />
        </label>
        <label>
          이메일 또는 전화번호 *
          <input
            name='contact'
            required
            maxLength={100}
          />
        </label>
      </div>
      <label>
        문의 내용 *
        <textarea
          name='message'
          required
          rows={5}
          maxLength={2000}
          placeholder='취급 문의, 입점, 제휴 등 무엇이든 남겨주세요.'
        />
      </label>
      {/* 허니팟 — 사람에게는 보이지 않는다 */}
      <input
        type='text'
        name='website'
        tabIndex={-1}
        autoComplete='off'
        aria-hidden
        className='hp'
      />
      {error && <p className='form-error'>{error}</p>}
      <button
        type='submit'
        disabled={sending}
      >
        {sending ? 'SENDING…' : 'SEND'}
      </button>
    </Wrapper>
  );
};

const Wrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 720px;
  margin: 64px auto 0;
  padding: 0 24px;
  width: 100%;
  box-sizing: border-box;

  .form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: ${home.brown};
    font-family: ${font.kr};
    font-size: 14px;
  }

  input,
  textarea {
    padding: 10px 2px;
    border: none;
    border-bottom: 1px solid ${home.brown};
    background: transparent;
    color: ${home.ink};
    font-family: ${font.kr};
    font-size: 15px;
    border-radius: 0;

    &:focus {
      outline: none;
      border-bottom-color: ${home.purple};
    }
  }

  textarea {
    resize: vertical;
  }

  .hp {
    position: absolute;
    left: -9999px;
    height: 0;
    width: 0;
    border: none;
  }

  button {
    align-self: flex-start;
    padding: 12px 48px;
    border: 1px solid ${home.brown};
    background: transparent;
    color: ${home.brown};
    font-family: ${font.en};
    font-size: 15px;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition:
      background 0.2s,
      color 0.2s;

    &:hover:not(:disabled) {
      background: ${home.brown};
      color: ${home.cream};
    }

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }

  .form-error {
    margin: 0;
    color: #b0342a;
    font-family: ${font.kr};
    font-size: 14px;
  }

  .form-done {
    margin: 0;
    color: ${home.brown};
    font-family: ${font.kr};
    font-size: 16px;
    text-align: center;
  }

  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default ContactForm;
