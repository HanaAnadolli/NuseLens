// components/brand-logo.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center text-lg font-semibold tracking-normal text-foreground", className)}
    >
      NuseLens
    </Link>
  );
}
