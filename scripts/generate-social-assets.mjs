#!/usr/bin/env node
/**
 * generate-social-assets.mjs — chybějící sdílecí a ikonové assety
 * Datum: 2026-08-14
 *
 * Proč: `BaseLayout.astro` odkazuje na `/images/og-default.jpg`
 * (og:image + twitter:image na VŠECH stránkách) a na `/apple-touch-icon.png`
 * (link rel + site.webmanifest). Ani jeden soubor v `public/` neexistoval →
 * náhledy odkazů na Facebooku, Discordu, WhatsAppu a Slacku se renderovaly
 * bez obrázku a Twitter Card padala ze `summary_large_image` na `summary`.
 *
 * Navíc Google pro `Organization.logo` v JSON-LD neakceptuje SVG — potřebuje
 * raster (PNG/JPG/GIF). Proto generujeme i `logo/pan-prstenu.png`.
 *
 * Zdroje:
 *   - og-default.jpg   ← public/images/hero-poster.webp (1440×810 → 1200×630 cover)
 *   - apple-touch-icon ← public/favicon.svg na tmavém podkladu (180×180)
 *   - logo PNG         ← public/favicon.svg (600×424, průhledné pozadí)
 *
 * Spuštění:
 *   node scripts/generate-social-assets.mjs
 *
 * Skript je idempotentní — přepíše výstupy načisto. Až vznikne graficky
 * navržená OG karta (logo + termín + místo), stačí ji nahradit ručně
 * a tento skript pro og-default.jpg přestat volat.
 */

import sharp from 'sharp';
import { readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUB = join(ROOT, 'public');

/** Tmavé pozadí značky (--color-bg-darkest). */
const BG_DARKEST = { r: 0x0a, g: 0x13, b: 0x0d, alpha: 1 };

const main = async () => {
  await mkdir(join(PUB, 'images/logo'), { recursive: true });

  /* ── 1) OG / Twitter card — 1200×630 (poměr 1.91:1, doporučení Facebooku) ── */
  const ogPath = join(PUB, 'images/og-default.jpg');
  await sharp(join(PUB, 'images/hero-poster.webp'))
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(ogPath);
  console.log('✓ public/images/og-default.jpg (1200×630)');

  /* ── 2) apple-touch-icon — 180×180, logo vycentrované na tmavém podkladu ── */
  const svg = await readFile(join(PUB, 'favicon.svg'));
  const markFor = async (size) =>
    sharp(svg, { density: 600 })
      .resize(Math.round(size * 0.82), Math.round(size * 0.82), {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

  await sharp({
    create: { width: 180, height: 180, channels: 4, background: BG_DARKEST },
  })
    .composite([{ input: await markFor(180), gravity: 'center' }])
    .png()
    .toFile(join(PUB, 'apple-touch-icon.png'));
  console.log('✓ public/apple-touch-icon.png (180×180)');

  /* ── 3) Raster logo pro JSON-LD Organization.logo (Google nebere SVG) ── */
  await sharp(svg, { density: 600 })
    .resize(600, 424, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(PUB, 'images/logo/pan-prstenu.png'));
  console.log('✓ public/images/logo/pan-prstenu.png (600×424)');
};

main().catch((e) => {
  console.error('✗ generate-social-assets failed:', e);
  process.exit(1);
});
