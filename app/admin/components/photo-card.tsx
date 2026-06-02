// app/admin/components/photo-card.tsx
"use client";

import Link from "next/link";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PhotoDto } from "@/features/photos/types";

interface PhotoCardProps {
  photo: PhotoDto;
  isDeleting: boolean;
  onDelete: () => void;
}

export function PhotoCard({ photo, isDeleting, onDelete }: PhotoCardProps) {
  const formattedDate = new Intl.DateTimeFormat("sq-AL", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(photo.createdAt));

  return (
    <Card className="overflow-hidden bg-surface shadow-sm">
      <div className="bg-cream">
        <img src={photo.fileUrl} alt={photo.originalName} className="aspect-square w-full object-cover" />
      </div>
      <CardContent className="space-y-4 p-5">
        <div className="space-y-1">
          <h2 className="truncate font-serif text-xl font-semibold text-foreground">{photo.guestName || "Mysafir anonim"}</h2>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
          <p className="truncate text-xs text-muted-foreground" title={photo.originalName}>
            {photo.originalName}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href={photo.fileUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Hape
            </Link>
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={onDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
            Fshi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
