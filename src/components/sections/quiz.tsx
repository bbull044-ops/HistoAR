import { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";

const questions = [
  {
    q: "Periodisasi geologi paling tua adalah?",
    options: ["Arkaekum", "Paleozoikum", "Mesozoikum", "Neozoikum"],
    correct: 0,
  },
  {
    q: "Pada masa Mesozoikum, bagaimana kehidupan manusia praaksara?",
    options: ["Bercocok tanam", "Berburu dan meramu", "Berburu dan bercocok tanam", "Meramu dan bercocok tanam"],
    correct: 1,
  },
  {
    q: "Siapa penemu fosil manusia purba Pithecanthropus?",
    options: ["G.H.R. von Koenigswald", "B.D. van Rietschoten", "Eugène Dubois", "Ralph von Koenigswald"],
    correct: 2,
  },
];

export function Quiz() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const current = questions[index];

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === current.correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (index + 1 >= questions.length) setDone(true);
      else {
        setIndex(index + 1);
        setSelected(null);
      }
    }, 900);
  }
  function reset() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }

  return (
    <section id="quiz" className="relative mx-auto max-w-3xl px-6 py-32">
      <div className="mb-10 text-center">
        <div className="catalog-label text-accent-foreground">Uji Pemahaman</div>
        <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
          Coba <span className="text-primary">kuis singkat</span>.
        </h2>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-[0_30px_80px_-30px_oklch(0_0_0/0.25)] sm:p-10">
        {!done ? (
          <>
            <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">
                Soal {index + 1} / {questions.length}
              </span>
              <span className="font-mono">Skor {score}</span>
            </div>
            <div className="mb-2 h-0.5 w-full overflow-hidden bg-border">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${((index + 1) / questions.length) * 100}%` }}
              />
            </div>
            <h3 className="mt-8 font-display text-2xl font-medium sm:text-3xl">
              {current.q}
            </h3>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {current.options.map((opt, i) => {
                const isCorrect = selected !== null && i === current.correct;
                const isWrong =
                  selected === i && i !== current.correct;
                return (
                  <button
                    key={opt}
                    onClick={() => choose(i)}
                    disabled={selected !== null}
                    className={`group relative flex items-center justify-between rounded-xl border border-border bg-background/40 px-5 py-4 text-left text-sm transition hover:border-primary/50 disabled:cursor-not-allowed ${
                      isCorrect
                        ? "border-success bg-success/10"
                        : isWrong
                          ? "border-destructive bg-destructive/10"
                          : ""
                    }`}
                  >
                    <span>{opt}</span>
                    {isCorrect && <Check className="h-4 w-4 text-success" />}
                    {isWrong && <X className="h-4 w-4 text-destructive" />}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary/40">
              <span className="font-display text-2xl font-medium text-primary">
                {score}/{questions.length}
              </span>
            </div>
            <h3 className="mt-6 font-display text-3xl font-medium">
              {score === questions.length
                ? "Setara kurator."
                : score >= questions.length / 2
                  ? "Cukup baik."
                  : "Perlu kunjungi lagi pamerannya."}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Ulangi kuis, atau lanjut ke lini masa dan daftar materi lengkap.
            </p>
            <button
              onClick={reset}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <RotateCcw className="h-4 w-4" /> Coba lagi
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
