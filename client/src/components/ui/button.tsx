import * as React from "react";
import { cn } from "../../lib/utils";

type Variant = "default" | "secondary" | "ghost" | "destructive";
type Size = "default" | "sm" | "lg";

const variantClasses: Record<Variant, string> = {
  default: "bg-indigo-500 hover:bg-indigo-400 text-white",
  secondary: "bg-slate-700 hover:bg-slate-600 text-white",
  ghost: "hover:bg-slate-800 text-white",
  destructive: "bg-red-600 hover:bg-red-500 text-white",
};

const sizeClasses: Record<Size, string> = {
  default: "h-10 px-4 text-sm",
  sm: "h-9 px-3 text-sm",
  lg: "h-11 px-6 text-base",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
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

