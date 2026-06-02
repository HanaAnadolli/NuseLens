// app/settings/error.tsx
"use client";

import { Button } from "@/components/ui/button";

interface SettingsErrorProps {
  reset: () => void;
}

export default function SettingsError({ reset }: SettingsErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-card border border-border bg-surface p-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Cilësimet nuk janë të disponueshme</h1>
        <p className="mt-3 text-sm text-muted-foreground">Ju lutemi provoni t’i hapni cilësimet përsëri.</p>
        <Button type="button" className="mt-6" onClick={reset}>
          Provo përsëri
        </Button>
      </section>
    </main>
  );
}
