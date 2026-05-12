/**
 * Výpisy přihlášených — 6 typů tabulek.
 * Datum: 2026-05-12
 *
 * Vstup: id elementu, slug akce, typ výpisu.
 * Načte /participants + /schema, vyrenderuje tabulku podle typu.
 *
 * Typy:
 *  - celkovy: 5 sloupců top-level (Svobodné národy / Síly Temna / Žoldáci / Nehrající / Dětská hra),
 *             pod prvními dvěma 4 sub-armády
 *  - svobodne-narody: jen 4 armády Svobodných národů
 *  - sily-temneho-pana: jen 4 armády Sil Temna
 *  - zoldaci: jeden sloupec — všichni žoldáci
 *  - nehrajici: sloupce podle typů rolí (civ / supporter_category options)
 *  - detska-hra: sloupce podle věkových kategorií (kids_age options)
 */

import { getEventSchema, getEventParticipants } from './api-client';
import type { SchemaResponse, Participant, FormField } from './types';

type VypisTyp = 'celkovy' | 'svobodne-narody' | 'sily-temneho-pana' | 'zoldaci' | 'nehrajici' | 'detska-hra';

// Numerické klíče side z PP2026 schema (ne string slugy):
//   1 = Svobodné národy Středozemě
//   2 = Síly Temného pána
//   3 = Žoldáci — Horalé / Vrchovina
//   4 = Nehrající / Nebojový doprovod
//   5 = Dětská hra
const SIDE_FREE = '1';
const SIDE_EVIL = '2';
const SIDE_MERC = '3';
const SIDE_NONPLAY = '4';
const SIDE_KIDS = '5';

export async function initVypis(rootSelector: string, slug: string, typ: string): Promise<void> {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) return;

  root.classList.add('reg-app');
  root.innerHTML = '<div class="reg-loading">Načítám seznam přihlášených…</div>';

  const [schema, participantsRes] = await Promise.all([
    getEventSchema(slug),
    getEventParticipants(slug),
  ]);

  if (!schema || !participantsRes) {
    root.innerHTML = `
      <div class="reg-error">
        Nepodařilo se načíst data ze serveru registracka.cz.
        Zkus to za chvíli, nebo nás kontaktuj na info@panprstenu.cz.
      </div>
    `;
    return;
  }

  const t = (typ as VypisTyp);
  switch (t) {
    case 'celkovy':
      renderCelkovy(root, schema, participantsRes.participants);
      break;
    case 'svobodne-narody':
      renderSideTable(root, schema, participantsRes.participants, SIDE_FREE, 'Svobodné národy Středozemě');
      break;
    case 'sily-temneho-pana':
      renderSideTable(root, schema, participantsRes.participants, SIDE_EVIL, 'Síly Temného Pána');
      break;
    case 'zoldaci':
      renderSingleColumn(root, schema, participantsRes.participants, SIDE_MERC, 'Žoldáci — Horalé z Vrchoviny');
      break;
    case 'nehrajici':
      renderNehrajici(root, schema, participantsRes.participants);
      break;
    case 'detska-hra':
      renderDetskaHra(root, schema, participantsRes.participants);
      break;
    default:
      root.innerHTML = `<div class="reg-error">Neznámý typ výpisu: ${escapeHtml(typ)}</div>`;
  }
}

// === Celkový výpis — 5 top-level sloupců ====================================

function renderCelkovy(
  root: HTMLElement,
  schema: SchemaResponse,
  participants: Participant[],
): void {
  const sideField = findField(schema, 'side');
  const narField = findField(schema, 'nar');
  const civField = findField(schema, 'supporter_category') ?? findField(schema, 'civ');

  // Top-level sloupce
  const cols: Array<{
    title: string;
    sideKey?: string;
    subCols?: Array<{ title: string; narKey: string }>;
    filterFn: (p: Participant) => boolean;
  }> = [
    {
      title: 'Svobodné národy Středozemě',
      sideKey: SIDE_FREE,
      subCols: narOptionsForSide(narField, SIDE_FREE),
      filterFn: (p) => p.form.side === SIDE_FREE,
    },
    {
      title: 'Síly Temného Pána',
      sideKey: SIDE_EVIL,
      subCols: narOptionsForSide(narField, SIDE_EVIL),
      filterFn: (p) => p.form.side === SIDE_EVIL,
    },
    {
      title: 'Žoldáci — Horalé z Vrchoviny',
      sideKey: SIDE_MERC,
      filterFn: (p) => p.form.side === SIDE_MERC,
    },
    {
      title: 'Nehrající / Nebojový doprovod',
      sideKey: SIDE_NONPLAY,
      filterFn: (p) => p.form.side === SIDE_NONPLAY,
    },
    {
      title: 'Dětská hra',
      sideKey: SIDE_KIDS,
      filterFn: (p) => p.form.side === SIDE_KIDS,
    },
  ];

  // Vypočítej součty pro hlavičky
  const sideCounts: Record<string, number> = {};
  const narCounts: Record<string, number> = {};
  for (const p of participants) {
    const s = p.form.side;
    const n = p.form.nar;
    if (s) sideCounts[s] = (sideCounts[s] ?? 0) + 1;
    if (n) narCounts[n] = (narCounts[n] ?? 0) + 1;
  }

  // Build tabulky — pro mobile stack potřebujeme data-col-label na <td>,
  // aby CSS ::before pseudo zobrazil název sloupce nad obsahem karty.
  const headRow1: string[] = [];
  const headRow2: string[] = [];
  const cells: Array<{ items: Participant[]; label: string }> = [];

  for (const col of cols) {
    const sideCount = col.sideKey ? sideCounts[col.sideKey] ?? 0 : 0;
    const sideLimit = col.sideKey ? getLimit(schema, 'side', col.sideKey) : null;
    const sideHeader = `${col.title} ${formatRatio(sideCount, sideLimit)}`;

    if (col.subCols && col.subCols.length > 0) {
      headRow1.push(`<th colspan="${col.subCols.length}">${escapeHtml(sideHeader)}</th>`);
      for (const sc of col.subCols) {
        const c = narCounts[sc.narKey] ?? 0;
        const lim = getLimit(schema, 'nar', sc.narKey);
        const label = `${sc.title} ${formatRatio(c, lim)}`;
        headRow2.push(`<th>${escapeHtml(label)}</th>`);
        cells.push({
          items: participants.filter((p) => p.form.side === col.sideKey && p.form.nar === sc.narKey),
          label,
        });
      }
    } else {
      headRow1.push(`<th rowspan="2">${escapeHtml(sideHeader)}</th>`);
      cells.push({ items: participants.filter(col.filterFn), label: sideHeader });
    }
  }

  const bodyRow = cells
    .map((c) => `<td data-col-label="${escapeHtml(c.label)}">${renderParticipantList(c.items)}</td>`)
    .join('');

  root.innerHTML = `
    <div class="reg-vypis">
      <div class="reg-vypis__meta">Přihlášených celkem: <strong>${participants.length}</strong></div>
      <div class="reg-vypis__table-wrap">
        <table class="reg-vypis__table">
          <thead>
            <tr>${headRow1.join('')}</tr>
            <tr>${headRow2.join('')}</tr>
          </thead>
          <tbody>
            <tr>${bodyRow}</tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// === Dílčí výpis — jedna strana (4 armády vedle sebe) =======================

function renderSideTable(
  root: HTMLElement,
  schema: SchemaResponse,
  participants: Participant[],
  sideKey: string,
  title: string,
): void {
  const narField = findField(schema, 'nar');
  const subCols = narOptionsForSide(narField, sideKey);
  const sideCount = participants.filter((p) => p.form.side === sideKey).length;
  const sideLimit = getLimit(schema, 'side', sideKey);

  const colLabels = subCols.map((sc) => {
    const c = participants.filter((p) => p.form.side === sideKey && p.form.nar === sc.narKey).length;
    const lim = getLimit(schema, 'nar', sc.narKey);
    return `${sc.title} ${formatRatio(c, lim)}`;
  });

  const headHtml = colLabels.map((l) => `<th>${escapeHtml(l)}</th>`).join('');

  const bodyHtml = subCols.map((sc, i) => {
    const arr = participants.filter((p) => p.form.side === sideKey && p.form.nar === sc.narKey);
    return `<td data-col-label="${escapeHtml(colLabels[i])}">${renderParticipantList(arr)}</td>`;
  }).join('');

  root.innerHTML = `
    <div class="reg-vypis">
      <div class="reg-vypis__meta">
        ${escapeHtml(title)}: <strong>${sideCount}${sideLimit !== null ? ` / ${sideLimit}` : ''}</strong>
      </div>
      <div class="reg-vypis__table-wrap">
        <table class="reg-vypis__table">
          <thead><tr>${headHtml}</tr></thead>
          <tbody><tr>${bodyHtml}</tr></tbody>
        </table>
      </div>
    </div>
  `;
}

// === Jedno-sloupcový výpis (žoldáci) ========================================

function renderSingleColumn(
  root: HTMLElement,
  schema: SchemaResponse,
  participants: Participant[],
  sideKey: string,
  title: string,
): void {
  const filtered = participants.filter((p) => p.form.side === sideKey);
  const limit = getLimit(schema, 'side', sideKey);

  const colLabel = `${title} ${formatRatio(filtered.length, limit)}`;
  root.innerHTML = `
    <div class="reg-vypis">
      <div class="reg-vypis__meta">
        ${escapeHtml(title)}: <strong>${filtered.length}${limit !== null ? ` / ${limit}` : ''}</strong>
      </div>
      <div class="reg-vypis__table-wrap">
        <table class="reg-vypis__table">
          <thead><tr><th>${escapeHtml(colLabel)}</th></tr></thead>
          <tbody><tr><td data-col-label="${escapeHtml(colLabel)}">${renderParticipantList(filtered)}</td></tr></tbody>
        </table>
      </div>
    </div>
  `;
}

// === Nehrající — sloupce podle typů rolí ====================================

function renderNehrajici(
  root: HTMLElement,
  schema: SchemaResponse,
  participants: Participant[],
): void {
  // Filtruj jen nehrající
  const nehrajici = participants.filter((p) => p.form.side === SIDE_NONPLAY);

  // Najdi pole pro konkrétní roli nehrajícího — supporter_category nebo civ
  const roleField = findField(schema, 'supporter_category') ?? findField(schema, 'civ');
  const sideLimit = getLimit(schema, 'side', SIDE_NONPLAY);

  if (!roleField || !roleField.options) {
    // Fallback — bez rolí, jeden sloupec
    renderSingleColumn(root, schema, participants, SIDE_NONPLAY, 'Nehrající / Nebojový doprovod');
    return;
  }

  const options = optionsAsEntries(roleField.options);
  const roleName = roleField.name ?? 'supporter_category';

  // Rozdělení rolí do 2 tabulek:
  //   primární (klíče 1-5): Hobité, Nebojový doprovod, Fotografové, Stánkaři, Doprovod dítěte
  //   sekundární (klíče 6-7): Pomocníci, Organizátoři
  const PRIMARY_KEYS = ['1', '2', '3', '4', '5'];
  const SECONDARY_KEYS = ['6', '7'];
  const primaryOpts = options.filter(([k]) => PRIMARY_KEYS.includes(k));
  const secondaryOpts = options.filter(([k]) => SECONDARY_KEYS.includes(k));

  const buildTable = (opts: Array<[string, string]>): string => {
    if (opts.length === 0) return '';
    const colLabels = opts.map(([key, label]) => {
      const c = nehrajici.filter((p) => p.form[roleName] === key).length;
      const lim = getLimit(schema, roleName, key);
      return `${label} ${formatRatio(c, lim)}`;
    });
    const headHtml = colLabels.map((l) => `<th>${escapeHtml(l)}</th>`).join('');
    const bodyHtml = opts.map(([key], i) => {
      const arr = nehrajici.filter((p) => p.form[roleName] === key);
      return `<td data-col-label="${escapeHtml(colLabels[i])}">${renderParticipantList(arr)}</td>`;
    }).join('');
    return `
      <div class="reg-vypis__table-wrap">
        <table class="reg-vypis__table">
          <thead><tr>${headHtml}</tr></thead>
          <tbody><tr>${bodyHtml}</tr></tbody>
        </table>
      </div>
    `;
  };

  root.innerHTML = `
    <div class="reg-vypis">
      <div class="reg-vypis__meta">
        Nehrající / Nebojový doprovod:
        <strong>${nehrajici.length}${sideLimit !== null ? ` / ${sideLimit}` : ''}</strong>
      </div>
      ${buildTable(primaryOpts)}
      ${buildTable(secondaryOpts)}
    </div>
  `;
}

// === Dětská hra — sloupce podle věku ========================================

function renderDetskaHra(
  root: HTMLElement,
  schema: SchemaResponse,
  participants: Participant[],
): void {
  // Filtruj všechny účastníky kteří mají vyplněné kids_age — to definuje dětskou hru
  const kidsField = findField(schema, 'kids_age');
  if (!kidsField || !kidsField.options) {
    root.innerHTML = `<div class="reg-error">Schema akce nedefinuje pole 'kids_age' — výpis dětské hry zatím není dostupný.</div>`;
    return;
  }

  const options = optionsAsEntries(kidsField.options);
  const fieldName = kidsField.name ?? 'kids_age';

  // Bere účastníky se side="5" (Dětská hra) — schema má kids_age skryté
  // mimo side=5, takže filtrace přes side je deterministická.
  const detska = participants.filter((p) => p.form.side === SIDE_KIDS);

  const colLabels = options.map(([key, label]) => {
    const c = detska.filter((p) => p.form[fieldName] === key).length;
    const lim = getLimit(schema, fieldName, key);
    // Odřízni dlouhý popisek za " - " a zachovej jen věkové rozmezí.
    const shortLabel = stripExplanation(label);
    return `${shortLabel} - ${formatRatio(c, lim)}`;
  });
  const headHtml = colLabels.map((l) => `<th>${escapeHtml(l)}</th>`).join('');

  const bodyHtml = options.map(([key], i) => {
    const arr = detska.filter((p) => p.form[fieldName] === key);
    return `<td data-col-label="${escapeHtml(colLabels[i])}">${renderParticipantList(arr)}</td>`;
  }).join('');

  const kidsSideLimit = getLimit(schema, 'side', SIDE_KIDS);

  root.innerHTML = `
    <div class="reg-vypis">
      <div class="reg-vypis__meta">
        Dětská hra: <strong>${detska.length}${kidsSideLimit !== null ? ` / ${kidsSideLimit}` : ''}</strong>
      </div>
      <div class="reg-vypis__table-wrap">
        <table class="reg-vypis__table">
          <thead><tr>${headHtml}</tr></thead>
          <tbody><tr>${bodyHtml}</tr></tbody>
        </table>
      </div>
    </div>
  `;
}

// === Pomocníci ==============================================================

// Vrátí seznam subcolumns (armád) pro danou stranu — z `nar.optionsif`.
// Pokud schema nemá optionsif, fallback jen na všechny options pole `nar`.
function narOptionsForSide(
  narField: FormField | null,
  sideKey: string,
): Array<{ title: string; narKey: string }> {
  if (!narField || !narField.options) return [];
  const entries = optionsAsEntries(narField.options);

  if (narField.optionsif) {
    return entries
      .filter(([key]) => {
        const cond = narField.optionsif?.[key];
        if (!cond) return false;
        return cond.some((c) => c === `side=${sideKey}`);
      })
      .map(([narKey, title]) => ({ narKey, title }));
  }

  return entries.map(([narKey, title]) => ({ narKey, title }));
}

// PHP options mohou být buď object {key:label} nebo array ["Ne","Ano"] (legacy).
// Normalizuj na entries [[key, label], …].
function optionsAsEntries(opts: Record<string, string> | string[]): Array<[string, string]> {
  if (Array.isArray(opts)) {
    return opts.map((label, idx) => [String(idx), label]);
  }
  return Object.entries(opts);
}

function findField(schema: SchemaResponse, name: string): FormField | null {
  return schema.form.fields.find((f) => f.name === name) ?? null;
}

function getLimit(schema: SchemaResponse, fieldName: string, optionKey: string): number | null {
  const limits = schema.limits[fieldName];
  if (!limits) return null;
  const v = limits[optionKey];
  return typeof v === 'number' ? v : null;
}

function formatRatio(count: number, limit: number | null): string {
  return limit !== null ? `(${count}/${limit})` : `(${count})`;
}

// Odřízne všechno za " - " (= popisek/vysvětlení připojený za labelem).
// "děti od 2 do 4/5 let - dětskou skupinu..." → "děti od 2 do 4/5 let"
// "děti od 6 do 8 let" → "děti od 6 do 8 let" (no change)
function stripExplanation(label: string): string {
  const idx = label.indexOf(' - ');
  return idx >= 0 ? label.slice(0, idx).trim() : label.trim();
}

// === Render participants v buňce ============================================

function renderParticipantList(participants: Participant[]): string {
  if (participants.length === 0) return '<div class="reg-vypis__empty">—</div>';
  return `<ul class="reg-vypis__list">${
    participants.map((p) => {
      const cls = p.target_type === 'pending'
        ? 'reg-vypis__item reg-vypis__item--pending'
        : 'reg-vypis__item';
      const title = p.target_type === 'pending'
        ? ' title="Čeká na potvrzení e-mailem"'
        : '';
      return `<li class="${cls}"${title}>${renderParticipant(p)}</li>`;
    }).join('')
  }</ul>`;
}

function renderParticipant(p: Participant): string {
  const displayName = p.nick && p.nick.trim() !== '' ? p.nick : p.first_name;
  const ageLabel = p.age_bucket ? ` (${p.age_bucket})` : '';
  const groupHtml = p.group_name
    ? ` <span class="reg-vypis__group">— ${escapeHtml(p.group_name)}</span>`
    : '';
  // Pending: ikona platby nemá smysl (nelze platit dokud není potvrzeno),
  // místo ní ukážeme malé hodinky.
  const icon = p.target_type === 'pending'
    ? '<span class="reg-vypis__pending-icon" aria-hidden="true">⏳</span>'
    : renderPaymentIcon(p.is_paid);
  return `${icon}${escapeHtml(displayName)}${escapeHtml(ageLabel)}${groupHtml}`;
}

// SVG ikona hromádky kovových mincí — zelená pro zaplaceno, červená přeškrtnutá pro nezaplaceno.
function renderPaymentIcon(isPaid: boolean): string {
  const cls = isPaid ? 'reg-vypis__pay reg-vypis__pay--paid' : 'reg-vypis__pay reg-vypis__pay--unpaid';
  const title = isPaid ? 'Zaplaceno' : 'Nezaplaceno';
  // Mince stack (3 elipsy + spojení)
  const coinsSvg = `
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <ellipse cx="10" cy="14.5" rx="6" ry="2"/>
      <path d="M4 14.5v-2c0 1.1 2.7 2 6 2s6-0.9 6-2v2c0 1.1-2.7 2-6 2s-6-0.9-6-2z"/>
      <ellipse cx="10" cy="12" rx="6" ry="2"/>
      <path d="M4 12v-2c0 1.1 2.7 2 6 2s6-0.9 6-2v2c0 1.1-2.7 2-6 2s-6-0.9-6-2z"/>
      <ellipse cx="10" cy="9.5" rx="6" ry="2"/>
    </svg>
  `;
  // Strikethrough přes ikonu jen pokud unpaid
  const strikeSvg = !isPaid
    ? `<svg viewBox="0 0 20 20" class="reg-vypis__pay-strike" aria-hidden="true" focusable="false">
         <line x1="2" y1="18" x2="18" y2="2" stroke="#dc2626" stroke-width="2.2" stroke-linecap="round"/>
       </svg>`
    : '';
  return `<span class="${cls}" title="${escapeHtml(title)}">${coinsSvg}${strikeSvg}</span>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
