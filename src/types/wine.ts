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
}
