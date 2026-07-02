import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { customedTheme } from '@/styles/theme';
import CloverIcon from '@/components/CloverIcon';

const { home, font } = customedTheme;

const GALLERY_IMAGES = [1, 2, 3, 4, 5].map(
  (n) => `/home/gallery/gallery-${n}.jpeg`,
);

/** 다크 갤러리 스트립 + 타원 마스크 CONTACT 링크 */
const GallerySection = () => {
  return (
    <Wrapper>
      <div className='gallery-strip'>
        {GALLERY_IMAGES.map((src, i) =>
          i === 2 ? (
            <Link
              key={src}
              to='/contact'
              className='gallery-item gallery-contact'
            >
              <img
                src={src}
                alt=''
                loading='lazy'
              />
              <span className='contact-badge'>
                <CloverIcon
                  color={home.greenSoft}
                  size={96}
                  stem
                />
                <span className='contact-label font-display'>CONTACT</span>
              </span>
            </Link>
          ) : (
            <div
              key={src}
              className='gallery-item'
            >
              <img
                src={src}
                alt=''
                loading='lazy'
              />
            </div>
          ),
        )}
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  background: ${home.dark};
  padding: 160px 0;
  overflow: hidden;

  .gallery-strip {
    display: flex;
    align-items: center;
    gap: 32px;
    width: 116%;
    margin-left: -8%;
  }

  .gallery-item {
    flex: 1;
    min-width: 0;
    position: relative;

    img {
      display: block;
      width: 100%;
      height: 500px;
      object-fit: cover;
    }
  }

  .gallery-contact img {
    border-radius: 50% / 42%;
  }

  .contact-badge {
    position: absolute;
    right: -34px;
    bottom: 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .contact-label {
    margin-top: -22px;
    color: #ffffff;
    font-size: 17px;
    letter-spacing: 0.08em;
    font-family: ${font.display};
  }

  @media (max-width: 1024px) {
    padding: 96px 0;

    .gallery-strip {
      overflow-x: auto;
      width: 100%;
      margin-left: 0;
      padding: 0 24px;
    }

    .gallery-item {
      flex: 0 0 280px;

      img {
        height: 380px;
      }
    }
  }
`;

export default GallerySection;
