/** 품종 문자열 비교용 정규화: 앞뒤 공백 제거 + 연속 공백 정리 + 소문자화 */
export const normalizeVariety = (value: string): string =>
  value.trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * 여러 와인의 품종 목록에서 대소문자·공백 차이를 무시하고 중복을 제거한
 * 대표 표기(먼저 등장한 표기) 목록을 알파벳순으로 반환
 */
export const distinctVarieties = (lists: string[][]): string[] => {
  const byKey = new Map<string, string>();
  lists.forEach((list) =>
    list.forEach((raw) => {
      const display = raw.trim().replace(/\s+/g, ' ');
      if (!display) return;
      const key = display.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, display);
    }),
  );
  return [...byKey.values()].sort((a, b) => a.localeCompare(b));
};
