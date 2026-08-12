import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

/** 부드러운 감속 이징 (easeOutQuint 계열) — 홈 모션 공통 톤 */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** SSR(SSG 프리렌더) 중에는 useLayoutEffect가 경고를 내므로 서버에서는 useEffect로 대체 */
export const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface RevealProps {
  children: ReactNode;
  /** 등장 지연(초) — stagger는 호출부에서 delay로 조합 */
  delay?: number;
  /** 슬라이드업 거리(px) */
  y?: number;
  className?: string;
  style?: CSSProperties;
}

/** 스크롤 등장(페이드+슬라이드업) 래퍼.
 *
 *  SSG 안전 장치: 프리렌더 HTML에는 숨김 스타일을 절대 넣지 않는다.
 *  hydration 후(paint 전) 뷰포트 아래에 있는 요소만 숨겼다가(armed)
 *  뷰포트 진입 시 1회 재생한다. JS 미실행 환경(크롤러)에서는 항상 보인다. */
export const Reveal = ({
  children,
  delay = 0,
  y = 14,
  className,
  style,
}: RevealProps) => {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [armed, setArmed] = useState(false);

  useIsoLayoutEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (el && el.getBoundingClientRect().top > window.innerHeight * 0.85) {
      setArmed(true);
    }
  }, [reduce]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={false}
      animate={armed ? (inView ? 'visible' : 'hidden') : undefined}
      variants={{
        hidden: { opacity: 0, y, transition: { duration: 0 } },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.65, ease: EASE, delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

interface LoadFadeProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}

/** 페이지 진입 시 1회 페이드(+슬라이드업). 히어로 전용.
 *  keyframes([시작, 끝])라 hydration 후에만 숨김→등장이 재생되고
 *  프리렌더 HTML은 항상 보이는 상태다. */
export const LoadFade = ({
  children,
  delay = 0,
  y = 0,
  className,
  style,
}: LoadFadeProps) => {
  const reduce = useReducedMotion();
  const [armed, setArmed] = useState(false);

  useIsoLayoutEffect(() => {
    if (!reduce) setArmed(true);
  }, [reduce]);

  return (
    <motion.div
      className={className}
      style={style}
      initial={false}
      animate={armed ? { opacity: [0, 1], y: [y, 0] } : undefined}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
};

interface MaskedLinesProps {
  /** '\n' 구분 문구 — renderLines와 동일한 줄 분리 규칙 */
  text: string;
  /** load: 페이지 진입 시 재생, scroll: 뷰포트 진입 시 재생 */
  mode?: 'load' | 'scroll';
  delay?: number;
  /** 줄 간 재생 간격(초) */
  stagger?: number;
}

/** 마스크 텍스트 리빌: 각 줄이 보이지 않는 마스크 아래에서 떠오른다.
 *  Reveal과 동일한 SSG 안전 장치(armed) 적용. */
export const MaskedLines = ({
  text,
  mode = 'scroll',
  delay = 0,
  stagger = 0.12,
}: MaskedLinesProps) => {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [armed, setArmed] = useState(false);

  useIsoLayoutEffect(() => {
    if (reduce) return;
    if (mode === 'load') {
      setArmed(true);
      return;
    }
    const el = ref.current;
    if (el && el.getBoundingClientRect().top > window.innerHeight * 0.85) {
      setArmed(true);
    }
  }, [reduce, mode]);

  const playing = armed && (mode === 'load' || inView);

  return (
    <span ref={ref}>
      {text.split('\n').map((line, i) => (
        <span
          key={i}
          style={{ display: 'block', overflow: 'hidden' }}
        >
          <motion.span
            style={{ display: 'block' }}
            initial={false}
            animate={armed ? (playing ? 'visible' : 'hidden') : undefined}
            variants={{
              hidden: { y: '110%', transition: { duration: 0 } },
              visible: {
                y: ['110%', '0%'],
                transition: {
                  duration: 0.8,
                  ease: EASE,
                  delay: delay + i * stagger,
                },
              },
            }}
          >
            {line || ' '}
          </motion.span>
        </span>
      ))}
    </span>
  );
};
