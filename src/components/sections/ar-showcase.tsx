import { Camera, Scan, Smartphone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function ARShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ar-anim", {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="ar"
      ref={ref}
      className="relative mx-auto max-w-6xl px-6 py-32"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-[0_30px_80px_-30px_oklch(0_0_0/0.25)] sm:p-14">
        <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="ar-anim catalog-label mb-4 flex items-center gap-2 text-accent-foreground">
              <Scan className="h-3 w-3" /> Siap AR
            </div>
            <h2 className="ar-anim font-display text-4xl font-medium sm:text-5xl">
              Arahkan. <span className="text-primary">Jelajahi.</span>
              <br />
              Pelajari.
            </h2>
            <p className="ar-anim mt-6 max-w-md leading-relaxed text-muted-foreground">
              Tanpa instalasi, tanpa unduhan. Cukup pindai marker, dan model 3D
              serta diorama muncul dalam skala sebenarnya di ruanganmu.
            </p>

            <ul className="ar-anim mt-8 space-y-3 text-sm">
              {[
                { icon: Camera, t: "Menggunakan kamera perangkat untuk pelacakan secara langsung" },
                { icon: Smartphone, t: "Berjalan di Safari (iOS) dan browser favoritmu (Android)" },
                { icon: Scan, t: "Posisi model tetap stabil selama kamera mengarah ke marker" },
              ].map((r) => (
                <li key={r.t} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <r.icon className="h-4 w-4 text-primary" />
                  </span>
                  <span className="text-muted-foreground">{r.t}</span>
                </li>
              ))}
            </ul>

            <div className="ar-anim mt-10">
              <Link
                to="/materi"
                className="inline-block rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Mulai Pindai
              </Link>
            </div>
          </div>

          {/* Viewfinder pemindaian: bukan model 3D lagi (sudah tampil di hero),
              representasi konsep "arahkan kamera ke marker" pakai bracket
              sudut ala jendela bidik kamera, bukan mockup foto generik. */}
          <div className="ar-anim relative mx-auto w-full max-w-md">
            <div
              className="absolute inset-0 -z-10 blur-3xl"
              style={{
                background:
                  "radial-gradient(55% 55% at 50% 40%, oklch(0.58 0.09 175 / 0.14), transparent 70%)",
              }}
              aria-hidden
            />
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-card">
            <div className="ar-scanline pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-primary/12 to-transparent" />
            {[
              "left-5 top-5 border-l border-t",
              "right-5 top-5 border-r border-t",
              "left-5 bottom-5 border-l border-b",
              "right-5 bottom-5 border-r border-b",
            ].map((pos) => (
              <span
                key={pos}
                className={`absolute h-8 w-8 border-primary/50 ${pos}`}
                aria-hidden
              />
            ))}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <Scan className="h-8 w-8 text-primary/70" />
              <div className="catalog-label text-muted-foreground">Menunggu marker…</div>
            </div>
            <div className="absolute inset-x-0 bottom-0 border-t border-border bg-card/80 px-5 py-4 backdrop-blur-sm">
              <div className="catalog-label text-accent-foreground">Spesimen · Pratinjau</div>
              <div className="mt-1 font-display text-lg font-medium">
                Kartu / Buku Bertanda AR
              </div>
              <div className="text-xs text-muted-foreground">Model 3D muncul begitu marker terbaca</div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
