// app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import { Providers } from "./providers";
import "./global.css";

export const metadata: Metadata = {
  title: "Kanagjegji Blerines",
  description: "Ngarkim i thjeshtë fotosh për mysafirët dhe administratorët e eventit.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="sq">
      <body>
        <LoadingScreen />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
