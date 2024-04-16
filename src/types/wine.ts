import { ReactNode } from 'react';

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
  wineType: 'Petnat' | 'White' | 'Red' | 'Sweet' | 'Orange' | 'Rose';
  wineVariety: string[];
  wineDescription: string;
  wineImagePath: string;
}
