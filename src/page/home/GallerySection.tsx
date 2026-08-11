import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { customedTheme } from '@/styles/theme';
import type { HomeContent } from '@/api/homeContent';

const { home } = customedTheme;

/** 다크 갤러리 스트립 + 타원 마스크 CONTACT 링크 */
const GallerySection = ({ content }: { content: HomeContent }) => {
  const galleryImages = [
    content.gallery_1,
    content.gallery_2,
    content.gallery_3,
    content.gallery_4,
    content.gallery_5,
  ];
  return (
    <Wrapper>
      <div className='gallery-strip'>
        {galleryImages.map((src, i) =>
          i === 2 ? (
            <Link
              key={`${i}-${src}`}
              to='/contact'
              className='gallery-item gallery-contact'
            >
              <img
                src={src}
                alt=''
                loading='lazy'
              />
              <img
                className='contact-badge'
                src='/home/clover/contact-clover.png'
                alt='CONTACT'
              />
            </Link>
          ) : (
            <div
              key={`${i}-${src}`}
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

  /* .gallery-item img 규칙(100%/500px/cover/라운드)을 배지에는 무효화 */
  .gallery-contact img.contact-badge {
    position: absolute;
    right: -34px;
    bottom: 28px;
    width: 160px;
    height: auto;
    object-fit: contain;
    border-radius: 0;
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
