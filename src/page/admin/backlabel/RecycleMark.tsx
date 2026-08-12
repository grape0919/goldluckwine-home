/**
 * 분리배출 마크 — 꺾인 굵은 화살표 3개가 삼각형을 이루고 가운데에 재질명.
 * wine-label 저장소 make_label.py 의 recycle_mark() 를 그대로 포팅했다.
 */

type Pt = [number, number];

const CX = 50;
const CY = 50;
const R = 48;
const SW = 8.5; // 화살표 굵기

const rad = (deg: number) => (deg * Math.PI) / 180;
const lerp = (p: Pt, q: Pt, t: number): Pt => [
  p[0] + (q[0] - p[0]) * t,
  p[1] + (q[1] - p[1]) * t,
];
const f = (p: Pt) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;

// 위, 우하, 좌하 꼭지점
const verts: Pt[] = [-90, 30, 150].map((a) => [
  CX + R * Math.cos(rad(a)),
  CY + R * Math.sin(rad(a)),
]);

// 화살표 하나는 꼭지점에서 꺾인다. 앞 변의 70% 지점에서 출발해
// 꼭지점을 돌아 다음 변 30% 지점까지 가고, 거기서 화살촉이 나온다.
const [corner, nxt, prev] = verts;
const start = lerp(prev, corner, 0.7);
const end = lerp(corner, nxt, 0.3);

const dx = nxt[0] - corner[0];
const dy = nxt[1] - corner[1];
const n = Math.hypot(dx, dy);
const [ux, uy] = [dx / n, dy / n];
const [px, py] = [-uy, ux]; // 수직 벡터

const HEAD_LEN = 15;
const HEAD_HALF = 9.5;
const apex: Pt = [end[0] + ux * HEAD_LEN, end[1] + uy * HEAD_LEN];
const b1: Pt = [end[0] + px * HEAD_HALF, end[1] + py * HEAD_HALF];
const b2: Pt = [end[0] - px * HEAD_HALF, end[1] - py * HEAD_HALF];

const RecycleMark = ({ material }: { material: string }) => (
  <svg
    viewBox='-6 -6 112 112'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden='true'
  >
    {[0, 120, 240].map((r) => (
      <g
        key={r}
        transform={`rotate(${r} ${CX} ${CY})`}
      >
        <path
          d={`M${f(start)} L${f(corner)} L${f(end)}`}
          fill='none'
          stroke='#000'
          strokeWidth={SW}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <polygon
          points={`${f(apex)} ${f(b1)} ${f(b2)}`}
          fill='#000'
        />
      </g>
    ))}
    <text
      x='50'
      y='55'
      textAnchor='middle'
      dominantBaseline='central'
      fontFamily='NanumGothic, "Apple SD Gothic Neo", sans-serif'
      fontSize='21'
      fontWeight='700'
      fill='#000'
    >
      {material}
    </text>
  </svg>
);

export default RecycleMark;
