import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { customedTheme, failImage } from '@/styles/theme';
import CloverIcon from '@/components/CloverIcon';
import type { WineInfoType } from '@/types/wine';

const { home, font, color } = customedTheme;

interface WineCardProps {
  wine: WineInfoType;
  wineryName?: string;
}

/** 홈 OUR COLLECTION·와인 리스트 공용 와인 카드 (Figma product 프레임).
 *  테두리는 카드가 아니라 그리드(부모)가 그린다. */
const WineCard = ({ wine, wineryName }: WineCardProps) => (
  <CardLink to={`/wines/${wine.wineId}`}>
    <div className='card-image'>
      <img
        src={wine.wineImagePath || failImage}
        alt={`${wine.wineNameEN} ${wine.wineNameKR}`}
        loading='lazy'
        onError={(e) => {
          // 무한 onError 루프 방지: 디폴트 이미지로는 한 번만 교체
          if (e.currentTarget.src !== failImage) {
            e.currentTarget.src = failImage;
          }
        }}
      />
    </div>
    <div className='card-caption'>
      <div className='card-names'>
        <span>{wine.wineNameEN}</span>
        <span>{wine.wineNameKR}</span>
      </div>
      <div className='card-meta'>
        <span>{wineryName ?? ''}</span>
        <span className='card-type'>
          <CloverIcon
            color={
              color.wine[wine.wineType as keyof typeof color.wine] ??
              home.greenSoft
            }
            size={15}
          />
          {wine.wineType}
        </span>
      </div>
    </div>
  </CardLink>
);

const CardLink = styled(Link)`
  display: flex;
  flex-direction: column;
  text-decoration: none;
  transition: background 0.25s;

  /* Figma product_hover: 퍼플 틴트 (캡션은 흰 배경이라 썸네일 영역만 물든다) */
  &:hover,
  &:focus-visible {
    background: ${home.purpleTint};
  }

  .card-image {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 560px;
    padding: 44px 0;
    box-sizing: border-box;

    img {
      max-height: 100%;
      max-width: 60%;
      object-fit: contain;
    }
  }

  .card-caption {
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    height: 96px;
    padding: 0 24px;
    background: #ffffff;
    border-top: 1px solid ${home.dark};
    font-family: ${font.en};
    font-size: 16px;
  }

  .card-names {
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: ${home.brown};

    span:last-child {
      font-family: ${font.kr};
      font-size: 15px;
    }
  }

  .card-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    color: ${home.gray};
  }

  .card-type {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  @media (max-width: 1024px) {
    .card-image {
      height: 380px;
      padding: 32px 0;
    }
  }
`;

export default WineCard;
