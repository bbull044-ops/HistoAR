// Port dari QuizEngine (assets/js/quiz-engine.js) jadi komponen React.
// Render soal satu per satu, validasi jawaban, hitung skor.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@/lib/histoar-types";
import { cn } from "@/lib/utils";

export function QuizPanel({
  questions,
  onFinish,
}: {
  questions: QuizQuestion[];
  onFinish: (score: number, total: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const q = questions[index];
  const answered = selected !== null;
  const isLast = index === questions.length - 1;

  function selectAnswer(idx: number) {
    if (answered) return;
    setSelected(idx);
    if (idx === q.jawaban) setScore((s) => s + 1);
  }

  function next() {
    if (!answered) return;
    if (!isLast) {
      setIndex((i) => i + 1);
      setSelected(null);
    } else {
      // `score` sudah termasuk jawaban soal terakhir (ditambahkan di selectAnswer),
      // jadi tidak perlu dihitung ulang di sini.
      onFinish(score, questions.length);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-[0_20px_60px_-30px_oklch(0_0_0/0.25)] sm:p-8">
      <div className="catalog-label">
        Soal {index + 1} / {questions.length}
      </div>
      <h3 className="mt-3 font-display text-xl font-medium leading-snug">{q.pertanyaan}</h3>

      <div className="mt-6 flex flex-col gap-2.5">
        {q.opsi.map((opsiText, idx) => {
          const isCorrect = idx === q.jawaban;
          const isPicked = idx === selected;
          return (
            <button
              key={idx}
              type="button"
              disabled={answered}
              onClick={() => selectAnswer(idx)}
              className={cn(
                "rounded-xl border border-border bg-background/40 px-4 py-3 text-left text-sm transition-colors",
                !answered && "hover:border-primary/50",
                answered && isCorrect && "border-success bg-success/10 text-success",
                answered && isPicked && !isCorrect && "border-destructive/60 bg-destructive/10 text-destructive",
              )}
            >
              {opsiText}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={next} disabled={!answered} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
          {isLast ? "Lihat Hasil" : "Lanjut"}
        </Button>
      </div>
    </div>
  );
}
