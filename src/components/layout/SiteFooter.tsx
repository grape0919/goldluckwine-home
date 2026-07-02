import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { customedTheme } from '@/styles/theme';

const { home, font } = customedTheme;

/** 홈 리디자인 공통 다크 푸터 (Figma 3525:2 footer) */
const SiteFooter = () => {
  return (
    <Wrapper>
      <div className='footer-brand'>
        <img
          src='/home/brand/logo-symbol-footer.svg'
          alt='Gold Luck Wine'
          height={88}
        />
        <p>
          May wine and peace be with you.
          <br />
          ©2026 goldluckwine. All rights reserved.
        </p>
      </div>

      <nav className='footer-columns'>
        <div className='footer-column'>
          <span className='footer-heading'>EXPLORE</span>
          <Link to='/importer'>about</Link>
          <Link to='/wineries'>wineries</Link>
          <Link to='/winelist'>wine list</Link>
        </div>
        <div className='footer-column'>
          <span className='footer-heading'>FOLLOW</span>
          <a
            href='https://www.instagram.com/goldluckwine/'
            target='_blank'
            rel='noreferrer'
          >
            @goldluckwine
          </a>
        </div>
        <div className='footer-column'>
          <span className='footer-heading'>CONTACT</span>
          <a href='mailto:goldluckwine@gmail.com'>goldluckwine@gmail.com</a>
        </div>
      </nav>
    </Wrapper>
  );
};

const Wrapper = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3rem;
  padding: 44px 80px 52px;
  background: ${home.dark};
  font-family: ${font.en};
  font-size: 14px;

  .footer-brand p {
    margin: 20px 0 0;
    color: ${home.grayLight};
    line-height: 1.5;
  }

  .footer-columns {
    display: flex;
    gap: 96px;
    padding-top: 40px;
  }

  .footer-column {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 130px;
  }

  .footer-heading {
    color: ${home.gray};
    letter-spacing: 0.04em;
    margin-bottom: 6px;
  }

  .footer-column a {
    color: ${home.grayLight};
    text-decoration: none;

    &:hover {
      color: ${home.cream};
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 40px 24px;

    .footer-columns {
      flex-wrap: wrap;
      gap: 40px;
      padding-top: 0;
    }
  }
`;

export default SiteFooter;
