import styled from 'styled-components';
import { customedTheme } from '@/styles/theme';

const { home, font } = customedTheme;

/** /order 영역 공용 레이아웃 — 공개 사이트의 크림·브라운 톤을 잇는다.
 *  폼 스타일(밑줄 입력)은 ContactForm 과 동일한 문법. */
const OrderShell = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 56px 24px 160px;
  min-height: calc(100vh - 80px - 200px);
  color: ${home.ink};
  font-family: ${font.kr};

  .order-eyebrow {
    margin: 0 0 6px;
    color: ${home.brown};
    font-family: ${font.en};
    font-style: italic;
    font-size: 15px;
    letter-spacing: 0.08em;
  }

  h1 {
    margin: 0 0 28px;
    color: ${home.brown};
    font-family: ${font.display};
    font-size: 34px;
    font-weight: 400;
    letter-spacing: 0.02em;
  }

  h2 {
    margin: 36px 0 12px;
    color: ${home.brown};
    font-size: 18px;
  }

  p {
    line-height: 1.7;
  }

  .order-form {
    display: flex;
    flex-direction: column;
    gap: 22px;
    margin-top: 8px;
  }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: ${home.brown};
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

  .check-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px 18px;
    border: 1px solid ${home.brown};
    font-size: 14px;

    label {
      flex-direction: row;
      align-items: flex-start;
      gap: 10px;
      color: ${home.ink};
    }

    input[type='checkbox'] {
      margin-top: 3px;
      accent-color: ${home.purple};
    }

    a {
      color: ${home.purple};
    }
  }

  .order-button {
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

  .order-error {
    margin: 0;
    color: #b0342a;
    font-size: 14px;
  }

  .order-hint {
    color: ${home.gray};
    font-size: 13.5px;
  }

  .order-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 24px;
    /* 로그아웃 버튼 등 높은 요소가 다음 요소(배너)와 겹치지 않게 아래 여백 확보 */
    margin: 20px 0 20px;
    font-size: 14px;

    a {
      color: ${home.purple};
    }
  }

  .status-card {
    border: 1px solid ${home.brown};
    padding: 28px;
    line-height: 1.8;

    strong {
      color: ${home.brown};
    }
  }

  .verify-line {
    display: flex;
    align-items: center;
    gap: 10px;

    input {
      flex: 1;
    }
  }

  .verify-button {
    padding: 8px 18px;
    border: 1px solid ${home.brown};
    background: transparent;
    color: ${home.brown};
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }

  .verify-ok {
    color: ${home.green};
    font-size: 13.5px;
  }

  .verify-bad {
    color: #b0342a;
    font-size: 13.5px;
  }

  @media (max-width: 640px) {
    .field-row {
      grid-template-columns: 1fr;
    }
  }
`;

export default OrderShell;
