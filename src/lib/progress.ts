// Port dari assets/js/progress.js
// Simpan progres belajar siswa di localStorage:
// - materi mana yang sudah selesai (quiz + chatbot kelar)
// - materi berikutnya otomatis ke-unlock
//
// Struktur localStorage:
// histoar_progress = { completed: ["m1", "m2"], scores: { m1: 3 } }

import type { Materi } from "@/lib/histoar-types";

const STORAGE_KEY = "histoar_progress";

export interface Progress {
  completed: string[];
  scores: Record<string, number>;
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function getProgress(): Progress {
  if (!isBrowser()) return { completed: [], scores: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [], scores: {} };
    const parsed = JSON.parse(raw);
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      scores: parsed.scores && typeof parsed.scores === "object" ? parsed.scores : {},
    };
  } catch (err) {
    console.error("Gagal membaca progres:", err);
    return { completed: [], scores: {} };
  }
}

export function saveProgress(progress: Progress) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error("Gagal menyimpan progres:", err);
  }
}

export function markMateriComplete(materiId: string, score: number): Progress {
  const progress = getProgress();
  if (!progress.completed.includes(materiId)) {
    progress.completed.push(materiId);
  }
  progress.scores[materiId] = score;
  saveProgress(progress);
  return progress;
}

export function isMateriComplete(materiId: string): boolean {
  return getProgress().completed.includes(materiId);
}

/**
 * Materi ke-N terbuka jika materi ke-(N-1) sudah selesai.
 * Materi pertama (urutan 1) selalu terbuka.
 */
export function isMateriUnlocked(materiList: Materi[], materiId: string): boolean {
  // Unlock semua materi (fitur lock-per-urutan dinonaktifkan sementara).
  return true;
}

export function resetProgress() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
