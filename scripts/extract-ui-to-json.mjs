// One-shot script to extract per-lang dicts from src/i18n/ui.ts to src/i18n/ui/{lang}.json
// Usage: node --experimental-strip-types scripts/extract-ui-to-json.mjs
import { writeFileSync } from 'node:fs';
import { ui } from '../src/i18n/ui.ts';

for (const [lang, dict] of Object.entries(ui)) {
  const path = `./src/i18n/ui/${lang}.json`;
  writeFileSync(path, JSON.stringify(dict, null, 2) + '\n');
  console.log(`wrote ${path} (${Object.keys(dict).length} keys)`);
}
