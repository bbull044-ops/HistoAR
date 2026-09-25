import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import quizData from "@/data/quiz.json";
import type { QuizData } from "@/lib/histoar-types";
import { getStudentId } from "@/lib/student-id";
import { sendQuizAttempt } from "@/lib/quiz-log";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { FieldTexture } from "@/components/field-texture";
import { StudentForm } from "@/components/histoar/StudentForm";
import { QuizPanel } from "@/components/histoar/QuizPanel";
import { Chatbot } from "@/components/histoar/Chatbot";

const { quiz: quizAll } = quizData as QuizData;
const questions = quizAll["final"] ?? [];

export const Route = createFileRoute("/quiz/")({
  head: () => ({
    meta: [{ title: "Quiz Akhir (10 soal) · HistoAR" }],
  }),
  component: QuizFinalPage,
});

function QuizFinalPage() {
  const [result, setResult] = useState<{ score: number; total: number } | null>(
    null,
  );
  const [studentId, setStudentId] = useState<string | null>(() =>
    getStudentId(),
  );

  if (questions.length === 0) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <FieldTexture />
        <Nav />
        <div className="relative z-10 mx-auto max-w-3xl px-6 pt-32 pb-24">
          <p className="text-sm text-muted-foreground">
            Bank soal final belum tersedia.
          </p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <FieldTexture />
      <Nav />
      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-32 pb-24">
        <span className="catalog-label text-accent-foreground">
          Quiz Akhir · Keseluruhan Materi
        </span>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          10 soal dari semua bab
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Disarankan setelah menjelajahi semua materi dan diskusi HistoAI. Nilai
          tersimpan otomatis untuk penelitian.
        </p>

        <div className="mt-8">
          {!result && !studentId && <StudentForm onRegistered={setStudentId} />}

          {!result && studentId && (
            <QuizPanel
              questions={questions}
              onFinish={(score, total, answers, startedAt) => {
                setResult({ score, total });
                // Fire-and-forget: hasil tampil duluan, pengiriman menyusul.
                void sendQuizAttempt({
                  student_id: studentId,
                  materi_id: "final",
                  score,
                  total,
                  answers,
                  started_at: startedAt,
                });
              }}
            />
          )}

          {result && (
            <div className="mx-auto w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-[0_20px_60px_-30px_oklch(0_0_0/0.25)] sm:p-8">
              <span className="catalog-label text-accent-foreground">
                Hasil Quiz Akhir
              </span>
              <p className="mt-4 text-sm text-muted-foreground">Skor Kamu</p>
              <div className="font-display text-5xl font-medium text-primary">
                {result.score}/{result.total}
              </div>

              <Chatbot
                materiId="final"
                materiJudul="Quiz Akhir (gabungan seluruh materi)"
                score={result.score}
                total={result.total}
                onFirstInteraction={() => {}}
              />

              <div className="mt-6">
                <Link
                  to="/materi"
                  className="inline-block rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  Kembali ke daftar materi
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
