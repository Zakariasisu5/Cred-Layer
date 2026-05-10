import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glow-card rounded-xl ${className}`}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between p-5 pb-3 gap-3">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "primary";
}) {
  const styles: Record<string, string> = {
    default: "bg-muted text-muted-foreground border-border",
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-warning/15 text-warning border-warning/30",
    danger: "bg-danger/15 text-danger border-danger/30",
    primary: "bg-primary/15 text-primary border-primary/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  delta,
  deltaType = "up",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaType?: "up" | "down";
}) {
  return (
    <div className="p-5">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {delta && (
          <span
            className={`text-xs font-medium ${deltaType === "up" ? "text-success" : "text-danger"}`}
          >
            {deltaType === "up" ? "▲" : "▼"} {delta}
          </span>
        )}
      </div>
    </div>
  );
}

type Variant = "primary" | "outline" | "ghost";
interface CredButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}
export const CredButton = forwardRef<HTMLButtonElement, CredButtonProps>(
  (
    { variant = "primary", size = "md", loading, className = "", disabled, children, ...rest },
    ref,
  ) => {
    const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-11 px-5 text-sm" };
    const variants: Record<Variant, string> = {
      primary: "btn-primary btn-primary-hover font-medium",
      outline: "border border-border bg-card hover:bg-accent text-foreground",
      ghost: "hover:bg-accent text-foreground",
    };
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
        {...rest}
      >
        {loading && (
          <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {children}
      </button>
    );
  },
);
CredButton.displayName = "CredButton";
