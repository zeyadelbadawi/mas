import type { ReactNode } from "react";
import { cn } from "./cn";

export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="rounded-control bg-accent text-accent-fg sr-only fixed start-4 top-4 z-[100] px-4 py-2 focus:not-sr-only"
    >
      {label}
    </a>
  );
}

export type NavItem = { href: string; label: string };

type SiteHeaderProps = {
  logo: ReactNode;
  nav?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function SiteHeader({ logo, nav, actions, className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "border-line/60 bg-bg/85 supports-[backdrop-filter]:bg-bg/70 sticky top-0 z-50 border-b backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <div className="shrink-0">{logo}</div>
        {nav ? <nav className="hidden flex-1 md:block">{nav}</nav> : <div className="flex-1" />}
        <div className="flex items-center gap-2">{actions}</div>
      </div>
    </header>
  );
}

type SiteFooterProps = {
  brandLine: ReactNode;
  links: ReactNode;
  legal: ReactNode;
  className?: string;
};

export function SiteFooter({ brandLine, links, legal, className }: SiteFooterProps) {
  return (
    <footer className={cn("border-line bg-bg border-t", className)}>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[2fr_3fr] lg:px-8">
        <div className="text-muted">{brandLine}</div>
        <div className="flex flex-wrap items-start gap-x-6 gap-y-3 text-sm md:justify-end">
          {links}
        </div>
      </div>
      <div className="border-line/60 text-muted mx-auto max-w-7xl border-t px-4 py-5 text-xs sm:px-6 lg:px-8">
        {legal}
      </div>
    </footer>
  );
}

/** Marks content that is dummy until the client provides real data (CLAUDE.md rule 5). */
export function PlaceholderBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "border-slot-fg/50 text-slot-fg inline-flex items-center rounded-full border border-dashed px-2 py-0.5 font-mono text-[11px] tracking-wide uppercase rtl:font-sans rtl:tracking-normal",
        className,
      )}
    >
      {label}
    </span>
  );
}
