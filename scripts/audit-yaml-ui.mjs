import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';

const FACT_DIR = '/Users/mealtiner/GIT/PanPrstenu/src/content/factions';
const UI_DIR = '/Users/mealtiner/GIT/PanPrstenu/src/i18n/ui';
const LANGS = ['en', 'de', 'sk', 'uk'];

function isLegitimatelyIdentical(value) {
  if (typeof value !== 'string') return true;
  const v = value.trim();
  if (v.length === 0) return true;
  if (!/[a-zA-Zá-žÁ-Žа-яА-Я]/.test(v)) return true;
  if (v.length <= 3) return true;
  if (/^(Pán Prstenů|Moravian LARP|Mordor|Gondor|Rohan|Mealtiner|Středozem|Tolkien|Larp|LARP|FAQ|GDPR|U Zeleného draka|Registračka\.cz)$/i.test(v)) return true;
  return false;
}

function collectStrings(obj, prefix = '', out = []) {
  if (obj === null || obj === undefined) return out;
  if (typeof obj === 'string') { out.push({ path: prefix, value: obj }); return out; }
  if (Array.isArray(obj)) { obj.forEach((v, i) => collectStrings(v, prefix + '[' + i + ']', out)); return out; }
  if (typeof obj === 'object') for (const [k, v] of Object.entries(obj)) collectStrings(v, prefix ? prefix + '.' + k : k, out);
  return out;
}

// === FRAKCE ===
console.log('# Audit FRAKCÍ — i18n.cs vs i18n.{lang}\n');
console.log('| Frakce | EN | DE | SK | UK |');
console.log('|---|---|---|---|---|');
let factTotals = {};
for (const lang of LANGS) factTotals[lang] = { ut: 0, t: 0 };

for (const file of fs.readdirSync(FACT_DIR).sort()) {
  if (!file.endsWith('.yml')) continue;
  const data = yaml.parse(fs.readFileSync(path.join(FACT_DIR, file), 'utf8'));
  const cs = data.i18n?.cs;
  if (!cs) continue;
  const csStrings = collectStrings(cs).filter(s => !isLegitimatelyIdentical(s.value));
  const cells = LANGS.map(lang => {
    const langData = data.i18n?.[lang];
    if (!langData) return '❌ chybí';
    let ut = 0;
    for (const { path: p, value } of csStrings) {
      const langValue = (() => {
        const parts = p.replace(/\[(\d+)\]/g, '.$1').split('.');
        let cur = langData;
        for (const part of parts) { if (cur == null) return undefined; cur = cur[part]; }
        return cur;
      })();
      if (langValue === undefined || langValue === value) ut++;
    }
    factTotals[lang].ut += ut;
    factTotals[lang].t += csStrings.length;
    if (ut === 0) return '🟢 0';
    if (ut === csStrings.length) return '🔴 ' + ut + '/' + csStrings.length;
    return '🟠 ' + ut + '/' + csStrings.length;
  });
  console.log('| ' + file.replace('.yml', '') + ' | ' + cells.join(' | ') + ' |');
}
console.log('\n**Celkem frakce:**');
for (const lang of LANGS) {
  const t = factTotals[lang];
  console.log(`- ${lang.toUpperCase()}: **${t.ut}** nepřeložených z ${t.t}`);
}

// === UI KLÍČE ===
console.log('\n\n# Audit UI klíčů (src/i18n/ui/*.json)\n');
const csUi = JSON.parse(fs.readFileSync(path.join(UI_DIR, 'cs.json'), 'utf8'));
const csUiStrings = collectStrings(csUi).filter(s => !isLegitimatelyIdentical(s.value));
console.log(`CS má ${Object.keys(csUi).length} klíčů celkem (${csUiStrings.length} smysluplných k překladu).\n`);
console.log('| Lang | nepřeložených | celkem | % přeloženo |');
console.log('|---|---|---|---|');
for (const lang of LANGS) {
  const langPath = path.join(UI_DIR, `${lang}.json`);
  if (!fs.existsSync(langPath)) { console.log('| ' + lang + ' | ❌ chybí | | |'); continue; }
  const langJson = JSON.parse(fs.readFileSync(langPath, 'utf8'));
  let ut = 0;
  for (const { path: p, value } of csUiStrings) {
    const langValue = langJson[p];
    if (langValue === undefined || langValue === value) ut++;
  }
  const pct = ((1 - ut/csUiStrings.length) * 100).toFixed(1);
  console.log(`| ${lang.toUpperCase()} | ${ut} | ${csUiStrings.length} | ${pct}% |`);
}

// === LONG-FORM MD ===
console.log('\n\n# Audit LONG-FORM markdown (src/content/pages-long/*)\n');
const PAGES_LONG = '/Users/mealtiner/GIT/PanPrstenu/src/content/pages-long';
console.log('| Stránka | EN | DE | SK | UK |');
console.log('|---|---|---|---|---|');
for (const slug of fs.readdirSync(PAGES_LONG).sort()) {
  const dir = path.join(PAGES_LONG, slug);
  const csPath = path.join(dir, 'cs.md');
  if (!fs.existsSync(csPath)) continue;
  const cs = fs.readFileSync(csPath, 'utf8');
  const csBody = cs.split('---').slice(2).join('---').trim();
  const cells = LANGS.map(lang => {
    const langPath = path.join(dir, `${lang}.md`);
    if (!fs.existsSync(langPath)) return '❌ chybí';
    const lang_text = fs.readFileSync(langPath, 'utf8');
    const lang_body = lang_text.split('---').slice(2).join('---').trim();
    if (lang_body === csBody) return '🔴 stejné jako CS';
    // Zhruba — jaký podíl řádků se liší?
    const csLines = new Set(csBody.split('\n').filter(l => l.length > 30));
    const langLines = lang_body.split('\n').filter(l => l.length > 30);
    let same = 0;
    for (const l of langLines) if (csLines.has(l)) same++;
    if (same === 0) return '🟢 OK';
    if (same > langLines.length * 0.5) return '🟠 ' + same + '/' + langLines.length + ' řádků shodných';
    return '🟡 ' + same + ' řádků shodných';
  });
  console.log('| ' + slug + ' | ' + cells.join(' | ') + ' |');
}
