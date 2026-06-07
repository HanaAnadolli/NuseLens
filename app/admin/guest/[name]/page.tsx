// app/admin/guest/[name]/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/features/auth/service";
import { getPhotosByGuest } from "@/features/photos/service";
import { ANON_LABEL, decodeGuestSlug } from "../../components/guest-slug";
import { DeleteFolderButton } from "./delete-folder-button";
import { PhotoList } from "./photo-list";

export const dynamic = "force-dynamic";

interface GuestPageProps {
  params: Promise<{ name: string }>;
}

const dateFormatter = new Intl.DateTimeFormat("sq-AL", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default async function GuestPage({ params }: GuestPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin");
  if (!user.isAdmin) redirect("/");

  const { name } = await params;
  const { isAnonymous, guestName } = decodeGuestSlug(name);
  const photos = await getPhotosByGuest(guestName);

  if (photos.length === 0) {
    notFound();
  }

  const displayName = isAnonymous ? ANON_LABEL : guestName ?? "";
  const latest = photos[0];

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
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kthehu te galeria
        </Link>

        <div className="mt-5 mb-8 rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-serif text-xs uppercase tracking-[0.32em] text-muted-foreground">
                Mysafir
              </p>
              <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
                {displayName}
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Ngarkimi i fundit: {dateFormatter.format(new Date(latest!.createdAt))}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-card border border-border bg-cream px-4 py-3">
                <ImageIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium text-foreground">
                  {photos.length} skedarë
                </p>
              </div>
              <DeleteFolderButton slug={name} guestName={displayName} />
            </div>
          </div>
        </div>

        <PhotoList initialPhotos={photos} />
      </section>
    </AppShell>
  );
}
