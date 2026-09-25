import { useState } from "react";
import { Button } from "@/components/ui/button";
import { setStudentId } from "@/lib/student-id";

// Form identitas sekali-isi sebelum diskusi/quiz: nama, kelas, sekolah +
// persetujuan penggunaan data untuk penelitian (nama asli disimpan).
export function StudentForm({
  onRegistered,
}: {
  onRegistered: (id: string) => void;
}) {
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [sekolah, setSekolah] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, kelas, sekolah, consent }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Gagal menyimpan identitas.");
        return;
      }
      setStudentId(json.id);
      onRegistered(json.id);
    } catch {
      setError("Tidak dapat menghubungi server. Periksa internetmu.");
    } finally {
      setSending(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50";

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-[0_20px_60px_-30px_oklch(0_0_0/0.25)] sm:p-8">
      <span className="catalog-label text-accent-foreground">Kenalan dulu</span>
      <h3 className="mt-3 font-display text-xl font-medium leading-snug">
        Isi identitasmu sebelum mulai
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Cukup sekali — datamu dipakai untuk penelitian pembelajaran HistoAR.
      </p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Nama lengkap"
          autoComplete="name"
          className={inputCls}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            placeholder="Kelas (mis. X-1)"
            className={inputCls}
          />
          <input
            value={sekolah}
            onChange={(e) => setSekolah(e.target.value)}
            placeholder="Sekolah"
            className={inputCls}
          />
        </div>

        <label className="mt-1 flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
          />
          Saya setuju nama, kelas, sekolah, jawaban kuis, dan percakapan dengan
          HistoAI saya digunakan untuk keperluan penelitian pembelajaran
          HistoAR.
        </label>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="mt-2 flex justify-end">
          <Button
            type="submit"
            disabled={sending}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {sending ? "Menyimpan…" : "Simpan & Lanjut"}
          </Button>
        </div>
      </form>
    </div>
  );
}
