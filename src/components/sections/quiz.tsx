import { Link } from "@tanstack/react-router";
import { ArrowRight, ListChecks } from "lucide-react";

// Landing: bukan quiz interaktif (nilai tidak disimpan di sini).
// Pintu masuk jujur ke alur penelitian: materi -> diskusi -> quiz akhir.
export function Quiz() {
  return (
    <section id="quiz" className="relative mx-auto max-w-3xl px-6 py-32">
      <div className="mb-10 text-center">
        <div className="catalog-label text-accent-foreground">
          Uji Pemahaman
        </div>
        <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
          Satu <span className="text-primary">quiz akhir</span>, 10 soal.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
          Mencakup semua bab — dari praaksara sampai Homo Sapiens. Disarankan
          setelah menjelajahi semua materi dan diskusi HistoAI. Nilai tersimpan
          otomatis untuk penelitian.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-[0_30px_80px_-30px_oklch(0_0_0/0.25)] sm:p-10">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ListChecks className="h-5 w-5" />
          </span>
          <div>
            <div className="font-display text-lg font-medium">
              Quiz Akhir HistoAR
            </div>
            <div className="text-sm text-muted-foreground">
              10 soal pilihan ganda · mencakup semua bab
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/materi"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:border-primary/50"
          >
            Mulai dari Materi
          </Link>
          <Link
            to="/quiz"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Langsung ke Quiz Akhir <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
