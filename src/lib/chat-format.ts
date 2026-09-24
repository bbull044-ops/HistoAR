// Helper shared untuk kedua jalur chatbot HistoAI:
// - landing: lib/histo-ai.ts (serverFn askHistoAI)
// - post-quiz: routes/api/chat.ts (HTTP route /api/chat)
//
// Tujuannya: aturan bintang (*) konsisten + parsing respons Kie.ai tahan
// JSON maupun SSE (data: {...}), supaya tidak throw mentah yang di-mask
// TanStack jadi "Server exception".
/* eslint-disable @typescript-eslint/no-explicit-any -- respons Kie.ai eksternal, bentuk JSON dinamis */

export type ChatSource = { title: string; url: string };

/** Samakan dengan api/chat.ts: hilangkan * + bullet ताकि tidak bocor ke UI. */
export function bersihkanFormat(reply: string): string {
  return reply
    .replace(/\*/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/^[ \t]+/gm, "")
    .trim();
}

/** Parse respons Kie: coba JSON penuh, fallback ke event-stream SSE. */
export function parseKieResponse(raw: string): any {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("KIE mengembalikan respons kosong.");

  try {
    return JSON.parse(trimmed);
  } catch {
    // Lanjut ke parsing SSE di bawah.
  }

  const events = trimmed
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .filter((data) => data && data !== "[DONE]")
    .map((data) => {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  if (!events.length) {
    throw new Error(`Respons KIE tidak dapat dibaca: ${trimmed.slice(0, 500)}`);
  }

  const complete = [...events]
    .reverse()
    .find((event) => Array.isArray(event?.output));
  if (complete) return complete;

  const output = events.flatMap((event) =>
    Array.isArray(event?.output) ? event.output : [],
  );
  return { output };
}

/** Ambil output_text dari struktur Kie { output: [{type:"message",...}] }. */
export function extractReplyText(json: any): string | undefined {
  const messageItem = json.output?.find(
    (item: { type: string }) => item.type === "message",
  );
  return (
    messageItem?.content?.find(
      (c: { type: string }) => c.type === "output_text",
    )?.text ??
    json.output
      ?.filter((item: any) => item.type === "message")
      ?.flatMap((item: any) => item.content ?? [])
      ?.find((content: any) => content.type === "output_text")?.text
  );
}

export function extractSources(json: any, reply: string): ChatSource[] {
  const sources: ChatSource[] = [];
  const seen = new Set<string>();

  const add = (title: string, url: string) => {
    if (!url || !/^https?:\/\//i.test(url) || seen.has(url)) return;
    seen.add(url);
    sources.push({ title: title || url, url });
  };

  const annotations =
    json?.output?.flatMap((item: any) => item?.content ?? []) ?? [];
  for (const item of annotations) {
    const candidates = [item?.annotations, item?.citations]
      .flat()
      .filter(Boolean);
    for (const annotation of candidates) {
      const list = Array.isArray(annotation) ? annotation : [annotation];
      for (const a of list) {
        add(
          a?.title ?? a?.source?.title ?? a?.url,
          a?.url ?? a?.source?.url ?? a?.href,
        );
      }
    }
  }

  const urls = reply.match(/https?:\/\/[^\s)<>]+/g) ?? [];
  for (const rawUrl of urls) add(rawUrl, rawUrl.replace(/[.,;:!?]+$/, ""));

  return sources.slice(0, 8);
}

/** Pesan Indonesia per kode error — dipakai frontend, tanpa [DEBUG]. */
export function pesanErrorIndonesia(code: string): string {
  switch (code) {
    case "RATE_LIMITED":
      return "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.";
    case "MISSING_KEY":
      return "HistoAI belum dikonfigurasi (API key kosong). Hubungi guru/admin atau cek file .env.";
    case "UPSTREAM_AUTH":
      return "Koneksi AI ditolak (API key salah/expired). Coba lagi nanti atau hubungi admin.";
    case "UPSTREAM_QUOTA":
      return "Kuota AI habis. Coba lagi nanti.";
    case "UPSTREAM_4xx":
      return "Permintaan ke AI ditolak server. Coba ubah pertanyaanmu sedikit lalu kirim ulang.";
    case "UPSTREAM_5xx":
      return "Server AI sedang gangguan. Tunggu sebentar lalu tekan Coba lagi.";
    case "BAD_RESPONSE":
      return "AI mengembalikan jawaban yang tidak terbaca. Tekan Coba lagi.";
    case "EMPTY_REPLY":
      return "AI tidak memberikan jawaban. Coba kirim ulang pertanyaanmu.";
    case "TIMEOUT":
      return "Koneksi ke AI timeout. Periksa internetmu lalu tekan Coba lagi.";
    default:
      return "Maaf, ada gangguan saat menjawab. Tekan Coba lagi.";
  }
}
