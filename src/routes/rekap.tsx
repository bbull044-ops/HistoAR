import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { FieldTexture } from "@/components/field-texture";
import { Button } from "@/components/ui/button";
import { Download, LockOpen } from "lucide-react";

// Halaman export data penelitian Prof. Wawan.
// SENGAJA tidak ditautkan di nav — hanya yang tahu URL + password.
// Password (env EXPORT_PASSWORD) disimpan di sessionStorage (hilang saat
// tab ditutup) dan dikirim via header, tidak pernah via URL.

const PW_KEY = "histoar_export_pw";

const FILES = [
  {
    jenis: "rekap",
    judul: "Rekap per siswa",
    deskripsi:
      "1 baris per siswa: identitas, jumlah chat per materi, skor quiz akhir. Buka langsung di Excel.",
  },
  {
    jenis: "siswa",
    judul: "Detail siswa",
    deskripsi: "Dump identitas + waktu persetujuan (consent_at).",
  },
  {
    jenis: "chat",
    judul: "Detail chat",
    deskripsi: "Tiap pesan chatbot beridentitas + nama siswa (bukan UUID).",
  },
  {
    jenis: "quiz",
    judul: "Detail quiz",
    deskripsi: "Tiap attempt + jawaban per-butir (kolom answers).",
  },
  {
    jenis: "anonim",
    judul: "Chat anonim",
    deskripsi: "Chat tanpa identitas (landing + data lama), terpisah.",
  },
] as const;

export const Route = createFileRoute("/rekap")({
  head: () => ({
    meta: [
      { title: "Rekap Penelitian · HistoAR" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: RekapPage,
});

function filenameFromHeader(disposition: string | null, fallback: string) {
  if (!disposition) return fallback;
  const m = /filename="([^"]+)"/.exec(disposition);
  return m?.[1] ?? fallback;
}

function RekapPage() {
  const [password, setPassword] = useState(
    () => sessionStorage.getItem(PW_KEY) ?? "",
  );
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(PW_KEY) !== null,
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    sessionStorage.setItem(PW_KEY, password);
    setUnlocked(true);
    setError("");
  }

  function logout() {
    sessionStorage.removeItem(PW_KEY);
    setPassword("");
    setUnlocked(false);
  }

  async function download(jenis: string) {
    const pw = sessionStorage.getItem(PW_KEY) ?? "";
    setBusy(jenis);
    setError("");
    try {
      const res = await fetch(`/api/export?jenis=${jenis}`, {
        headers: { "x-export-password": pw },
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const msg =
          typeof json?.error === "string"
            ? json.error
            : `Gagal mengunduh (${res.status}).`;
        if (res.status === 401) {
          logout();
          setError("Password salah atau berubah. Masukkan ulang.");
        } else {
          setError(msg);
        }
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filenameFromHeader(
        res.headers.get("content-disposition"),
        `histoar-${jenis}.csv`,
      );
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Tidak dapat menghubungi server. Periksa internetmu.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <FieldTexture />
      <Nav />
      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-32 pb-24">
        <span className="catalog-label text-accent-foreground">
          Penelitian · Internal
        </span>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Rekap Data Penelitian
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Unduh data siswa, diskusi chatbot, dan quiz akhir sebagai CSV siap
          olah di Excel/SPSS.
        </p>

        {!unlocked ? (
          <form
            onSubmit={savePassword}
            className="mt-8 w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8"
          >
            <h2 className="font-display text-lg font-medium">
              Masukkan password export
            </h2>
            <div className="mt-4 flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password dari peneliti"
                autoComplete="off"
                className="flex-1 rounded-full border border-border bg-background/40 px-4 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
              />
              <Button
                type="submit"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <LockOpen className="h-4 w-4" />
              </Button>
            </div>
            {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
          </form>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            {FILES.map((f) => (
              <div
                key={f.jenis}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center"
              >
                <div className="flex-1">
                  <div className="font-display text-base font-medium">
                    {f.judul}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {f.deskripsi}
                  </div>
                </div>
                <Button
                  onClick={() => download(f.jenis)}
                  disabled={busy !== null}
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  {busy === f.jenis ? "Mengunduh…" : "Unduh CSV"}
                </Button>
              </div>
            ))}

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button
              onClick={logout}
              className="mt-2 self-start text-sm text-muted-foreground hover:text-foreground"
            >
              Keluar (lupakan password di tab ini)
            </button>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
