// components/app-shell.tsx
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Heart } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
  actions?: ReactNode;
}

export function AppShell({ children, actions }: AppShellProps) {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-pink text-muted-foreground" aria-hidden="true" />
            <BrandLogo className="font-serif text-xl font-semibold text-muted-foreground" />
          </div>
          {actions ? <nav className="flex items-center gap-2">{actions}</nav> : null}
        </div>
      </header>
      {children}
    </main>
  );
}
