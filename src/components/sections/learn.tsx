import { Globe, Footprints, Mountain, Sparkles, Skull } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import materiData from "@/data/materi.json";
import type { MateriData } from "@/lib/histoar-types";

const { materi } = materiData as MateriData;

// Kartu di section ini DULU daftar hand-typed terpisah dari data/materi.json,
// jadi ikut basi tiap materi.json berubah (mis. "Homo Soloensis & Wajakensis"
// yang sudah tidak ada, materi m3-3 aslinya berjudul "Homo Sapiens") dan malah
// memecah m1 jadi 4 kartu semu (Arkaekum dkk. cuma hotspot DI DALAM m1, bukan
// materi sendiri). Turunkan langsung dari materi.json biar selalu sinkron.
function categoryFor(id: string) {
  if (id === "m1") return { tag: "Periodisasi Geologi", icon: Globe };
  if (id.startsWith("m2-4")) return { tag: "Situs Megalitik", icon: Mountain };
  if (id === "m2-5") return { tag: "Sistem Kepercayaan", icon: Sparkles };
  if (id.startsWith("m2")) return { tag: "Kehidupan Praaksara", icon: Footprints };
  return { tag: "Manusia Purba", icon: Skull };
}

const materials = [...materi]
  .sort((a, b) => a.urutan - b.urutan)
  .map((m) => ({
    id: m.id,
    title: m.judul,
    meta: m.ringkasan,
    layerColor: m.layerColor,
    ...categoryFor(m.id),
  }));

export function Learn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Kalau section sudah kelihatan di viewport saat mount
    // (misalnya deep-link ke #learn), langsung tampilkan tanpa
    // nunggu event scroll yang mungkin tidak pernah terjadi lagi.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="learn"
      ref={ref}
      className="relative mx-auto max-w-6xl px-6 py-32"
    >
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <div className="catalog-label text-accent-foreground">Daftar Materi</div>
          <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
            Jelajahi <span className="text-primary">masa praaksara</span>.
          </h2>
        </div>
        <Link
          to="/materi"
          className="rounded-full border border-border px-5 py-2.5 text-sm text-foreground transition hover:border-primary/50"
        >
          Lihat semua materi →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {materials.map((m, i) => (
          <Link
            key={m.id}
            to="/materi/$id"
            params={{ id: m.id }}
            className="learn-card group relative block overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_50px_-30px_oklch(0_0_0/0.25)] transition-all duration-700 hover:-translate-y-1 hover:border-primary/40"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transitionDelay: visible ? `${i * 70}ms` : "0ms",
            }}
          >
            <div
              className="relative flex h-36 items-center justify-center"
              style={{
                background: `linear-gradient(160deg, ${m.layerColor}26, var(--color-muted))`,
              }}
            >
              <m.icon className="h-9 w-9" style={{ color: m.layerColor }} />
              <div className="catalog-label absolute left-4 top-3.5 text-muted-foreground">
                {m.tag}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-display text-lg font-medium">{m.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {m.meta}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Materi + AR</span>
                <span className="text-primary transition group-hover:translate-x-1">
                  Buka →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
