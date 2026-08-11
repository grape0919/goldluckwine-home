import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/** 홈 화면 문구·이미지 — key-value.
 *  DB(home_content)에 값이 없거나 빈 문자열이면 아래 기본값으로 폴백한다.
 *  문구의 줄바꿈은 '\n'으로 저장하고 렌더링 시 <br/>로 변환한다. */
export const HOME_CONTENT_DEFAULTS = {
  hero_tagline:
    'GOLDLUCKWINE is a natural wine\nimporter introducing wines from\nsmall growers — the hidden jewels of France.',
  hero_bg: '/home/hero/hero-bg-1.webp',
  intro_heading:
    '골드럭와인은 프랑스의 보석 같은 소규모 농부들의 와인을 소개하는\n내추럴 와인 전문 수입사입니다.',
  intro_body:
    '루아르 지역의 대표 화이트 품종인 슈냉 블랑의 다채로운 퍼포먼스를 보여주는 와인들을 위주로,\n특히 ‘깨끗함’과 ‘우아함’의 강점을 가진 와인들을 선보입니다. 골드럭와인은 포도 본연의 순수함과\n떼루아를 존중하며 최소한의 개입으로 양조하는, 진솔한 와인메이커들과 함께합니다.',
  strip_1: '/home/strip/strip-01.webp',
  strip_2: '/home/strip/strip-02.webp',
  strip_3: '/home/strip/strip-03.webp',
  strip_4: '/home/strip/strip-04.webp',
  strip_5: '/home/strip/strip-05.webp',
  strip_6: '/home/strip/strip-06.webp',
  feature_title: 'German\nWine,\nNaturally',
  feature_body:
    '독일 최남서단, 스위스 국경과 맞닿은 언덕의 포도밭.\n여섯 세대를 이어온 슈나이더 가문이 건강한 밭과 적은 수확량으로 빚어내는 정직한 와인을 만나보세요.',
  feature_photo: '/home/germany/germany-wine.webp',
  gallery_1: '/home/gallery/gallery-1.webp',
  gallery_2: '/home/gallery/gallery-2.webp',
  gallery_3: '/home/gallery/gallery-3.webp',
  gallery_4: '/home/gallery/gallery-4.webp',
  gallery_5: '/home/gallery/gallery-5.webp',
} as const;

export type HomeContentKey = keyof typeof HOME_CONTENT_DEFAULTS;
export type HomeContent = Record<HomeContentKey, string>;

interface HomeContentRow {
  key: string;
  value: string;
}

/** 홈이 실제로 표시할 값 — 기본값 위에 DB 값을 덮어쓴다(빈 값 무시).
 *  Supabase 미설정·조회 실패 시에도 기본값으로 항상 렌더링 가능하다. */
export async function fetchHomeContent(): Promise<HomeContent> {
  const content: HomeContent = { ...HOME_CONTENT_DEFAULTS };
  if (!isSupabaseConfigured) return content;
  const { data, error } = await supabase.from('home_content').select('*');
  if (error) {
    // 테이블 미생성(마이그레이션 전)도 여기로 온다 — 기본값으로 폴백
    console.error('[fetchHomeContent]', error.message);
    return content;
  }
  for (const row of (data as HomeContentRow[]) ?? []) {
    if (row.key in content && row.value.trim()) {
      content[row.key as HomeContentKey] = row.value;
    }
  }
  return content;
}

/** 관리자 저장 — 변경된 키만 upsert */
export async function upsertHomeContent(
  entries: Partial<Record<HomeContentKey, string>>,
): Promise<void> {
  const rows = Object.entries(entries).map(([key, value]) => ({ key, value }));
  if (rows.length === 0) return;
  const { error } = await supabase.from('home_content').upsert(rows);
  if (error) throw error;
}
