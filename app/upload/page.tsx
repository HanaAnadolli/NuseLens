// app/upload/page.tsx
export const dynamic = "force-static";

import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import { getMaxFilesPerUpload } from "@/features/photos/service";
import { PhotoUploadForm } from "./components/photo-upload-form";

export default function UploadPage() {
  const maxUploadSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 8);
  const maxFilesPerUpload = getMaxFilesPerUpload();

  return (
    <AppShell>
      <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
        <Image
          src="/home/flower3.png"
          alt=""
          width={480}
          height={260}
          aria-hidden="true"
          priority
          className="pointer-events-none absolute -left-10 -top-2 w-40 -rotate-12 opacity-60 animate-fade-in sm:-left-16 sm:-top-6 sm:w-64 sm:opacity-70"
        />
        <Image
          src="/home/flower1.png"
          alt=""
          width={420}
          height={260}
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 top-32 hidden w-48 rotate-12 opacity-60 lg:block"
        />

        <div className="mx-auto grid w-full max-w-6xl items-start gap-10 md:grid-cols-[0.95fr_1.05fr] md:gap-14">
          <div className="space-y-6 sm:space-y-7">
            <h1 className="font-serif text-4xl font-semibold leading-[1.08] text-foreground sm:text-5xl md:text-6xl animate-fade-up">
              Ndani{" "}
              <span className="font-script text-[1.15em] font-normal text-primary">
                momentet
              </span>
              <br />e kësaj mbrëmjeje
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8 animate-fade-up [animation-delay:260ms]">
              Ngarkoni fotot që keni bërë dhe na ndihmoni t&apos;i mbledhim kujtimet në një vend të vetëm.
            </p>
            <p className="font-serif text-sm italic text-muted-foreground animate-fade-up [animation-delay:380ms]">
              Video deri në 5 minuta. Foto e video pa kufi numri.
            </p>
          </div>

          <div className="animate-fade-up [animation-delay:200ms]">
            <PhotoUploadForm maxUploadSizeMb={maxUploadSizeMb} maxFilesPerUpload={maxFilesPerUpload} />
          </div>
        </div>
      </section>
    </AppShell>
  );
}
