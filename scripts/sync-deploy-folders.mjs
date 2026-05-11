#!/usr/bin/env node
/**
 * sync-deploy-folders.mjs — kopíruje obsah dist/ do lokálních FTP staging složek.
 * Datum: 2026-05-11
 *
 * Účel: po každém `npm run build` automaticky aktualizovat
 *   - public_html/        (pro manuální FTP upload na panprstenu.cz / www)
 *   - public_html_new/    (pro manuální FTP upload na new.panprstenu.cz)
 *
 * Tím odpadá riziko, že uživatel nahraje starý build, protože zapomněl
 * obě složky ručně synchronizovat (typický důvod, proč „GA tam není").
 *
 * Strategie: smaže starý obsah cíle a zkopíruje aktuální dist/ doň.
 * .DS_Store ze zdroje vynecháváme.
 *
 * Spuštění (automaticky):
 *   npm run build   → prebuild (gen llms) → astro build → postbuild (TENTO SKRIPT)
 *
 * Spuštění (ručně):
 *   node scripts/sync-deploy-folders.mjs
 */

import { rm, cp, stat, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'dist');
const TARGETS = [
  join(ROOT, 'public_html'),
  join(ROOT, 'public_html_new'),
];

const exists = async (p) => {
  try { await stat(p); return true; } catch { return false; }
};

const countFiles = async (dir) => {
  if (!(await exists(dir))) return 0;
  let total = 0;
  const walk = async (d) => {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const full = join(d, e.name);
      if (e.isDirectory()) await walk(full);
      else total++;
    }
  };
  await walk(dir);
  return total;
};

const sync = async (target) => {
  if (!(await exists(SRC))) {
    throw new Error(`Zdrojová složka ${SRC} neexistuje — pusť nejdřív \`npm run build\`.`);
  }

  // Smaž obsah cíle (ale zachovej samotnou složku — někteří FTP klienti by si stěžovali).
  if (await exists(target)) {
    for (const entry of await readdir(target, { withFileTypes: true })) {
      // Nech v cíli skryté metasoubory FTP klientů (.git, .DS_Store nezachováváme)
      if (entry.name === '.git' || entry.name === '.gitkeep') continue;
      await rm(join(target, entry.name), { recursive: true, force: true });
    }
  }

  // Zkopíruj dist/ → target (rekurzivně, bez .DS_Store)
  await cp(SRC, target, {
    recursive: true,
    filter: (src) => !src.endsWith('/.DS_Store'),
  });

  const count = await countFiles(target);
  return count;
};

const main = async () => {
  const srcCount = await countFiles(SRC);
  console.log(`▶ sync-deploy: zdroj dist/ má ${srcCount.toLocaleString()} souborů`);
  for (const target of TARGETS) {
    const targetName = target.replace(ROOT + '/', '');
    try {
      const count = await sync(target);
      console.log(`  ✓ ${targetName}: ${count.toLocaleString()} souborů`);
    } catch (e) {
      console.error(`  ✗ ${targetName}: ${e.message}`);
      process.exitCode = 1;
    }
  }
};

main().catch((e) => {
  console.error('✗ sync-deploy failed:', e);
  process.exit(1);
});
