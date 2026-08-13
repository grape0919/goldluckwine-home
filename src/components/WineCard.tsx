import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { customedTheme } from '@/styles/theme';
import CloverIcon from '@/components/CloverIcon';
import { trackEvent } from '@/lib/analytics';
import type { WineInfoType } from '@/types/wine';

const { home, font, color } = customedTheme;

/** 이미지 로딩 실패 시 대체 이미지 (와인 상세 페이지와 동일) */
const DEFAULT_WINE_IMAGE = '/wines/default.png';

interface WineCardProps {
  wine: WineInfoType;
  wineryName?: string;
}

/** 홈 OUR COLLECTION·와인 리스트 공용 와인 카드 (Figma product 프레임).
 *  테두리는 카드가 아니라 그리드(부모)가 그린다. */
const WineCard = ({ wine, wineryName }: WineCardProps) => (
  <CardLink
    to={`/wines/${wine.wineId}`}
    $soldOut={wine.soldOut}
    onClick={() =>
      trackEvent('select_item', {
        item_id: String(wine.wineId),
        item_name: wine.wineNameEN,
        item_category: wine.wineType,
      })
    }
  >
    <div className='card-image'>
      {wine.soldOut && <span className='sold-out-badge'>SOLD OUT</span>}
      <img
        src={wine.wineImagePath || DEFAULT_WINE_IMAGE}
        alt={`${wine.wineNameEN} ${wine.wineNameKR}`}
        loading='lazy'
        onError={(e) => {
          // 무한 onError 루프 방지: 디폴트 이미지로는 한 번만 교체
          if (!e.currentTarget.src.endsWith(DEFAULT_WINE_IMAGE)) {
            e.currentTarget.src = DEFAULT_WINE_IMAGE;
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

const CardLink = styled(Link)<{ $soldOut?: boolean }>`
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
    position: relative;
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
      transition: transform 0.5s ease;
      opacity: ${({ $soldOut }) => ($soldOut ? 0.45 : 1)};
      filter: ${({ $soldOut }) => ($soldOut ? 'grayscale(60%)' : 'none')};
    }
  }

  &:hover .card-image img,
  &:focus-visible .card-image img {
    transform: scale(1.04);
  }

  .sold-out-badge {
    position: absolute;
    top: 24px;
    left: 24px;
    padding: 6px 14px;
    border: 1px solid ${home.dark};
    background: ${home.cream};
    color: ${home.ink};
    font-family: ${font.en};
    font-style: italic;
    font-size: 13px;
    letter-spacing: 0.08em;
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
