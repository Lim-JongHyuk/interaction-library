"use client";

// deps: 없음 (rAF 직접 구동 — 링 회전과 아바타 역회전을 한 프레임에 계산)
import { useEffect, useRef, useSyncExternalStore } from "react";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED_QUERY).matches, () => false);
}

export interface OrbitItem {
  /** 아바타 이니셜 (1~2자) */
  initials: string;
  name: string;
  /** 색상 hue (0-360) */
  hue?: number;
}

export interface OrbitAvatarsProps {
  /** 안쪽 링 1회전에 걸리는 시간(s). 바깥 링일수록 비례해 느려진다 */
  speed?: number;
  /** 링 개수 (1–3) */
  rings?: number;
  /** 인접 링을 서로 반대 방향으로 회전 */
  counterRotate?: boolean;
  /** 호버 시 궤도 일시정지 */
  pauseOnHover?: boolean;
  /** 궤도에 올릴 아이템. 생략 시 데모 아바타 */
  items?: OrbitItem[];
}

const DEMO_ITEMS: OrbitItem[] = [
  { initials: "JH", name: "Jonghyuk", hue: 248 },
  { initials: "MK", name: "Minkyung", hue: 32 },
  { initials: "SY", name: "Seoyeon", hue: 180 },
  { initials: "DH", name: "Dohyun", hue: 140 },
  { initials: "YJ", name: "Yujin", hue: 315 },
  { initials: "TW", name: "Taewoo", hue: 205 },
  { initials: "HR", name: "Haerin", hue: 10 },
  { initials: "JS", name: "Jisoo", hue: 265 },
  { initials: "EB", name: "Eunbi", hue: 55 },
  { initials: "KM", name: "Kyungmin", hue: 225 },
];

const RING_RADII = [64, 104, 144];

/**
 * 중심 브랜드를 둘러싸고 아바타들이 궤도를 도는 "trusted by" 섹션.
 * 링 전체를 회전시키고 각 아바타를 같은 각도만큼 역회전시켜
 * 아바타가 항상 똑바로 서 있게 유지한다.
 */
export function OrbitAvatars({
  speed = 18,
  rings = 2,
  counterRotate = true,
  pauseOnHover = true,
  items = DEMO_ITEMS,
}: OrbitAvatarsProps) {
  const ringCount = Math.max(1, Math.min(3, Math.round(rings)));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);
  const avatarRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const pausedRef = useRef(false);
  const paramsRef = useRef({ speed, counterRotate, pauseOnHover });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    paramsRef.current = { speed, counterRotate, pauseOnHover };
  }, [speed, counterRotate, pauseOnHover]);

  // 링별 아이템 분배: 안쪽 링부터 3/4/5개
  const perRing: OrbitItem[][] = [];
  {
    let cursor = 0;
    for (let r = 0; r < ringCount; r++) {
      const count = Math.min(3 + r, Math.max(0, items.length - cursor));
      perRing.push(items.slice(cursor, cursor + count));
      cursor += count;
    }
  }

  useEffect(() => {
    if (reduced) {
      // 정적 상태: 각 링 0°로 고정
      ringRefs.current.forEach((ring) => {
        if (ring) ring.style.transform = "rotate(0deg)";
      });
      avatarRefs.current.forEach((el) => {
        el.style.transform = "rotate(0deg)";
      });
      return;
    }

    let raf = 0;
    let last = performance.now();
    const angles = new Array(ringCount).fill(0);

    function loop(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const p = paramsRef.current;

      if (!(p.pauseOnHover && pausedRef.current)) {
        for (let r = 0; r < ringCount; r++) {
          const dir = p.counterRotate && r % 2 === 1 ? -1 : 1;
          // 바깥 링일수록 주기가 길어져 자연스러운 시차가 생긴다
          const period = Math.max(p.speed, 1) * (1 + r * 0.6);
          angles[r] += dir * (360 / period) * dt;
          const ring = ringRefs.current[r];
          if (ring) ring.style.transform = `rotate(${angles[r]}deg)`;
          avatarRefs.current.forEach((el, key) => {
            if (key.startsWith(`${r}:`)) el.style.transform = `rotate(${-angles[r]}deg)`;
          });
        }
      }
      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, ringCount]);

  return (
    <div
      ref={wrapperRef}
      role="img"
      aria-label="궤도를 도는 팀 아바타"
      className="relative flex h-80 w-full items-center justify-center overflow-hidden"
      onPointerEnter={() => {
        pausedRef.current = true;
      }}
      onPointerLeave={() => {
        pausedRef.current = false;
      }}
    >
      {/* 중심 브랜드 */}
      <div className="absolute z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/60 text-sm font-bold text-white shadow-lg shadow-accent/30">
        MK
      </div>

      {perRing.map((ringItems, r) => {
        const radius = RING_RADII[r];
        return (
          <div key={r} className="absolute" style={{ width: radius * 2, height: radius * 2 }}>
            {/* 궤도선 */}
            <div className="absolute inset-0 rounded-full border border-border" aria-hidden="true" />
            {/* 회전 레이어 */}
            <div
              ref={(el) => {
                ringRefs.current[r] = el;
              }}
              className="absolute inset-0"
            >
              {ringItems.map((item, i) => {
                const angle = (360 / ringItems.length) * i - 90;
                const rad = (angle * Math.PI) / 180;
                const x = radius + Math.cos(rad) * radius;
                const y = radius + Math.sin(rad) * radius;
                const key = `${r}:${i}`;
                return (
                  // 바깥 div는 위치+역회전(JS transform 전용), 안쪽 span이 시각·호버 담당
                  <div
                    key={key}
                    ref={(el) => {
                      if (el) avatarRefs.current.set(key, el);
                      else avatarRefs.current.delete(key);
                    }}
                    className="absolute -ml-5 -mt-5 h-10 w-10"
                    style={{ left: x, top: y }}
                  >
                    <span
                      title={item.name}
                      className="flex h-full w-full items-center justify-center rounded-full border-2 border-background text-[11px] font-semibold text-white shadow-md transition-transform hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, hsl(${item.hue ?? 240} 60% 55%), hsl(${item.hue ?? 240} 60% 40%))`,
                      }}
                    >
                      {item.initials}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
