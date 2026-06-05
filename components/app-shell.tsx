// components/app-shell.tsx
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";

interface AppShellProps {
  children: ReactNode;
  actions?: ReactNode;
}

export function AppShell({ children, actions }: AppShellProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <BrandLogo />
          {actions ? <nav className="flex items-center gap-2">{actions}</nav> : null}
        </div>
      </header>
      {children}
    </main>
  );
}
