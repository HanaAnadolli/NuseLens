// app/admin/components/photo-grid.tsx
"use client";

import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { deletePhotoById } from "@/features/photos/hooks";
import type { PhotoDto } from "@/features/photos/types";
import { GuestFolder } from "./guest-folder";

interface PhotoGridProps {
  initialPhotos: PhotoDto[];
}

const ANON_LABEL = "Mysafirë anonimë";

export function PhotoGrid({ initialPhotos }: PhotoGridProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [expandAllVersion, setExpandAllVersion] = useState(0);
  const [allOpen, setAllOpen] = useState(false);

  const groups = useMemo(() => groupByGuest(photos), [photos]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => g.guestName.toLowerCase().includes(q));
  }, [groups, query]);

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm("Ta fshijmë këtë foto?")) return;

    setError("");
    setDeletingId(id);

    try {
      await deletePhotoById(id);
      setPhotos((current) => current.filter((photo) => photo.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fotoja nuk u fshi dot. Ju lutemi provoni përsëri.");
    } finally {
      setDeletingId(null);
    }
  }

  function toggleAll(): void {
    setAllOpen((value) => !value);
    setExpandAllVersion((v) => v + 1);
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-card border border-border bg-cream px-6 py-16 text-center">
        <p className="font-serif text-2xl font-semibold text-foreground">Ende nuk ka foto të ngarkuara.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Fotot e mysafirëve do të shfaqen këtu pas ngarkimit të parë.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kërkoni një mysafir..."
            className="h-11 pl-9"
          />
        </div>
        <button
          type="button"
          onClick={toggleAll}
          className="inline-flex items-center gap-1.5 self-start rounded-button border border-border bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface-soft sm:self-auto"
        >
          {allOpen ? (
            <>
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
              Mbylli të gjitha
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
              Hapi të gjitha
            </>
          )}
        </button>
      </div>

      {error ? (
        <p className="rounded-2xl border border-border bg-pink px-4 py-3 text-sm text-pink-foreground">
          {error}
        </p>
      ) : null}

      {filteredGroups.length === 0 ? (
        <div className="rounded-card border border-border bg-cream px-6 py-12 text-center">
          <p className="font-serif text-lg text-foreground">Asnjë mysafir nuk përputhet me kërkimin.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGroups.map((group) => (
            <GuestFolder
              key={`${group.guestName}-${expandAllVersion}`}
              guestName={group.guestName}
              photos={group.photos}
              deletingId={deletingId}
              onDelete={handleDelete}
              defaultOpen={allOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function groupByGuest(photos: PhotoDto[]): Array<{ guestName: string; photos: PhotoDto[] }> {
  const map = new Map<string, PhotoDto[]>();
  for (const photo of photos) {
    const key = photo.guestName?.trim() || ANON_LABEL;
    const arr = map.get(key) ?? [];
    arr.push(photo);
    map.set(key, arr);
  }

  return Array.from(map.entries())
    .map(([guestName, list]) => ({
      guestName,
      photos: list.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    }))
    .sort(
      (a, b) =>
        new Date(b.photos[0]!.createdAt).getTime() - new Date(a.photos[0]!.createdAt).getTime()
    );
}
