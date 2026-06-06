// app/page.tsx
export const dynamic = "force-static";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";

const steps = [
  {
    number: "I",
    title: "Bëni foto",
    description: "Kapni momentet tuaja të preferuara gjatë mbrëmjes me telefonin tuaj.",
  },
  {
    number: "II",
    title: "Ngarkojini",
    description: "Prekni butonin e ngarkimit dhe zgjidhni fotot që dëshironi të ndani.",
  },
  {
    number: "III",
    title: "Dërgoni kujtimet",
    description: "Fotot tuaja do të shtohen në koleksionin tonë privat të familjes.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <BrandLogo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <Link className="transition-colors hover:text-foreground" href="/">
              Kryefaqja
            </Link>
            <Link className="transition-colors hover:text-foreground" href="/admin">
              Galeria
            </Link>
            <Link className="transition-colors hover:text-foreground" href="#how-it-works">
              Si funksionon
            </Link>
          </nav>
          <Button asChild className="shrink-0 shadow-sm">
            <Link href="/upload">
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Ngarko fotot</span>
              <span className="sm:hidden">Ngarko</span>
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
        <Image
          src="/home/flower3.png"
          alt=""
          width={480}
          height={260}
          aria-hidden="true"
          className="pointer-events-none absolute -left-12 -top-2 w-44 -rotate-12 opacity-60 animate-fade-in sm:-left-16 sm:-top-6 sm:w-72 sm:opacity-70"
          priority
        />
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.05fr_1fr] md:gap-16">
          <div className="space-y-6 sm:space-y-7">
            <p className="font-serif text-xs uppercase tracking-[0.32em] text-muted-foreground animate-fade-up">
              Kanagjegj &middot; 6 qershor 2026
            </p>
            <h1 className="font-serif text-4xl font-semibold leading-[1.08] text-foreground sm:text-5xl md:text-6xl animate-fade-up [animation-delay:120ms]">
              Mirë se erdhët në
              <br />
              <span className="font-script text-[1.15em] font-normal text-primary">
                kanagjegjin
              </span>{" "}
              e Blerines
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8 animate-fade-up [animation-delay:260ms]">
              Na ndihmoni të mbledhim momentet e veçanta të kësaj mbrëmjeje — fotot tuaja do të bëhen pjesë e
              kujtimeve tona të përbashkëta.
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:gap-4 animate-fade-up [animation-delay:380ms]">
              <Button asChild className="h-13 px-7 text-base shadow-sm">
                <Link href="/upload">
                  <Upload className="h-5 w-5" aria-hidden="true" />
                  Ngarko fotot
                </Link>
              </Button>
              <Button asChild variant="secondary" className="h-13 px-7 text-base">
                <Link href="#how-it-works">
                  Si funksionon
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm sm:max-w-md md:max-w-none animate-bloom [animation-delay:200ms]">
            <Image
              src="/home/flower2.png"
              alt="Buqetë me zambakë rozë"
              width={960}
              height={960}
              priority
              className="w-full"
            />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-10 space-y-2 text-center sm:mb-14">
            <p className="font-serif text-xs uppercase tracking-[0.32em] text-muted-foreground">Si funksionon</p>
            <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              Tri hapa të vegjël
            </h2>
          </Reveal>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 140}>
                <article className="group relative h-full rounded-card border border-border bg-surface px-6 py-7 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-md sm:px-7 sm:py-8">
                  <p className="font-script text-4xl text-primary">{step.number}</p>
                  <h3 className="mt-3 font-serif text-2xl font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{step.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-surface-soft px-4 py-16 sm:px-6 sm:py-20">
        <Image
          src="/home/flower1.png"
          alt=""
          width={420}
          height={260}
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-6 w-36 rotate-12 opacity-70 sm:-right-10 sm:-top-8 sm:w-64 sm:opacity-80"
        />
        <Reveal className="relative mx-auto max-w-3xl text-center">
          <p className="font-serif text-xs uppercase tracking-[0.32em] text-muted-foreground">
            Një kërkesë e vogël
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Ndani sa më shumë momente
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Ato spontane, ato të lumtura, detajet e vogla dhe kujtimet që mund të na shpëtojnë gjatë mbrëmjes —
            çdo foto ka shumë vlerë për ne.
          </p>
        </Reveal>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 w-40 opacity-90 sm:mb-8 sm:w-48">
            <Image
              src="/home/flower3.png"
              alt=""
              width={480}
              height={260}
              aria-hidden="true"
              className="w-full"
            />
          </div>
          <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl">
            Gati për t&apos;i ndarë{" "}
            <span className="font-script text-primary">fotot</span> tuaja?
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">Zgjat vetëm pak sekonda.</p>
          <div className="mt-7 flex justify-center sm:mt-8">
            <Button asChild className="h-14 px-10 text-base shadow-sm">
              <Link href="/upload">
                <Upload className="h-5 w-5" aria-hidden="true" />
                Ngarko fotot
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border bg-surface/70 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl text-center">
          <p className="font-script text-xl text-muted-foreground">
            Me dashuri për ditën e veçantë të Blerines
          </p>
        </div>
      </footer>
    </main>
  );
}
