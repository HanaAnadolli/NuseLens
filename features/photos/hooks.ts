// features/photos/hooks.ts
"use client";

import type { PhotoDto } from "@/features/photos/types";

interface PhotosResponse {
  data?: {
    photos: PhotoDto[];
  };
  error?: string;
}

export async function fetchPhotos(): Promise<PhotoDto[]> {
  try {
    const response = await fetch("/api/photos", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const body = (await response.json()) as PhotosResponse;

    if (!response.ok) {
      throw new Error(body.error ?? "Fotot nuk u ngarkuan dot.");
    }

    return body.data?.photos ?? [];
  } catch {
    throw new Error("Fotot nuk u ngarkuan dot. Ju lutemi provoni përsëri.");
  }
}

export async function deletePhotoById(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/photos/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      throw new Error(body.error ?? "Fotoja nuk u fshi dot.");
    }
  } catch {
    throw new Error("Fotoja nuk u fshi dot. Ju lutemi provoni përsëri.");
  }
}
