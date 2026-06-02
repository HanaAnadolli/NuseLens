// app/page.tsx
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Camera,
  Heart,
  Image as ImageIcon,
  Sparkles,
  Upload,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "1. Bëni foto",
    description: "Kapni momentet tuaja të preferuara gjatë festës me telefonin tuaj.",
    icon: Camera,
    className: "bg-lavender md:mr-auto",
  },
  {
    title: "2. Ngarkojini",
    description: "Prekni butonin e ngarkimit dhe zgjidhni fotot që dëshironi të ndani.",
    icon: Upload,
    className: "bg-pink md:ml-auto",
  },
  {
    title: "3. Dërgoni kujtimet",
    description: "Fotot tuaja do të shtohen në koleksionin tonë privat, që familja t’i ruajë përgjithmonë.",
    icon: ImageIcon,
    className: "bg-sage md:mr-auto",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-pink text-muted-foreground" aria-hidden="true" />
            <BrandLogo className="font-serif text-xl font-semibold text-muted-foreground" />
          </div>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <Link className="transition-colors hover:text-foreground" href="/">
              Kryefaqja
            </Link>
            <Link className="transition-colors hover:text-foreground" href="/admin">
              Galeria
            </Link>
            <Link className="transition-colors hover:text-foreground" href="#request">
              Rreth nesh
            </Link>
            <Link className="transition-colors hover:text-foreground" href="#how-it-works">
              Pyetje
            </Link>
          </nav>
          <Button asChild className="bg-primary text-primary-foreground shadow-sm">
            <Link href="/upload">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Ngarko fotot
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-button border border-border bg-surface/70 px-4 py-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">Mirë se vini në festën tonë</span>
            </div>
            <h1 className="font-serif text-5xl font-semibold leading-tight tracking-normal text-foreground md:text-6xl">
              Mirë se erdhët në
              <br />
              Kanagjegjin e Blerinës
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Jemi shumë të lumtur që jeni këtu. Na ndihmoni të mbledhim momentet e veçanta të kësaj mbrëmjeje duke ngarkuar fotografitë që bëni gjatë festës.
            </p>
            <div className="flex flex-col gap-4 pt-3 sm:flex-row">
              <Button asChild className="h-14 px-8 text-base shadow-sm">
                <Link href="/upload">
                  <Upload className="h-5 w-5" aria-hidden="true" />
                  Ngarko fotot
                </Link>
              </Button>
              <Button asChild variant="secondary" className="h-14 px-8 text-base">
                <Link href="#how-it-works">
                  Si funksionon
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative hidden md:block" aria-hidden="true">
            <div className="relative aspect-square w-full">
              <div className="absolute inset-0 rounded-[3rem] border border-border bg-lavender opacity-60" />
              <div className="absolute inset-4 rounded-[2.5rem] border border-border bg-surface/80 backdrop-blur-sm" />
              <div className="absolute left-1/4 top-1/3 h-16 w-16 rounded-full bg-lavender blur-2xl" />
              <div className="absolute bottom-1/3 right-1/4 h-20 w-20 rounded-full bg-pink blur-2xl" />
              <Sparkles className="absolute right-8 top-8 h-8 w-8 text-muted-foreground" />
              <Heart className="absolute bottom-12 left-12 h-6 w-6 fill-pink text-muted-foreground" />
              <div className="absolute bottom-8 right-12 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-pink text-3xl">
                <span aria-hidden="true">✿</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-8 text-center shadow-sm sm:p-10">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lavender">
              <Calendar className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
          </div>
          <p className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">Data e festës</p>
          <h2 className="mt-4 font-serif text-4xl font-semibold text-foreground">E shtunë, 14 qershor 2026</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Faleminderit që po festoni këtë natë të bukur me ne.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="bg-surface-soft px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 space-y-3 text-center">
            <h2 className="font-serif text-4xl font-semibold text-foreground">Si t’i ndani fotot tuaja</h2>
            <p className="text-lg text-muted-foreground">Ndiqni këta hapa të thjeshtë</p>
          </div>

          <div className="relative space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isMiddle = index === 1;

              return (
                <div key={step.title} className="grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
                  <div className={isMiddle ? "hidden md:block" : "flex md:justify-end"}>
                    {!isMiddle ? <StepCard step={step} Icon={Icon} /> : null}
                  </div>
                  <div className="hidden md:flex">
                    {index < 2 ? (
                      <ArrowRight
                        className={`h-12 w-12 text-muted-foreground ${isMiddle ? "rotate-180" : ""}`}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    ) : (
                      <div className="h-12 w-12" />
                    )}
                  </div>
                  <div className={isMiddle ? "flex" : "hidden md:block"}>
                    {isMiddle ? <StepCard step={step} Icon={Icon} /> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="request" className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-card border border-border bg-surface p-8 shadow-sm sm:p-12">
          <div className="relative z-10 space-y-4">
            <h2 className="font-serif text-3xl font-semibold text-foreground">Një kërkesë e vogël</h2>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Ju lutemi ndani sa më shumë momente që dëshironi — ato spontane, ato të lumtura, detajet e vogla dhe kujtimet që mund të na shpëtojnë gjatë mbrëmjes. Çdo foto ka shumë vlerë.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-cream px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          <div className="flex justify-center gap-2">
            <Heart className="h-5 w-5 fill-pink text-muted-foreground" aria-hidden="true" />
            <Sparkles className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <Heart className="h-5 w-5 fill-pink text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="space-y-4">
            <h2 className="font-serif text-4xl font-semibold text-foreground md:text-5xl">
              Gati për t’i ndarë fotot tuaja?
            </h2>
            <p className="text-lg text-muted-foreground">Zgjat vetëm pak sekonda.</p>
          </div>
          <Button asChild className="mx-auto h-16 px-12 text-lg shadow-sm">
            <Link href="/upload">
              <Upload className="h-6 w-6" aria-hidden="true" />
              Ngarko fotot
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border bg-surface/70 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm text-muted-foreground">Me dashuri për ditën e veçantë të Blerinës</p>
        </div>
      </footer>
    </main>
  );
}

interface StepCardProps {
  step: {
    title: string;
    description: string;
    className: string;
  };
  Icon: typeof Camera;
}

function StepCard({ step, Icon }: StepCardProps) {
  return (
    <article className={`w-full max-w-md rounded-card border border-border p-8 shadow-sm ${step.className}`}>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-surface/80">
        <Icon className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="font-serif text-2xl font-semibold text-foreground">{step.title}</h3>
      <p className="mt-3 leading-7 text-muted-foreground">{step.description}</p>
    </article>
  );
}
