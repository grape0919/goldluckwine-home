import React from 'react';

interface CloverIconProps {
  /** 채움색 (와인 타입 색, 장식용 연녹색 등) */
  color?: string;
  size?: number | string;
  /** 줄기 표시 여부 — 장식용 대형 클로버에만 사용 */
  stem?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * 네잎클로버 아이콘 (Figma 홈 리디자인의 클로버 모티프).
 * 하트 모양 잎 4장을 중심 기준 90도씩 회전해 그립니다.
 */
const CloverIcon = ({
  color = '#6fa64c',
  size = 16,
  stem = false,
  style,
  className,
}: CloverIconProps) => (
  <svg
    viewBox='0 0 100 100'
    width={size}
    height={size}
    style={style}
    className={className}
    aria-hidden
  >
    <g fill={color}>
      {[0, 90, 180, 270].map((deg) => (
        <g
          key={deg}
          transform={`rotate(${deg} 50 50)`}
        >
          {/* 잎 하나 = 원 2개 + 중심을 향한 쐐기 */}
          <circle
            cx={40}
            cy={27}
            r={13}
          />
          <circle
            cx={60}
            cy={27}
            r={13}
          />
          <path d='M50 52 L30.5 33.5 Q50 15 69.5 33.5 Z' />
        </g>
      ))}
      {stem && (
        <path
          d='M53 55 Q60 74 50 92 Q49 94 47.5 92.5 Q56 75 49 57 Z'
          transform='rotate(8 50 50)'
        />
      )}
    </g>
  </svg>
);

export default CloverIcon;
