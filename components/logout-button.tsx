// components/logout-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitLogout } from "@/features/auth/hooks";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout(): Promise<void> {
    setIsPending(true);

    try {
      await submitLogout();
      router.push("/login");
      router.refresh();
    } catch {
      setIsPending(false);
    }
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={handleLogout} disabled={isPending}>
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Dil
    </Button>
  );
}
