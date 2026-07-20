"use client";

// deps: motion
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface OTPInputProps {
  /** 자리 수 */
  length?: number;
  /** 입력값을 ●로 마스킹 */
  masked?: boolean;
  /** 데모 검증 코드. 일치하면 성공 웨이브, 다르면 흔들림 후 초기화. 빈 문자열이면 검증 없음 */
  correctCode?: string;
  /** 포커스 링·성공 색 */
  accentColor?: string;
  onComplete?: (code: string) => void;
}

type Status = "idle" | "error" | "success";

/**
 * 붙여넣기·백스페이스·모바일 원타임코드 자동완성까지 처리하는 애니메이션 OTP 입력.
 * 실제 입력은 투명한 단일 input이 받고, 박스들은 상태를 시각화만 한다 —
 * 포커스 관리와 스크린리더 호환을 한 곳에서 해결하는 구조.
 */
export function OTPInput({
  length = 6,
  masked = false,
  correctCode = "123456",
  accentColor = "#6366f1",
  onComplete,
}: OTPInputProps) {
  const digits = Math.max(4, Math.min(8, Math.round(length)));
  const reducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const pop = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 500, damping: 28 };

  function handleChange(raw: string) {
    if (status === "success") return;
    const next = raw.replace(/\D/g, "").slice(0, digits);
    setValue(next);
    if (status === "error") setStatus("idle");

    if (next.length === digits) {
      if (correctCode && next !== correctCode) {
        setStatus("error");
        // 흔들림이 끝난 뒤 비우고 다시 받는다
        setTimeout(() => {
          setValue("");
          setStatus("idle");
        }, reducedMotion ? 60 : 650);
      } else {
        setStatus("success");
        onComplete?.(next);
        setTimeout(() => {
          setValue("");
          setStatus("idle");
        }, 1800);
      }
    }
  }

  const activeIndex = Math.min(value.length, digits - 1);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <motion.div
        className="relative flex cursor-text gap-2"
        onClick={() => inputRef.current?.focus()}
        animate={
          status === "error" && !reducedMotion
            ? { x: [0, -10, 9, -7, 5, -2, 0] }
            : { x: 0 }
        }
        transition={status === "error" ? { duration: 0.5 } : undefined}
      >
        {/* 실제 입력 필드: 투명하지만 스크린리더·모바일 자동완성의 단일 진입점 */}
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label={`${digits}자리 인증 코드 입력`}
          className="absolute inset-0 z-10 opacity-0"
          disabled={status === "success"}
        />

        {Array.from({ length: digits }).map((_, i) => {
          const char = value[i] ?? "";
          const isActive = focused && i === activeIndex && status !== "success";
          const borderColor =
            status === "success"
              ? accentColor
              : status === "error"
                ? "#f87171"
                : isActive
                  ? accentColor
                  : undefined;
          return (
            <motion.div
              key={i}
              className="flex h-14 w-11 items-center justify-center rounded-xl border-2 border-border bg-card text-xl font-semibold"
              style={borderColor ? { borderColor } : undefined}
              animate={
                status === "success" && !reducedMotion
                  ? { y: [0, -10, 0], scale: [1, 1.06, 1] }
                  : { y: 0, scale: 1 }
              }
              transition={
                status === "success"
                  ? { duration: 0.45, delay: reducedMotion ? 0 : i * 0.06 }
                  : pop
              }
            >
              {char ? (
                <motion.span
                  initial={reducedMotion ? false : { scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={pop}
                  style={status === "success" ? { color: accentColor } : undefined}
                >
                  {masked ? "●" : char}
                </motion.span>
              ) : (
                isActive && (
                  <span
                    className="h-6 w-0.5 animate-pulse rounded-full"
                    style={{ backgroundColor: accentColor }}
                    aria-hidden="true"
                  />
                )
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <p className="h-4 text-xs text-muted-foreground" role="status" aria-live="polite">
        {status === "success"
          ? "인증되었습니다"
          : status === "error"
            ? "코드가 일치하지 않습니다"
            : correctCode
              ? `데모 코드: ${correctCode}`
              : " "}
      </p>
    </div>
  );
}
