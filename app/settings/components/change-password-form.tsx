// app/settings/components/change-password-form.tsx
"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitPasswordChange } from "@/features/auth/hooks";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await submitPasswordChange({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setSuccess("Fjalëkalimi u përditësua.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fjalëkalimi nuk u ndryshua dot. Ju lutemi provoni përsëri.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">Ndrysho fjalëkalimin</h2>
        <p className="mt-1 text-sm text-muted-foreground">Përditësoni fjalëkalimin që përdoret për hyrjen në administrim.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Fjalëkalimi aktual</Label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">Fjalëkalimi i ri</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      {error ? (
        <p className="rounded-2xl border border-border bg-pink px-4 py-3 text-sm text-pink-foreground">{error}</p>
      ) : null}
      {success ? (
        <p className="rounded-2xl border border-border bg-sage px-4 py-3 text-sm font-medium text-sage-foreground">{success}</p>
      ) : null}
      <Button type="submit" className="h-12" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        Ruaj fjalëkalimin
      </Button>
    </form>
  );
}
