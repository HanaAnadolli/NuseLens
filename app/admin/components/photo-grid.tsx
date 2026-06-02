// app/admin/components/photo-grid.tsx
"use client";

import { useState } from "react";
import { deletePhotoById } from "@/features/photos/hooks";
import type { PhotoDto } from "@/features/photos/types";
import { PhotoCard } from "./photo-card";

interface PhotoGridProps {
  initialPhotos: PhotoDto[];
}

export function PhotoGrid({ initialPhotos }: PhotoGridProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(id: string): Promise<void> {
    const confirmed = window.confirm("Ta fshijmë këtë foto?");

    if (!confirmed) {
      return;
    }

    setError("");
    setDeletingId(id);

    try {
      await deletePhotoById(id);
      setPhotos((currentPhotos) => currentPhotos.filter((photo) => photo.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fotoja nuk u fshi dot. Ju lutemi provoni përsëri.");
    } finally {
      setDeletingId(null);
    }
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-card border border-border bg-cream px-6 py-16 text-center">
        <p className="font-serif text-2xl font-semibold text-foreground">Ende nuk ka foto të ngarkuara.</p>
        <p className="mt-2 text-sm text-muted-foreground">Fotot e mysafirëve do të shfaqen këtu pas ngarkimit të parë.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-2xl border border-border bg-pink px-4 py-3 text-sm text-pink-foreground">{error}</p>
      ) : null}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isDeleting={deletingId === photo.id}
            onDelete={() => handleDelete(photo.id)}
          />
        ))}
      </div>
    </div>
  );
}
