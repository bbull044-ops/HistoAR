import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { FieldTexture } from "@/components/field-texture";
import { MateriGrid } from "@/components/histoar/MateriGrid";
import { CoreSample } from "@/components/histoar/CoreSample";

export const Route = createFileRoute("/materi/")({
  head: () => ({
    meta: [{ title: "Pilih Materi" }],
  }),
  component: MateriPage,
});

function MateriPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <FieldTexture />
      <Nav />
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-32 pb-24">
        <div className="mb-4">
          <CoreSample currentMateriId={null} />
        </div>
        <span className="catalog-label text-accent-foreground">
          Katalog · Peta Lapisan
        </span>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          Pilih Materi
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Materi tersusun berurutan seperti lapisan tanah. Jelajahi tiap materi
          (scan AR / 3D + diskusi HistoAI), lalu kerjakan satu quiz akhir berisi
          10 soal dari keseluruhan materi.
        </p>

        <div className="mt-10">
          <MateriGrid />
        </div>

        <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="font-display text-base font-medium">
              Sudah selesai semua materi?
            </div>
            <div className="text-sm text-muted-foreground">
              Kerjakan quiz akhir — 10 soal dari keseluruhan bab, nilai
              tersimpan otomatis.
            </div>
          </div>
          <Link
            to="/quiz"
            className="inline-block rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Ke Quiz Akhir →
          </Link>
        </div>

        <Link
          to="/"
          className="mt-10 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Kembali ke beranda
        </Link>
      </div>
      <Footer />
    </main>
  );
}
