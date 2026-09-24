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
        <span className="catalog-label text-accent-foreground">Katalog · Peta Lapisan</span>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          Pilih Materi
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Materi tersusun berurutan seperti lapisan tanah, selesaikan satu materi (scan AR + quiz
          + diskusi HistoAI) untuk membuka materi berikutnya.
        </p>

        <div className="mt-10">
          <MateriGrid />
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
