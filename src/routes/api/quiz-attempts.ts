import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServer } from "@/lib/supabase-server";

type AnswerItem = { soal_id?: string; dipilih?: number; benar?: boolean };

type AttemptBody = {
  student_id?: string;
  materi_id?: string;
  score?: number;
  total?: number;
  answers?: AnswerItem[];
  started_at?: string;
};

export const Route = createFileRoute("/api/quiz-attempts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          let supabase;
          try {
            supabase = getSupabaseServer();
          } catch (err) {
            console.error("Supabase belum dikonfigurasi:", err);
            return Response.json(
              { error: "Database belum dikonfigurasi." },
              { status: 500 },
            );
          }

          const body = (await request.json()) as AttemptBody;
          if (
            !body.student_id ||
            !body.materi_id ||
            typeof body.score !== "number" ||
            typeof body.total !== "number" ||
            !Array.isArray(body.answers)
          ) {
            return Response.json(
              { error: "Data percobaan quiz tidak lengkap." },
              { status: 400 },
            );
          }

          // Penelitian Prof. Wawan: satu quiz akhir, total selalu 10.
          // Data lama per-materi tetap tersimpan di tabel (arsip).
          if (body.materi_id !== "final" || body.total !== 10) {
            return Response.json(
              {
                error:
                  "Quiz akhir harus materi_id 'final' dengan total 10 soal.",
              },
              { status: 400 },
            );
          }

          const answers = body.answers
            .filter((a) => typeof a?.soal_id === "string")
            .map((a) => ({
              soal_id: a.soal_id as string,
              dipilih: typeof a.dipilih === "number" ? a.dipilih : null,
              benar: a.benar === true,
            }));

          const { error } = await supabase.from("quiz_attempts").insert({
            student_id: body.student_id,
            materi_id: body.materi_id,
            score: body.score,
            total: body.total,
            answers,
            started_at: body.started_at || null,
          });

          if (error) {
            console.error("Gagal menyimpan quiz attempt:", error);
            return Response.json(
              { error: "Gagal menyimpan hasil quiz." },
              { status: 500 },
            );
          }

          return Response.json({ ok: true });
        } catch (err) {
          console.error("/api/quiz-attempts error", err);
          return Response.json(
            { error: err instanceof Error ? err.message : "Unknown error" },
            { status: 500 },
          );
        }
      },
    },
  },
});
