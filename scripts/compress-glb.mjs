/**
 * compress-glb.mjs — Kompresi aset GLB HistoAR untuk perf mobile.
 *
 * Strategi (SENGAJA konservatif, "no runtime decoder needed"):
 *  - Tekstur adalah ~85% berat file (photoscan Tripo: baseColor 2048² JPEG,
 *    gpuSize ~22MB/tekstur). Kita resize ke maks 1024 + re-encode (JPEG q80 /
 *    PNG), TANPA mengubah format (tetap core glTF → dijamin load di A-Frame
 *    `<a-gltf-model>` & drei `useGLTF`, tanpa Draco/meshopt/webp decoder).
 *  - Geometri (~2MB) TIDAK disentuh: skip join/weld agar rig & animasi
 *    (berburu_meramu, meganthropus, dll) tidak berisiko. Hanya dedup + prune
 *    (buang data tak terpakai) yang aman.
 *
 * Idempotent: aman dijalankan ulang (tekstur ≤1024 tak di-upscale).
 * Jalankan: node scripts/compress-glb.mjs [--dry]
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, textureCompress } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIRS = ["public/assets/models", "public/models"];
const MAX_TEX = 1024;
const JPEG_Q = 80;
const DRY = process.argv.includes("--dry");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (extname(p).toLowerCase() === ".glb") out.push(p);
  }
  return out;
}

// Daftarkan semua ekstensi + decoder Draco untuk BACA. Karena kita tidak pernah
// memanggil draco() saat tulis, output = glTF standar (Draco di-decompress &
// dihapus → tak butuh DracoLoader di runtime). Ini sekaligus menutup risiko
// zaman_logam.glb (satu-satunya file Draco) yang bisa gagal muat di A-Frame.
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "draco3d.decoder": await draco3d.createDecoderModule(),
});
const files = DIRS.flatMap((d) => {
  try {
    return walk(join(ROOT, d));
  } catch {
    return [];
  }
});

let totalBefore = 0;
let totalAfter = 0;
const rows = [];

for (const file of files) {
  const before = statSync(file).size;
  totalBefore += before;
  const originalBytes = readFileSync(file);

  const doc = await io.read(file);

  // Buang ekstensi Draco (jika ada): geometri sudah ter-decode ke accessor
  // standar saat read; dispose → output glTF standar tanpa dependensi Draco.
  // File Draco SELALU dipertahankan versi decompress-nya (walau lebih besar),
  // karena runtime tak punya DracoLoader → versi asli tidak bisa dimuat.
  let hadDraco = false;
  for (const ext of doc.getRoot().listExtensionsUsed()) {
    if (ext.extensionName === "KHR_draco_mesh_compression") {
      hadDraco = true;
      ext.dispose();
    }
  }

  await doc.transform(
    dedup(),
    prune({ keepAttributes: true, keepLeaves: false }),
    textureCompress({
      encoder: sharp,
      targetFormat: "jpeg",
      formats: /^image\/jpeg$/,
      resize: [MAX_TEX, MAX_TEX],
      quality: JPEG_Q,
    }),
    textureCompress({
      encoder: sharp,
      targetFormat: "png",
      formats: /^image\/png$/,
      resize: [MAX_TEX, MAX_TEX],
    }),
  );

  let after = before;
  let kept = false;
  if (!DRY) {
    await io.write(file, doc);
    after = statSync(file).size;
    // Guard: kalau hasil >= asli DAN bukan file Draco, kembalikan versi asli
    // (tak ada gunanya mengirim file lebih besar). File Draco dikecualikan.
    if (after >= before && !hadDraco) {
      writeFileSync(file, originalBytes);
      after = before;
      kept = true;
    }
  }
  totalAfter += after;

  const rel = file.replace(ROOT + "\\", "").replace(ROOT + "/", "");
  const pct = before ? Math.round((1 - after / before) * 100) : 0;
  rows.push({ rel, before, after, pct, kept, hadDraco });
}

const kb = (n) => (n / 1024).toFixed(0) + " KB";
const mb = (n) => (n / 1024 / 1024).toFixed(2) + " MB";

rows.sort((a, b) => b.before - a.before);
console.log(`\n${DRY ? "[DRY RUN] " : ""}Kompresi ${files.length} GLB (maks tekstur ${MAX_TEX}px, JPEG q${JPEG_Q})\n`);
for (const r of rows) {
  const tag = r.hadDraco ? " [draco→decompress]" : r.kept ? " [kept original]" : "";
  console.log(`${String(r.pct).padStart(3)}%  ${kb(r.before).padStart(9)} -> ${kb(r.after).padStart(9)}  ${r.rel}${tag}`);
}
console.log(
  `\nTOTAL: ${mb(totalBefore)} -> ${mb(totalAfter)}  (-${Math.round((1 - totalAfter / totalBefore) * 100)}%)`,
);
