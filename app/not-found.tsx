// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-card border border-border bg-surface p-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Faqja nuk u gjet</h1>
        <p className="mt-3 text-sm text-muted-foreground">Faqja që hapët nuk është e disponueshme.</p>
        <Button asChild className="mt-6">
          <Link href="/">Kthehu në kryefaqe</Link>
        </Button>
      </section>
    </main>
  );
}
