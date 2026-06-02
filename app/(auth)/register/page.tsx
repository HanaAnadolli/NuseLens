// app/(auth)/register/page.tsx
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <AppShell
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Hyr</Link>
        </Button>
      }
    >
      <section className="mx-auto grid min-h-[calc(100vh-81px)] w-full max-w-5xl items-center gap-10 px-4 py-10 sm:px-6 md:grid-cols-[0.9fr_1fr]">
        <div className="hidden rounded-card border border-border bg-lavender p-8 shadow-sm md:block">
          <Sparkles className="mb-5 h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <h1 className="font-serif text-4xl font-semibold tracking-normal text-foreground">Krijoni hapësirën tuaj të administrimit</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Llogaria e parë bëhet administratore e galerisë private NuseLens.
          </p>
        </div>
        <div>
          <div className="mb-6">
            <h1 className="font-serif text-4xl font-semibold tracking-normal text-foreground">Krijo llogari</h1>
            <p className="mt-2 text-sm text-muted-foreground">Llogaria e parë bëhet administratore e kësaj galerie.</p>
          </div>
          <RegisterForm />
        </div>
      </section>
    </AppShell>
  );
}
