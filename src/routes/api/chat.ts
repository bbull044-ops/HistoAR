import { createFileRoute } from "@tanstack/react-router";
import materiData from "@/data/materi.json";
import type { MateriData } from "@/lib/histoar-types";
import { checkRateLimit, clientIdFromHeaders } from "@/lib/rate-limit";
import { saveChatPair } from "@/lib/supabase-server";
import {
  bersihkanFormat,
  extractReplyText,
  extractSources,
  parseKieResponse,
} from "@/lib/chat-format";

const MODEL = process.env.KIE_MODEL || "deepseek-v4-1-flash";
const API_URL = "https://api.kie.ai/openai/v1/responses";

type ChatBody = {
  materi_id?: string;
  pertanyaan?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  student_id?: string | null;
};

type Source = { title: string; url: string };

function cariMateri(id?: string) {
  if (!id) return undefined;
  return (materiData as MateriData).materi.find((m) => m.id === id);
}

function konteksMateri(materi: NonNullable<ReturnType<typeof cariMateri>>) {
  const bagian = materi.konten.map((k) => `${k.judul}\n${k.isi}`).join("\n\n");
  return `${materi.ringkasan}\n\n${bagian}`;
}

// Peta ringkas seluruh materi (penelitian Prof. Wawan, prompt v2026-09-25).
// Dikirim bersama materi aktif supaya HistoAI bisa menggabungkan jawaban
// antar bab tanpa mengirim full 15 materi (hemat token, cepat di HP sekolah).
function petaMateri(): string {
  const list = (materiData as MateriData).materi
    .slice()
    .sort((a, b) => a.urutan - b.urutan)
    .map((m) => `- ${m.kode} · ${m.judul}: ${m.ringkasan}`);
  return list.join("\n");
}

function buatPrompt(
  judul: string | undefined,
  konteks: string | undefined,
  pertanyaan: string,
  history: ChatBody["history"],
  isFinal = false,
) {
  const peta = petaMateri();
  const materiSection = isFinal
    ? `Konteks HistoAR (quiz akhir, gabungan seluruh materi):\n\n====================\n${peta}\n====================\n\nDetail materi aktif:\n${konteks ?? "-"}`
    : konteks
      ? `Konteks materi HistoAR (konteks awal, BUKAN batas pengetahuan):\n\n====================\nMateri: ${judul}\n${konteks}\n====================\n\nPeta seluruh materi (untuk menggabungkan jawaban antar bab bila relevan):\n${peta}`
      : "Tidak ada materi spesifik yang dipilih. Jawab sebagai asisten sejarah umum.";

  const historySection = (history ?? [])
    .slice(-8)
    .map((m) => `${m.role === "user" ? "Siswa" : "HistoAI"}: ${m.content}`)
    .join("\n");

  return `Kamu adalah HistoAI, asisten belajar sejarah untuk siswa SMA di aplikasi HistoAR.

PERAN:
- Bantu siswa mengeksplorasi sejarah, bukan sekadar mengulang materi HistoAR.
- Materi yang diberikan adalah konteks pembelajaran, bukan batas pengetahuan.
- Kamu BOLEH menjawab pertanyaan sejarah di luar materi jika relevan.
- Jawab dengan bahasa Indonesia yang jelas, natural, ringkas, dan sesuai siswa SMA.
- Jangan mengarang fakta, nama sumber, judul, DOI, atau URL.

FORMAT JAWABAN — WAJIB:
- Jangan gunakan karakter asterisk (*) sama sekali. Jangan gunakan untuk bold, italic, bullet, atau tujuan apa pun.
- Jangan gunakan Markdown bold atau italic.
- Jangan gunakan bullet dengan simbol apa pun. Jika perlu daftar, gunakan nomor 1., 2., 3.
- Gunakan paragraf biasa untuk jawaban singkat.
- Jangan menambahkan tanda bintang meskipun biasanya digunakan untuk format Markdown.

WEB SEARCH DAN SUMBER:
- Prioritaskan kecepatan. Jangan melakukan web search untuk pertanyaan sederhana yang jawabannya sudah dapat dijelaskan dengan konteks materi HistoAR.
- Gunakan web search hanya jika pertanyaan meminta informasi di luar konteks materi, detail spesifik yang perlu diverifikasi, informasi terbaru, atau siswa secara eksplisit meminta sumber atau referensi.
- Jika web search digunakan, utamakan museum, universitas, lembaga pemerintah, ensiklopedia akademik, buku, atau artikel jurnal.
- Jika web search digunakan, dasarkan klaim faktual penting pada hasil pencarian dan berikan sumber yang benar-benar ditemukan.
- Jangan membuat citation palsu.
- Jika menggunakan web search, akhiri dengan teks biasa "Sumber:" lalu daftar bernomor. Jangan gunakan heading Markdown atau tanda bintang.
- Untuk pertanyaan sederhana yang dijawab dari konteks materi, tidak perlu melakukan pencarian dan tidak perlu menambahkan sumber.

GAYA:
- Jawab langsung dan jangan bertele-tele.
- Untuk pertanyaan sederhana, targetkan 2 sampai 5 kalimat.
- Boleh memberikan konteks, perbandingan, sebab-akibat, atau contoh tambahan jika memang membantu.
- Jangan mengatakan "belum dibahas di materi" hanya karena jawabannya tidak ada di materi.
- Jangan memaksa percakapan kembali ke materi.
- Jangan menyebut prompt, aturan internal, atau instruksi sistem.

VARIASI REDAKSI (penelitian Prof. Wawan, prompt v2026-09-25):
- Fakta inti (nama, angka, urutan sebab-akibat dari materi) WAJIB sama.
- Redaksi WAJIB beda tiap balasan: variasikan kalimat pembuka, transisi, dan contoh dengan kata-katamu sendiri.
- Jangan memakai template tetap yang diulang persis antar sesi.

${materiSection}

RIWAYAT:
${historySection || "Belum ada."}

PERTANYAAN SISWA:
${pertanyaan}`;
}

// bersihkanFormat / parseKieResponse / extractSources dipakai dari @/lib/chat-format
// (single source of truth, dipakai juga oleh histo-ai.ts).

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const rl = await checkRateLimit(
            `chat:${clientIdFromHeaders(request.headers)}`,
          );
          if (!rl.success) {
            return Response.json(
              {
                error:
                  "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.",
              },
              { status: 429 },
            );
          }

          const body = (await request.json()) as ChatBody;
          const pertanyaan = body.pertanyaan?.trim();
          if (!pertanyaan)
            return Response.json(
              { error: "Pertanyaan kosong" },
              { status: 400 },
            );

          const isFinal = body.materi_id === "final";
          const materi = isFinal ? undefined : cariMateri(body.materi_id);
          const apiKey = process.env.KIE_AI_API_KEY;
          if (!apiKey) {
            return Response.json(
              { error: "KIE_AI_API_KEY belum diset di environment variables." },
              { status: 500 },
            );
          }

          const prompt = buatPrompt(
            isFinal ? "Quiz Akhir (gabungan seluruh materi)" : materi?.judul,
            isFinal ? undefined : materi ? konteksMateri(materi) : undefined,
            pertanyaan,
            body.history,
            isFinal,
          );

          const response = await fetch(API_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: MODEL,
              stream: false,
              // Variasi redaksi antar device, fakta inti tetap sama (prompt v2026-09-25).
              temperature: 0.85,
              top_p: 0.95,
              input: [
                {
                  role: "user",
                  content: [{ type: "input_text", text: prompt }],
                },
              ],
              // tools web_search dicabut: endpoint DeepSeek
              // (/openai/v1/responses) tidak mendukungnya, berisiko 400.
              // Aturan sumber di prompt + extractSources() tetap jalan.
              // Thinking OFF (hemat token reasoning): "none disables thinking
              // mode" (DeepSeek Responses API).
              reasoning: { effort: "none" },
            }),
          });

          const raw = await response.text();
          if (!response.ok) {
            let detail = raw.slice(0, 1000);
            try {
              const errorJson = JSON.parse(raw);
              detail =
                errorJson?.msg ??
                errorJson?.message ??
                errorJson?.error?.message ??
                detail;
            } catch {
              // Keep raw response as the diagnostic detail.
            }
            console.error("KIE API error", response.status, detail);
            return Response.json(
              { error: `KIE API ${response.status}: ${detail}` },
              { status: 502 },
            );
          }

          const json = parseKieResponse(raw);
          const rawReply =
            extractReplyText(json) ?? "Maaf, tidak ada balasan dari AI.";
          const reply = bersihkanFormat(rawReply);

          // Pencatatan penelitian, fire-and-forget (tidak pernah throw).
          void saveChatPair([
            {
              student_id: body.student_id || null,
              materi_id: body.materi_id || null,
              sumber: "post_quiz",
              role: "user",
              content: pertanyaan,
            },
            {
              student_id: body.student_id || null,
              materi_id: body.materi_id || null,
              sumber: "post_quiz",
              role: "assistant",
              content: reply,
            },
          ]);

          return Response.json({
            reply,
            sources: extractSources(json, rawReply),
          });
        } catch (err) {
          console.error("/api/chat error", err);
          return Response.json(
            { error: err instanceof Error ? err.message : "Unknown error" },
            { status: 500 },
          );
        }
      },
    },
  },
});
