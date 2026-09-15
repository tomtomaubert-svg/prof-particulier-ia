import { HTMLAttributes } from "react";
import clsx from "clsx";

type Tone = "primary" | "success" | "warning" | "error" | "neutral";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  error: "bg-error-soft text-error",
  neutral: "bg-surface-raised text-text-secondary border border-border",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-full)] text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
