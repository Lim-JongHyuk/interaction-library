"use client";

// deps: motion
import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface FloatingLabelInputProps {
  label?: string;
  helperText?: string;
  required?: boolean;
  type?: "text" | "email" | "password";
}

export function FloatingLabelInput({
  label = "Email address",
  helperText = "We'll never share your email.",
  required = false,
  type = "text",
}: FloatingLabelInputProps) {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div className="flex w-full max-w-sm flex-col gap-1.5">
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          required={required}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="peer w-full rounded-lg border border-border bg-card px-3.5 pb-2 pt-5 text-sm outline-none transition-colors focus-visible:border-accent"
        />
        <motion.label
          htmlFor={id}
          initial={false}
          animate={{
            top: floated ? 7 : "50%",
            y: floated ? 0 : "-50%",
            scale: floated ? 0.82 : 1,
            color: focused ? "var(--accent)" : "var(--muted-foreground)",
          }}
          transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
          className="pointer-events-none absolute left-3.5 origin-left text-sm"
        >
          {label}
          {required && <span className="text-accent"> *</span>}
        </motion.label>
        <motion.span
          initial={false}
          animate={{ scaleX: focused ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-x-0 -bottom-px h-0.5 origin-left rounded-full bg-accent"
        />
      </div>
      {helperText && <p className="px-0.5 text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}
