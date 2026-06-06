// app/admin/components/folder-grid.tsx
"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type { PhotoDto } from "@/features/photos/types";
import { ANON_LABEL } from "./guest-slug";
import { GuestFolder } from "./guest-folder";

interface FolderGridProps {
  initialPhotos: PhotoDto[];
}

export function FolderGrid({ initialPhotos }: FolderGridProps) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => groupByGuest(initialPhotos), [initialPhotos]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => g.guestName.toLowerCase().includes(q));
  }, [groups, query]);

  if (initialPhotos.length === 0) {
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
    <div className="space-y-5">
      <div className="relative w-full sm:max-w-sm">
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

      {filteredGroups.length === 0 ? (
        <div className="rounded-card border border-border bg-cream px-6 py-12 text-center">
          <p className="font-serif text-lg text-foreground">Asnjë mysafir nuk përputhet me kërkimin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGroups.map((group) => (
            <GuestFolder
              key={group.guestName}
              guestName={group.guestName}
              isAnonymous={group.isAnonymous}
              photos={group.photos}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function groupByGuest(
  photos: PhotoDto[]
): Array<{ guestName: string; isAnonymous: boolean; photos: PhotoDto[] }> {
  const map = new Map<string, { guestName: string; isAnonymous: boolean; photos: PhotoDto[] }>();

  for (const photo of photos) {
    const trimmed = photo.guestName?.trim() ?? "";
    const isAnon = trimmed.length === 0;
    const key = isAnon ? "__anon__" : trimmed;
    let group = map.get(key);
    if (!group) {
      group = { guestName: isAnon ? ANON_LABEL : trimmed, isAnonymous: isAnon, photos: [] };
      map.set(key, group);
    }
    group.photos.push(photo);
  }

  for (const group of map.values()) {
    group.photos.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.photos[0]!.createdAt).getTime() - new Date(a.photos[0]!.createdAt).getTime()
  );
}
