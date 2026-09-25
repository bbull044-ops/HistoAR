import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import materiData from "@/data/materi.json";
import type { MateriData } from "@/lib/histoar-types";
import { markMateriComplete } from "@/lib/progress";
import { getStudentId } from "@/lib/student-id";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { FieldTexture } from "@/components/field-texture";
import { CoreSample } from "@/components/histoar/CoreSample";
import { StudentForm } from "@/components/histoar/StudentForm";
import { Chatbot } from "@/components/histoar/Chatbot";

const { materi: materiList } = materiData as MateriData;

export const Route = createFileRoute("/materi/$id/diskusi")({
  loader: ({ params }) => {
    const materi = materiList.find((m) => m.id === params.id);
    if (!materi) throw notFound();
    return { materi };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Diskusi · ${loaderData?.materi.judul ?? ""} · HistoAR` }],
  }),
  component: DiskusiPage,
});

function DiskusiPage() {
  const { materi } = Route.useLoaderData();
  const [unlocked, setUnlocked] = useState(false);
  // Gerbang identitas: chat penelitian wajib terikat student_id.
  // Cukup diisi sekali di materi pertama (tersimpan di localStorage).
  const [studentId, setStudentId] = useState<string | null>(() =>
    getStudentId(),
  );

  const nextMateri = [...materiList]
    .sort((a, b) => a.urutan - b.urutan)
    .find((m) => m.urutan === materi.urutan + 1);

  const isLast = !nextMateri;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <FieldTexture />
      <Nav />
      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-32 pb-24">
        <div className="mb-6">
          <CoreSample currentMateriId={materi.id} />
        </div>

        <span className="catalog-label text-accent-foreground">
          Diskusi · {materi.kode}
        </span>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          {materi.judul}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{materi.ringkasan}</p>

        <div className="mt-6">
          {!studentId ? (
            <StudentForm onRegistered={setStudentId} />
          ) : (
            <Chatbot
              materiId={materi.id}
              materiJudul={materi.judul}
              onFirstInteraction={() => {
                markMateriComplete(materi.id, 0);
                setUnlocked(true);
              }}
            />
          )}
        </div>

        <div className="mt-6">
          {unlocked ? (
            isLast ? (
              <Link
                to="/quiz"
                className="inline-block rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Lanjut ke Quiz Akhir (10 soal) →
              </Link>
            ) : (
              nextMateri && (
                <Link
                  to="/materi/$id"
                  params={{ id: nextMateri.id }}
                  className="inline-block rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  Lanjut ke {nextMateri.judul} →
                </Link>
              )
            )
          ) : (
            <>
              <span className="inline-block cursor-not-allowed rounded-full border border-border px-5 py-3 text-sm font-medium text-muted-foreground">
                {isLast
                  ? "Lanjut ke Quiz Akhir →"
                  : "Lanjut ke Materi Berikutnya →"}
              </span>
              <p className="mt-2 text-xs text-muted-foreground">
                Chat dulu dengan HistoAI minimal satu kali untuk membuka langkah
                berikutnya.
              </p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
