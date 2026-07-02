import { createClient } from '@supabase/supabase-js';
import { WineTypes } from '@/enum/wine';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // 개발 중 .env 누락 시 빠르게 인지할 수 있도록 경고만 남깁니다.
  // (값이 없으면 supabase 호출은 실패하고, 화면은 더미 데이터로 폴백하도록 구성합니다)
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 설정되지 않았습니다. .env.example 을 참고하세요.',
  );
}

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(url ?? '', anonKey ?? '');

/** DB 테이블 행 타입 (supabase/schema.sql 과 일치) */
export interface WineryRow {
  id: number;
  domaine: string;
  domaine_kr: string;
  location: string;
  description: string;
  image_path: string;
  sort_order: number;
}

export interface WineRow {
  id: number;
  winery_id: number;
  name_en: string;
  name_kr: string;
  wine_type: WineTypes;
  variety: string[];
  description: string;
  image_path: string;
  is_featured: boolean;
  sort_order: number;
}
