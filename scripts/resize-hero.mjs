// scripts/resize-hero.mjs
// Datum: 2026-05-10
// Cíl: zmenšit a re-kompresovat hero obrázky pro lepší PageSpeed skóre.
//   - Desktop hero (hero-poster.webp): resize na 1440x810 (16:9), webp q=80
//   - Mobile hero  (hero-poster-sm.webp): re-komprese webp q=65 (rozměry zachovány)
// Spuštění: `node scripts/resize-hero.mjs`

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'public', 'images');

const DESKTOP = path.join(IMG_DIR, 'hero-poster.webp');
const MOBILE = path.join(IMG_DIR, 'hero-poster-sm.webp');

const fmtKiB = (bytes) => `${(bytes / 1024).toFixed(2)} KiB`;

async function safeStat(p) {
  try {
    return await fs.stat(p);
  } catch {
    return null;
  }
}

async function processImage({ label, file, transform, webpOptions }) {
  const before = await safeStat(file);
  if (!before) {
    console.error(`[${label}] CHYBA: soubor neexistuje -> ${file}`);
    return null;
  }
  const meta = await sharp(file).metadata();
  console.log(`\n[${label}]`);
  console.log(`  Vstup: ${path.relative(ROOT, file)}`);
  console.log(`  Rozměry před: ${meta.width}x${meta.height}`);
  console.log(`  Velikost před: ${fmtKiB(before.size)}`);

  // Načti celý buffer DOPŘEDU (čteme a přepisujeme stejný soubor — sharp by jinak
  // mohl číst po našem zápisu; bezpečnější je decode do bufferu před zápisem).
  const inputBuffer = await fs.readFile(file);

  let pipeline = sharp(inputBuffer);
  if (transform) pipeline = transform(pipeline);
  pipeline = pipeline.webp(webpOptions);

  const outputBuffer = await pipeline.toBuffer();
  await fs.writeFile(file, outputBuffer);

  const after = await fs.stat(file);
  const metaAfter = await sharp(file).metadata();
  console.log(`  Rozměry po:   ${metaAfter.width}x${metaAfter.height}`);
  console.log(`  Velikost po:  ${fmtKiB(after.size)}`);
  const savedBytes = before.size - after.size;
  const savedPct = (savedBytes / before.size) * 100;
  console.log(`  Ušetřeno:     ${fmtKiB(savedBytes)} (${savedPct.toFixed(1)} %)`);

  return { label, beforeBytes: before.size, afterBytes: after.size, savedBytes };
}

async function main() {
  console.log('Re-komprese hero obrázků (sharp)…');

  const results = [];

  // 1) Desktop — resize 1440x810, q=80
  const desktopRes = await processImage({
    label: 'desktop hero-poster.webp',
    file: DESKTOP,
    transform: (p) => p.resize(1440, 810, { fit: 'cover', position: 'centre' }),
    webpOptions: { quality: 80, effort: 6 },
  });
  if (desktopRes) results.push(desktopRes);

  // 2) Mobile — bez resize, jen lepší komprese q=65
  const mobileRes = await processImage({
    label: 'mobile  hero-poster-sm.webp',
    file: MOBILE,
    transform: null,
    webpOptions: { quality: 65, effort: 6 },
  });
  if (mobileRes) results.push(mobileRes);

  // Souhrn
  console.log('\n────────── SOUHRN ──────────');
  let totalBefore = 0;
  let totalAfter = 0;
  for (const r of results) {
    console.log(
      `${r.label.padEnd(28)}  ${fmtKiB(r.beforeBytes).padStart(10)}  ->  ${fmtKiB(
        r.afterBytes
      ).padStart(10)}   (ušetřeno ${fmtKiB(r.savedBytes)})`
    );
    totalBefore += r.beforeBytes;
    totalAfter += r.afterBytes;
  }
  const totalSaved = totalBefore - totalAfter;
  const totalPct = (totalSaved / totalBefore) * 100;
  console.log('────────────────────────────');
  console.log(
    `CELKEM:                         ${fmtKiB(totalBefore).padStart(10)}  ->  ${fmtKiB(
      totalAfter
    ).padStart(10)}   (ušetřeno ${fmtKiB(totalSaved)}, ${totalPct.toFixed(1)} %)`
  );
}

main().catch((err) => {
  console.error('Chyba při zpracování:', err);
  process.exit(1);
});
