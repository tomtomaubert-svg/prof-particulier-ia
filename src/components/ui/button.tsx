import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export type Variant = "primary" | "secondary" | "ghost" | "outline";
export type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover shadow-md",
  secondary: "bg-surface-raised text-text-primary hover:opacity-90 border border-border",
  ghost: "bg-transparent text-text-primary hover:bg-surface-raised",
  outline: "bg-transparent border border-border text-text-primary hover:bg-surface-raised",
};

export const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-[var(--radius-sm)]",
  md: "h-11 px-5 text-sm rounded-[var(--radius-md)]",
  lg: "h-12 px-6 text-base rounded-[var(--radius-md)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
