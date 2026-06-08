// app/admin/components/guest-folder.tsx
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import type { PhotoDto } from "@/features/photos/types";
import { cn } from "@/lib/utils";
import { ANON_SLUG, encodeGuestSlug } from "./guest-slug";

function isVideo(photo: PhotoDto): boolean {
  return photo.mimeType.startsWith("video/");
}

interface GuestFolderProps {
  guestName: string;
  isAnonymous: boolean;
  photos: PhotoDto[];
}

const dateFormatter = new Intl.DateTimeFormat("sq-AL", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function GuestFolder({ guestName, isAnonymous, photos }: GuestFolderProps) {
  const latest = photos[0];
  const slug = isAnonymous ? ANON_SLUG : encodeGuestSlug(guestName);

  return (
    <Link
      href={`/admin/guest/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[5/4] w-full overflow-hidden bg-surface-soft">
        {photos.slice(0, 3).map((photo, index) => {
          const layout = cn(
            "absolute h-[78%] w-[60%] rounded-2xl border-4 border-surface object-cover shadow-md transition-transform duration-500",
            index === 0 && "left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rotate-[-3deg] group-hover:rotate-[-6deg]",
            index === 1 && "left-[18%] top-[16%] z-20 rotate-[-9deg] group-hover:-translate-x-1",
            index === 2 && "right-[14%] top-[20%] z-10 rotate-[8deg] group-hover:translate-x-1"
          );
          if (isVideo(photo)) {
            return (
              <div key={photo.id} className={cn(layout, "overflow-hidden p-0")}>
                <video
                  src={photo.fileUrl}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-foreground/15">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 shadow-sm">
                    <Play className="h-3 w-3 text-primary" aria-hidden="true" />
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div key={photo.id} className={cn(layout, "overflow-hidden p-0")}>
              <Image
                src={photo.fileUrl}
                alt=""
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 border-t border-border bg-surface p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-serif text-xl font-semibold text-foreground">{guestName}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {photos.length} {photos.length === 1 ? "foto" : "foto"}
            {latest ? ` · ${dateFormatter.format(new Date(latest.createdAt))}` : ""}
          </p>
        </div>
        <ChevronRight
          className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
