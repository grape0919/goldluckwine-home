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
}
