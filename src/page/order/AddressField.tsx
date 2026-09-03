import { useRef, useState } from 'react';
import { openPostcode } from '@/utils/postcode';

interface AddressFieldProps {
  label?: string;
  name?: string;
  required?: boolean;
  defaultValue?: string;
}

/** 배송지 주소 입력 — 카카오 우편번호 검색 + 상세주소 이어쓰기.
 *  가입·내 정보·체크아웃 공용 (OrderShell 의 .verify-line/.verify-button 스타일 재사용).
 *  비제어 입력이라 기존 FormData 제출 코드를 그대로 쓴다. */
const AddressField = ({
  label = '배송지 주소',
  name = 'address',
  required,
  defaultValue,
}: AddressFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const search = async () => {
    setError('');
    try {
      const result = await openPostcode();
      if (result && inputRef.current) {
        inputRef.current.value = `${result.address} `;
        inputRef.current.focus();
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

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
