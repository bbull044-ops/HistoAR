import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { FieldTexture } from "@/components/field-texture";
import { Button } from "@/components/ui/button";
import { Download, LogIn, LogOut } from "lucide-react";

const FILES = [
  { jenis: "rekap", judul: "Rekap per siswa", deskripsi: "1 baris per siswa: identitas, jumlah chat per materi, skor quiz akhir." },
  { jenis: "siswa", judul: "Detail siswa", deskripsi: "Identitas + waktu persetujuan (consent_at)." },
  { jenis: "chat", judul: "Detail chat", deskripsi: "Tiap pesan chatbot beridentitas + nama siswa." },
  { jenis: "quiz", judul: "Detail quiz", deskripsi: "Tiap attempt + jawaban per-butir." },
  { jenis: "anonim", judul: "Chat anonim", deskripsi: "Chat tanpa identitas, terpisah dari chat siswa." },
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function checkSession() {
    setChecking(true);
    try {
      const res = await fetch("/api/export-session", { cache: "no-store" });
      setLoggedIn(res.ok);
    } catch {
      setLoggedIn(false);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    void checkSession();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (checking) return;
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/export-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(typeof json?.error === "string" ? json.error : "Login gagal.");
        return;
      }
      setLoggedIn(true);
      setPassword("");
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setChecking(false);
    }
  }

  async function logout() {
    await fetch("/api/export-logout", { method: "POST" }).catch(() => undefined);
    setLoggedIn(false);
    setPassword("");
  }

  async function download(jenis: string) {
    setBusy(jenis);
    setError("");
    try {
      const res = await fetch(`/api/export-auth?jenis=${jenis}`, { cache: "no-store" });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(typeof json?.error === "string" ? json.error : `Gagal mengunduh (${res.status}).`);
        if (res.status === 401) setLoggedIn(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filenameFromHeader(res.headers.get("content-disposition"), `histoar-${jenis}.csv`);
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
        <span className="catalog-label text-accent-foreground">Penelitian · Internal</span>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">Rekap Data Penelitian</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Unduh data langsung dari Supabase sebagai CSV terbaru saat tombol ditekan.</p>

        {!loggedIn ? (
          <form onSubmit={login} className="mt-8 w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-display text-lg font-medium">Masuk untuk export</h2>
            <p className="mt-1 text-xs text-muted-foreground">Gunakan username dan password internal penelitian.</p>
            <div className="mt-5 space-y-3">
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" autoComplete="username" className="w-full rounded-full border border-border bg-background/40 px-4 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" className="w-full rounded-full border border-border bg-background/40 px-4 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50" />
              <Button type="submit" disabled={checking || !username || !password} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <LogIn className="h-4 w-4" />
                {checking ? "Memeriksa…" : "Masuk"}
              </Button>
            </div>
            {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
          </form>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            {FILES.map((f) => (
              <div key={f.jenis} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="font-display text-base font-medium">{f.judul}</div>
                  <div className="text-sm text-muted-foreground">{f.deskripsi}</div>
                </div>
                <Button onClick={() => download(f.jenis)} disabled={busy !== null} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Download className="h-4 w-4" />
                  {busy === f.jenis ? "Mengunduh…" : "Unduh CSV"}
                </Button>
              </div>
            ))}
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button onClick={logout} className="mt-2 flex items-center gap-2 self-start text-sm text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
