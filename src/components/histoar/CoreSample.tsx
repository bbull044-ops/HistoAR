// Port dari renderCoreSample() di assets/js/router.js.
// "Core sample" - strip lapisan yang merepresentasikan progres belajar,
// tiap materi = satu layer. Terisi kalau sudah selesai, berkedip kalau
// sedang dikerjakan.

import { useEffect, useState } from "react";
import materiData from "@/data/materi.json";
import type { MateriData } from "@/lib/histoar-types";
import { getProgress } from "@/lib/progress";

const { materi } = materiData as MateriData;

export function CoreSample({ currentMateriId }: { currentMateriId?: string | null }) {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    setCompleted(getProgress().completed);
  }, [currentMateriId]);

  const list = [...materi].sort((a, b) => a.urutan - b.urutan);

  return (
    <div className="flex items-center gap-1" aria-label="Progres belajar">
      {list.map((m) => {
        const isDone = completed.includes(m.id);
        const isCurrent = m.id === currentMateriId;
        return (
          <span
            key={m.id}
            title={`${m.kode} · ${m.judul}`}
            className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
              isDone
                ? "hairline"
                : isCurrent
                  ? "animate-pulse hairline"
                  : "opacity-30"
            }`}
            style={{ backgroundColor: isDone || isCurrent ? m.layerColor : undefined, background: isDone || isCurrent ? m.layerColor : "oklch(1 0 0 / 0.1)" }}
          />
        );
      })}
    </div>
  );
}
