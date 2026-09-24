import { createFileRoute } from "@tanstack/react-router";
import { checkSupabase, supabaseMissingEnv } from "@/lib/supabase-server";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const missing = supabaseMissingEnv();
        const supabase = await checkSupabase();
        return Response.json({
          ok: supabase.ok,
          hasKieKey: Boolean(process.env.KIE_AI_API_KEY),
          kieModel: process.env.KIE_MODEL ?? "deepseek-v4-1-flash",
          redis: process.env.UPSTASH_REDIS_REST_URL
            ? "configured"
            : "off (fail-open)",
          supabase: supabase.ok ? "ok" : supabase.detail,
          // Safe diagnostic only: never return the secret value.
          supabaseUrlRestPathNormalized: supabase.ok && !missing.includes("SUPABASE_URL"),
        });
      },
    },
  },
});
