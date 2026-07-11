import React from 'react';
import styled from 'styled-components';
import { FaInstagram, FaRegEnvelope } from 'react-icons/fa6';
import { customedTheme } from '@/styles/theme';
import Seo from '@/components/Seo';

const { home, font } = customedTheme;

/** 컨택트 (Figma 3525:16297) — 스플릿 타이틀(CONTACT/US, 브라운 악센트) +
 *  이메일·브랜드·인스타그램 한 줄, 하단 파스텔 일러스트가 푸터에 밀착 */
const ContactFooter: React.FC = () => (
  <Wrapper>
    <Seo
      title='CONTACT US 문의'
      description='골드럭와인 문의 — 이메일 goldluckwine@gmail.com, 인스타그램 @goldluckwine'
      path='/contact'
    />
    <header className='contact-header'>
      <h1 aria-label='CONTACT US'>
        <span
          className='t-contact'
          aria-hidden
        >
          CONTACT
        </span>
        <span
          className='t-us'
          aria-hidden
        >
          US
        </span>
      </h1>
    </header>

    <div className='info-row'>
      <a
        className='info-item'
        href='mailto:goldluckwine@gmail.com'
      >
        <FaRegEnvelope aria-hidden />
        goldluckwine@gmail.com
      </a>
      <span className='info-item info-brand'>Gold Luck Wine</span>
      <a
        className='info-item'
        href='https://www.instagram.com/goldluckwine'
        target='_blank'
        rel='noreferrer'
      >
        <FaInstagram aria-hidden />
        @goldluckwine
      </a>
    </div>

    <img
      className='illustration'
      src='/home/contact/contact-illustration.png'
      alt=''
      aria-hidden
    />
  </Wrapper>
);

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* 일러스트가 푸터에 밀착하도록 뷰포트 높이를 채운다 (GNB 80px 제외) */
  min-height: calc(100vh - 80px);
  background: ${home.cream};
  overflow: hidden;

  .contact-header {
    position: relative;
    height: 251px;
  }

  .contact-header h1 {
    margin: 0;
    font-weight: 400;
  }

  /* 에디토리얼 스플릿 타이틀: CONTACT 좌측 여백, US는 59.4% 지점 (Figma x=80/855) */
  .t-contact,
  .t-us {
    position: absolute;
    top: 200px;
    color: ${home.brown};
    font-family: ${font.en};
    font-size: 24px;
    line-height: 29px;
    letter-spacing: 0.02em;
  }

  .t-contact {
    left: 80px;
  }

  .t-us {
    left: 59.4%;
  }

  /* 좌 이메일 / 중앙 브랜드 / 우 인스타그램 (Figma y=331) */
  .info-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 0 80px;
  }

  .info-item {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    color: ${home.brown};
    font-family: ${font.en};
    font-size: 18px;
    line-height: 22px;
    text-decoration: none;

    svg {
      font-size: 20px;
    }
  }

  a.info-item {
    transition: color 0.2s;

    &:hover {
      color: ${home.purple};
    }
  }

  .info-row a:last-child {
    justify-self: end;
  }

  .illustration {
    display: block;
    width: 100%;
    margin-top: auto;
    padding-top: 78px;
    pointer-events: none;
  }

  @media (max-width: 1024px) {
    min-height: calc(100vh - 80px);

    .contact-header {
      height: 191px;
    }

    .t-contact,
    .t-us {
      top: 140px;
    }

    .t-contact {
      left: 24px;
    }

    .info-row {
      padding: 0 24px;
    }
  }

  @media (max-width: 768px) {
    min-height: calc(100vh - 64px);

    .contact-header {
      height: 155px;
    }

    .t-contact,
    .t-us {
      top: 104px;
    }

    .info-row {
      grid-template-columns: 1fr;
      justify-items: start;
      gap: 16px;
    }

    .info-brand,
    .info-row a:last-child {
      justify-self: start;
    }

    .illustration {
      padding-top: 48px;
    }
  }
`;

export default ContactFooter;
