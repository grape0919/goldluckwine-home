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

// env 미설정(로컬/CI 빌드 등) 시 supabase-js 2.110+ 는 빈 URL에 throw 하므로
// placeholder 로 생성한다. isSupabaseConfigured 가 false 라 실제 호출은 일어나지 않는다.
export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key');

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
  /** 공개 사이트 노출 여부 — 마이그레이션 전 행에는 없을 수 있어 optional */
  is_visible?: boolean;
  /** 솔드아웃 표시 — 마이그레이션 전 행에는 없을 수 있어 optional */
  sold_out?: boolean;
  sort_order: number;
  /** 상품 스펙 — 마이그레이션 전 행에는 없을 수 있어 optional, 모두 선택 입력 */
  vintage?: string;
  volume_ml?: number | null;
  abv?: number | null;
  serving_temp?: string;
  food_pairing?: string;
}
