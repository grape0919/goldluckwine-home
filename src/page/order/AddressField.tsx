import { useRef, useState } from 'react';
import { openPostcode } from '@/utils/postcode';

interface AddressFieldProps {
  label?: string;
  name?: string;
  required?: boolean;
  defaultValue?: string;
  /** true 면 기본주소는 주소 검색으로만 입력(직접 타이핑 불가)하고
   *  상세주소를 별도 칸으로 받는다. 제출 코드는 `${name}_base` 와
   *  `${name}_detail` 두 값을 합쳐 저장해야 한다. (회원가입용) */
  requireSearch?: boolean;
}

/** 배송지 주소 입력 — 카카오 우편번호 검색 + 상세주소.
 *  가입·내 정보·체크아웃 공용 (OrderShell 의 .verify-line/.verify-button 스타일 재사용).
 *  비제어 입력이라 기존 FormData 제출 코드를 그대로 쓴다. */
const AddressField = ({
  label = '배송지 주소',
  name = 'address',
  required,
  defaultValue,
  requireSearch = false,
}: AddressFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const search = async () => {
    setError('');
    try {
      const result = await openPostcode();
      if (result && inputRef.current) {
        if (requireSearch) {
          inputRef.current.value = result.address;
          detailRef.current?.focus();
        } else {
          inputRef.current.value = `${result.address} `;
          inputRef.current.focus();
        }
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (requireSearch) {
    return (
      <>
        <label>
          {label}
          <div className='verify-line'>
            <input
              ref={inputRef}
              name={`${name}_base`}
              readOnly
              required={required}
              defaultValue={defaultValue}
              placeholder='[주소 검색]을 눌러 입력하세요'
              // readOnly 입력은 브라우저 required 검증에서 제외된다 —
              // 제출 코드에서 빈 값을 막아야 한다
              onClick={search}
              style={{ cursor: 'pointer' }}
            />
            <button
              type='button'
              className='verify-button'
              onClick={search}
            >
              주소 검색
            </button>
          </div>
          {error && <span className='order-error'>{error}</span>}
        </label>
        <label>
          상세주소
          <input
            ref={detailRef}
            name={`${name}_detail`}
            autoComplete='address-line2'
            placeholder='동·호수·층 등 (없으면 비워두세요)'
          />
        </label>
      </>
    );
  }

  return (
    <label>
      {label}
      <div className='verify-line'>
        <input
          ref={inputRef}
          name={name}
          required={required}
          defaultValue={defaultValue}
          autoComplete='street-address'
          placeholder='주소 검색 후 상세주소를 이어서 입력하세요'
        />
        <button
          type='button'
          className='verify-button'
          onClick={search}
        >
          주소 검색
        </button>
      </div>
      {error && <span className='order-error'>{error}</span>}
    </label>
  );
};

export default AddressField;
