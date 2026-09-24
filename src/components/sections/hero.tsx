import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MeganthropusViewer } from "@/components/viewer/MeganthropusViewer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-anim", {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
        stagger: 0.1,
      });
      gsap.to(".hero-fade", {
        opacity: 0,
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-screen items-center overflow-hidden pb-16 pt-32"
    >
      {/* Nomor katalog raksasa: motif arsip, bukan dekorasi acak. */}
      <div
        aria-hidden
        className="hero-fade pointer-events-none absolute -top-10 right-0 select-none font-display text-[26vw] font-medium leading-none text-transparent sm:text-[20vw]"
        style={{ WebkitTextStroke: "1px oklch(1 0 0 / 0.06)" }}
      >
        01
      </div>

      <div className="hero-fade relative z-10 grid w-full items-center gap-y-14 lg:grid-cols-[minmax(0,1fr)_44vw]">
        <div className="px-6 lg:pl-6 lg:pr-0 xl:pl-12">
          <div className="hero-anim catalog-label text-accent-foreground">
            Arsip Digital · Prasejarah Indonesia
          </div>
          <h1 className="hero-anim mt-5 max-w-xl font-display text-6xl font-medium leading-[1.02] tracking-tight sm:text-7xl">
            Sejarah yang bisa
            <br />
            kamu <span className="text-primary">bongkar sendiri</span>.
          </h1>
          <p className="hero-anim drop-cap mt-7 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            HistoAR menyusun manusia purba, situs megalitik, dan periodisasi
            zaman Indonesia seperti katalog museum, lalu membiarkanmu
            memeriksanya langsung lewat augmented reality, satu lapisan pada
            satu waktu.
          </p>
          <div className="hero-anim mt-9 flex flex-wrap items-center gap-6">
            <Link
              to="/materi"
              className="rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Mulai Pengalaman
            </Link>
            <a
              href="#experience"
              className="text-sm font-medium text-foreground underline decoration-border underline-offset-8 transition hover:decoration-primary"
            >
              Jelajahi Lini Masa →
            </a>
          </div>
        </div>

        {/* Panel model 3D sengaja bleed ke tepi kanan viewport: breakout dari
            grid simetris, bukan card yang dikurung padding di semua sisi. */}
        <div className="hero-anim relative -mt-6 lg:mt-0">
          <div
            className="absolute inset-0 -z-10 blur-3xl"
            style={{
              background:
                "radial-gradient(55% 55% at 60% 40%, oklch(0.58 0.09 175 / 0.16), transparent 70%)",
            }}
            aria-hidden
          />
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-l-[2.5rem] border-y border-l border-border bg-card">
            <MeganthropusViewer />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-card via-card/70 to-transparent p-6 pt-12 sm:p-8">
              <div className="catalog-label text-accent-foreground">Spesimen 01</div>
              <div className="mt-1 font-display text-xl font-medium">
                Meganthropus Paleojavanicus
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
