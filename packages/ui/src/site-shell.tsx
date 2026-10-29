import type { ReactNode } from "react";
import { cn } from "./cn";

export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="sr-only fixed start-4 top-4 z-[100] rounded-control bg-accent px-4 py-2 text-accent-fg focus:not-sr-only"
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
        "sticky top-0 z-50 border-b border-line/60 bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70",
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
    <footer className={cn("border-t border-line bg-bg", className)}>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[2fr_3fr] lg:px-8">
        <div className="text-muted">{brandLine}</div>
        <div className="flex flex-wrap items-start gap-x-6 gap-y-3 text-sm md:justify-end">{links}</div>
      </div>
      <div className="mx-auto max-w-7xl border-t border-line/60 px-4 py-5 text-xs text-muted sm:px-6 lg:px-8">{legal}</div>
    </footer>
  );
}

/** Marks content that is dummy until the client provides real data (CLAUDE.md rule 5). */
export function PlaceholderBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-dashed border-slot-fg/50 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-slot-fg",
        className,
      )}
    >
      {label}
    </span>
  );
}
