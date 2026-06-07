// app/admin/guest/[name]/photo-list.tsx
"use client";

import { Download, Loader2, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { deletePhotoById } from "@/features/photos/hooks";
import type { PhotoDto } from "@/features/photos/types";
import { PhotoLightbox } from "./photo-lightbox";

interface PhotoListProps {
  initialPhotos: PhotoDto[];
}

function isVideo(photo: PhotoDto): boolean {
  return photo.mimeType.startsWith("video/");
}

export function PhotoList({ initialPhotos }: PhotoListProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm("Ta fshijmë këtë skedar?")) return;

    setError("");
    setDeletingId(id);

    try {
      await deletePhotoById(id);
      setPhotos((current) => current.filter((photo) => photo.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Skedari nuk u fshi dot. Ju lutemi provoni përsëri.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDownload(photo: PhotoDto): Promise<void> {
    setError("");
    setDownloadingId(photo.id);

    try {
      const response = await fetch(photo.fileUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = photo.originalName || "media";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(photo.fileUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloadingId(null);
    }
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-card border border-border bg-cream px-6 py-16 text-center">
        <p className="font-serif text-2xl font-semibold text-foreground">Asnjë skedar.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Ky mysafir nuk ka më skedarë në galeri.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-2xl border border-border bg-pink px-4 py-3 text-sm text-pink-foreground">
          {error}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, idx) => {
          const isDownloading = downloadingId === photo.id;
          const isDeleting = deletingId === photo.id;
          const video = isVideo(photo);

          return (
            <div
              key={photo.id}
              className="group/tile relative aspect-square overflow-hidden rounded-2xl border border-border bg-cream shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="block h-full w-full"
                aria-label={`Hape ${photo.originalName}`}
              >
                {video ? (
                  <>
                    <video
                      src={photo.fileUrl}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover/tile:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-foreground/15">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface/90 shadow-md backdrop-blur-sm">
                        <Play className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                    </div>
                  </>
                ) : (
                  <img
                    src={photo.fileUrl}
                    alt={photo.originalName}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/tile:scale-105"
                  />
                )}
              </button>
              <div className="absolute right-2 top-2 z-10 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDownload(photo)}
                  disabled={isDownloading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-button bg-surface/95 text-foreground shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                  aria-label={`Shkarko ${photo.originalName}`}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Download className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  disabled={isDeleting}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-button bg-surface/95 text-foreground shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-danger hover:text-danger-foreground disabled:opacity-50"
                  aria-label={`Fshi ${photo.originalName}`}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {lightboxIndex !== null ? (
        <PhotoLightbox
          photos={photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onDownload={handleDownload}
          downloadingId={downloadingId}
        />
      ) : null}
    </div>
  );
}
