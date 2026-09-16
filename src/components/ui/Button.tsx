import * as React from "react";
import { NavLink } from "react-router-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-wide transition-all duration-300 focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-saffron via-saffron-deep to-gold-deep text-[#1a0a04] shadow-[0_10px_30px_-10px_rgba(240,132,46,0.6)] hover:shadow-[0_14px_40px_-8px_rgba(240,132,46,0.75)] hover:-translate-y-0.5",
        gold: "border border-gold/60 bg-gold/5 text-gold-light hover:bg-gold/15 hover:border-gold hover:-translate-y-0.5",
        outline:
          "border border-gold/30 text-ink hover:border-gold/70 hover:bg-[#b67a1b]/10",
        ghost: "text-muted hover:text-ink hover:bg-[#b67a1b]/10",
        whatsapp:
          "bg-[#25D366] text-[#052e16] font-semibold hover:brightness-105 hover:-translate-y-0.5 shadow-[0_10px_30px_-10px_rgba(37,211,102,0.6)]",
        purple:
          "bg-gradient-to-r from-purple-700 to-purple-500 text-ink hover:brightness-110 hover:-translate-y-0.5 shadow-[var(--shadow-glow-purple)]",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base py-3.5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type BaseProps = VariantProps<typeof buttonVariants> & {
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
    external?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const classes = cn(buttonVariants({ variant: props.variant, size: props.size }), props.className);

  if (props.href !== undefined) {
    // Pull out consumed props so they are NOT spread onto the DOM element
    const { href, external, variant, size, className, children, ...rest } = props;
    const isExternal =
      external ||
      href.startsWith("http") ||
      href.startsWith("tel:") ||
      href.startsWith("mailto:");
    if (isExternal) {
      return (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          {...rest}
          className={classes}
        >
          {children}
        </a>
      );
    }
    return (
      <NavLink
        to={href}
        {...rest}
        className={({ isActive }) =>
          cn(classes, isActive && "pointer-events-none opacity-80")
        }
      >
        {children}
      </NavLink>
    );
  }

  const { variant, size, className, children, ...rest } = props;
  return (
    <button {...rest} className={classes}>
      {children}
    </button>
  );
}

export { buttonVariants };
