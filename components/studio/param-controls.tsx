"use client";

import type { ParamDef } from "@/lib/spec";
import type { ParamValues } from "@/lib/codegen";
import { cn } from "@/lib/cn";

interface ParamControlsProps {
  params: ParamDef[];
  values: ParamValues;
  onChange: (key: string, value: string | number | boolean) => void;
  dense?: boolean;
}

export function ParamControls({ params, values, onChange, dense = false }: ParamControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      {params.map((param) => (
        <ParamControl key={param.key} param={param} value={values[param.key]} onChange={onChange} dense={dense} />
      ))}
    </div>
  );
}

function ParamControl({
  param,
  value,
  onChange,
  dense,
}: {
  param: ParamDef;
  value: string | number | boolean;
  onChange: (key: string, value: string | number | boolean) => void;
  dense: boolean;
}) {
  const inputId = `param-${param.key}`;

  return (
    <div className={cn("flex flex-col", dense ? "gap-2 border-b border-border pb-4 last:border-0" : "gap-1.5")}>
      <div className="flex items-center justify-between text-xs">
        <label htmlFor={inputId} className="font-medium text-foreground">
          {param.label}
        </label>
        {param.control === "slider" && (
          <span className="bg-muted px-2 py-1 tabular-nums text-muted-foreground">
            {value as number}
            {param.unit ?? ""}
          </span>
        )}
      </div>

      {param.control === "slider" && (
        <input
          id={inputId}
          type="range"
          min={param.min}
          max={param.max}
          step={param.step}
          value={value as number}
          onChange={(e) => onChange(param.key, Number(e.target.value))}
          className="w-full accent-accent"
        />
      )}

      {param.control === "number" && (
        <input
          id={inputId}
          type="number"
          min={param.min}
          max={param.max}
          value={value as number}
          onChange={(e) => onChange(param.key, Number(e.target.value))}
          className="border border-border bg-background px-2 py-1.5 text-sm"
        />
      )}

      {param.control === "select" && (
        <select
          id={inputId}
          value={value as string}
          onChange={(e) => onChange(param.key, e.target.value)}
          className="border border-border bg-background px-2 py-1.5 text-sm"
        >
          {param.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}

      {param.control === "color" && (
        <input
          id={inputId}
          type="color"
          value={value as string}
          onChange={(e) => onChange(param.key, e.target.value)}
          className="h-8 w-full border border-border bg-background"
        />
      )}

      {param.control === "toggle" && (
        <button
          id={inputId}
          type="button"
          role="switch"
          aria-checked={value as boolean}
          onClick={() => onChange(param.key, !(value as boolean))}
          className={cn(
            "relative h-7 w-full shrink-0 border transition-colors duration-200",
            value
              ? "border-accent bg-accent"
              : "border-border bg-background"
          )}
        >
          <span
            className={cn(
              "absolute top-1/2 size-4 -translate-y-1/2 rounded-full shadow-sm transition-[left,background-color] duration-200",
              value ? "left-[calc(100%-19px)] bg-accent-foreground" : "left-[3px] bg-muted-foreground"
            )}
          />
          <span className="sr-only">{param.label}</span>
        </button>
      )}

      {param.control === "text" && (
        <input
          id={inputId}
          type="text"
          value={value as string}
          onChange={(e) => onChange(param.key, e.target.value)}
          className="border border-border bg-background px-2 py-1.5 text-sm"
        />
      )}
    </div>
  );
}
