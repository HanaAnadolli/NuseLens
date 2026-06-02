// app/(auth)/login/login-form.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitLogin } from "@/features/auth/hooks";

interface LoginFormProps {
  callbackUrl: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await submitLogin({ email, password });
      router.push(callbackUrl);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hyrja nuk u krye dot. Ju lutemi provoni përsëri.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5 sm:p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              required
            />
          </div>
          {error ? (
            <p className="rounded-2xl border border-border bg-pink px-4 py-3 text-sm text-pink-foreground">{error}</p>
          ) : null}
          <Button type="submit" className="h-12 w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Hyr
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Ju duhet një llogari?{" "}
            <Link className="font-medium text-foreground underline underline-offset-4" href="/register">
              Regjistrohu
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
