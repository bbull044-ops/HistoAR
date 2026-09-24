import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client Supabase server-side saja.
// JANGAN diimpor dari komponen client — credential server tidak boleh bocor ke browser.

let cached: SupabaseClient | undefined;

function normalizeSupabaseUrl(rawUrl: string): string {
  // createClient() sudah otomatis menambahkan /rest/v1 untuk PostgREST.
  // Jika env berisi URL REST lengkap (.../rest/v1), jangan sampai menjadi
  // /rest/v1/rest/v1/... (PGRST125: Invalid path specified in request URL).
  return rawUrl.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
}

export function supabaseMissingEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  return missing;
}

export function getSupabaseServer(): SupabaseClient {
  if (cached) return cached;
  const rawUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !key) {
    throw new Error(
      `Supabase belum dikonfigurasi (missing: ${supabaseMissingEnv().join(", ")}). ` +
        "Isi di .env.local dan Vercel Environment Variables.",
    );
  }

  const url = normalizeSupabaseUrl(rawUrl);
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export type ChatLogRow = {
  student_id: string | null;
  materi_id: string | null;
  sumber: "landing" | "post_quiz";
  role: "user" | "assistant";
  content: string;
};

/**
 * Simpan pasangan chat user+assistant, fire-and-forget dari pemanggil
 * (pakai `void saveChatPair(...)`). Tidak pernah throw: gagal = log saja,
 * supaya pencatatan tidak mengganggu balasan AI ke siswa.
 */
export async function saveChatPair(rows: ChatLogRow[]): Promise<void> {
  try {
    const clean = rows
      .filter(
        (r) => typeof r.content === "string" && r.content.trim().length > 0,
      )
      .map((r) => ({ ...r, content: r.content.slice(0, 8000) }));
    if (clean.length === 0) return;
    const { error } = await getSupabaseServer()
      .from("chat_messages")
      .insert(clean);
    if (error) console.error("Gagal menyimpan chat:", error);
  } catch (err) {
    console.error("Gagal menyimpan chat:", err);
  }
}

/** Cek koneksi ringan untuk /api/health (select 1 baris, tanpa bocorkan secret). */
export async function checkSupabase(): Promise<{
  ok: boolean;
  detail: string;
}> {
  const missing = supabaseMissingEnv();
  if (missing.length > 0)
    return { ok: false, detail: `MISSING_ENV:${missing.join(",")}` };
  try {
    const { error } = await getSupabaseServer()
      .from("students")
      .select("id", { count: "exact", head: true });
    if (error)
      return { ok: false, detail: `DB:${error.message}`.slice(0, 200) };
    return { ok: true, detail: "ok" };
  } catch (err) {
    return {
      ok: false,
      detail: `EXC:${err instanceof Error ? err.message : String(err)}`.slice(
        0,
        200,
      ),
    };
  }
}
