// app/admin/guest/[name]/delete-folder-button.tsx
"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deletePhotosByGuest } from "@/features/photos/hooks";

interface DeleteFolderButtonProps {
  slug: string;
  guestName: string;
}

export function DeleteFolderButton({ slug, guestName }: DeleteFolderButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleClick(): Promise<void> {
    const confirmed = window.confirm(
      `Të fshijmë të gjithë dosjen e mysafirit "${guestName}"?\n\nKy veprim do të heqë të gjitha fotot dhe videot e tij dhe nuk mund të zhbëhet.`
    );
    if (!confirmed) return;

    setError("");
    setBusy(true);

    try {
      await deletePhotosByGuest(slug);
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Dosja nuk u fshi dot. Ju lutemi provoni përsëri.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="danger" size="sm" onClick={handleClick} disabled={busy}>
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        )}
        Fshi dosjen
      </Button>
      {error ? (
        <p className="text-xs text-danger" role="alert">{error}</p>
      ) : null}
    </div>
  );
}
