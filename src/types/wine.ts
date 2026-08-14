import { ReactNode } from 'react';
import { WineTypes } from '@/enum/wine';

export interface WineType {
  id: number;
  name: string;
  image: ReactNode;
  description: string;
}

export interface WineInfoType {
  wineryId: number;
  wineId: number;
  wineNameEN: string;
  wineNameKR: string;
  wineType: WineTypes;
  wineVariety: string[];
  wineDescription: string;
  wineImagePath: string;
  /** 솔드아웃 여부 — 더미 데이터 등 미지정 시 판매 중으로 취급 */
  soldOut?: boolean;
  /** 상품 스펙 — 모두 선택 입력, 없으면 상세 스펙표에서 해당 행 숨김 */
  vintage?: string;
  volumeMl?: number;
  abv?: number;
  servingTemp?: string;
  foodPairing?: string;
}
