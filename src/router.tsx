import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { initMonitoring } from "./lib/monitoring";

export const getRouter = () => {
  // Aktifkan error tracking sedini mungkin di client (no-op di server & bila
  // VITE_SENTRY_DSN kosong). Ditaruh di sini agar jalan untuk semua rute.
  initMonitoring();

  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
