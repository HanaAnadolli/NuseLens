// app/admin/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { Image as ImageIcon, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/service";
import { getPhotos } from "@/features/photos/service";
import { LogoutButton } from "@/components/logout-button";
import { PhotoGrid } from "./components/photo-grid";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!user.isAdmin) {
    redirect("/");
  }

  const photos = await getPhotos();

  return (
    <AppShell
      actions={
        <>
          <Button asChild variant="ghost" size="sm">
            <Link href="/upload">Ngarko</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/settings">Cilësimet</Link>
          </Button>
          <LogoutButton />
        </>
      }
    >
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-button border border-border bg-sage px-4 py-2 text-sm font-medium text-foreground">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Administrimi
              </div>
              <h1 className="font-serif text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
                Galeria e fotove
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                Shikoni fotot që mysafirët kanë ndarë nga festa e Blerines.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-card border border-border bg-cream px-4 py-3">
              <ImageIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">{photos.length} foto të ngarkuara</p>
            </div>
          </div>
        </div>
        <PhotoGrid initialPhotos={photos} />
      </section>
    </AppShell>
  );
}
