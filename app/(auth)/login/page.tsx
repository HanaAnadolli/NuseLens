// app/(auth)/login/page.tsx
import Link from "next/link";
import { Heart } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./login-form";

interface LoginPageProps {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl ?? "/admin";

  return (
    <AppShell
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link href="/upload">Ngarko</Link>
        </Button>
      }
    >
      <section className="mx-auto grid min-h-[calc(100vh-81px)] w-full max-w-5xl items-center gap-10 px-4 py-10 sm:px-6 md:grid-cols-[0.9fr_1fr]">
        <div className="hidden rounded-card border border-border bg-cream p-8 shadow-sm md:block">
          <Heart className="mb-5 h-10 w-10 fill-pink text-muted-foreground" aria-hidden="true" />
          <h1 className="font-serif text-4xl font-semibold tracking-normal text-foreground">Mirë se u kthyet</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Hyni për të hapur galerinë private të familjes dhe për të menaxhuar kujtimet e ndara nga festa.
          </p>
        </div>
        <div>
          <div className="mb-6">
            <h1 className="font-serif text-4xl font-semibold tracking-normal text-foreground">Hyr</h1>
            <p className="mt-2 text-sm text-muted-foreground">Hyni në galerinë private të NuseLens.</p>
          </div>
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </section>
    </AppShell>
  );
}
