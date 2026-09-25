import { createFileRoute } from "@tanstack/react-router";
import materiData from "@/data/materi.json";
import type { MateriData } from "@/lib/histoar-types";
import { csvFile } from "@/lib/csv";
import { checkRateLimit, clientIdFromHeaders } from "@/lib/rate-limit";
import { getSupabaseServer } from "@/lib/supabase-server";

// Export CSV data penelitian Prof. Wawan (halaman /rekap).
// Proteksi: password tunggal via header `x-export-password`, dicocokkan
// dengan env EXPORT_PASSWORD. Halaman tidak ditautkan di nav.
// Semua baca DB server-side (service_role tidak pernah ke browser).

type Jenis = "rekap" | "siswa" | "chat" | "quiz" | "anonim";

const JENIS_VALID: Jenis[] = ["rekap", "siswa", "chat", "quiz", "anonim"];

interface StudentRow {
  id: string;
  nama: string;
  kelas: string;
  sekolah: string;
  consent_at: string;
  created_at: string;
}

interface ChatRow {
  student_id: string | null;
  materi_id: string | null;
  sumber: string;
  role: string;
  content: string;
  created_at: string;
}

interface QuizRow {
  student_id: string;
  materi_id: string;
  score: number;
  total: number;
  answers: unknown;
  started_at: string | null;
  finished_at: string;
}

async function fetchAll<T>(table: string, orderCol: string): Promise<T[]> {
  const supabase = getSupabaseServer();
  const out: T[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(orderCol, { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Gagal membaca ${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    out.push(...(data as T[]));
    if (data.length < PAGE) break;
  }
  return out;
}

function csvResponse(filename: string, body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export const Route = createFileRoute("/api/export")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const rl = await checkRateLimit(
            `export:${clientIdFromHeaders(request.headers)}`,
          );
          if (!rl.success) {
            return Response.json(
              { error: "Terlalu banyak permintaan. Tunggu sebentar." },
              { status: 429 },
            );
          }

          const password = process.env.EXPORT_PASSWORD;
          if (!password) {
            return Response.json(
              { error: "Export belum dikonfigurasi (EXPORT_PASSWORD kosong)." },
              { status: 500 },
            );
          }

          const given = request.headers.get("x-export-password");
          if (given !== password) {
            return Response.json({ error: "Password salah." }, { status: 401 });
          }

          const url = new URL(request.url);
          const jenis = url.searchParams.get("jenis");
          if (!jenis || !JENIS_VALID.includes(jenis as Jenis)) {
            return Response.json(
              { error: "Jenis export tidak dikenal." },
              { status: 400 },
            );
          }

          const today = new Date().toISOString().slice(0, 10);
          const students = await fetchAll<StudentRow>("students", "created_at");
          const byId = new Map(students.map((s) => [s.id, s]));

          if (jenis === "siswa") {
            return csvResponse(
              `histoar-siswa-${today}.csv`,
              csvFile(
                ["nama", "kelas", "sekolah", "consent_at", "created_at"],
                students.map((s) => [
                  s.nama,
                  s.kelas,
                  s.sekolah,
                  s.consent_at,
                  s.created_at,
                ]),
              ),
            );
          }

          const chats = await fetchAll<ChatRow>("chat_messages", "created_at");
          const identified = chats.filter((c) => c.student_id !== null);
          const anonymous = chats.filter((c) => c.student_id === null);

          if (jenis === "chat") {
            return csvResponse(
              `histoar-chat-${today}.csv`,
              csvFile(
                [
                  "created_at",
                  "nama",
                  "kelas",
                  "sekolah",
                  "materi_id",
                  "sumber",
                  "role",
                  "content",
                ],
                identified.map((c) => {
                  const s = c.student_id ? byId.get(c.student_id) : undefined;
                  return [
                    c.created_at,
                    s?.nama ?? "",
                    s?.kelas ?? "",
                    s?.sekolah ?? "",
                    c.materi_id,
                    c.sumber,
                    c.role,
                    c.content,
                  ];
                }),
              ),
            );
          }

          if (jenis === "anonim") {
            return csvResponse(
              `histoar-anonim-${today}.csv`,
              csvFile(
                ["created_at", "materi_id", "sumber", "role", "content"],
                anonymous.map((c) => [
                  c.created_at,
                  c.materi_id,
                  c.sumber,
                  c.role,
                  c.content,
                ]),
              ),
            );
          }

          const attempts = await fetchAll<QuizRow>(
            "quiz_attempts",
            "finished_at",
          );

          if (jenis === "quiz") {
            return csvResponse(
              `histoar-quiz-${today}.csv`,
              csvFile(
                [
                  "finished_at",
                  "nama",
                  "kelas",
                  "sekolah",
                  "materi_id",
                  "score",
                  "total",
                  "started_at",
                  "answers",
                ],
                attempts.map((a) => {
                  const s = byId.get(a.student_id);
                  return [
                    a.finished_at,
                    s?.nama ?? "",
                    s?.kelas ?? "",
                    s?.sekolah ?? "",
                    a.materi_id,
                    a.score,
                    a.total,
                    a.started_at,
                    JSON.stringify(a.answers ?? []),
                  ];
                }),
              ),
            );
          }

          // jenis === "rekap": 1 baris per siswa.
          const { materi: materiList } = materiData as MateriData;
          const ordered = [...materiList].sort((a, b) => a.urutan - b.urutan);

          const userChats = identified.filter((c) => c.role === "user");
          const chatsByStudent = new Map<string, ChatRow[]>();
          for (const c of userChats) {
            const key = c.student_id as string;
            const arr = chatsByStudent.get(key) ?? [];
            arr.push(c);
            chatsByStudent.set(key, arr);
          }
          const finalsByStudent = new Map<string, QuizRow[]>();
          for (const a of attempts) {
            if (a.materi_id !== "final") continue;
            const arr = finalsByStudent.get(a.student_id) ?? [];
            arr.push(a);
            finalsByStudent.set(a.student_id, arr);
          }

          const header = [
            "nama",
            "kelas",
            "sekolah",
            "consent_at",
            ...ordered.map((m) => `chat_${m.id}`),
            "chat_total",
            "materi_diskusi",
            "quiz_skor",
            "quiz_total",
            "quiz_tanggal",
            "quiz_attempts",
          ];
          const rows = students.map((s) => {
            const list = chatsByStudent.get(s.id) ?? [];
            const perMateri = ordered.map(
              (m) => list.filter((c) => c.materi_id === m.id).length,
            );
            const finals = finalsByStudent.get(s.id) ?? [];
            const latest = finals[finals.length - 1];
            return [
              s.nama,
              s.kelas,
              s.sekolah,
              s.consent_at,
              ...perMateri,
              list.length,
              new Set(list.map((c) => c.materi_id)).size,
              latest?.score ?? "",
              latest?.total ?? "",
              latest?.finished_at ?? "",
              finals.length,
            ];
          });

          return csvResponse(
            `histoar-rekap-${today}.csv`,
            csvFile(header, rows),
          );
        } catch (err) {
          console.error("/api/export error", err);
          return Response.json(
            { error: err instanceof Error ? err.message : "Unknown error" },
            { status: 500 },
          );
        }
      },
    },
  },
});
