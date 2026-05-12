/**
 * Srovnání ročníků 2024 / 2025 / 2026 — agregovaná data, mezi-ročníkové grafy.
 * Datum: 2026-05-12
 *
 * Fetchuje paralelně /api/v1/events/PP2024/stats, /PP2025/stats, /PP2026/stats
 * a vykresluje 10 sekcí srovnání: KPI, trend, strany abs/rel, frakce slope,
 * věk + pyramidy, generace, pohlaví, zbraně slope, skupiny, registrační dynamika.
 *
 * Vanilla SVG/CSS bez chart-library. Side keys napříč ročníky nejsou stabilní
 * (PP2024 nemá Žoldáky, ostatní strany se posouvají), proto normalizace přes
 * label → kanonický klíč free|evil|merc|nonplay|kids.
 */

import { getEventStats } from './api-client';
import type {
  StatsResponse,
  StatsSideRow,
  StatsNarRow,
  StatsTimelinePoint,
} from './types';

// ───────────────────────────────────────────────────────────────────────────
// Konstanty
// ───────────────────────────────────────────────────────────────────────────

const YEARS = ['2024', '2025', '2026'] as const;
type Year = (typeof YEARS)[number];

type SideNorm = 'free' | 'evil' | 'merc' | 'nonplay' | 'kids';

const SIDE_ORDER: SideNorm[] = ['free', 'evil', 'merc', 'nonplay', 'kids'];

const SIDE_LABELS: Record<SideNorm, string> = {
  free: 'Svobodné národy Středozemě',
  evil: 'Síly Temného pána',
  merc: 'Žoldáci — Vrchovina',
  nonplay: 'Nehrající / Nebojový doprovod',
  kids: 'Dětská hra',
};

// Barvy stran — totožné s statistiky.ts (WCAG AA audit).
const SIDE_COLORS: Record<SideNorm, string> = {
  free: 'var(--color-side-free, #2E4C3A)',
  evil: 'var(--color-side-evil, #7B1E20)',
  merc: 'var(--color-gold-dark, #8A6E34)',
  nonplay: 'var(--color-gold-darkest, #5E4A23)',
  kids: '#6F6A5E',
};

// Roky → barva pro multi-ročníkové grafy (pro odlišení 2024/2025/2026 v rámci jedné kategorie).
const YEAR_COLORS: Record<Year, string> = {
  '2024': 'var(--color-gold-darkest, #5E4A23)',
  '2025': 'var(--color-gold-dark, #8A6E34)',
  '2026': 'var(--color-gold-light, #E0C088)',
};

// Hranice plauzibilního věku — vyšší hodnoty jsou očividný bug v datech
// (PP2024 max=124, PP2025 max=1048). Pro KPI a pyramidy filtrujeme.
const MAX_PLAUSIBLE_AGE = 90;

// ───────────────────────────────────────────────────────────────────────────
// Vstupní bod
// ───────────────────────────────────────────────────────────────────────────

export async function initSrovnani(rootSelector: string): Promise<void> {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) return;

  root.classList.add('reg-app');
  root.innerHTML = '<div class="reg-loading">Načítám data tří ročníků…</div>';

  const [s2024, s2025, s2026] = await Promise.all([
    getEventStats('PP2024'),
    getEventStats('PP2025'),
    getEventStats('PP2026'),
  ]);

  const all: Record<Year, StatsResponse | null> = {
    '2024': s2024,
    '2025': s2025,
    '2026': s2026,
  };

  const loaded = YEARS.filter((y) => all[y] !== null);
  if (loaded.length === 0) {
    root.innerHTML = `
      <div class="reg-error">
        Nepodařilo se načíst data ani z jednoho ročníku. Zkuste obnovit stránku za chvíli.
      </div>
    `;
    return;
  }

  const missing = YEARS.filter((y) => all[y] === null);
  const warningBox = missing.length > 0
    ? `<div class="reg-stats__warning">
        ⚠️ Chybí data ročníku ${missing.join(', ')}. Některé sloupce v grafech budou prázdné.
      </div>`
    : '';

  root.innerHTML = `
    <div class="reg-stats reg-stats--compare">
      ${warningBox}

      <!-- 1) Top KPI -->
      <section class="reg-stats__group">${renderTopKpi(all)}</section>

      <!-- 2) Trend účasti -->
      <section class="reg-stats__group">${renderParticipationTrend(all)}</section>

      <!-- 3) Strany absolutní -->
      <section class="reg-stats__group">${renderSidesAbsolute(all)}</section>

      <!-- 4) Strany relativní -->
      <section class="reg-stats__group">${renderSidesRelative(all)}</section>

      <!-- 5) Frakce slope -->
      <section class="reg-stats__group">${renderArmiesSlope(all)}</section>

      <!-- 6) Věk + pyramidy -->
      <section class="reg-stats__group">${renderAgeAndPyramids(all)}</section>

      <!-- 7) Generace -->
      <section class="reg-stats__group">${renderGenerations(all)}</section>

      <!-- 8) Pohlaví -->
      <section class="reg-stats__group">${renderGender(all)}</section>

      <!-- 9) Zbraně slope -->
      <section class="reg-stats__group">${renderWeaponsSlope(all)}</section>

      <!-- 10) Skupiny + registrační dynamika -->
      <section class="reg-stats__group">${renderGroupsTable(all)}</section>
      <section class="reg-stats__group">${renderRegistrationDynamics(all)}</section>
    </div>
  `;
}

// ───────────────────────────────────────────────────────────────────────────
// Normalizační helpery
// ───────────────────────────────────────────────────────────────────────────

/**
 * Mapuje API `side_label` (které se napříč ročníky liší klíčem ale ne textem)
 * na kanonický klíč. Detekce přes první charakteristické slovo v labelu.
 */
function normalizeSideKey(label: string): SideNorm | null {
  const l = label.toLowerCase();
  if (l.startsWith('svobodné')) return 'free';
  if (l.startsWith('síly')) return 'evil';
  if (l.startsWith('žoldáci') || l.startsWith('horalé') || l.includes('vrchovina')) return 'merc';
  if (l.startsWith('nehrající') || l.includes('nebojový')) return 'nonplay';
  if (l.startsWith('dětská')) return 'kids';
  return null;
}

function findSide(stats: StatsResponse, norm: SideNorm): StatsSideRow | null {
  return stats.by_side.find((s) => normalizeSideKey(s.label) === norm) ?? null;
}

function findNar(stats: StatsResponse, label: string): StatsNarRow | null {
  return stats.by_nar.find((n) => n.label === label) ?? null;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function escapeHtml(s: string | number): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDelta(curr: number, prev: number | null): string {
  if (prev === null || prev === 0) return '';
  const delta = curr - prev;
  const pct = (delta / prev) * 100;
  const sign = delta > 0 ? '+' : '';
  const cls = delta > 0 ? 'reg-stats__delta--up' : delta < 0 ? 'reg-stats__delta--down' : '';
  return `<span class="reg-stats__delta ${cls}">${sign}${delta} (${sign}${pct.toFixed(1)} %)</span>`;
}

// ───────────────────────────────────────────────────────────────────────────
// 1) Top KPI — 3 sloupce per ročník
// ───────────────────────────────────────────────────────────────────────────

function renderTopKpi(all: Record<Year, StatsResponse | null>): string {
  const cols = YEARS.map((y, idx) => {
    const s = all[y];
    if (!s) {
      return `<div class="reg-stats__kpi-col reg-stats__kpi-col--empty">
        <div class="reg-stats__kpi-year">${y}</div>
        <div class="reg-stats__kpi-empty">data nedostupná</div>
      </div>`;
    }
    const prev = idx > 0 ? all[YEARS[idx - 1] as Year] : null;

    const femalePct = s.total > 0 ? ((s.gender.female / s.total) * 100) : 0;
    const femalePctPrev = prev && prev.total > 0 ? ((prev.gender.female / prev.total) * 100) : null;
    const femaleDelta = femalePctPrev !== null
      ? `<span class="reg-stats__delta ${femalePct > femalePctPrev ? 'reg-stats__delta--up' : femalePct < femalePctPrev ? 'reg-stats__delta--down' : ''}">${femalePct > femalePctPrev ? '+' : ''}${(femalePct - femalePctPrev).toFixed(1)} p.b.</span>`
      : '';

    const avgAge = s.age_stats.avg ?? 0;
    const avgAgePrev = prev?.age_stats.avg ?? null;
    const ageDelta = avgAgePrev !== null
      ? `<span class="reg-stats__delta ${avgAge > avgAgePrev ? 'reg-stats__delta--up' : avgAge < avgAgePrev ? 'reg-stats__delta--down' : ''}">${avgAge > avgAgePrev ? '+' : ''}${(avgAge - avgAgePrev).toFixed(1)}</span>`
      : '';

    return `
      <div class="reg-stats__kpi-col" style="--year-color: ${YEAR_COLORS[y]}">
        <div class="reg-stats__kpi-year">${y}</div>
        <div class="reg-stats__kpi-row">
          <div class="reg-stats__kpi-num">${s.total}</div>
          <div class="reg-stats__kpi-sub">přihlášených ${formatDelta(s.total, prev?.total ?? null)}</div>
        </div>
        <div class="reg-stats__kpi-row">
          <div class="reg-stats__kpi-num">${avgAge.toFixed(1)} <small>let</small></div>
          <div class="reg-stats__kpi-sub">průměrný věk ${ageDelta}</div>
        </div>
        <div class="reg-stats__kpi-row">
          <div class="reg-stats__kpi-num">${femalePct.toFixed(1)} %</div>
          <div class="reg-stats__kpi-sub">žen v celku ${femaleDelta}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <h2 class="reg-stats__h2">Klíčová čísla per ročník</h2>
    <div class="reg-stats__kpi-grid">${cols}</div>
    <p class="reg-stats__hint">Procentní body (p.b.) = absolutní rozdíl podílu. Δ věku = posun průměru oproti minulému ročníku.</p>
  `;
}

// ───────────────────────────────────────────────────────────────────────────
// 2) Trend účasti — bar chart
// ───────────────────────────────────────────────────────────────────────────

function renderParticipationTrend(all: Record<Year, StatsResponse | null>): string {
  const data = YEARS.map((y) => ({ year: y, count: all[y]?.total ?? 0 }));
  const max = Math.max(...data.map((d) => d.count), 1);

  const bars = data.map((d) => {
    const h = (d.count / max) * 100;
    return `
      <div class="reg-stats__trend-col">
        <div class="reg-stats__trend-num">${d.count}</div>
        <div class="reg-stats__trend-bar-wrap">
          <div class="reg-stats__trend-bar" style="height: ${h.toFixed(1)}%; background: ${YEAR_COLORS[d.year]}"></div>
        </div>
        <div class="reg-stats__trend-year">${d.year}</div>
      </div>
    `;
  }).join('');

  const totals = data.map((d) => d.count).filter((n) => n > 0);
  const growth = totals.length >= 2
    ? `Celkový růst ${totals[0]} → ${totals[totals.length - 1]} (${((totals[totals.length - 1]! / totals[0]! - 1) * 100).toFixed(1)} %)`
    : '';

  return `
    <h2 class="reg-stats__h2">Trend účasti</h2>
    <div class="reg-stats__trend">${bars}</div>
    ${growth ? `<p class="reg-stats__hint">${growth}</p>` : ''}
  `;
}

// ───────────────────────────────────────────────────────────────────────────
// 3) Strany absolutní — grouped bar
// ───────────────────────────────────────────────────────────────────────────

function renderSidesAbsolute(all: Record<Year, StatsResponse | null>): string {
  type Cell = { year: Year; count: number; available: boolean };
  type Row = { norm: SideNorm; label: string; cells: Cell[]; max: number };

  const rows: Row[] = SIDE_ORDER.map((norm) => {
    const cells: Cell[] = YEARS.map((y) => {
      const s = all[y];
      if (!s) return { year: y, count: 0, available: false };
      const row = findSide(s, norm);
      return { year: y, count: row?.count ?? 0, available: row !== null };
    });
    const max = Math.max(...cells.map((c) => c.count), 1);
    return { norm, label: SIDE_LABELS[norm], cells, max };
  });

  // Globální max pro vizuální srovnatelnost mezi stranami.
  const globalMax = Math.max(...rows.flatMap((r) => r.cells.map((c) => c.count)), 1);

  const html = rows.map((r) => {
    const bars = r.cells.map((c) => {
      if (!c.available) {
        return `
          <div class="reg-stats__group-col" title="V ročníku ${c.year} tato strana neexistovala">
            <div class="reg-stats__group-num">—</div>
            <div class="reg-stats__group-bar-wrap"><div class="reg-stats__group-bar reg-stats__group-bar--missing"></div></div>
            <div class="reg-stats__group-year">${c.year}</div>
          </div>
        `;
      }
      const h = (c.count / globalMax) * 100;
      return `
        <div class="reg-stats__group-col">
          <div class="reg-stats__group-num">${c.count}</div>
          <div class="reg-stats__group-bar-wrap">
            <div class="reg-stats__group-bar" style="height: ${h.toFixed(1)}%; background: ${SIDE_COLORS[r.norm]}"></div>
          </div>
          <div class="reg-stats__group-year">${c.year}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="reg-stats__group-cluster">
        <div class="reg-stats__group-title">${escapeHtml(r.label)}</div>
        <div class="reg-stats__group-bars">${bars}</div>
      </div>
    `;
  }).join('');

  return `
    <h2 class="reg-stats__h2">Strany — absolutní počty per ročník</h2>
    <div class="reg-stats__grouped">${html}</div>
    <p class="reg-stats__hint">Stejné měřítko napříč všemi stranami. Žoldáci v PP2024 ještě jako samostatná strana neexistovali.</p>
  `;
}

// ───────────────────────────────────────────────────────────────────────────
// 4) Strany relativní — 3× stacked 100 %
// ───────────────────────────────────────────────────────────────────────────

function renderSidesRelative(all: Record<Year, StatsResponse | null>): string {
  const cols = YEARS.map((y) => {
    const s = all[y];
    if (!s) {
      return `<div class="reg-stats__stack-col reg-stats__stack-col--empty">
        <div class="reg-stats__stack-year">${y}</div>
        <div class="reg-stats__stack-empty">—</div>
      </div>`;
    }
    const total = s.by_side.reduce((sum, row) => sum + row.count, 0);
    if (total === 0) return '';

    const segments = SIDE_ORDER.map((norm) => {
      const row = findSide(s, norm);
      const count = row?.count ?? 0;
      if (count === 0) return '';
      const pct = (count / total) * 100;
      return `
        <div class="reg-stats__stack-seg"
             style="height: ${pct.toFixed(2)}%; background: ${SIDE_COLORS[norm]}"
             title="${escapeHtml(SIDE_LABELS[norm])}: ${count} (${pct.toFixed(1)} %)">
          ${pct >= 6 ? `<span class="reg-stats__stack-seg-lbl">${pct.toFixed(0)} %</span>` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="reg-stats__stack-col">
        <div class="reg-stats__stack-year">${y}</div>
        <div class="reg-stats__stack-bar">${segments}</div>
        <div class="reg-stats__stack-total">${total} účastníků</div>
      </div>
    `;
  }).join('');

  const legend = SIDE_ORDER.map((norm) => `
    <li class="reg-stats__legend-item">
      <span class="reg-stats__legend-swatch" style="background: ${SIDE_COLORS[norm]}"></span>
      <span class="reg-stats__legend-label">${escapeHtml(SIDE_LABELS[norm])}</span>
    </li>
  `).join('');

  return `
    <h2 class="reg-stats__h2">Strany — relativní podíl (100 %)</h2>
    <div class="reg-stats__stack-row">${cols}</div>
    <ul class="reg-stats__legend reg-stats__legend--compact">${legend}</ul>
    <p class="reg-stats__hint">Každý sloupec = 100 %. Viditelný posun v poměru stran ročník od ročníku.</p>
  `;
}

// ───────────────────────────────────────────────────────────────────────────
// 5) Frakce slope chart — 8 frakcí přes 3 roky
// ───────────────────────────────────────────────────────────────────────────

const ARMY_LABELS = [
  'Gondor',
  'Rohan',
  'Elfové',
  'Trpaslíci',
  'Skřeti a Skuruti (orkové, goblini)',
  'Harad',
  'Umbar',
  'Horalé / Vrchovina',
];

function renderArmiesSlope(all: Record<Year, StatsResponse | null>): string {
  type ArmyPoints = { label: string; sideNorm: SideNorm | null; values: (number | null)[] };

  const armies: ArmyPoints[] = ARMY_LABELS.map((label) => {
    const values = YEARS.map((y) => {
      const s = all[y];
      if (!s) return null;
      const nar = findNar(s, label);
      return nar?.count ?? 0;
    });
    // Najdi side_key z prvního dostupného ročníku, normalizuj přes side_label.
    let sideNorm: SideNorm | null = null;
    for (const y of YEARS) {
      const s = all[y];
      const nar = s ? findNar(s, label) : null;
      if (nar) {
        const sideRow = s!.by_side.find((sr) => sr.key === nar.side_key);
        sideNorm = sideRow ? normalizeSideKey(sideRow.label) : null;
        break;
      }
    }
    return { label, sideNorm, values };
  });

  const allValues = armies.flatMap((a) => a.values.filter((v): v is number => v !== null));
  const max = Math.max(...allValues, 1);

  // SVG slope chart — width 100 % responzivně, height 360.
  const W = 720;
  const H = 360;
  const padL = 110;
  const padR = 130;
  const padT = 24;
  const padB = 32;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const xFor = (i: number): number => padL + (plotW * i) / (YEARS.length - 1);
  const yFor = (v: number): number => padT + plotH - (v / max) * plotH;

  // Axis labels (roky).
  const xAxis = YEARS.map((y, i) => `
    <text x="${xFor(i)}" y="${H - 8}" text-anchor="middle" class="reg-stats__slope-axis">${y}</text>
  `).join('');

  // Pro každou frakci: lomená čára + body.
  const lines = armies.map((a) => {
    const color = a.sideNorm ? SIDE_COLORS[a.sideNorm] : '#888';
    const points = a.values.map((v, i) => v !== null ? `${xFor(i)},${yFor(v)}` : null);
    const segments: string[] = [];
    for (let i = 0; i < points.length - 1; i += 1) {
      if (points[i] && points[i + 1]) {
        segments.push(`<line x1="${points[i]!.split(',')[0]}" y1="${points[i]!.split(',')[1]}" x2="${points[i + 1]!.split(',')[0]}" y2="${points[i + 1]!.split(',')[1]}" stroke="${color}" stroke-width="2" stroke-linecap="round" />`);
      }
    }
    const dots = a.values.map((v, i) => v !== null
      ? `<circle cx="${xFor(i)}" cy="${yFor(v)}" r="4" fill="${color}" stroke="var(--color-bg-dark)" stroke-width="1.5"><title>${escapeHtml(a.label)} ${YEARS[i]}: ${v}</title></circle>`
      : '').join('');

    // Label vpravo u posledního dostupného bodu.
    let lastIdx = -1;
    let lastVal: number | null = null;
    for (let i = a.values.length - 1; i >= 0; i -= 1) {
      if (a.values[i] !== null) {
        lastIdx = i;
        lastVal = a.values[i]!;
        break;
      }
    }
    const labelEl = lastIdx >= 0
      ? `<text x="${xFor(lastIdx) + 8}" y="${yFor(lastVal!) + 4}" class="reg-stats__slope-label" fill="${color}">${escapeHtml(a.label.length > 18 ? a.label.slice(0, 16) + '…' : a.label)} (${lastVal})</text>`
      : '';

    return `<g>${segments.join('')}${dots}${labelEl}</g>`;
  }).join('');

  // Y axis ticks.
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const v = Math.round(max * f);
    const yy = yFor(v);
    return `
      <line x1="${padL}" y1="${yy}" x2="${W - padR}" y2="${yy}" stroke="var(--color-gold-darkest, #5E4A23)" stroke-width="0.5" stroke-dasharray="2,3" opacity="0.45" />
      <text x="${padL - 8}" y="${yy + 4}" text-anchor="end" class="reg-stats__slope-axis">${v}</text>
    `;
  }).join('');

  return `
    <h2 class="reg-stats__h2">Frakce — vývoj 2024 → 2026</h2>
    <div class="reg-stats__slope-wrap">
      <svg viewBox="0 0 ${W} ${H}" class="reg-stats__slope" role="img" aria-label="Slope chart vývoje frakcí mezi ročníky">
        ${ticks}
        ${lines}
        ${xAxis}
      </svg>
    </div>
    <p class="reg-stats__hint">Každá linka = jedna frakce, barva podle strany. Vrchovina (žoldáci) chyběla v PP2024.</p>
  `;
}

// ───────────────────────────────────────────────────────────────────────────
// 6) Věk + 3 pyramidy
// ───────────────────────────────────────────────────────────────────────────

function renderAgeAndPyramids(all: Record<Year, StatsResponse | null>): string {
  const ageTable = `
    <table class="reg-stats__compare-table">
      <thead>
        <tr>
          <th>Ročník</th>
          <th>Průměr</th>
          <th>Medián</th>
          <th>Nejčastější</th>
          <th>Rozsah věku</th>
        </tr>
      </thead>
      <tbody>
        ${YEARS.map((y) => {
          const s = all[y];
          if (!s) return `<tr><td><strong>${y}</strong></td><td colspan="4" class="reg-stats__cell-missing">data nedostupná</td></tr>`;
          const outlierWarn = (s.age_stats.max ?? 0) > MAX_PLAUSIBLE_AGE
            ? `<span class="reg-stats__warn-inline" title="Max ${s.age_stats.max} v datech je očividný bug, vyřazeno z trimovaných pyramid">⚠</span>`
            : '';
          return `
            <tr>
              <td><strong>${y}</strong></td>
              <td>${(s.age_stats.avg ?? 0).toFixed(1)} let</td>
              <td>${s.age_stats.median ?? '—'} let</td>
              <td>${s.age_stats.mode ?? '—'} let${s.age_stats.mode_count ? ` <small>(×${s.age_stats.mode_count})</small>` : ''}</td>
              <td>${s.age_stats.min ?? '—'} – ${Math.min(s.age_stats.max ?? 0, MAX_PLAUSIBLE_AGE)} ${outlierWarn}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  // 3 mini-pyramidy vedle sebe.
  const pyramids = YEARS.map((y) => {
    const s = all[y];
    if (!s) return `<div class="reg-stats__mini-pyramid reg-stats__mini-pyramid--empty">
      <div class="reg-stats__pyr-year">${y}</div>
      <div class="reg-stats__stack-empty">—</div>
    </div>`;
    return `
      <div class="reg-stats__mini-pyramid">
        <div class="reg-stats__pyr-year">${y}</div>
        ${renderMiniPyramid(s)}
      </div>
    `;
  }).join('');

  return `
    <h2 class="reg-stats__h2">Věk účastníků</h2>
    ${ageTable}
    <h3 class="reg-stats__h3" style="margin-top: 2rem">Věkové pyramidy — Svobodné vs Síly Temna</h3>
    <div class="reg-stats__mini-pyramids">${pyramids}</div>
    <p class="reg-stats__hint">Levá polovina = Svobodné národy, pravá = Síly Temného pána. Každý řádek = jeden rok věku (od 5 do ${MAX_PLAUSIBLE_AGE}).</p>
  `;
}

function renderMiniPyramid(stats: StatsResponse): string {
  const free = stats.age_years.free;
  const evil = stats.age_years.evil;
  if (!free.length || !evil.length) return '<div class="reg-stats__stack-empty">—</div>';

  // Trim na 5..MAX_PLAUSIBLE_AGE
  const from = 5;
  const to = Math.min(free.length - 1, MAX_PLAUSIBLE_AGE);
  const maxBucket = Math.max(...free.slice(from, to + 1), ...evil.slice(from, to + 1), 1);

  const rows: string[] = [];
  for (let age = to; age >= from; age -= 1) {
    const f = free[age] ?? 0;
    const e = evil[age] ?? 0;
    const fw = (f / maxBucket) * 100;
    const ew = (e / maxBucket) * 100;
    const labelEvery5 = age % 5 === 0 ? `<span class="reg-stats__pyr-age">${age}</span>` : '<span class="reg-stats__pyr-age">&nbsp;</span>';
    rows.push(`
      <div class="reg-stats__pyr-row">
        <div class="reg-stats__pyr-bar-l"><div style="width: ${fw.toFixed(1)}%; background: ${SIDE_COLORS.free}"></div></div>
        ${labelEvery5}
        <div class="reg-stats__pyr-bar-r"><div style="width: ${ew.toFixed(1)}%; background: ${SIDE_COLORS.evil}"></div></div>
      </div>
    `);
  }

  return `<div class="reg-stats__pyr">${rows.join('')}</div>`;
}

// ───────────────────────────────────────────────────────────────────────────
// 7) Generace per ročník — 3× stacked 100 %
// ───────────────────────────────────────────────────────────────────────────

const GEN_COLORS = ['#4A8C5E', '#7BAE5E', '#C9A75E', '#8A6E34', '#5E4A23'];

function renderGenerations(all: Record<Year, StatsResponse | null>): string {
  // Sumuju generation counts napříč stranami per ročník.
  const cols = YEARS.map((y) => {
    const s = all[y];
    if (!s || !s.generations?.by_side) {
      return `<div class="reg-stats__stack-col reg-stats__stack-col--empty">
        <div class="reg-stats__stack-year">${y}</div>
        <div class="reg-stats__stack-empty">—</div>
      </div>`;
    }
    const labels = s.generations.labels;
    const ranges = s.generations.ranges;
    const sums = labels.map((_, idx) =>
      s.generations.by_side.reduce((sum, side) => sum + (side.counts[idx] ?? 0), 0),
    );
    const total = sums.reduce((a, b) => a + b, 0);
    if (total === 0) {
      return `<div class="reg-stats__stack-col reg-stats__stack-col--empty">
        <div class="reg-stats__stack-year">${y}</div>
        <div class="reg-stats__stack-empty">—</div>
      </div>`;
    }
    const segments = sums.map((c, idx) => {
      if (c === 0) return '';
      const pct = (c / total) * 100;
      const color = GEN_COLORS[idx] ?? '#888';
      return `
        <div class="reg-stats__stack-seg"
             style="height: ${pct.toFixed(2)}%; background: ${color}"
             title="${escapeHtml(labels[idx] ?? '')} (${escapeHtml(ranges[idx] ?? '')}): ${c} (${pct.toFixed(1)} %)">
          ${pct >= 6 ? `<span class="reg-stats__stack-seg-lbl">${pct.toFixed(0)} %</span>` : ''}
        </div>
      `;
    }).join('');
    return `
      <div class="reg-stats__stack-col">
        <div class="reg-stats__stack-year">${y}</div>
        <div class="reg-stats__stack-bar">${segments}</div>
        <div class="reg-stats__stack-total">${total} účastníků</div>
      </div>
    `;
  }).join('');

  // Legenda — vezmu z prvního dostupného ročníku.
  const first = YEARS.map((y) => all[y]).find((s): s is StatsResponse => s !== null);
  const legend = first?.generations?.labels
    ? first.generations.labels.map((lbl, idx) => `
        <li class="reg-stats__legend-item">
          <span class="reg-stats__legend-swatch" style="background: ${GEN_COLORS[idx] ?? '#888'}"></span>
          <span class="reg-stats__legend-label">${escapeHtml(lbl)} <small>(${escapeHtml(first.generations.ranges[idx] ?? '')})</small></span>
        </li>
      `).join('')
    : '';

  return `
    <h2 class="reg-stats__h2">Generační složení per ročník</h2>
    <div class="reg-stats__stack-row">${cols}</div>
    <ul class="reg-stats__legend reg-stats__legend--compact">${legend}</ul>
    <p class="reg-stats__hint">Rozdělení podle Pew Research (Gen Alpha 0–16, Gen Z 17–29, Mileniálové 30–45, Gen X 46–61, Boomer 62+).</p>
  `;
}

// ───────────────────────────────────────────────────────────────────────────
// 8) Pohlaví per ročník — 3× stacked 100 %
// ───────────────────────────────────────────────────────────────────────────

const GENDER_COLORS = {
  male: 'var(--color-side-free, #2E4C3A)',
  female: 'var(--color-side-evil, #7B1E20)',
  unknown: '#6F6A5E',
};

function renderGender(all: Record<Year, StatsResponse | null>): string {
  const cols = YEARS.map((y) => {
    const s = all[y];
    if (!s) {
      return `<div class="reg-stats__stack-col reg-stats__stack-col--empty">
        <div class="reg-stats__stack-year">${y}</div>
        <div class="reg-stats__stack-empty">—</div>
      </div>`;
    }
    const total = s.gender.male + s.gender.female + s.gender.unknown;
    if (total === 0) return '';
    const segs = ([
      { key: 'male', label: 'Muži', count: s.gender.male, color: GENDER_COLORS.male },
      { key: 'female', label: 'Ženy', count: s.gender.female, color: GENDER_COLORS.female },
      { key: 'unknown', label: 'Neuvedeno', count: s.gender.unknown, color: GENDER_COLORS.unknown },
    ]).map((seg) => {
      if (seg.count === 0) return '';
      const pct = (seg.count / total) * 100;
      return `
        <div class="reg-stats__stack-seg"
             style="height: ${pct.toFixed(2)}%; background: ${seg.color}"
             title="${seg.label}: ${seg.count} (${pct.toFixed(1)} %)">
          ${pct >= 6 ? `<span class="reg-stats__stack-seg-lbl">${pct.toFixed(0)} %</span>` : ''}
        </div>
      `;
    }).join('');
    return `
      <div class="reg-stats__stack-col">
        <div class="reg-stats__stack-year">${y}</div>
        <div class="reg-stats__stack-bar">${segs}</div>
        <div class="reg-stats__stack-total">${total}</div>
      </div>
    `;
  }).join('');

  // Trend % žen v textu.
  const femaleTrend = YEARS.map((y) => {
    const s = all[y];
    if (!s) return `${y}: —`;
    const total = s.gender.male + s.gender.female + s.gender.unknown;
    if (total === 0) return `${y}: —`;
    return `${y}: <strong>${((s.gender.female / total) * 100).toFixed(1)} %</strong> žen`;
  }).join(' · ');

  return `
    <h2 class="reg-stats__h2">Pohlaví per ročník</h2>
    <div class="reg-stats__stack-row">${cols}</div>
    <ul class="reg-stats__legend reg-stats__legend--compact">
      <li class="reg-stats__legend-item"><span class="reg-stats__legend-swatch" style="background: ${GENDER_COLORS.male}"></span> Muži</li>
      <li class="reg-stats__legend-item"><span class="reg-stats__legend-swatch" style="background: ${GENDER_COLORS.female}"></span> Ženy</li>
      <li class="reg-stats__legend-item"><span class="reg-stats__legend-swatch" style="background: ${GENDER_COLORS.unknown}"></span> Neuvedeno</li>
    </ul>
    <p class="reg-stats__hint">Trend zastoupení žen: ${femaleTrend}</p>
  `;
}

// ───────────────────────────────────────────────────────────────────────────
// 9) Zbraně slope chart — top 7 zbraní 2024 → 2026
// ───────────────────────────────────────────────────────────────────────────

const WEAPON_COLORS = [
  '#7B1E20', // tmavě červená
  '#2E4C3A', // tmavě zelená
  '#8A6E34', // gold dark
  '#5E4A23', // gold darkest
  '#475E78', // tlumená modrá
  '#6F6A5E', // muted gold
  '#3A2E1E', // hnědá
];

function renderWeaponsSlope(all: Record<Year, StatsResponse | null>): string {
  // Zbraně mají stabilní `key` napříč ročníky (string '0'..'6'), můžu mapovat podle key.
  // Posbírej všechny zbraně co se vyskytly aspoň v jednom ročníku.
  type W = { key: string; label: string; values: (number | null)[] };
  const map = new Map<string, W>();

  YEARS.forEach((y, idx) => {
    const s = all[y];
    if (!s) return;
    for (const row of s.by_weapon) {
      const existing = map.get(row.key);
      if (existing) {
        existing.values[idx] = row.count;
      } else {
        const values: (number | null)[] = [null, null, null];
        values[idx] = row.count;
        map.set(row.key, { key: row.key, label: row.label, values });
      }
    }
  });

  // Doplň 0 pro ročníky, kde zbraň existovala ale `by_weapon` ji nevrátil.
  for (const w of map.values()) {
    for (let i = 0; i < YEARS.length; i += 1) {
      if (w.values[i] === null && all[YEARS[i]!]) w.values[i] = 0;
    }
  }

  const weapons = Array.from(map.values())
    .sort((a, b) => {
      const sumA = a.values.reduce<number>((s, v) => s + (v ?? 0), 0);
      const sumB = b.values.reduce<number>((s, v) => s + (v ?? 0), 0);
      return sumB - sumA;
    });

  const allValues = weapons.flatMap((w) => w.values.filter((v): v is number => v !== null));
  const max = Math.max(...allValues, 1);

  const W = 720;
  const H = 360;
  const padL = 130;
  const padR = 180;
  const padT = 24;
  const padB = 32;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const xFor = (i: number): number => padL + (plotW * i) / (YEARS.length - 1);
  const yFor = (v: number): number => padT + plotH - (v / max) * plotH;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const v = Math.round(max * f);
    const yy = yFor(v);
    return `
      <line x1="${padL}" y1="${yy}" x2="${W - padR}" y2="${yy}" stroke="var(--color-gold-darkest, #5E4A23)" stroke-width="0.5" stroke-dasharray="2,3" opacity="0.45" />
      <text x="${padL - 8}" y="${yy + 4}" text-anchor="end" class="reg-stats__slope-axis">${v}</text>
    `;
  }).join('');

  const lines = weapons.map((w, idx) => {
    const color = WEAPON_COLORS[idx % WEAPON_COLORS.length] ?? '#888';
    const points = w.values.map((v, i) => v !== null ? `${xFor(i)},${yFor(v)}` : null);
    const segments: string[] = [];
    for (let i = 0; i < points.length - 1; i += 1) {
      if (points[i] && points[i + 1]) {
        segments.push(`<line x1="${points[i]!.split(',')[0]}" y1="${points[i]!.split(',')[1]}" x2="${points[i + 1]!.split(',')[0]}" y2="${points[i + 1]!.split(',')[1]}" stroke="${color}" stroke-width="2" stroke-linecap="round" />`);
      }
    }
    const dots = w.values.map((v, i) => v !== null
      ? `<circle cx="${xFor(i)}" cy="${yFor(v)}" r="4" fill="${color}" stroke="var(--color-bg-dark)" stroke-width="1.5"><title>${escapeHtml(w.label)} ${YEARS[i]}: ${v}</title></circle>`
      : '').join('');

    let lastIdx = -1;
    let lastVal: number | null = null;
    for (let i = w.values.length - 1; i >= 0; i -= 1) {
      if (w.values[i] !== null) {
        lastIdx = i;
        lastVal = w.values[i]!;
        break;
      }
    }
    const labelShort = w.label.length > 28 ? w.label.slice(0, 26) + '…' : w.label;
    const labelEl = lastIdx >= 0
      ? `<text x="${xFor(lastIdx) + 8}" y="${yFor(lastVal!) + 4}" class="reg-stats__slope-label" fill="${color}">${escapeHtml(labelShort)} (${lastVal})</text>`
      : '';
    return `<g>${segments.join('')}${dots}${labelEl}</g>`;
  }).join('');

  const xAxis = YEARS.map((y, i) => `
    <text x="${xFor(i)}" y="${H - 8}" text-anchor="middle" class="reg-stats__slope-axis">${y}</text>
  `).join('');

  return `
    <h2 class="reg-stats__h2">Zbraně — vývoj preferencí</h2>
    <div class="reg-stats__slope-wrap">
      <svg viewBox="0 0 ${W} ${H}" class="reg-stats__slope" role="img" aria-label="Slope chart popularity zbraní">
        ${ticks}
        ${lines}
        ${xAxis}
      </svg>
    </div>
    <p class="reg-stats__hint">Seřazeno podle celkového součtu napříč ročníky. Hover na bod ukáže přesné číslo.</p>
  `;
}

// ───────────────────────────────────────────────────────────────────────────
// 10a) Skupiny — tabulka klíčových čísel
// ───────────────────────────────────────────────────────────────────────────

function renderGroupsTable(all: Record<Year, StatsResponse | null>): string {
  const rows = YEARS.map((y) => {
    const s = all[y];
    if (!s) {
      return `<tr><td><strong>${y}</strong></td><td colspan="6" class="reg-stats__cell-missing">data nedostupná</td></tr>`;
    }
    const totalSolo = s.group_total_solo ?? 0;
    const groupedSize = s.group_size_buckets.reduce((sum, b) => sum + b.count, 0);
    const totalCount = totalSolo + (groupedSize - (s.group_size_buckets.find((b) => b.key === 'sólo')?.count ?? 0));
    const soloPct = totalCount > 0 ? ((totalSolo / totalCount) * 100).toFixed(1) : '—';
    const gini = s.gini_groups !== null ? s.gini_groups.toFixed(2) : '—';
    const groupCount = s.group_count ?? 0;

    const largest = s.simpson_groups
      .reduce<typeof s.simpson_groups[number] | null>(
        (max, g) => !max || g.size > max.size ? g : max,
        null,
      );
    const largestStr = largest && largest.size > 0
      ? `${escapeHtml(largest.group_name ?? '')} (${largest.size})`
      : '—';

    const mostDiverse = s.simpson_groups
      .filter((g) => g.size >= 3)
      .reduce<typeof s.simpson_groups[number] | null>((best, g) =>
        !best || g.simpson > best.simpson ? g : best, null);
    const diverseStr = mostDiverse
      ? `${escapeHtml(mostDiverse.group_name ?? '')} <small>(Simpson ${mostDiverse.simpson.toFixed(2)})</small>`
      : '—';

    return `
      <tr>
        <td><strong>${y}</strong></td>
        <td>${groupCount}</td>
        <td>${soloPct === '—' ? '—' : soloPct + ' %'}</td>
        <td>${gini}</td>
        <td>${largestStr}</td>
        <td>${diverseStr}</td>
      </tr>
    `;
  }).join('');

  return `
    <h2 class="reg-stats__h2">Skupinová struktura</h2>
    <table class="reg-stats__compare-table">
      <thead>
        <tr>
          <th>Ročník</th>
          <th>Počet skupin</th>
          <th>Sólo registrací</th>
          <th>Gini</th>
          <th>Největší skupina</th>
          <th>Nejdiverznější (Simpson)</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="reg-stats__hint">Gini coefficient: 0 = stejně velké skupiny, 1 = jedna obří + zbytek sólo. Simpson Index = pravděpodobnost, že 2 náhodní členové skupiny jsou z různých stran.</p>
  `;
}

// ───────────────────────────────────────────────────────────────────────────
// 10b) Registrační dynamika — 3 normalizované CDF křivky
// ───────────────────────────────────────────────────────────────────────────

function renderRegistrationDynamics(all: Record<Year, StatsResponse | null>): string {
  // Normalizuju timeline každého ročníku na [0, 1] osy `% času do akce`.
  // 0 % = první den registrace, 100 % = den akce (event.date_from).
  type Curve = { year: Year; points: { x: number; y: number }[]; color: string; total: number };

  const curves: Curve[] = YEARS.map((y) => {
    const s = all[y];
    if (!s || !s.timeline || s.timeline.length === 0) {
      return { year: y, points: [], color: YEAR_COLORS[y], total: 0 };
    }
    const eventDate = new Date(s.event.date_from).getTime();
    const firstDate = new Date(s.timeline[0]!.date).getTime();
    const range = eventDate - firstDate;
    if (range <= 0) return { year: y, points: [], color: YEAR_COLORS[y], total: 0 };
    const total = s.timeline[s.timeline.length - 1]!.cumulative;
    if (total === 0) return { year: y, points: [], color: YEAR_COLORS[y], total: 0 };

    const points = s.timeline.map((p: StatsTimelinePoint) => ({
      x: clamp((new Date(p.date).getTime() - firstDate) / range, 0, 1),
      y: p.cumulative / total,
    }));
    // Pro hezčí konec dotáhni na (1, 1) — předpokládáme že po posledním datu už nikdo nepřibyl.
    if (points[points.length - 1]!.x < 1) {
      points.push({ x: 1, y: 1 });
    }
    return { year: y, points, color: YEAR_COLORS[y], total };
  }).filter((c) => c.points.length > 0);

  if (curves.length === 0) {
    return `<h2 class="reg-stats__h2">Registrační dynamika</h2><p class="reg-stats__hint">Data nedostupná.</p>`;
  }

  const W = 720;
  const H = 320;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xFor = (x: number): number => padL + x * plotW;
  const yFor = (y: number): number => padT + plotH - y * plotH;

  // Y osa — 25/50/75/100 %.
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => `
    <line x1="${padL}" y1="${yFor(f)}" x2="${W - padR}" y2="${yFor(f)}" stroke="var(--color-gold-darkest, #5E4A23)" stroke-width="0.5" stroke-dasharray="2,3" opacity="0.4" />
    <text x="${padL - 6}" y="${yFor(f) + 4}" text-anchor="end" class="reg-stats__slope-axis">${(f * 100).toFixed(0)} %</text>
  `).join('');

  // X osa — 0/25/50/75/100 % času.
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => `
    <line x1="${xFor(f)}" y1="${padT}" x2="${xFor(f)}" y2="${padT + plotH}" stroke="var(--color-gold-darkest, #5E4A23)" stroke-width="0.5" stroke-dasharray="2,3" opacity="0.25" />
    <text x="${xFor(f)}" y="${H - 18}" text-anchor="middle" class="reg-stats__slope-axis">${(f * 100).toFixed(0)} %</text>
  `).join('');

  const lines = curves.map((c) => {
    const d = c.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.x).toFixed(2)} ${yFor(p.y).toFixed(2)}`).join(' ');
    return `<path d="${d}" fill="none" stroke="${c.color}" stroke-width="2.4" stroke-linejoin="round" />`;
  }).join('');

  // Mediánové body (kdy ročník dosáhl 50 %).
  const medians = curves.map((c) => {
    const pt = c.points.find((p) => p.y >= 0.5);
    if (!pt) return '';
    return `<circle cx="${xFor(pt.x)}" cy="${yFor(0.5)}" r="4" fill="${c.color}" stroke="var(--color-bg-dark)" stroke-width="1.5"><title>${c.year}: 50 % registrací po ${(pt.x * 100).toFixed(0)} % času</title></circle>`;
  }).join('');

  const legendCurves = curves.map((c) => {
    const median = c.points.find((p) => p.y >= 0.5);
    const medianPct = median ? `${(median.x * 100).toFixed(0)} %` : '—';
    return `
      <li class="reg-stats__legend-item">
        <span class="reg-stats__legend-swatch" style="background: ${c.color}"></span>
        <span class="reg-stats__legend-label">${c.year} <small>(50 % reg. po ${medianPct} času)</small></span>
      </li>
    `;
  }).join('');

  return `
    <h2 class="reg-stats__h2">Registrační dynamika — normalizovaná na 100 % čas do akce</h2>
    <div class="reg-stats__slope-wrap">
      <svg viewBox="0 0 ${W} ${H}" class="reg-stats__slope" role="img" aria-label="CDF křivky kumulativní registrace per ročník">
        ${yTicks}
        ${xTicks}
        ${lines}
        ${medians}
        <text x="${W / 2}" y="${H - 4}" text-anchor="middle" class="reg-stats__slope-axis">% času do akce (0 % = první registrace, 100 % = den akce)</text>
      </svg>
    </div>
    <ul class="reg-stats__legend reg-stats__legend--compact">${legendCurves}</ul>
    <p class="reg-stats__hint">Pokud křivka stoupá vlevo, ročník měl pomalý rozjezd. Strmé stoupání vpravo = poslední vlna těsně před akcí.</p>
  `;
}

