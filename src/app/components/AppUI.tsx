import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Screen({
  children,
  className,
  wide = false,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={cn("app-screen", wide && "max-w-none", className)}>
      {children}
    </div>
  );
}

export function ScreenTitle({
  kicker,
  title,
  subtitle,
  action,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        {kicker && <p className="app-kicker">{kicker}</p>}
        <h1 className="app-title">{title}</h1>
        {subtitle && <p className="app-sub">{subtitle}</p>}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function AppButton({
  children,
  className,
  variant = "primary",
  block = false,
  type = "button",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "gold" | "whatsapp" | "danger";
  block?: boolean;
}) {
  return (
    <button
      type={type}
      className={cn("app-btn", `app-btn-${variant}`, block && "w-full", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function AppLink({
  to,
  children,
  className,
  variant = "primary",
  block = false,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "ghost" | "gold" | "whatsapp";
  block?: boolean;
}) {
  return (
    <Link to={to} className={cn("app-btn", `app-btn-${variant}`, block && "w-full", className)}>
      {children}
    </Link>
  );
}

export function IconButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cn("app-icon-btn", className)} {...rest}>
      {children}
    </button>
  );
}

export function IconLink({
  to,
  children,
  className,
  "aria-label": ariaLabel,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  "aria-label": string;
}) {
  return (
    <Link to={to} aria-label={ariaLabel} className={cn("app-icon-btn", className)}>
      {children}
    </Link>
  );
}

export function BackLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="app-back">
      {children}
    </Link>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="app-field">
      {label}
      {children}
    </label>
  );
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={cn("app-chip", active && "app-chip-active")}>
      {children}
    </button>
  );
}

export function HScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("app-hscroll", className)}>{children}</div>;
}

export function ButtonRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("app-btn-row", className)}>{children}</div>;
}
