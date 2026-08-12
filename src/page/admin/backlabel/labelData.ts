import type { WineRow } from '@/lib/supabase';

/** 백라벨(70x35mm) 표시사항 — back_labels.data(jsonb) 와 1:1 */
export interface BackLabelData {
  /** 번호 매긴 법정 표시 항목. 예: "1.제품유형: 과실주" */
  items: string[];
  /** 과음경고문구 (국세청 고시) */
  warning: string;
  /** 하단 신고 안내 문구 */
  report: string;
  /** 반전 강조 배지. 예: "이산화황 함유" */
  badges: string[];
  /** 분리배출 마크 가운데 재질명. 예: "유리" */
  recycle: string;
  /** 표시사항 본문 활자 크기(pt) */
  bodyPt: number;
  /** 과음경고문구 활자 크기(pt) */
  warnPt: number;
}

/** 5종 발주에 실제 사용한 라벨을 기본 템플릿으로 삼는다 — 제품명만 와인별로 다르다 */
export const DEFAULT_BACK_LABEL: BackLabelData = {
  items: [
    '1.제품유형: 과실주',
    '2.제품명: ',
    '3.원산지: 독일',
    '4.알콜분 및 용량: 현품에 별도표기, 750 mL',
    '5.원료명: 포도원액, 무수아황산(산화방지제)',
    '6.수입사: 골드럭 와인 TEL. 070-4571-8528 서울특별시 중구 동호로10길 8-5, 지하1층',
    '7.보관방법: 취급은 신중히 서늘한 응달에 보관',
    '8.제조번호: 현품에 별도표기',
    '9.제조사: WEINGUT - CLAUS SCHNEIDER',
    '10.반품 또는 교환: 수입사 또는 구입처',
  ],
  warning:
    '지나친 음주는 뇌졸중, 기억력 손상이나 치매를 유발합니다. 음주운전은 자신과 다른 사람의 생명을 위태롭게 할 수 있습니다. 임신 중 음주는 기형아 출생 위험을 높입니다.',
  report: '*부정, 불량 식품 신고는 국번없이 1399',
  badges: ['이산화황 함유', '19세미만 판매금지'],
  recycle: '유리',
  bodyPt: 7.0,
  warnPt: 7.0,
};

/** 라벨이 아직 없는 와인의 초안 — 템플릿에 제품명을 채워 만든다 */
export function draftForWine(wine: WineRow): BackLabelData {
  const name = wine.name_kr || wine.name_en;
  return {
    ...DEFAULT_BACK_LABEL,
    items: DEFAULT_BACK_LABEL.items.map((t) =>
      t.startsWith('2.제품명:') ? `2.제품명: ${name}` : t,
    ),
  };
}

/** jsonb 에서 읽은 값 보정 — 과거 저장분에 필드가 빠져 있어도 동작하도록 */
export function normalizeLabelData(raw: unknown): BackLabelData {
  const d = (raw ?? {}) as Partial<BackLabelData>;
  return {
    ...DEFAULT_BACK_LABEL,
    ...d,
    items: Array.isArray(d.items) ? d.items : DEFAULT_BACK_LABEL.items,
    badges: Array.isArray(d.badges) ? d.badges : DEFAULT_BACK_LABEL.badges,
    bodyPt: Number(d.bodyPt) || DEFAULT_BACK_LABEL.bodyPt,
    warnPt: Number(d.warnPt) || DEFAULT_BACK_LABEL.warnPt,
  };
}
