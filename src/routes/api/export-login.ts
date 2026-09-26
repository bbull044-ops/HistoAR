import { createFileRoute } from "@tanstack/react-router";
import { checkRateLimit, clientIdFromHeaders } from "@/lib/rate-limit";
import { getSupabaseServer } from "@/lib/supabase-server";
import { createExportSession, exportSessionCookie } from "@/lib/export-session";

export const Route = createFileRoute("/api/export-login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rl = await checkRateLimit(`export-login:${clientIdFromHeaders(request.headers)}`);
        if (!rl.success) return Response.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });

        try {
          const body = await request.json().catch(() => null);
          const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
          const password = typeof body?.password === "string" ? body.password : "";
          if (!username || !password) return Response.json({ error: "Username dan password wajib diisi." }, { status: 400 });

          const { data, error } = await getSupabaseServer().rpc("verify_export_login", {
            p_username: username,
            p_password: password,
          });
          if (error) {
            console.error("Export login verifier error:", error);
            return Response.json({ error: "Login belum dapat diproses." }, { status: 500 });
          }
          if (data !== true) return Response.json({ error: "Username atau password salah." }, { status: 401 });

          const token = createExportSession(username);
          return Response.json(
            { ok: true, username },
            { headers: { "Set-Cookie": exportSessionCookie(token), "Cache-Control": "no-store" } },
          );
        } catch (err) {
          console.error("/api/export-login error", err);
          return Response.json({ error: "Login gagal." }, { status: 500 });
        }
      },
    },
  },
});
