// app/upload/components/photo-upload-form.tsx
"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhotoUploadFormProps {
  maxUploadSizeMb: number;
  maxFilesPerUpload: number;
}

interface PreviewFile {
  id: string;
  file: File;
  url: string;
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export function PhotoUploadForm({ maxUploadSizeMb, maxFilesPerUpload }: PhotoUploadFormProps) {
  const [guestName, setGuestName] = useState("");
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const maxUploadSizeBytes = useMemo(() => maxUploadSizeMb * 1024 * 1024, [maxUploadSizeMb]);

  useEffect(() => {
    return () => {
      for (const preview of files) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [files]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const selectedFiles = Array.from(event.target.files ?? []);
    setError("");
    setSuccess(false);

    if (selectedFiles.length === 0) {
      replaceFiles([]);
      return;
    }

    if (selectedFiles.length > maxFilesPerUpload) {
      replaceFiles([]);
      setError(`Ju lutemi zgjidhni jo më shumë se ${maxFilesPerUpload} foto.`);
      event.target.value = "";
      return;
    }

    const invalidType = selectedFiles.find((file) => !ACCEPTED_IMAGE_TYPES.includes(file.type));

    if (invalidType) {
      replaceFiles([]);
      setError("Ju lutemi ngarkoni vetëm foto JPEG, PNG, WebP, HEIC ose HEIF.");
      event.target.value = "";
      return;
    }

    const oversized = selectedFiles.find((file) => file.size > maxUploadSizeBytes);

    if (oversized) {
      replaceFiles([]);
      setError(`Çdo foto duhet të jetë ${maxUploadSizeMb}MB ose më e vogël.`);
      event.target.value = "";
      return;
    }

    replaceFiles(
      selectedFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        url: URL.createObjectURL(file),
      }))
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (files.length === 0) {
      setError("Ju lutemi zgjidhni të paktën një foto.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("guestName", guestName);

      for (const preview of files) {
        formData.append("photos", preview.file);
      }

      const response = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });
      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? "Fotot nuk u ngarkuan dot.");
      }

      replaceFiles([]);
      setGuestName("");
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fotot nuk u ngarkuan dot. Ju lutemi provoni përsëri.");
    } finally {
      setIsUploading(false);
    }
  }

  function removeFile(id: string): void {
    setSuccess(false);
    setFiles((currentFiles) => {
      const fileToRemove = currentFiles.find((file) => file.id === id);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.url);
      return currentFiles.filter((file) => file.id !== id);
    });
  }

  function replaceFiles(nextFiles: PreviewFile[]): void {
    setFiles((currentFiles) => {
      for (const preview of currentFiles) {
        URL.revokeObjectURL(preview.url);
      }
      return nextFiles;
    });
  }

  const selectedLabel = files.length === 1 ? "1 foto e zgjedhur" : `${files.length} foto të zgjedhura`;

  return (
    <Card className="bg-surface shadow-sm">
      <CardContent className="p-5 sm:p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="guestName">Emri juaj</Label>
            <Input
              id="guestName"
              name="guestName"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              placeholder="Opsionale"
              autoComplete="name"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="photos">Fotot</Label>
            <label
              htmlFor="photos"
              className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-card border border-dashed border-border bg-cream px-4 py-8 text-center transition-colors hover:bg-surface-soft"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface">
                <ImagePlus className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              </span>
              <span className="mt-4 text-base font-medium text-foreground">Zgjidhni fotot</span>
              <span className="mt-1 text-xs text-muted-foreground">
                Deri në {maxFilesPerUpload} foto, {maxUploadSizeMb}MB secila
              </span>
            </label>
            <Input
              id="photos"
              name="photos"
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              multiple
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>

          {files.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">{selectedLabel}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {files.map((preview) => (
                  <div key={preview.id} className="relative overflow-hidden rounded-2xl border border-border bg-cream">
                    <img src={preview.url} alt={preview.file.name} className="aspect-square w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(preview.id)}
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-button bg-primary text-primary-foreground"
                      aria-label={`Hiq ${preview.file.name}`}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-border bg-pink px-4 py-3 text-sm text-pink-foreground">{error}</p>
          ) : null}

          {success ? (
            <p className="rounded-2xl border border-border bg-sage px-4 py-3 text-sm font-medium text-sage-foreground">
              Faleminderit! Fotot tuaja u ngarkuan me sukses.
            </p>
          ) : null}

          <Button type="submit" className="h-14 w-full text-base" disabled={isUploading || files.length === 0}>
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Ngarko fotot
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
