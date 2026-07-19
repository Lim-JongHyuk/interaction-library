"use client";

// deps: motion
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, type MotionValue } from "motion/react";

export interface DockItem {
  label: string;
  icon?: string;
}

export interface FloatingDockProps {
  items?: DockItem[];
  magnification?: number;
  radius?: number;
}

const DEFAULT_ITEMS: DockItem[] = [
  { label: "Home", icon: "🏠" },
  { label: "Search", icon: "🔍" },
  { label: "Components", icon: "🧩" },
  { label: "Docs", icon: "📄" },
  { label: "Settings", icon: "⚙️" },
];

export function FloatingDock({ items = DEFAULT_ITEMS, magnification = 1.6, radius = 90 }: FloatingDockProps) {
  const reducedMotion = useReducedMotion();
  // 커서 X 좌표. 벗어나면 Infinity로 두어 모든 아이콘이 기본 크기로 복귀한다.
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="flex items-end gap-2 rounded-2xl border border-border bg-card/80 px-3 py-2.5 backdrop-blur"
    >
      {items.map((item) => (
        <DockIcon
          key={item.label}
          item={item}
          mouseX={mouseX}
          magnification={reducedMotion ? 1 : magnification}
          radius={radius}
        />
      ))}
    </div>
  );
}

function DockIcon({
  item,
  mouseX,
  magnification,
  radius,
}: {
  item: DockItem;
  mouseX: MotionValue<number>;
  magnification: number;
  radius: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // transform 콜백은 렌더 밖(모션 밸류 갱신 시)에서 실행되므로 ref 접근이 안전하다.
  const distance = useTransform(mouseX, (x) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || !Number.isFinite(x)) return radius;
    return Math.abs(x - (rect.left + rect.width / 2));
  });
  const targetScale = useTransform(distance, [0, radius], [magnification, 1], { clamp: true });
  const scale = useSpring(targetScale, { stiffness: 300, damping: 20 });

  return (
    <motion.div
      ref={ref}
      style={{ scale }}
      className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-lg"
    >
      {item.icon}
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-background px-2 py-0.5 text-xs opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {item.label}
      </span>
    </motion.div>
  );
}
