#!/usr/bin/env node
/**
 * prepare-emailing-images.mjs — příprava obrázků pro e-mailové kampaně
 * Datum: 2026-08-17
 *
 * Vezme zdrojové obrázky a vyrobí z nich varianty vhodné do e-mailu:
 *   - šířka 1200 px při zobrazení na 600 px (2× kvůli retina displejům —
 *     v HTML se pak nastaví width="600"),
 *   - JPEG pro fotky, PNG pro grafiku s textem a plochými barvami
 *     (vybírá se ta menší varianta, což tuhle hranici trefuje samo),
 *   - odstraněná EXIF metadata (velikost + soukromí: GPS z fotoaparátu),
 *   - strop velikosti souboru, protože e-mail se musí načíst i na datech.
 *
 * ZÁMĚRNĚ NEDĚLÁ WebP ani AVIF — Outlook, řada webmailů a starší Android
 * klienti je nezobrazí a příjemci uvidí prázdné místo.
 *
 * Použití:
 *   node scripts/prepare-emailing-images.mjs <slozka-nebo-soubory...>
 *   node scripts/prepare-emailing-images.mjs ~/Downloads/emailing
 *   node scripts/prepare-emailing-images.mjs foto.jpg menu.png --max-kb 300
 *
 * Přepínače:
 *   --out <dir>      cíl (výchozí public/emailing/)
 *   --width <px>     cílová šířka zobrazení (výchozí 600 → export 1200)
 *   --max-kb <n>     strop velikosti souboru (výchozí 200)
 *   --dry            jen vypíše, co by udělal
 */
import { readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ARGS = process.argv.slice(2);
const flag = (name, def) => {
  const i = ARGS.indexOf(`--${name}`);
  return i >= 0 && ARGS[i + 1] ? ARGS[i + 1] : def;
};
const DRY = ARGS.includes('--dry');
const OUT_DIR = path.resolve(flag('out', 'public/emailing'));
const DISPLAY_W = Number(flag('width', 600));
const EXPORT_W = DISPLAY_W * 2; // 2× kvůli retina displejům
const MAX_BYTES = Number(flag('max-kb', 200)) * 1024;

const INPUTS = ARGS.filter((a, i) => {
  if (a.startsWith('--')) return false;
  if (i > 0 && ARGS[i - 1].startsWith('--') && !['--dry'].includes(ARGS[i - 1])) return false;
  return true;
});

/** Název souboru bez diakritiky, malými písmeny, kebab-case. */
function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)} kB`;
}

/** Posbírá vstupní soubory ze složek i z přímých cest. */
async function collect(inputs) {
  const files = [];
  for (const raw of inputs) {
    const p = path.resolve(raw.replace(/^~/, process.env.HOME ?? '~'));
    if (!existsSync(p)) {
      console.error(`  ! neexistuje: ${p}`);
      continue;
    }
    const s = await stat(p);
    if (s.isDirectory()) {
      for (const f of await readdir(p)) {
        if (/\.(jpe?g|png|tiff?|bmp|webp|avif|heic)$/i.test(f)) files.push(path.join(p, f));
      }
    } else {
      files.push(p);
    }
  }
  return files.sort();
}

/**
 * Zakóduje do JPEG i PNG a vrátí menší variantu.
 * Fotky vyhrají v JPEG, grafika s textem a plochými barvami v PNG —
 * není proto potřeba hádat typ obsahu dopředu.
 */
async function encodeBest(pipeline, maxBytes) {
  const png = await pipeline.clone().png({ compressionLevel: 9, palette: true }).toBuffer();

  let quality = 82;
  let jpg = await pipeline.clone().jpeg({ quality, progressive: true, mozjpeg: true }).toBuffer();
  // Když se fotka nevejde do stropu, ubíráme kvalitu — ale ne pod 60,
  // tam už jsou vidět artefakty a e-mail vypadá lacině. Podmínka testuje
  // kvalitu PO odečtení, jinak by se z q64 skočilo rovnou na q58.
  const MIN_QUALITY = 60;
  while (jpg.length > maxBytes && quality - 6 >= MIN_QUALITY) {
    quality -= 6;
    jpg = await pipeline.clone().jpeg({ quality, progressive: true, mozjpeg: true }).toBuffer();
  }

  return png.length <= jpg.length
    ? { buf: png, ext: 'png', note: 'PNG (grafika/text)' }
    : { buf: jpg, ext: 'jpg', note: `JPEG q${quality}` };
}

async function main() {
  if (INPUTS.length === 0) {
    console.error('Použití: node scripts/prepare-emailing-images.mjs <slozka-nebo-soubory...>');
    process.exit(1);
  }

  const files = await collect(INPUTS);
  if (files.length === 0) {
    console.error('Nenalezeny žádné obrázky.');
    process.exit(1);
  }

  if (!DRY) await mkdir(OUT_DIR, { recursive: true });

  console.log(`\nCíl: ${OUT_DIR}`);
  console.log(`Zobrazovaná šířka ${DISPLAY_W} px → export ${EXPORT_W} px (2× retina), strop ${kb(MAX_BYTES)}\n`);

  const results = [];
  for (const src of files) {
    const meta = await sharp(src).metadata();
    const slug = slugify(path.basename(src));

    // Zvětšovat nemá smysl — jen bychom nafoukli soubor bez zisku detailu.
    const targetW = Math.min(EXPORT_W, meta.width ?? EXPORT_W);
    const pipeline = sharp(src)
      .rotate()                                  // narovná podle EXIF orientace
      .resize({ width: targetW, withoutEnlargement: true })
      .removeAlpha()                             // e-mail průhlednost stejně nezvládne
      .flatten({ background: '#ffffff' });

    const { buf, ext, note } = await encodeBest(pipeline, MAX_BYTES);
    const outName = `${slug}.${ext}`;
    const outPath = path.join(OUT_DIR, outName);
    const displayH = Math.round(((meta.height ?? 0) / (meta.width ?? 1)) * DISPLAY_W);

    if (!DRY) await writeFile(outPath, buf);

    const warn = buf.length > MAX_BYTES ? '  ⚠ nad stropem' : '';
    const tall = displayH > 1200 ? '  ⚠ velmi vysoký' : '';
    console.log(
      `  ${path.basename(src)}\n` +
      `    → ${outName}  ${targetW}×${Math.round(((meta.height ?? 0) / (meta.width ?? 1)) * targetW)}` +
      `  ${kb(buf.length)}  ${note}${warn}${tall}`
    );

    results.push({ outName, displayW: DISPLAY_W, displayH, bytes: buf.length });
  }

  const total = results.reduce((a, r) => a + r.bytes, 0);
  console.log(`\nCelkem ${results.length} souborů, ${kb(total)}`);
  if (total > 1024 * 1024) {
    console.log('  ⚠ Přes 1 MB dohromady — do jednoho e-mailu nedávej všechny.');
  }

  console.log('\n─── HTML k vložení do e-mailu ───\n');
  for (const r of results) {
    console.log(
      `<img src="https://www.panprstenu.cz/emailing/${r.outName}"\n` +
      `     width="${r.displayW}" height="${r.displayH}"\n` +
      `     alt="DOPLŇ POPIS" style="display:block;width:100%;max-width:${r.displayW}px;height:auto;border:0;">\n`
    );
  }
  console.log('Nezapomeň vyplnit alt — většina klientů blokuje obrázky ve výchozím stavu.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
