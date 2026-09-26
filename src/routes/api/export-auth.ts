import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServer } from "@/lib/supabase-server";
import materiData from "@/data/materi.json";
import type { MateriData } from "@/lib/histoar-types";
import { csvFile } from "@/lib/csv";

type Jenis = "rekap" | "siswa" | "chat" | "quiz" | "anonim";
interface StudentRow { id: string; nama: string; kelas: string; sekolah: string; consent_at: string; created_at: string; }
interface ChatRow { student_id: string | null; materi_id: string | null; sumber: string; role: string; content: string; created_at: string; }
interface QuizRow { student_id: string; materi_id: string; score: number; total: number; answers: unknown; started_at: string | null; finished_at: string; }

async function fetchAll<T>(table: string, orderCol: string): Promise<T[]> {
  const supabase = getSupabaseServer();
  const out: T[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from(table).select("*").order(orderCol, { ascending: true }).range(from, from + PAGE - 1);
    if (error) throw new Error(`Gagal membaca ${table}: ${error.message}`);
    if (!data?.length) break;
    out.push(...(data as T[]));
    if (data.length < PAGE) break;
  }
  return out;
}

function csvResponse(filename: string, body: string) {
  return new Response(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "private, no-store" } });
}

export const Route = createFileRoute("/api/export-auth")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const auth = request.headers.get("authorization");
          const token = auth?.startsWith("Bearer ") ? auth.slice(7) : "";
          if (!token) return Response.json({ error: "Belum login." }, { status: 401 });

          const supabase = getSupabaseServer();
          const { data: { user }, error: authError } = await supabase.auth.getUser(token);
          if (authError || !user || user.is_anonymous || !user.email) return Response.json({ error: "Sesi login tidak valid." }, { status: 401 });

          const { data: access, error: accessError } = await supabase.from("export_access").select("enabled").eq("email", user.email.toLowerCase()).maybeSingle();
          if (accessError) throw new Error(`Gagal memeriksa akses export: ${accessError.message}`);
          if (!access?.enabled) return Response.json({ error: "Akun ini tidak punya akses export." }, { status: 403 });

          const url = new URL(request.url);
          const jenis = url.searchParams.get("jenis") as Jenis | null;
          if (!jenis || !["rekap", "siswa", "chat", "quiz", "anonim"].includes(jenis)) return Response.json({ error: "Jenis export tidak dikenal." }, { status: 400 });

          const today = new Date().toISOString().slice(0, 10);
          const students = await fetchAll<StudentRow>("students", "created_at");
          const byId = new Map(students.map((s) => [s.id, s]));

          if (jenis === "siswa") return csvResponse(`histoar-siswa-${today}.csv`, csvFile(["nama", "kelas", "sekolah", "consent_at", "created_at"], students.map((s) => [s.nama, s.kelas, s.sekolah, s.consent_at, s.created_at])));

          const chats = await fetchAll<ChatRow>("chat_messages", "created_at");
          const identified = chats.filter((c) => c.student_id !== null);
          const anonymous = chats.filter((c) => c.student_id === null);

          if (jenis === "chat") return csvResponse(`histoar-chat-${today}.csv`, csvFile(["created_at", "nama", "kelas", "sekolah", "materi_id", "sumber", "role", "content"], identified.map((c) => { const s = c.student_id ? byId.get(c.student_id) : undefined; return [c.created_at, s?.nama ?? "", s?.kelas ?? "", s?.sekolah ?? "", c.materi_id, c.sumber, c.role, c.content]; })));
          if (jenis === "anonim") return csvResponse(`histoar-anonim-${today}.csv`, csvFile(["created_at", "materi_id", "sumber", "role", "content"], anonymous.map((c) => [c.created_at, c.materi_id, c.sumber, c.role, c.content])));

          const attempts = await fetchAll<QuizRow>("quiz_attempts", "finished_at");
          if (jenis === "quiz") return csvResponse(`histoar-quiz-${today}.csv`, csvFile(["finished_at", "nama", "kelas", "sekolah", "materi_id", "score", "total", "started_at", "answers"], attempts.map((a) => { const s = byId.get(a.student_id); return [a.finished_at, s?.nama ?? "", s?.kelas ?? "", s?.sekolah ?? "", a.materi_id, a.score, a.total, a.started_at, JSON.stringify(a.answers ?? [])]; })));

          const { materi: materiList } = materiData as MateriData;
          const ordered = [...materiList].sort((a, b) => a.urutan - b.urutan);
          const userChats = identified.filter((c) => c.role === "user");
          const chatsByStudent = new Map<string, ChatRow[]>();
          for (const c of userChats) { const arr = chatsByStudent.get(c.student_id!) ?? []; arr.push(c); chatsByStudent.set(c.student_id!, arr); }
          const finalsByStudent = new Map<string, QuizRow[]>();
          for (const a of attempts) { if (a.materi_id !== "final") continue; const arr = finalsByStudent.get(a.student_id) ?? []; arr.push(a); finalsByStudent.set(a.student_id, arr); }

          const header = ["nama", "kelas", "sekolah", "consent_at", ...ordered.map((m) => `chat_${m.id}`), "chat_total", "materi_diskusi", "quiz_skor", "quiz_total", "quiz_tanggal", "quiz_attempts"];
          const rows = students.map((s) => { const list = chatsByStudent.get(s.id) ?? []; const perMateri = ordered.map((m) => list.filter((c) => c.materi_id === m.id).length); const finals = finalsByStudent.get(s.id) ?? []; const latest = finals[finals.length - 1]; return [s.nama, s.kelas, s.sekolah, s.consent_at, ...perMateri, list.length, new Set(list.map((c) => c.materi_id)).size, latest?.score ?? "", latest?.total ?? "", latest?.finished_at ?? "", finals.length]; });
          return csvResponse(`histoar-rekap-${today}.csv`, csvFile(header, rows));
        } catch (err) {
          console.error("/api/export-auth error", err);
          return Response.json({ error: err instanceof Error ? err.message : "Gagal membuat export." }, { status: 500 });
        }
      },
    },
  },
});
