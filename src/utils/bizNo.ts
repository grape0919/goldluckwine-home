/** 사업자등록번호 표기 — DB에는 숫자 10자리로 정규화 저장하므로(국세청 조회·중복
 *  체크용) 화면·인쇄물에서는 000-00-00000 형식으로 복원한다. 10자리가 아니면 원본 유지. */
export const formatBizNo = (s: string): string => {
  const d = s.replace(/\D/g, '');
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}` : s;
};
