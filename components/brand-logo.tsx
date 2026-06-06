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
      className={cn(
        "inline-flex items-center font-script text-2xl leading-none tracking-wide text-foreground sm:text-3xl",
        className
      )}
    >
      Kanagjegji Blerines
    </Link>
  );
}
