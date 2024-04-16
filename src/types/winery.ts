export interface WineryBase {
  id: number;
  name: string;
}
export interface Wine {
  id: number;
  name: string;
  description: string;
}

export interface Winery extends WineryBase {
  id: number;
  name: string;
  wines: Wine[];
}

export interface WineryInfoType {
  id: number;
  domaine: string;
  location: string;
  description: string;
  imagePath: string;
}
