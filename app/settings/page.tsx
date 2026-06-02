// app/settings/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/features/auth/service";
import { ChangePasswordForm } from "./components/change-password-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/settings");
  }

  return (
    <AppShell
      actions={
        <>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">Administrimi</Link>
          </Button>
          <LogoutButton />
        </>
      }
    >
      <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8 rounded-card border border-border bg-cream p-6 shadow-sm sm:p-8">
          <h1 className="font-serif text-4xl font-semibold tracking-normal text-foreground">Cilësimet</h1>
          <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-5 sm:p-8">
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
