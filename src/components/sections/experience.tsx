import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import materiData from "@/data/materi.json";
import type { MateriData } from "@/lib/histoar-types";

const { materi } = materiData as MateriData;
const layerStack = [...materi].sort((a, b) => a.urutan - b.urutan).slice(0, 8);

function BentoCard({
  className = "",
  eyebrow,
  title,
  description,
  graphic,
}: {
  className?: string;
  eyebrow: string;
  title: string;
  description: string;
  graphic: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/30 ${className}`}
    >
      <div className="relative h-44 shrink-0 overflow-hidden sm:h-52">{graphic}</div>
      <div className="relative z-10 -mt-10 flex flex-1 flex-col justify-end border-t border-border bg-card/90 p-6 backdrop-blur-sm">
        <div className="catalog-label text-accent-foreground">{eyebrow}</div>
        <h3 className="mt-1 font-display text-xl font-medium">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

/** Graphic pameran: model 3D-nya sudah tampil di hero, di sini cukup motif
 *  "arahkan & jelajahi" (kompas + glow) biar gak dobel aset yang sama. */
function ExhibitGraphic() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-muted">
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(45% 65% at 50% 50%, oklch(0.58 0.09 175 / 0.18), transparent 70%)",
        }}
        aria-hidden
      />
      <Compass className="relative h-14 w-14 text-primary/70" strokeWidth={1.25} />
    </div>
  );
}

/** Graphic "core sample": tumpukan lapisan warna asli dari data materi,
 *  bukan foto stok, representasi literal dari metafora "belajar berlapis". */
function LayerStackGraphic() {
  return (
    <div className="flex h-full w-full items-stretch bg-muted">
      {layerStack.map((m) => (
        <div key={m.id} className="h-full flex-1" style={{ background: m.layerColor }} title={m.judul} />
      ))}
    </div>
  );
}

/** Graphic waveform audio: CSS murni, nge-pulse pelan gantian. */
function WaveformGraphic() {
  const bars = [40, 65, 90, 55, 75, 45, 85, 60, 70, 50, 80, 42];
  return (
    <div className="flex h-full w-full items-center justify-center gap-1.5 bg-muted px-8">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-2 rounded-full bg-primary/50"
          style={{
            height: `${h}%`,
            animation: `wave-pulse 1.8s ease-in-out ${i * 0.09}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/** Graphic pratinjau obrolan: mockup ringkas, konsisten sama Chatbot asli. */
function ChatPreviewGraphic() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-2 bg-muted px-8">
      <div className="max-w-[75%] self-start rounded-xl rounded-bl-sm border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
        Kenapa jawabanku salah?
      </div>
      <div className="max-w-[75%] self-end rounded-xl rounded-br-sm bg-primary px-3 py-2 text-xs text-primary-foreground">
        Coba kita bahas pelan-pelan…
      </div>
    </div>
  );
}

export function Experience() {
  return (
    <section id="experience" className="relative mx-auto max-w-6xl px-6 py-32">
      <div className="mb-16 max-w-2xl">
        <div className="catalog-label text-accent-foreground">Pengalaman Belajar</div>
        <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">
          Belajar sejarah dengan <span className="text-primary">tangan sendiri</span>.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Setiap materi digali, bukan sekadar dibaca: model, suara, dan diskusi jadi satu alur.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
        <BentoCard
          className="lg:col-span-4"
          eyebrow="Pameran Interaktif"
          title="Model 3D di ruanganmu sendiri"
          description="Diorama praaksara dihadirkan lewat augmented reality, langsung dari browser, tanpa instal apa pun. Putar, dekati, amati detailnya."
          graphic={<ExhibitGraphic />}
        />
        <BentoCard
          className="lg:col-span-2"
          eyebrow="Belajar Berlapis"
          title="Satu lapisan, satu waktu"
          description="Materi tersusun seperti lapisan tanah situs gali. Warnanya di atas persis lapisan materi yang akan kamu lewati."
          graphic={<LayerStackGraphic />}
        />
        <BentoCard
          className="lg:col-span-3"
          eyebrow="Narasi Audio"
          title="Dengarkan sambil memeriksa"
          description="Tiap bagian punya narasi suara, jadi kamu bisa dengarkan penjelasannya sambil memutar model AR-nya."
          graphic={<WaveformGraphic />}
        />
        <BentoCard
          className="lg:col-span-3"
          eyebrow="Pemandu HistoAI"
          title="Tanya sampai jelas"
          description="Setelah kuis, ngobrol dengan pemandu percakapan untuk bagian yang masih kurang jelas, bukan cuma dikasih nilai."
          graphic={<ChatPreviewGraphic />}
        />
      </div>
    </section>
  );
}
