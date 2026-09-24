#!/usr/bin/env node
// Verifies the vendored AR libraries in public/vendor/ are present and unmodified.
//
// These files are served from our own origin so the service worker can precache them
// and so a filtered or slow CDN cannot kill an AR session in a classroom. That only
// holds if the files are actually the ones we vetted, hence the checksums.
//
// Run standalone:  node scripts/check-vendor.mjs
// Exit codes:      0 = all good, 1 = missing or altered file
//
// When updating a library, follow public/vendor/VENDOR.md and change EXPECTED below.

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Source of truth for what may be served from public/vendor/.
 * Keep in sync with the table in public/vendor/VENDOR.md.
 */
const EXPECTED = [
  {
    file: "public/vendor/aframe-1.5.0.min.js",
    version: "1.5.0",
    source: "https://aframe.io/releases/1.5.0/aframe.min.js",
    sha256: "4fe911ce356f034b05da1a00d3a205ec19c8cf9de0ea17592cc6481b2cb98afb",
  },
  {
    file: "public/vendor/mindar-image-aframe-1.2.5.prod.js",
    version: "1.2.5",
    source: "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js",
    sha256: "42764d6f1b39387f5786b9c4cfbe50883e13ca3f47b42bf1e54e84510b374013",
  },
];

async function sha256Of(absPath) {
  const buf = await readFile(absPath);
  return createHash("sha256").update(buf).digest("hex");
}

let failed = 0;

for (const entry of EXPECTED) {
  const abs = join(root, entry.file);
  let actual;

  try {
    actual = await sha256Of(abs);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(`MISSING  ${entry.file}`);
      console.error(`         re-download from ${entry.source}`);
      failed++;
      continue;
    }
    throw err;
  }

  if (actual !== entry.sha256) {
    console.error(`ALTERED  ${entry.file}`);
    console.error(`         expected ${entry.sha256}`);
    console.error(`         actual   ${actual}`);
    console.error(`         if this was an intentional upgrade, follow public/vendor/VENDOR.md`);
    failed++;
    continue;
  }

  console.log(`ok       ${relative(root, abs).replace(/\\/g, "/")}  (v${entry.version})`);
}

if (failed > 0) {
  console.error(`\ncheck-vendor: ${failed} problem(s). AR will not load correctly.`);
  process.exit(1);
}

console.log(`\ncheck-vendor: ${EXPECTED.length} vendored file(s) verified.`);
