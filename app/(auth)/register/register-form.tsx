// app/(auth)/register/register-form.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitRegister } from "@/features/auth/hooks";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await submitRegister({ name, email, password });
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Llogaria nuk u krijua dot. Ju lutemi provoni përsëri.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5 sm:p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Emri</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              placeholder="Opsionale"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Emaili</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Fjalëkalimi</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          {error ? (
            <p className="rounded-2xl border border-border bg-pink px-4 py-3 text-sm text-pink-foreground">{error}</p>
          ) : null}
          <Button type="submit" className="h-12 w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Krijo llogari
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Keni tashmë një llogari?{" "}
            <Link className="font-medium text-foreground underline underline-offset-4" href="/login">
              Hyr
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
