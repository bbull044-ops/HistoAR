import { createFileRoute } from "@tanstack/react-router";

// Diagnostik tanpa bocorkan secret: bedakan "key belum set" vs "Kie down".
// Buka /api/health di browser setelah deploy.
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const hasKieKey = process.env.KIE_AI_API_KEY ? true : false;
        const hasRedis = Boolean(
          process.env.UPSTASH_REDIS_REST_URL &&
          process.env.UPSTASH_REDIS_REST_TOKEN,
        );
        return Response.json({
          ok: true,
          hasKieKey,
          kieModel: process.env.KIE_MODEL || "deepseek-v4-1-flash",
          redis: hasRedis ? "on" : "off (fail-open)",
        });
      },
    },
  },
});
