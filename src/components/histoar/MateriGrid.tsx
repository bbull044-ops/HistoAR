// Port dari renderMateriGrid() di assets/js/materi-loader.js.

import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import materiData from "@/data/materi.json";
import type { MateriData } from "@/lib/histoar-types";
import { isMateriComplete, isMateriUnlocked } from "@/lib/progress";
import { Lock, ScanLine, CheckCircle2 } from "lucide-react";

const { materi } = materiData as MateriData;

export function MateriGrid() {
  const [ready, setReady] = useState(false);

  // Status lock/unlock bergantung localStorage, jadi baru dihitung di client
  // (hindari mismatch SSR/hydration).
  useEffect(() => setReady(true), []);

  const list = [...materi].sort((a, b) => a.urutan - b.urutan);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((m) => {
        const unlocked = !ready || isMateriUnlocked(list, m.id);
        const done = ready && isMateriComplete(m.id);

        const cardInner = (
          <>
            <div className="flex items-center justify-between">
              <span className="catalog-label">{m.kode}</span>
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: m.layerColor }}
                aria-hidden
              />
            </div>
            <h3 className="mt-3 font-display text-lg font-medium leading-snug">{m.judul}</h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{m.ringkasan}</p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
              {done ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span className="text-success">Selesai</span>
                </>
              ) : unlocked ? (
                <>
                  <ScanLine className="h-3.5 w-3.5 text-primary" />
                  <span>Scan AR</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Terkunci</span>
                </>
              )}
            </div>
          </>
        );

        const cardClass =
          "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_20px_50px_-30px_oklch(0_0_0/0.25)] transition-all duration-300" +
          (unlocked
            ? " hover:-translate-y-1 hover:border-primary/40 cursor-pointer"
            : " opacity-50 cursor-not-allowed");

        if (unlocked) {
          return (
            <Link key={m.id} to="/materi/$id" params={{ id: m.id }} className={cardClass}>
              {cardInner}
            </Link>
          );
        }
        return (
          <div key={m.id} className={cardClass} aria-disabled>
            {cardInner}
          </div>
        );
      })}
    </div>
  );
}
