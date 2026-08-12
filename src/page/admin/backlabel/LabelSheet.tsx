/**
 * 와인 백라벨(70x35mm) 시트 — wine-label 저장소 make_label.py 의
 * build_html() 을 React 로 포팅했다. 실물 mm 단위로 렌더링하므로
 * 화면 미리보기는 부모에서 transform: scale() 로 확대한다.
 */
import { Fragment } from 'react';
import RecycleMark from '@/page/admin/backlabel/RecycleMark';
import type { BackLabelData } from '@/page/admin/backlabel/labelData';

export const LABEL_W_MM = 70;
export const LABEL_H_MM = 35;
const MARGIN_MM = 1; // 라벨 안쪽 여백

const NBSP = '\u00a0';

/**
 * 번호 매긴 항목이 흐르되, 줄 끝이 "7." 이나 "3.원산" 처럼 어중간하게
 * 끊기지 않도록 두 가지 규칙을 둔다:
 *  1) "번호.항목명: 첫어절" 은 nowrap 스팬으로 묶어 한 덩어리로 취급
 *  2) 나머지도 어절 단위로만 개행 (.bl-body 의 word-break:keep-all)
 */
const Item = ({ text }: { text: string }) => {
  const m = text.match(/^(\d+\.[^:]*:)\s*(\S+)\s*(.*)$/);
  if (!m) return <span className='bl-it'>{text}</span>;
  // "750 mL" 처럼 숫자와 단위 사이도 갈라지지 않게 nbsp 로 묶는다
  const rest = m[3].replace(/(\d) ([A-Za-z%])/g, `$1${NBSP}$2`);
  return (
    <span className='bl-it'>
      <span className='bl-nb'>{`${m[1]} ${m[2]}`}</span>
      {rest ? ` ${rest}` : null}
    </span>
  );
};

const css = (d: BackLabelData, guide: boolean) => `
  .bl-label { width:${LABEL_W_MM}mm; height:${LABEL_H_MM}mm; padding:${MARGIN_MM}mm;
              display:flex; flex-direction:column; overflow:hidden;
              margin:0; box-sizing:border-box; color:#000; background:#fff;
              font-family:"NanumGothic","나눔고딕","Apple SD Gothic Neo","Noto Sans KR",sans-serif;
              -webkit-font-smoothing:antialiased;
              -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .bl-label *, .bl-label *::before, .bl-label *::after {
              margin:0; padding:0; box-sizing:border-box;
              -webkit-print-color-adjust:exact; print-color-adjust:exact; }

  /* ---- 분리배출 마크: 우상단 플로트, 본문이 아래로 감김 ---- */
  .bl-recycle { float:right; width:10mm; height:10mm; margin:0 0 0.3mm 0.5mm; }
  .bl-recycle svg { display:block; width:100%; height:100%; }

  /* ---- 번호 항목이 흐르는 표시사항 ---- */
  .bl-body { flex:1; min-height:0; font-size:${d.bodyPt}pt; line-height:1.12;
             letter-spacing:-0.06em; overflow:hidden; word-break:keep-all; }
  .bl-it { margin-right:0.9mm; }
  .bl-nb { white-space:nowrap; }

  /* ---- 과음경고문구 (국세청 고시) ---- */
  .bl-warn { border:0.18mm solid #000; padding:0.35mm 0.55mm; margin-top:0.35mm;
             font-size:${d.warnPt}pt; font-weight:700; line-height:1.12;
             letter-spacing:-0.065em; }
  .bl-warn b { font-weight:800; }

  /* ---- 하단: 강조표시(반전) + 신고 안내 ---- */
  .bl-foot { display:flex; align-items:center; gap:0.7mm;
             margin-top:0.35mm; white-space:nowrap; }
  .bl-badge { background:#000; color:#fff; font-size:${d.bodyPt - 1}pt;
              font-weight:700; letter-spacing:-0.04em; line-height:1.15;
              padding:0.3mm 0.7mm; }
  .bl-foot .bl-rep { margin-left:auto; font-size:${d.bodyPt - 1}pt;
                     letter-spacing:-0.05em; }
  ${guide ? '.bl-label{outline:0.1mm dashed #b00;outline-offset:-0.05mm}' : ''}
`;

interface Props {
  data: BackLabelData;
  /** 재단 확인용 점선 테두리 (화면 확인용 — 인쇄/PDF에는 끄고 쓴다) */
  guide?: boolean;
}

const LabelSheet = ({ data, guide = false }: Props) => (
  <div className='bl-label'>
    <style>{css(data, guide)}</style>

    <div className='bl-body'>
      <div className='bl-recycle'>
        <RecycleMark material={data.recycle} />
      </div>
      {data.items.map((t, i) => (
        <Fragment key={i}>
          <Item text={t} />{' '}
        </Fragment>
      ))}
    </div>

    <div className='bl-warn'>
      <b>*경고:</b> {data.warning}
    </div>

    <div className='bl-foot'>
      {data.badges.map((t, i) => (
        <span
          key={i}
          className='bl-badge'
        >
          {t}
        </span>
      ))}
      <span className='bl-rep'>{data.report}</span>
    </div>
  </div>
);

export default LabelSheet;
