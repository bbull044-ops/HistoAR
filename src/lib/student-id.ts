// Identitas siswa tanpa login: UUID dari server, disimpan di localStorage.
// Semua event penelitian (quiz, chat) membawa ID ini.
// Kunci baru, terpisah dari histoar_progress (progres belajar lokal).

const STORAGE_KEY = "histoar_student_id";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStudentId(): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStudentId(id: string) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch (err) {
    console.error("Gagal menyimpan ID siswa:", err);
  }
}
