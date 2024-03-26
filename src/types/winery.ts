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
