import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServer } from "@/lib/supabase-server";

type StudentsBody = {
  nama?: string;
  kelas?: string;
  sekolah?: string;
  consent?: boolean;
};

export const Route = createFileRoute("/api/students")({
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

          const body = (await request.json()) as StudentsBody;
          const nama = body.nama?.trim();
          const kelas = body.kelas?.trim();
          const sekolah = body.sekolah?.trim();

          if (!nama || !kelas || !sekolah) {
            return Response.json(
              { error: "Nama, kelas, dan sekolah wajib diisi." },
              { status: 400 },
            );
          }
          if (body.consent !== true) {
            return Response.json(
              { error: "Persetujuan penggunaan data wajib dicentang." },
              { status: 400 },
            );
          }

          const { data, error } = await supabase
            .from("students")
            .insert({
              nama,
              kelas,
              sekolah,
              consent_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (error || !data) {
            console.error("Gagal menyimpan siswa:", error);
            return Response.json(
              { error: "Gagal menyimpan identitas. Coba lagi." },
              { status: 500 },
            );
          }

          return Response.json({ id: data.id });
        } catch (err) {
          console.error("/api/students error", err);
          return Response.json(
            { error: err instanceof Error ? err.message : "Unknown error" },
            { status: 500 },
          );
        }
      },
    },
  },
});
