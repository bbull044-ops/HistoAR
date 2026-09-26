import { createFileRoute } from "@tanstack/react-router";
import { getExportSessionFromRequest } from "@/lib/export-session";

export const Route = createFileRoute("/api/export-session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = getExportSessionFromRequest(request);
        if (!session) return Response.json({ loggedIn: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
        return Response.json({ loggedIn: true, username: session.username }, { headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});
