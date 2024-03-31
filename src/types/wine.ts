import { ReactNode } from 'react';

export interface WineType {
  id: number;
  name: string;
  image: ReactNode;
  description: string;
}
