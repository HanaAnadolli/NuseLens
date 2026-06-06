// app/admin/components/guest-folder.tsx
"use client";

import { ChevronDown, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import type { PhotoDto } from "@/features/photos/types";
import { cn } from "@/lib/utils";

interface GuestFolderProps {
  guestName: string;
  photos: PhotoDto[];
  deletingId: string | null;
  onDelete: (id: string) => void;
  defaultOpen?: boolean;
}

const dateFormatter = new Intl.DateTimeFormat("sq-AL", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function GuestFolder({ guestName, photos, deletingId, onDelete, defaultOpen = false }: GuestFolderProps) {
  const [open, setOpen] = useState(defaultOpen);
  const latest = photos[0];
  const remainder = photos.length - 1;

  return (
    <article className="overflow-hidden rounded-card border border-border bg-surface shadow-sm transition-all duration-300 hover:shadow-md">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
        aria-expanded={open}
      >
        <div className="relative h-16 w-20 shrink-0 sm:h-20 sm:w-24">
          {photos.slice(0, 3).map((photo, index) => (
            <img
              key={photo.id}
              src={photo.fileUrl}
              alt=""
              loading="lazy"
              className={cn(
                "absolute inset-0 h-full w-full rounded-2xl border-2 border-surface object-cover shadow-sm transition-transform",
                index === 0 && "z-30",
                index === 1 && "z-20 translate-x-2 rotate-3",
                index === 2 && "z-10 translate-x-4 -rotate-3"
              )}
            />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-serif text-xl font-semibold text-foreground sm:text-2xl">
            {guestName}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            {photos.length} {photos.length === 1 ? "foto" : "foto"}
            {latest ? ` · ${dateFormatter.format(new Date(latest.createdAt))}` : ""}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="border-t border-border bg-surface-soft/60 p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <PhotoTile
                key={photo.id}
                photo={photo}
                deleting={deletingId === photo.id}
                onDelete={() => onDelete(photo.id)}
              />
            ))}
          </div>
          {remainder < 0 ? <p className="mt-3 text-xs text-muted-foreground">Asnjë foto.</p> : null}
        </div>
      ) : null}
    </article>
  );
}

interface PhotoTileProps {
  photo: PhotoDto;
  deleting: boolean;
  onDelete: () => void;
}

function PhotoTile({ photo, deleting, onDelete }: PhotoTileProps) {
  return (
    <div className="group/tile relative aspect-square overflow-hidden rounded-2xl border border-border bg-cream shadow-sm transition-shadow duration-300 hover:shadow-md">
      <a
        href={photo.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="block h-full w-full"
        aria-label={`Hape ${photo.originalName}`}
      >
        <img
          src={photo.fileUrl}
          alt={photo.originalName}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover/tile:scale-105"
        />
      </a>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-button bg-surface/95 text-foreground shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-danger hover:text-danger-foreground disabled:opacity-50"
        aria-label={`Fshi ${photo.originalName}`}
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
