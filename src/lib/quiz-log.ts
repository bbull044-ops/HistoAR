// Pengiriman hasil quiz ke server dengan retry + antrean offline.
// Prinsip: jangan blokir siswa — hasil tetap tampil walau jaringan mati.

export type QuizAnswer = { soal_id: string; dipilih: number; benar: boolean };

export type QuizAttemptPayload = {
  student_id: string;
  materi_id: string;
  score: number;
  total: number;
  answers: QuizAnswer[];
  started_at: string;
};

const PENDING_KEY = "histoar_pending_attempts";
const MAX_TRIES = 3;

function isBrowser() {
  return typeof window !== "undefined";
}

function readPending(): QuizAttemptPayload[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePending(items: QuizAttemptPayload[]) {
  if (!isBrowser()) return;
  try {
    if (items.length === 0) window.localStorage.removeItem(PENDING_KEY);
    else window.localStorage.setItem(PENDING_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Gagal menyimpan antrean quiz:", err);
  }
}

async function postAttempt(payload: QuizAttemptPayload): Promise<boolean> {
  for (let i = 0; i < MAX_TRIES; i++) {
    try {
      const res = await fetch("/api/quiz-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) return true;
    } catch {
      // Coba lagi (offline sesaat / server sibuk).
    }
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  return false;
}

/** Kirim 1 attempt + flush antrean lama. Fire-and-forget dari pemanggil. */
export async function sendQuizAttempt(payload: QuizAttemptPayload) {
  const queue = [...readPending(), payload];
  const failed: QuizAttemptPayload[] = [];
  for (const item of queue) {
    const ok = await postAttempt(item);
    if (!ok) failed.push(item);
  }
  writePending(failed);
}
