"use client";

// deps: motion
import { useEffect, useRef, useState } from "react";
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  useReducedMotion,
  type PanInfo,
} from "motion/react";

export interface DeckCard {
  title: string;
  subtitle: string;
  /** 카드 배경 hue (0–360) */
  hue?: number;
  /** 이미지 URL. 지정하면 카드 전체 배경으로 렌더 */
  image?: string;
}

export interface SwipeDeckProps {
  cards?: DeckCard[];
  /** 드래그 시 카드가 기우는 최대 각도(deg) */
  rotation?: number;
  /** 카드가 넘어가는 드래그 거리(px) */
  threshold?: number;
  /** 뒤 카드가 드러나는 세로 간격(px) */
  stackOffset?: number;
}

const DEFAULT_CARDS: DeckCard[] = [
  { title: "Aurora", subtitle: "Iceland · 4K wallpaper pack", hue: 250 },
  { title: "Dune", subtitle: "Morocco · editorial series", hue: 24 },
  { title: "Reef", subtitle: "Palau · underwater film", hue: 190 },
  { title: "Neon", subtitle: "Tokyo · night street set", hue: 320 },
  { title: "Moss", subtitle: "Yakushima · texture study", hue: 150 },
];

/**
 * 틴더식 스와이프 카드 덱. 드래그 오프셋 + 릴리즈 속도를 합산해
 * 넘길지 되돌릴지 판정하고, 넘어간 카드는 덱 맨 뒤로 순환한다.
 */
export function SwipeDeck({
  cards = DEFAULT_CARDS,
  rotation = 12,
  threshold = 120,
  stackOffset = 14,
}: SwipeDeckProps) {
  const reducedMotion = useReducedMotion();
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  // 같은 카드가 다시 맨 앞에 왔을 때 모션 값을 리셋하기 위한 사이클 카운터
  const [cycle, setCycle] = useState(0);
  const flingRef = useRef<((dir: 1 | -1) => void) | null>(null);

  function sendToBack() {
    setOrder((o) => [...o.slice(1), o[0]]);
    setCycle((c) => c + 1);
  }

  const visible = order.slice(0, Math.min(4, order.length));

  return (
    <div
      role="group"
      aria-label="스와이프 카드 덱"
      className="relative flex h-[440px] w-full items-center justify-center"
    >
      <div className="relative h-80 w-60">
        {visible.map((cardIndex, i) => {
          const card = cards[cardIndex];
          if (i === 0) {
            return (
              <TopCard
                key={`${cardIndex}-${cycle}`}
                card={card}
                rotation={rotation}
                threshold={threshold}
                reducedMotion={!!reducedMotion}
                onDismiss={sendToBack}
                flingRef={flingRef}
              />
            );
          }
          return (
            <motion.div
              key={cardIndex}
              className="absolute inset-0"
              style={{ zIndex: visible.length - i }}
              initial={false}
              animate={{
                y: i * stackOffset,
                scale: 1 - i * 0.05,
                filter: `brightness(${1 - i * 0.14})`,
              }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 280, damping: 26 }
              }
              aria-hidden="true"
            >
              <CardFace card={card} />
            </motion.div>
          );
        })}
      </div>

      <div className="absolute bottom-4 flex gap-4">
        <button
          type="button"
          aria-label="건너뛰기 (왼쪽으로 스와이프)"
          onClick={() => flingRef.current?.(-1)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-400/40 bg-rose-500/10 text-rose-400 outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" className="h-5 w-5">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="담기 (오른쪽으로 스와이프)"
          onClick={() => flingRef.current?.(1)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 text-emerald-400 outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 21s-7.2-4.5-9.2-8.7C1.4 9 3.3 5.8 6.6 5.8c2 0 3.5 1.2 5.4 3.1 1.9-1.9 3.4-3.1 5.4-3.1 3.3 0 5.2 3.2 3.8 6.5C19.2 16.5 12 21 12 21Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function TopCard({
  card,
  rotation,
  threshold,
  reducedMotion,
  onDismiss,
  flingRef,
}: {
  card: DeckCard;
  rotation: number;
  threshold: number;
  reducedMotion: boolean;
  onDismiss: () => void;
  flingRef: React.MutableRefObject<((dir: 1 | -1) => void) | null>;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-280, 280], [-rotation, rotation]);
  const keepOpacity = useTransform(x, [32, threshold], [0, 1]);
  const skipOpacity = useTransform(x, [-threshold, -32], [1, 0]);

  function fling(dir: 1 | -1) {
    if (reducedMotion) {
      onDismiss();
      return;
    }
    animate(y, y.get() - 40, { duration: 0.32, ease: "easeOut" });
    animate(x, dir * 560, { duration: 0.32, ease: [0.32, 0.72, 0.35, 1] }).then(onDismiss);
  }

  useEffect(() => {
    flingRef.current = fling;
    return () => {
      flingRef.current = null;
    };
  });

  function onDragEnd(_: unknown, info: PanInfo) {
    // 오프셋 + 속도를 합산: 짧고 빠른 플릭도 카드가 넘어간다
    const power = info.offset.x + info.velocity.x * 0.2;
    if (Math.abs(power) > threshold) {
      fling(power > 0 ? 1 : -1);
    } else {
      animate(x, 0, { type: "spring", stiffness: 480, damping: 32 });
      animate(y, 0, { type: "spring", stiffness: 480, damping: 32 });
    }
  }

  return (
    <motion.div
      drag
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      style={{ x, y, rotate, zIndex: 40 }}
      className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
      aria-label={`${card.title} — ${card.subtitle}`}
    >
      <CardFace card={card} />
      <motion.span
        style={{ opacity: keepOpacity }}
        className="pointer-events-none absolute left-4 top-4 -rotate-12 rounded-md border-2 border-emerald-400 px-2 py-0.5 text-sm font-bold uppercase tracking-wider text-emerald-400"
        aria-hidden="true"
      >
        Keep
      </motion.span>
      <motion.span
        style={{ opacity: skipOpacity }}
        className="pointer-events-none absolute right-4 top-4 rotate-12 rounded-md border-2 border-rose-400 px-2 py-0.5 text-sm font-bold uppercase tracking-wider text-rose-400"
        aria-hidden="true"
      >
        Skip
      </motion.span>
    </motion.div>
  );
}

function CardFace({ card }: { card: DeckCard }) {
  const hue = card.hue ?? 250;
  return (
    <div
      className="relative flex h-full w-full select-none flex-col justify-end overflow-hidden rounded-2xl p-5 shadow-xl ring-1 ring-white/15"
      style={{
        background: card.image
          ? undefined
          : `linear-gradient(160deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 75% 28%))`,
      }}
    >
      {card.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 to-transparent" aria-hidden="true" />
      <p className="relative text-lg font-semibold text-white">{card.title}</p>
      <p className="relative text-xs text-white/75">{card.subtitle}</p>
    </div>
  );
}
