import type { ReactNode } from 'react';

/** 관리자 대시보드용 경량 SVG 차트 — 단일 계열 막대만 사용하므로
 *  차트 라이브러리를 추가하지 않는다.
 *  색: #7d5296 (단일 색조, 밝기·채도·대비 검증 통과), 텍스트는 잉크 토큰 사용. */

const BAR = '#7d5296';
const INK = '#262322';
const MUTED = '#8b8378';
const GRID = '#e8e4dc';

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

export interface BarDatum {
  label: string;
  value: number;
  /** 툴팁·라벨에 표시할 문자열 (없으면 값 그대로) */
  display?: string;
}

interface ChartProps {
  data: BarDatum[];
  /** 값 포맷터 — 기본은 원 단위 */
  format?: (v: number) => string;
  empty?: ReactNode;
}

/** 세로 막대 — 시간 순 추이 (월별 발주 등) */
export const ColumnChart = ({
  data,
  format = won,
  empty = '데이터가 없습니다',
}: ChartProps) => {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return <div style={{ color: MUTED, fontSize: 13 }}>{empty}</div>;
  }
  const W = 560;
  const H = 180;
  const padX = 8;
  const padTop = 22; // 값 라벨 자리
  const padBottom = 22; // 축 라벨 자리
  const max = Math.max(...data.map((d) => d.value));
  const slot = (W - padX * 2) / data.length;
  const barW = Math.min(46, slot - 10); // 막대 사이 여백 확보
  const plotH = H - padTop - padBottom;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width='100%'
      role='img'
      aria-label={`막대 차트: ${data.map((d) => `${d.label} ${d.display ?? format(d.value)}`).join(', ')}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* 기준선만 — 그리드는 최소화 */}
      <line
        x1={padX}
        x2={W - padX}
        y1={H - padBottom}
        y2={H - padBottom}
        stroke={GRID}
        strokeWidth={1}
      />
      {data.map((d, i) => {
        const h = max === 0 ? 0 : Math.round((d.value / max) * plotH);
        const x = padX + slot * i + (slot - barW) / 2;
        const y = H - padBottom - h;
        const text = d.display ?? format(d.value);
        return (
          <g key={d.label}>
            <title>{`${d.label} · ${text}`}</title>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, 2)}
              rx={4}
              fill={BAR}
            />
            {/* 최댓값에만 직접 라벨 — 모든 막대에 숫자를 얹지 않는다 */}
            {d.value === max && (
              <text
                x={x + barW / 2}
                y={y - 7}
                textAnchor='middle'
                fontSize={11}
                fill={INK}
              >
                {text}
              </text>
            )}
            <text
              x={x + barW / 2}
              y={H - 7}
              textAnchor='middle'
              fontSize={11}
              fill={MUTED}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/** 가로 막대 — 항목 비교 (거래처·와인 Top N) */
export const BarChart = ({
  data,
  format = won,
  empty = '데이터가 없습니다',
}: ChartProps) => {
  if (data.length === 0) {
    return <div style={{ color: MUTED, fontSize: 13 }}>{empty}</div>;
  }
  const rowH = 30;
  const barH = 16;
  const labelW = 120;
  const valueW = 96;
  const W = 560;
  const H = rowH * data.length;
  const max = Math.max(...data.map((d) => d.value), 1);
  const plotW = W - labelW - valueW;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width='100%'
      role='img'
      aria-label={`가로 막대 차트: ${data.map((d) => `${d.label} ${d.display ?? format(d.value)}`).join(', ')}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {data.map((d, i) => {
        const w = Math.max(Math.round((d.value / max) * plotW), 2);
        const y = i * rowH;
        const text = d.display ?? format(d.value);
        return (
          <g key={`${d.label}-${i}`}>
            <title>{`${d.label} · ${text}`}</title>
            <text
              x={0}
              y={y + rowH / 2 + 4}
              fontSize={12}
              fill={INK}
            >
              {d.label.length > 12 ? `${d.label.slice(0, 12)}…` : d.label}
            </text>
            <rect
              x={labelW}
              y={y + (rowH - barH) / 2}
              width={w}
              height={barH}
              rx={4}
              fill={BAR}
            />
            <text
              x={W}
              y={y + rowH / 2 + 4}
              textAnchor='end'
              fontSize={12}
              fill={INK}
            >
              {text}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
