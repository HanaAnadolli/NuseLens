// app/admin/components/guest-folder.tsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { PhotoDto } from "@/features/photos/types";
import { cn } from "@/lib/utils";
import { ANON_SLUG, encodeGuestSlug } from "./guest-slug";

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
        {photos.slice(0, 3).map((photo, index) => (
          <img
            key={photo.id}
            src={photo.fileUrl}
            alt=""
            loading="lazy"
            className={cn(
              "absolute h-[78%] w-[60%] rounded-2xl border-4 border-surface object-cover shadow-md transition-transform duration-500",
              index === 0 && "left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rotate-[-3deg] group-hover:rotate-[-6deg]",
              index === 1 && "left-[18%] top-[16%] z-20 rotate-[-9deg] group-hover:-translate-x-1",
              index === 2 && "right-[14%] top-[20%] z-10 rotate-[8deg] group-hover:translate-x-1"
            )}
          />
        ))}
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
