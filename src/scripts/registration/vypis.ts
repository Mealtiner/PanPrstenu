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
import { getDomTranslator } from '../i18n-helper';
import { openParticipantsModal } from '../participants-modal';

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

  const tr = getDomTranslator();
  const vt = (typ as VypisTyp);
  switch (vt) {
    case 'celkovy':
      renderCelkovy(root, schema, participantsRes.participants);
      break;
    case 'svobodne-narody':
      renderSideTable(root, schema, participantsRes.participants, SIDE_FREE, tr('side.free'));
      break;
    case 'sily-temneho-pana':
      renderSideTable(root, schema, participantsRes.participants, SIDE_EVIL, tr('side.evil'));
      break;
    case 'zoldaci':
      renderSingleColumn(root, schema, participantsRes.participants, SIDE_MERC, tr('side.merc'));
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

// === Celkový výpis — strany a armády s ikonami, počty, velitelé/panovníci ===

// Mapování nar key → slug SVG ikony v /public/images/ikony-narody/.
const NAR_ICON_SLUG: Record<string, string> = {
  '1': 'gondor',
  '2': 'rohan',
  '3': 'elfove',
  '4': 'trpaslici',
  '5': 'skreti',
  '6': 'skuruti',
  '7': 'harad',
  '8': 'umbar',
};

// Mapování side (bez sub-armády) → slug SVG ikony.
const SIDE_ICON_SLUG: Record<string, string> = {
  [SIDE_MERC]: 'horale',
  [SIDE_NONPLAY]: 'nebojovy-doprovod',
  [SIDE_KIDS]: 'detska-hra',
};

function rulerIconHtml(slug: string): string {
  if (!slug) return '';
  const url = `/images/ikony-narody/${slug}.svg`;
  return `<span class="reg-vypis-card__icon" style="-webkit-mask:url(${url}) center / contain no-repeat;mask:url(${url}) center / contain no-repeat;" aria-hidden="true"></span>`;
}

function rulerName(p: Participant): string {
  return escapeHtml(p.nick && p.nick.trim() !== '' ? p.nick : p.first_name);
}

function rulerLineHtml(rulers: Participant[], label: string, emptyLabel: string): string {
  if (rulers.length === 0) {
    return `<div class="reg-vypis-card__ruler reg-vypis-card__ruler--empty">${escapeHtml(label)}: <em>${escapeHtml(emptyLabel)}</em></div>`;
  }
  return `<div class="reg-vypis-card__ruler"><span class="reg-vypis-card__ruler-label">${escapeHtml(label)}:</span> <strong>${rulers.map(rulerName).join(', ')}</strong></div>`;
}

function renderCelkovy(
  root: HTMLElement,
  schema: SchemaResponse,
  participants: Participant[],
): void {
  const narField = findField(schema, 'nar');
  const tr = getDomTranslator();
  const noRuler = tr('vypis.no_ruler');

  // Filtry velitelů/panovníků z reg_form.reg_ruler_rule_key.
  // commanders config konvence (akce.config_form.commanders):
  //   "panovnik": ["side"]          → kraluje celé straně
  //   "velitel":  ["side", "nar"]   → veli své armádě
  const isPanovnikOfSide = (sideKey: string) => (p: Participant) =>
    p.form.reg_ruler_rule_key === 'panovnik' && p.form.side === sideKey;

  const isVelitelOfArmy = (sideKey: string, narKey: string) => (p: Participant) =>
    p.form.reg_ruler_rule_key === 'velitel' && p.form.side === sideKey && p.form.nar === narKey;

  const renderArmyCard = (sideKey: string, narKey: string, title: string): string => {
    const count = participants.filter((p) => p.form.side === sideKey && p.form.nar === narKey).length;
    const limit = getLimit(schema, 'nar', narKey);
    const velitele = participants.filter(isVelitelOfArmy(sideKey, narKey));
    const iconSlug = NAR_ICON_SLUG[narKey] ?? '';
    const tone = sideKey === SIDE_FREE ? 'free' : sideKey === SIDE_EVIL ? 'evil' : 'gold';
    return `
      <article class="reg-vypis-card reg-vypis-card--army" data-side="${escapeHtml(sideKey)}" data-nar="${escapeHtml(narKey)}">
        ${rulerIconHtml(iconSlug)}
        <h3 class="reg-vypis-card__title">${escapeHtml(title)}</h3>
        <div class="reg-vypis-card__count">${count}${limit !== null ? `<span class="reg-vypis-card__count-limit">/${limit}</span>` : ''}</div>
        ${rulerLineHtml(velitele, tr('vypis.velitel'), noRuler)}
        <button type="button" class="reg-vypis-card__show-btn" data-vypis-show data-side="${escapeHtml(sideKey)}" data-nar="${escapeHtml(narKey)}" data-tone="${escapeHtml(tone)}" data-title="${escapeHtml(title)}">${escapeHtml(tr('vypis.show_participants'))}</button>
      </article>
    `;
  };

  // Top-level sekce s armádami (Svobodné národy, Síly Temna)
  const renderTopSection = (sideKey: string, sideTitle: string): string => {
    const armies = narOptionsForSide(narField, sideKey);
    const count = participants.filter((p) => p.form.side === sideKey).length;
    const limit = getLimit(schema, 'side', sideKey);
    const panovnici = participants.filter(isPanovnikOfSide(sideKey));
    const sideMod = sideKey === SIDE_FREE ? 'free' : sideKey === SIDE_EVIL ? 'evil' : '';

    return `
      <section class="reg-vypis-section reg-vypis-section--with-armies${sideMod ? ` reg-vypis-section--${sideMod}` : ''}">
        <header class="reg-vypis-section__header">
          <h2 class="reg-vypis-section__title">${escapeHtml(sideTitle)}</h2>
          <div class="reg-vypis-section__count">${count}${limit !== null ? `<span class="reg-vypis-section__count-limit">/${limit}</span>` : ''}</div>
        </header>
        ${rulerLineHtml(panovnici, tr('vypis.panovnik'), noRuler)}
        <div class="reg-vypis-section__armies">
          ${armies.map((a) => renderArmyCard(sideKey, a.narKey, a.title)).join('')}
        </div>
      </section>
    `;
  };

  // Sekce bez sub-armády (Žoldáci, Nehrající, Dětská hra)
  const renderSoloSection = (sideKey: string, sideTitle: string): string => {
    const count = participants.filter((p) => p.form.side === sideKey).length;
    const limit = getLimit(schema, 'side', sideKey);
    const rulers = participants.filter(
      (p) =>
        p.form.side === sideKey &&
        p.form.reg_ruler_rule_key !== '' &&
        p.form.reg_ruler_rule_key !== null &&
        p.form.reg_ruler_rule_key !== undefined,
    );
    const iconSlug = SIDE_ICON_SLUG[sideKey] ?? '';
    return `
      <section class="reg-vypis-section reg-vypis-section--solo" data-side="${escapeHtml(sideKey)}">
        ${rulerIconHtml(iconSlug)}
        <h2 class="reg-vypis-section__title">${escapeHtml(sideTitle)}</h2>
        <div class="reg-vypis-section__count">${count}${limit !== null ? `<span class="reg-vypis-section__count-limit">/${limit}</span>` : ''}</div>
        ${rulerLineHtml(rulers, tr('vypis.ruler'), noRuler)}
        <button type="button" class="reg-vypis-card__show-btn" data-vypis-show data-side="${escapeHtml(sideKey)}" data-tone="gold" data-title="${escapeHtml(sideTitle)}">${escapeHtml(tr('vypis.show_participants'))}</button>
      </section>
    `;
  };

  root.innerHTML = `
    <div class="reg-vypis-overview">
      <div class="reg-vypis-overview__meta">${escapeHtml(tr('vypis.total_registered'))}: <strong>${participants.length}</strong></div>
      ${renderTopSection(SIDE_FREE, tr('side.free'))}
      ${renderTopSection(SIDE_EVIL, tr('side.evil'))}
      <div class="reg-vypis-overview__solos">
        ${renderSoloSection(SIDE_MERC, tr('side.merc'))}
        ${renderSoloSection(SIDE_NONPLAY, tr('side.nonplay'))}
        ${renderSoloSection(SIDE_KIDS, tr('side.kids'))}
      </div>
    </div>
  `;

  // Wire up tlačítka „přihlášení" na každé základní kartě → otevři modal se seznamem.
  root.querySelectorAll<HTMLButtonElement>('[data-vypis-show]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const sideKey = btn.dataset.side ?? '';
      const narKey = btn.dataset.nar;
      const title = btn.dataset.title ?? '';
      const tone = btn.dataset.tone ?? 'gold';
      const filtered = participants.filter((p) => {
        if (p.form.side !== sideKey) return false;
        if (narKey !== undefined && p.form.nar !== narKey) return false;
        return true;
      });
      const limit = narKey !== undefined
        ? getLimit(schema, 'nar', narKey)
        : getLimit(schema, 'side', sideKey);
      openParticipantsModal({
        title,
        count: filtered.length,
        limit,
        participants: filtered,
        tone,
      });
    });
  });
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

  const tr = getDomTranslator();
  if (!roleField || !roleField.options) {
    // Fallback — bez rolí, jeden sloupec
    renderSingleColumn(root, schema, participants, SIDE_NONPLAY, tr('side.nonplay'));
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
        ${escapeHtml(tr('side.nonplay'))}:
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

  const tr = getDomTranslator();
  root.innerHTML = `
    <div class="reg-vypis">
      <div class="reg-vypis__meta">
        ${escapeHtml(tr('side.kids'))}: <strong>${detska.length}${kidsSideLimit !== null ? ` / ${kidsSideLimit}` : ''}</strong>
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
