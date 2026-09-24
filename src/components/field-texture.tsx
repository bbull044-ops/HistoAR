import { CaveArtMotif } from "@/components/cave-art-motif";

/**
 * Latar belakang ala "meja kerja arkeolog": grid survei situs yang sangat
 * samar + tekstur butiran kertas + motif lukisan gua pudar, ditambah cahaya
 * lembut yang bergerak pelan, CSS-only (transform/opacity), jadi ringan,
 * bukan partikel JS. Disiplin "satu aksen saja": cuma verdigris (warna
 * utama) + satu titik cahaya netral bone-white, bukan palet warna-warni.
 */
export function FieldTexture() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden grain">
      <div
        className="ember-glow-slow absolute -top-1/4 left-1/4 h-[70vh] w-[70vh] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, oklch(0.58 0.09 175 / 0.14), transparent 65%)",
        }}
      />
      <div
        className="ember-glow-slow absolute bottom-0 right-0 h-[60vh] w-[60vh] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, oklch(0.94 0.006 75 / 0.05), transparent 65%)",
          animationDelay: "-8s",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 1) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_15%,var(--color-background)_85%)]" />
      <CaveArtMotif />
    </div>
  );
}
