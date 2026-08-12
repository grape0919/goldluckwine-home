import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { LABEL_W_MM, LABEL_H_MM } from '@/page/admin/backlabel/LabelSheet';

/**
 * 실물 크기(70x35mm)로 렌더된 라벨 노드를 고해상도 래스터로 캡처해
 * 정확히 70x35mm PDF 로 저장한다.
 * 70mm ≈ 264.6 CSS px 이므로 pixelRatio 12 → 약 1,150dpi — 인쇄에 충분.
 */
export async function downloadLabelPdf(
  node: HTMLElement,
  filename: string,
): Promise<void> {
  await document.fonts.ready;
  const canvas = await toCanvas(node, {
    pixelRatio: 12,
    backgroundColor: '#ffffff',
  });
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [LABEL_W_MM, LABEL_H_MM],
    compress: true,
  });
  pdf.addImage(canvas, 'PNG', 0, 0, LABEL_W_MM, LABEL_H_MM);
  pdf.save(filename);
}

/**
 * 브라우저 인쇄 다이얼로그를 연다. #bl-print-root 만 보이게 하는 인쇄 CSS 와
 * @page 70x35mm 규칙은 BackLabelAdmin 의 PrintStyle 에 있다.
 * 인쇄 중 문서 제목을 파일명으로 바꿔 "PDF로 저장" 시 기본 파일명을 맞춘다.
 */
export async function printLabel(title: string): Promise<void> {
  await document.fonts.ready;
  const prev = document.title;
  document.title = title;
  const restore = () => {
    document.title = prev;
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);
  window.print();
}
