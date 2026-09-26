import { createFileRoute } from "@tanstack/react-router";
import { EXPORT_SESSION_COOKIE, exportSessionCookie } from "@/lib/export-session";

export const Route = createFileRoute("/api/export-logout")({
  server: {
    handlers: {
      POST: async () =>
        Response.json(
          { ok: true },
          {
            headers: {
              "Set-Cookie": exportSessionCookie("", 0),
              "Cache-Control": "no-store",
            },
          },
        ),
    },
  },
});
