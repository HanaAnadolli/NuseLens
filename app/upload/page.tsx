// app/upload/page.tsx
import Link from "next/link";
import { Sparkles, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { getMaxFilesPerUpload } from "@/features/photos/service";
import { PhotoUploadForm } from "./components/photo-upload-form";

export default function UploadPage() {
  const maxUploadSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 8);
  const maxFilesPerUpload = getMaxFilesPerUpload();

  return (
    <AppShell
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin">Administrimi</Link>
        </Button>
      }
    >
      <section className="mx-auto grid min-h-[calc(100vh-81px)] w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-button border border-border bg-surface/70 px-4 py-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Ngarkimi i mysafirëve
          </div>
          <h1 className="font-serif text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-6xl">
            Ndani momentet e kësaj mbrëmjeje
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">
            Ngarkoni fotot që keni bërë dhe na ndihmoni t’i mbledhim kujtimet në një vend.
          </p>
          <div className="rounded-card border border-border bg-cream p-6 shadow-sm">
            <Upload className="mb-4 h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm leading-7 text-muted-foreground">
              Mund të dërgoni deri në {maxFilesPerUpload} foto njëherësh. Çdo foto mund të jetë deri në {maxUploadSizeMb}MB.
            </p>
          </div>
        </div>
        <PhotoUploadForm maxUploadSizeMb={maxUploadSizeMb} maxFilesPerUpload={maxFilesPerUpload} />
      </section>
    </AppShell>
  );
}
