/**
 * Statistiky účastníků — agregovaná data + grafy.
 * Datum: 2026-05-12
 *
 * Vanilla SVG/CSS grafy (žádné chart-library) — minimální bundle size.
 * Data z /api/v1/events/{slug}/stats (= pre-aggregated, GDPR-friendly).
 */

import { getEventStats } from './api-client';
import type { StatsResponse, StatsSideRow, StatsNarRow, StatsWeaponBySide, StatsWeaponByAge, StatsArrival, StatsNarPyramid } from './types';

const SIDE_FREE = '1';
const SIDE_EVIL = '2';
const SIDE_MERC = '3';
const SIDE_NONPLAY = '4';
const SIDE_KIDS = '5';

// Barvy stran — CSS vars + WCAG-friendly fallbacky.
// Vše procházelo audit: na bílém parchmentu (light) i tmavém pozadí (dark)
// musí mít kontrast vůči okolnímu textu/pozadí ≥ 3:1 (graphical objects),
// vůči white text uvnitř segmentu ≥ 4.5:1 (normal text).
//
// Tmavší tóny (zelená/červená) splňují WCAG AA na obě varianty.
// Gold #C9A75E byl příliš světlý pro white text → Žoldáci/Nehrající
// použijí gold-dark #8A6E34 (white ratio 5.2:1) místo plné gold.
const SIDE_COLORS: Record<string, string> = {
  [SIDE_FREE]: 'var(--color-side-free, #2E4C3A)',   // 9.4:1 vs white
  [SIDE_EVIL]: 'var(--color-side-evil, #7B1E20)',   // 9.6:1 vs white
  [SIDE_MERC]: 'var(--color-gold-dark, #8A6E34)',   // 5.2:1 vs white (gold byl 2.3:1 = FAIL)
  [SIDE_NONPLAY]: 'var(--color-gold-darkest, #5E4A23)', // 8.7:1 vs white
  [SIDE_KIDS]: '#6F6A5E',  // ztmavený muted (originál #A8A290 měl 2.4:1 = FAIL)
};

export async function initStatistiky(rootSelector: string, slug: string): Promise<void> {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) return;

  root.classList.add('reg-app');
  root.innerHTML = '<div class="reg-loading">Načítám statistiky…</div>';

  const stats = await getEventStats(slug);
  if (!stats) {
    root.innerHTML = `
      <div class="reg-error">
        Nepodařilo se načíst statistická data ze serveru registracka.cz.
      </div>
    `;
    return;
  }

  if (stats.total === 0) {
    root.innerHTML = `
      <div class="reg-closed">
        Zatím se nikdo nezaregistroval. Až přibudou účastníci, objeví se zde statistiky.
      </div>
    `;
    return;
  }

  root.innerHTML = `
    <div class="reg-stats">
      <!-- 1) PŘEHLED -->
      <section id="prehled" class="reg-stats__group">
        ${renderOverview(stats)}
        ${renderYoungAdult(stats)}
      </section>

      <!-- 2) STRANY, ARMÁDY A ZBRANĚ -->
      <section id="strany-a-armady" class="reg-stats__group">
        ${headlink('rozlozeni-stran', 'Rozložení podle stran')}
        ${renderSidesPie(stats)}
        ${headlink('svobodne-narody', 'Armády Svobodných národů Středozemě')}
        ${renderNarPie(stats, SIDE_FREE, 'Rozložení armád v rámci Svobodných národů Středozemě')}
        ${headlink('sily-temneho-pana', 'Armády Sil Temného pána')}
        ${renderNarPie(stats, SIDE_EVIL, 'Rozložení armád v rámci Sil Temného pána')}
        ${headlink('armady-pocty', 'Armády podle počtu přihlášených')}
        ${renderArmiesBars(stats)}
        ${headlink('shannon-diverzita', 'Vyrovnanost armád (Shannon diverzita)')}
        ${renderShannon(stats)}
        ${headlink('zbrane-podle-stran', 'Distribuce zbraní podle stran')}
        ${renderWeaponBySide(stats)}
        ${headlink('zbrane-podle-veku', 'Volba zbraně podle věku')}
        ${renderWeaponByAge(stats)}
      </section>

      <!-- 3) VĚK A POHLAVÍ -->
      <section id="vek-a-pohlavi" class="reg-stats__group">
        ${headlink('prumerny-vek', 'Průměrný věk podle strany')}
        ${renderAvgAgePerSide(stats)}
        ${headlink('generace', 'Generační složení')}
        ${renderGenerations(stats)}
        ${headlink('pyramida-stran', 'Věková pyramida — Svobodné národy vs Síly Temna')}
        ${renderAgePyramid(stats)}
        ${headlink('pyramida-pohlavi', 'Věková pyramida podle pohlaví')}
        ${renderAgePyramidGender(stats)}
        ${headlink('pyramida-srovnani', 'Srovnání věkové struktury dvou armád')}
        ${renderNarPyramidSelector(stats)}
        ${headlink('detska-hra', 'Dětská hra a věkové kategorie')}
        ${renderRolesAndKids(stats)}
        ${headlink('pohlavi-podle-stran', 'Pohlaví podle strany')}
        ${renderGenderPerSide(stats)}
        ${headlink('pohlavi-vs-zbran', 'Pohlaví × Zbraň')}
        ${renderGenderWeapon(stats)}
        ${headlink('pohlavi-vs-role', 'Pohlaví × Role nehrajícího')}
        ${renderGenderRole(stats)}
      </section>

      <!-- 4) SKUPINY A LOGISTIKA -->
      <section id="skupiny-a-prijezdy" class="reg-stats__group">
        ${headlink('velikost-skupin', 'Velikost skupin a družin')}
        ${renderGroupSizes(stats)}
        ${headlink('lorenz', 'Lorenzova křivka — koncentrace lidí ve skupinách')}
        ${renderLorenz(stats)}
        ${headlink('kosmopolitni-druziny', 'Kosmopolitní vs homogenní družiny')}
        ${renderSimpsonGroups(stats)}
        ${headlink('prijezdova-vlna', 'Příjezdová vlna do tábořiště')}
        ${renderArrivalsArea(stats)}
        ${headlink('registracni-krivka', 'Registrační křivka v čase')}
        ${renderTimeline(stats)}
        ${headlink('vekove-extremy', 'Pět nejmladších a nejstarších')}
        ${renderOutliersDetail(stats)}
      </section>
    </div>
  `;

  // Napoj dropdown handlery pro pyramidu se selektorem
  attachNarPyramidHandlers(root, stats);
}

// === 1. Přehled ===========================================================

function renderOverview(stats: StatsResponse): string {
  const freeSide = stats.by_side.find((s) => s.key === SIDE_FREE);
  const evilSide = stats.by_side.find((s) => s.key === SIDE_EVIL);
  const mercSide = stats.by_side.find((s) => s.key === SIDE_MERC);
  const nonplaySide = stats.by_side.find((s) => s.key === SIDE_NONPLAY);
  const kidsSide = stats.by_side.find((s) => s.key === SIDE_KIDS);

  const a = stats.age_stats;
  const fmtAge = (v: number | null): string => (v !== null ? `${v} let` : '—');
  const modeLabel = a.mode !== null
    ? `${a.mode} let${a.mode_count ? ` (${a.mode_count}×)` : ''}`
    : '—';

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Přehled</h2>
      <h3 class="reg-stats__subtitle">Počty účastníků</h3>
      <div class="reg-stats__cards">
        ${statCard('Celkem přihlášených', String(stats.total))}
        ${statCard('Svobodné národy', String(freeSide?.count ?? 0), SIDE_COLORS[SIDE_FREE])}
        ${statCard('Síly Temného Pána', String(evilSide?.count ?? 0), SIDE_COLORS[SIDE_EVIL])}
        ${statCard('Žoldáci', String(mercSide?.count ?? 0), SIDE_COLORS[SIDE_MERC])}
        ${statCard('Nehrající', String(nonplaySide?.count ?? 0), SIDE_COLORS[SIDE_NONPLAY])}
        ${statCard('Dětská hra', String(kidsSide?.count ?? 0), SIDE_COLORS[SIDE_KIDS])}
      </div>
      <h3 class="reg-stats__subtitle reg-stats__subtitle--spaced">Věk účastníků</h3>
      <div class="reg-stats__cards">
        ${statCard('Průměr', fmtAge(a.avg))}
        ${statCard('Medián', fmtAge(a.median))}
        ${statCard('Nejčastější', modeLabel)}
        ${statCard('Nejmladší', fmtAge(a.min))}
        ${statCard('Nejstarší', fmtAge(a.max))}
      </div>
    </section>
  `;
}

// Value smí obsahovat omezené HTML (např. <small>) — XSS riziko zde nehrozí,
// volající kontroluje obsah (jen interní data z BE, escapovaná na BE straně
// při formátování).
function statCard(label: string, value: string, accentColor?: string): string {
  const style = accentColor ? ` style="--stat-accent: ${accentColor}"` : '';
  return `
    <div class="reg-stats__card"${style}>
      <div class="reg-stats__card-value">${value}</div>
      <div class="reg-stats__card-label">${escapeHtml(label)}</div>
    </div>
  `;
}

// === 2. Koláč: rozložení podle stran (= rolí) =============================

function renderSidesPie(stats: StatsResponse): string {
  const slices = stats.by_side.filter((s) => s.count > 0);
  if (slices.length === 0) return '';
  const total = slices.reduce((sum, s) => sum + s.count, 0);

  // Donut chart — SVG s arc path elementy
  const radius = 80;
  const innerR = 50;
  const cx = 100;
  const cy = 100;
  let startAngle = -Math.PI / 2; // začni nahoře

  const paths = slices.map((s) => {
    const fraction = s.count / total;
    const endAngle = startAngle + fraction * 2 * Math.PI;
    const largeArc = fraction > 0.5 ? 1 : 0;
    const x1 = cx + Math.cos(startAngle) * radius;
    const y1 = cy + Math.sin(startAngle) * radius;
    const x2 = cx + Math.cos(endAngle) * radius;
    const y2 = cy + Math.sin(endAngle) * radius;
    const ix2 = cx + Math.cos(endAngle) * innerR;
    const iy2 = cy + Math.sin(endAngle) * innerR;
    const ix1 = cx + Math.cos(startAngle) * innerR;
    const iy1 = cy + Math.sin(startAngle) * innerR;
    const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
    const color = SIDE_COLORS[s.key] ?? '#888';
    const pct = ((fraction * 100).toFixed(1));
    startAngle = endAngle;
    return `<path d="${d}" fill="${color}" stroke="var(--color-bg-dark)" stroke-width="2"><title>${escapeHtml(s.label)}: ${s.count} (${pct} %)</title></path>`;
  }).join('');

  const legend = slices.map((s) => {
    const pct = ((s.count / total) * 100).toFixed(1);
    return `
      <li class="reg-stats__legend-item">
        <span class="reg-stats__legend-swatch" style="background:${SIDE_COLORS[s.key] ?? '#888'}"></span>
        <span class="reg-stats__legend-label">${escapeHtml(s.label)}</span>
        <span class="reg-stats__legend-value">${s.count} <small>(${pct} %)</small></span>
      </li>
    `;
  }).join('');

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Rozložení podle stran</h2>
      <div class="reg-stats__pie-wrap">
        <svg class="reg-stats__pie" viewBox="0 0 200 200" role="img" aria-label="Koláčový graf: rozložení účastníků podle rolí">
          ${paths}
          <text x="100" y="95" text-anchor="middle" class="reg-stats__pie-center-num">${stats.total}</text>
          <text x="100" y="115" text-anchor="middle" class="reg-stats__pie-center-label">přihlášených</text>
        </svg>
        <ul class="reg-stats__legend">${legend}</ul>
      </div>
    </section>
  `;
}

// === 3. Bar chart: armády (Svobodné + Síly Temna) =========================

function renderArmiesBars(stats: StatsResponse): string {
  const armies = stats.by_nar.filter((n) => n.side_key === SIDE_FREE || n.side_key === SIDE_EVIL);
  if (armies.length === 0) return '';
  const max = Math.max(...armies.map((a) => a.count), 1);

  const free = armies.filter((a) => a.side_key === SIDE_FREE);
  const evil = armies.filter((a) => a.side_key === SIDE_EVIL);

  const renderRow = (a: StatsNarRow): string => {
    const w = (a.count / max) * 100;
    const color = SIDE_COLORS[a.side_key] ?? '#888';
    return `
      <div class="reg-stats__bar-row">
        <div class="reg-stats__bar-label">${escapeHtml(a.label)}</div>
        <div class="reg-stats__bar-track">
          <div class="reg-stats__bar-fill" style="width: ${w.toFixed(1)}%; background: ${color}"></div>
        </div>
        <div class="reg-stats__bar-value">${a.count}</div>
      </div>
    `;
  };

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Armády podle počtu přihlášených</h2>
      <div class="reg-stats__bars-cols">
        <div>
          <h3 class="reg-stats__h3 reg-stats__h3--side-free">Svobodné národy</h3>
          ${free.map(renderRow).join('')}
        </div>
        <div>
          <h3 class="reg-stats__h3 reg-stats__h3--side-evil">Síly Temného Pána</h3>
          ${evil.map(renderRow).join('')}
        </div>
      </div>
    </section>
  `;
}

// === 4. Průměrný věk per side =============================================

function renderAvgAgePerSide(stats: StatsResponse): string {
  const items = stats.by_side.filter((s) => s.avg_age !== null && s.count > 0);
  if (items.length === 0) return '';

  const cards = items.map((s) => {
    const color = SIDE_COLORS[s.key] ?? 'var(--color-gold-dark)';
    return statCard(s.label, `${s.avg_age?.toFixed(1) ?? '—'} let`, color);
  }).join('');

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Průměrný věk podle strany</h2>
      <div class="reg-stats__cards">${cards}</div>
    </section>
  `;
}

// === 5. Gender per side ===================================================

function renderGenderPerSide(stats: StatsResponse): string {
  // Filter sides s alespoň 1 mužem/ženou
  const items = stats.by_side.filter((s) => s.male + s.female > 0);
  if (items.length === 0) return '';

  const rows = items.map((s) => {
    const total = s.male + s.female;
    const malePct = (s.male / total) * 100;
    const femalePct = (s.female / total) * 100;
    return `
      <div class="reg-stats__gender-row">
        <div class="reg-stats__bar-label">${escapeHtml(s.label)}</div>
        <div class="reg-stats__gender-bar">
          <div class="reg-stats__gender-male" style="width: ${malePct.toFixed(1)}%" title="Muži: ${s.male}">
            <span>♂ ${s.male}</span>
          </div>
          <div class="reg-stats__gender-female" style="width: ${femalePct.toFixed(1)}%" title="Ženy: ${s.female}">
            <span>♀ ${s.female}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const totalKnown = stats.gender.male + stats.gender.female;
  const overall = totalKnown > 0 ? `
    <p class="reg-stats__note">
      Celkem: <strong>${stats.gender.male} mužů</strong> a <strong>${stats.gender.female} žen</strong>
      ${stats.gender.unknown > 0 ? `(${stats.gender.unknown} bez vyplněného pohlaví)` : ''}
    </p>
  ` : '';

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Pohlaví podle strany</h2>
      ${overall}
      <div class="reg-stats__bars">${rows}</div>
    </section>
  `;
}

// === 6. Populační pyramida: Svobodné vs Síly Temna (per-rok, jemně) =======

function renderAgePyramid(stats: StatsResponse): string {
  const y = stats.age_years;
  if (!y) return '';
  const trimmed = trimYearRange(y.free, y.evil);
  if (trimmed === null) return '';
  const { from, to } = trimmed;

  const rows = renderPyramidRows(
    y.free,
    y.evil,
    from,
    to,
    y.max,
    SIDE_COLORS[SIDE_FREE],
    SIDE_COLORS[SIDE_EVIL],
  );

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Věková pyramida — Svobodné národy Středozemě vs Síly Temného pána</h2>
      <div class="reg-stats__pyramid-legend">
        <span class="reg-stats__legend-swatch" style="background: ${SIDE_COLORS[SIDE_FREE]}"></span>
        Svobodné národy
        <span style="margin-left: 1.5rem;"></span>
        <span class="reg-stats__legend-swatch" style="background: ${SIDE_COLORS[SIDE_EVIL]}"></span>
        Síly Temného Pána
      </div>
      <div class="reg-stats__pyramid reg-stats__pyramid--fine">${rows}</div>
    </section>
  `;
}

// Najdi nejmenší rozsah indexů ve dvou polích kde alespoň jedna strana má
// hodnotu > 0 — abychom nevykreslovali prázdné řádky 0..max.
function trimYearRange(a: number[], b: number[]): { from: number; to: number } | null {
  const n = Math.max(a.length, b.length);
  let from = -1;
  let to = -1;
  for (let i = 0; i < n; i++) {
    const v = (a[i] ?? 0) + (b[i] ?? 0);
    if (v > 0) {
      if (from < 0) from = i;
      to = i;
    }
  }
  if (from < 0) return null;
  // Přidej 1 rok padding na okrajích pro vizuální dýchání
  from = Math.max(0, from - 1);
  to = Math.min(n - 1, to + 1);
  return { from, to };
}

// Vykresli pyramidové řádky po jednom roku. Popisky osy se zobrazují
// jen každý 5. rok (a první/poslední), aby graf byl čitelný.
function renderPyramidRows(
  leftArr: number[],
  rightArr: number[],
  from: number,
  to: number,
  ageMax: number,
  leftColor: string,
  rightColor: string,
  axisStep = 5,
): string {
  const max = Math.max(...leftArr.slice(from, to + 1), ...rightArr.slice(from, to + 1), 1);
  let out = '';
  for (let i = from; i <= to; i++) {
    const lV = leftArr[i] ?? 0;
    const rV = rightArr[i] ?? 0;
    const lW = (lV / max) * 100;
    const rW = (rV / max) * 100;
    // Popisek osy: každých `axisStep` let, plus první a poslední index
    const showLabel = i % axisStep === 0 || i === from || i === to;
    const labelText = showLabel
      ? (i === ageMax ? `${i}+` : String(i))
      : '';
    out += `
      <div class="reg-stats__pyramid-row reg-stats__pyramid-row--thin">
        <div class="reg-stats__pyramid-left">
          <div class="reg-stats__pyramid-value">${lV > 0 ? lV : ''}</div>
          <div class="reg-stats__pyramid-bar" style="width:${lW.toFixed(1)}%;background:${leftColor}"></div>
        </div>
        <div class="reg-stats__pyramid-axis">${labelText}</div>
        <div class="reg-stats__pyramid-right">
          <div class="reg-stats__pyramid-bar" style="width:${rW.toFixed(1)}%;background:${rightColor}"></div>
          <div class="reg-stats__pyramid-value">${rV > 0 ? rV : ''}</div>
        </div>
      </div>
    `;
  }
  return out;
}

// === 7. Role nehrajících + věk dětí =======================================

function renderRolesAndKids(stats: StatsResponse): string {
  let html = '';
  if (stats.by_role.length > 0) {
    const max = Math.max(...stats.by_role.map((r) => r.count), 1);
    const rows = stats.by_role.map((r) => {
      const w = (r.count / max) * 100;
      return `
        <div class="reg-stats__bar-row">
          <div class="reg-stats__bar-label">${escapeHtml(r.label)}</div>
          <div class="reg-stats__bar-track">
            <div class="reg-stats__bar-fill" style="width: ${w.toFixed(1)}%; background: ${SIDE_COLORS[SIDE_NONPLAY]}"></div>
          </div>
          <div class="reg-stats__bar-value">${r.count}</div>
        </div>
      `;
    }).join('');
    html += `
      <section class="reg-stats__section">
        <h2 class="reg-stats__h2">Role nehrajících</h2>
        <div class="reg-stats__bars">${rows}</div>
      </section>
    `;
  }
  if (stats.by_kids.length > 0) {
    const max = Math.max(...stats.by_kids.map((k) => k.count), 1);
    const rows = stats.by_kids.map((k) => {
      const w = (k.count / max) * 100;
      // Stripneme dlouhý popis za " - "
      const idx = k.label.indexOf(' - ');
      const short = idx >= 0 ? k.label.slice(0, idx).trim() : k.label;
      return `
        <div class="reg-stats__bar-row">
          <div class="reg-stats__bar-label">${escapeHtml(short)}</div>
          <div class="reg-stats__bar-track">
            <div class="reg-stats__bar-fill" style="width: ${w.toFixed(1)}%; background: ${SIDE_COLORS[SIDE_KIDS]}"></div>
          </div>
          <div class="reg-stats__bar-value">${k.count}</div>
        </div>
      `;
    }).join('');
    html += `
      <section class="reg-stats__section">
        <h2 class="reg-stats__h2">Dětská hra — věkové kategorie</h2>
        <div class="reg-stats__bars">${rows}</div>
      </section>
    `;
  }
  return html;
}

// === 6b. Věková pyramida podle pohlaví ====================================
// Per-rok jemná pyramida muži (vlevo) vs ženy (vpravo). Zdroj: age_years.by_gender.

function renderAgePyramidGender(stats: StatsResponse): string {
  const y = stats.age_years;
  if (!y || !y.by_gender) return '';
  const male = y.by_gender.male;
  const female = y.by_gender.female;
  const trimmed = trimYearRange(male, female);
  if (trimmed === null) return '';
  const { from, to } = trimmed;

  const maleColor = '#2C5985';   // navy (WCAG 7.4:1 vs white)
  const femaleColor = '#8B3A66'; // burgundy (WCAG 6.6:1)

  const rows = renderPyramidRows(male, female, from, to, y.max, maleColor, femaleColor);
  const totalM = male.reduce((a, b) => a + b, 0);
  const totalF = female.reduce((a, b) => a + b, 0);

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Věková pyramida podle pohlaví</h2>
      <p class="reg-stats__note">Muži vlevo, ženy vpravo. Jeden řádek = jeden rok věku. Pomáhá vidět, jestli jsou některé věkové skupiny "jen pánské" nebo "jen dámské".</p>
      <div class="reg-stats__pyramid-legend">
        <span class="reg-stats__legend-swatch" style="background:${maleColor}"></span>
        ♂ Muži <small>(${totalM})</small>
        <span style="margin-left: 1.5rem;"></span>
        <span class="reg-stats__legend-swatch" style="background:${femaleColor}"></span>
        ♀ Ženy <small>(${totalF})</small>
      </div>
      <div class="reg-stats__pyramid reg-stats__pyramid--fine">${rows}</div>
    </section>
  `;
}

// === 8. Příjezdová vlna (area chart kumulativní) ==========================
// Plošný graf — kumulativní počet účastníků v táboře den po dni.
// Pro organizátora: kolik lidí čekat na registraci a kolik jídla připravit.

function renderArrivalsArea(stats: StatsResponse): string {
  const arrivals = stats.arrivals.filter((a) => a.count > 0 || a.cumulative > 0);
  if (arrivals.length === 0) return '';
  const max = Math.max(...arrivals.map((a) => a.cumulative), 1);
  const w = 600;
  const h = 200;
  const padL = 50;
  const padB = 40;
  const padT = 10;
  const padR = 20;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const n = arrivals.length;

  // SVG path: smooth area from baseline to cumulative
  const points = arrivals.map((a, i) => {
    const x = padL + (i / Math.max(n - 1, 1)) * innerW;
    const y = padT + innerH - (a.cumulative / max) * innerH;
    return { x, y, label: a.label, count: a.count, cum: a.cumulative };
  });

  const pathLine = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const pathArea = `${pathLine} L ${(padL + innerW).toFixed(1)} ${(padT + innerH).toFixed(1)} L ${padL} ${(padT + innerH).toFixed(1)} Z`;

  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((max * i) / yTicks));
  const yLines = yLabels.map((val, i) => {
    const y = padT + innerH - (val / max) * innerH;
    return `
      <line x1="${padL}" y1="${y}" x2="${padL + innerW}" y2="${y}" stroke="var(--color-gold-darkest)" stroke-width="0.5" stroke-dasharray="2,2"/>
      <text x="${padL - 8}" y="${y + 4}" text-anchor="end" class="reg-stats__axis-label">${val}</text>
    `;
  }).join('');

  const xLabels = points.map((p) => `
    <text x="${p.x}" y="${padT + innerH + 16}" text-anchor="middle" class="reg-stats__axis-label">${escapeHtml(shortDayLabel(p.label))}</text>
  `).join('');

  const dots = points.map((p) => `
    <circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--color-gold-light)" stroke="var(--color-bg-dark)" stroke-width="2">
      <title>${escapeHtml(p.label)}: +${p.count} (celkem ${p.cum} v táboře)</title>
    </circle>
    <text x="${p.x}" y="${p.y - 10}" text-anchor="middle" class="reg-stats__axis-label" style="fill:var(--color-gold-light); font-weight: 600;">${p.cum}</text>
  `).join('');

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Příjezdová vlna do tábořiště</h2>
      <p class="reg-stats__note">Kumulativní počet účastníků v táboře po každém příjezdovém dni.</p>
      <div class="reg-stats__svg-wrap">
        <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" class="reg-stats__area-chart" role="img" aria-label="Plošný graf kumulativních příjezdů">
          ${yLines}
          <path d="${pathArea}" fill="rgba(201,167,94,0.18)"/>
          <path d="${pathLine}" fill="none" stroke="var(--color-gold)" stroke-width="2" stroke-linejoin="round"/>
          ${xLabels}
          ${dots}
        </svg>
      </div>
    </section>
  `;
}

// Vyextrahuj jen krátký den + datum z label (např. "úterý 18.8. (stavěčka, veget)" → "út 18.8.")
function shortDayLabel(label: string): string {
  const dayMap: Record<string, string> = {
    'pondělí': 'po', 'úterý': 'út', 'středa': 'st', 'čtvrtek': 'čt',
    'pátek': 'pá', 'sobota': 'so', 'neděle': 'ne',
  };
  const m = /^(\S+)\s+([\d.]+)/.exec(label);
  if (m) {
    const dayShort = dayMap[m[1].toLowerCase()] ?? m[1];
    return `${dayShort} ${m[2]}`;
  }
  return label.length > 16 ? label.slice(0, 13) + '…' : label;
}

// === 9. Weapon × side (skládaný sloupcový graf) ===========================
// Distribuce zbraní ve frakcích — Svobodné vs Síly Temna vs Žoldáci.

// Weapon colors — všechny tmavší tóny, aby měly kontrast ≥ 4.5:1 vs white text
// uvnitř stacked bar segmentů. Původní #C9A75E (gold) měl ratio 2.3:1 → FAIL.
// Sjednoceno se stranama: gold-dark → gold-darkest → forest greens → reds.
const WEAPON_COLORS = [
  '#8A6E34', // gold-dark      5.2:1
  '#5E4A23', // gold-darkest   8.7:1
  '#2E4C3A', // forest         9.4:1
  '#4A5E3A', // sage           6.8:1
  '#7B1E20', // dark red       9.6:1
  '#9C3D2E', // brick          5.0:1
  '#5C4033', // mocha brown    8.2:1
];

function renderWeaponBySide(stats: StatsResponse): string {
  // Jen strany, které mají zbraně (= hrající)
  const sides = stats.weapon_by_side.filter((s) => s.total > 0);
  if (sides.length === 0) return '';

  // Sjednoť pořadí typů zbraní napříč všemi stranami (= legendová barva konzistentní)
  const allWeaponKeys = new Set<string>();
  sides.forEach((s) => s.weapons.forEach((w) => allWeaponKeys.add(w.key)));
  const weaponOrder = Array.from(allWeaponKeys);
  const weaponLabelMap = new Map<string, string>();
  sides.forEach((s) => s.weapons.forEach((w) => weaponLabelMap.set(w.key, w.label)));

  // Pro každou stranu: horizontální stack bar (vyjadřuje 100 % rozložení)
  const sideRows = sides.map((s) => {
    const segments = weaponOrder.map((wKey, idx) => {
      const w = s.weapons.find((x) => x.key === wKey);
      if (!w || w.count === 0) return '';
      const pct = (w.count / s.total) * 100;
      const color = WEAPON_COLORS[idx % WEAPON_COLORS.length];
      return `<div class="reg-stats__stack-seg" style="width:${pct.toFixed(1)}%;background:${color}" title="${escapeHtml(w.label)}: ${w.count} (${pct.toFixed(1)} %)">
        ${pct > 10 ? `<span>${w.count}</span>` : ''}
      </div>`;
    }).join('');
    return `
      <div class="reg-stats__stack-row">
        <div class="reg-stats__bar-label">${escapeHtml(s.side_label)} <small>(${s.total})</small></div>
        <div class="reg-stats__stack-bar">${segments}</div>
      </div>
    `;
  }).join('');

  const legend = weaponOrder.map((wKey, idx) => `
    <li class="reg-stats__legend-item">
      <span class="reg-stats__legend-swatch" style="background:${WEAPON_COLORS[idx % WEAPON_COLORS.length]}"></span>
      <span class="reg-stats__legend-label">${escapeHtml(weaponLabelMap.get(wKey) ?? wKey)}</span>
    </li>
  `).join('');

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Distribuce zbraní podle stran</h2>
      <p class="reg-stats__note">Skládaný sloupec — rozložení zbraní v rámci každé strany. Ukáže, zda má jedna strana převahu lukostřelců, kopiníků nebo štítů.</p>
      <div class="reg-stats__stacks">${sideRows}</div>
      <ul class="reg-stats__legend reg-stats__legend--inline">${legend}</ul>
    </section>
  `;
}

// === 10. Weapon × věk (matice) ============================================
// Pro každý typ zbraně: rozložení podle věkových kategorií. Odpovídá na
// otázku "preferují mladší hráči luky a starší těžké zbraně?".

function renderWeaponByAge(stats: StatsResponse): string {
  const weapons = stats.weapon_by_age.filter((w) => w.total > 0);
  if (weapons.length === 0) return '';
  const ageLabels = stats.age_buckets.labels;
  const maxCount = Math.max(...weapons.flatMap((w) => w.buckets), 1);

  const rows = weapons.map((w, wIdx) => {
    const cells = w.buckets.map((cnt, i) => {
      const intensity = cnt / maxCount;
      const color = WEAPON_COLORS[wIdx % WEAPON_COLORS.length];
      return `
        <div class="reg-stats__heatmap-cell" style="background:${color};opacity:${(0.15 + intensity * 0.85).toFixed(2)}" title="${escapeHtml(w.label)} — ${escapeHtml(ageLabels[i])}: ${cnt}">
          ${cnt > 0 ? cnt : ''}
        </div>
      `;
    }).join('');
    return `
      <div class="reg-stats__heatmap-row">
        <div class="reg-stats__heatmap-label">${escapeHtml(w.label)} <small>(${w.total})</small></div>
        ${cells}
      </div>
    `;
  }).join('');

  const headerCells = ageLabels.map((l) => `<div class="reg-stats__heatmap-axis">${escapeHtml(l)}</div>`).join('');

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Volba zbraně podle věku</h2>
      <p class="reg-stats__note">Heat-mapa: intenzita ukazuje počet hráčů dané kombinace zbraň × věková kategorie.</p>
      <div class="reg-stats__heatmap">
        <div class="reg-stats__heatmap-row reg-stats__heatmap-row--head">
          <div class="reg-stats__heatmap-label"></div>
          ${headerCells}
        </div>
        ${rows}
      </div>
    </section>
  `;
}

// === 11. Pyramida se selektorem (porovnání 2 armád) ========================

function renderNarPyramidSelector(stats: StatsResponse): string {
  if (!stats.nar_pyramid || stats.nar_pyramid.length < 2) return '';
  const opts = stats.nar_pyramid.map((n) =>
    `<option value="${escapeHtml(n.key)}">${escapeHtml(n.label)}</option>`
  ).join('');

  // Defaultní volby: první 2 armády
  const def1 = stats.nar_pyramid[0]?.key ?? '';
  const def2 = stats.nar_pyramid[1]?.key ?? '';

  return `
    <section class="reg-stats__section" data-nar-pyramid>
      <h2 class="reg-stats__h2">Srovnání věkové struktury dvou armád</h2>
      <p class="reg-stats__note">Vyber dvě libovolné armády ze seznamu — pyramida vykreslí jejich věkové rozložení vedle sebe.</p>
      <div class="reg-stats__pyramid-controls">
        <label>
          <span>Levá strana</span>
          <select data-nar-left class="reg-field__select">${opts.replace(`value="${escapeHtml(def1)}">`, `value="${escapeHtml(def1)}" selected>`)}</select>
        </label>
        <label>
          <span>Pravá strana</span>
          <select data-nar-right class="reg-field__select">${opts.replace(`value="${escapeHtml(def2)}">`, `value="${escapeHtml(def2)}" selected>`)}</select>
        </label>
      </div>
      <div class="reg-stats__pyramid-legend" data-pyramid-legend></div>
      <div class="reg-stats__pyramid" data-pyramid-content></div>
    </section>
  `;
}

function attachNarPyramidHandlers(root: HTMLElement, stats: StatsResponse): void {
  const section = root.querySelector<HTMLElement>('[data-nar-pyramid]');
  if (!section) return;
  const leftSel = section.querySelector<HTMLSelectElement>('[data-nar-left]');
  const rightSel = section.querySelector<HTMLSelectElement>('[data-nar-right]');
  const content = section.querySelector<HTMLElement>('[data-pyramid-content]');
  const legend = section.querySelector<HTMLElement>('[data-pyramid-legend]');
  if (!leftSel || !rightSel || !content || !legend) return;

  const update = (): void => {
    const left = stats.nar_pyramid.find((n) => n.key === leftSel.value);
    const right = stats.nar_pyramid.find((n) => n.key === rightSel.value);
    if (!left || !right) return;

    const leftColor = left.side_key === SIDE_EVIL ? SIDE_COLORS[SIDE_EVIL] : SIDE_COLORS[SIDE_FREE];
    const rightColor = right.side_key === SIDE_EVIL ? SIDE_COLORS[SIDE_EVIL] : SIDE_COLORS[SIDE_FREE];

    legend.innerHTML = `
      <span class="reg-stats__legend-swatch" style="background:${leftColor}"></span>
      <strong>${escapeHtml(left.label)}</strong>
      <span style="margin: 0 0.75rem;">vs</span>
      <span class="reg-stats__legend-swatch" style="background:${rightColor}"></span>
      <strong>${escapeHtml(right.label)}</strong>
    `;

    const trimmed = trimYearRange(left.years, right.years);
    if (!trimmed) {
      content.innerHTML = '<p class="reg-stats__note">Pro tyto armády nejsou data o věku.</p>';
      content.className = 'reg-stats__pyramid reg-stats__pyramid--fine';
      return;
    }
    content.className = 'reg-stats__pyramid reg-stats__pyramid--fine';
    content.innerHTML = renderPyramidRows(
      left.years,
      right.years,
      trimmed.from,
      trimmed.to,
      stats.age_years.max,
      leftColor,
      rightColor,
    );
  };

  leftSel.addEventListener('change', update);
  rightSel.addEventListener('change', update);
  update();
}

// Headlink — neviditelný SEO anchor (h3 s id pro scroll-target).
// Tělo je pouze offset div (scroll-margin-top), nadpis sekce je vidět
// jako reg-stats__h2 uvnitř každého renderXxx().
function headlink(id: string, srLabel: string): string {
  return `<h3 class="reg-stats__headlink" id="${id}">${escapeHtml(srLabel)}</h3>`;
}

// === Nové sekce ============================================================

// --- Koláčový graf armád v rámci jedné strany ---
function renderNarPie(stats: StatsResponse, sideKey: string, title: string): string {
  const entry = stats.nar_by_side.find((s) => s.side_key === sideKey);
  if (!entry || entry.total === 0) return '';
  const nars = entry.nars.filter((n) => n.count > 0);
  if (nars.length === 0) return '';

  // Palette — pro Svobodné národy zelené tóny, pro Síly Temna červené tóny
  const isFree = sideKey === SIDE_FREE;
  const palette = isFree
    ? ['#2E4C3A', '#5C7855', '#3a6b56', '#1e3528']
    : ['#7B1E20', '#9C3D2E', '#5c151a', '#a83d2e'];

  const radius = 80;
  const innerR = 50;
  const cx = 100;
  const cy = 100;
  let start = -Math.PI / 2;
  const paths = nars.map((n, i) => {
    const frac = n.count / entry.total;
    const end = start + frac * 2 * Math.PI;
    const large = frac > 0.5 ? 1 : 0;
    const x1 = cx + Math.cos(start) * radius;
    const y1 = cy + Math.sin(start) * radius;
    const x2 = cx + Math.cos(end) * radius;
    const y2 = cy + Math.sin(end) * radius;
    const ix1 = cx + Math.cos(start) * innerR;
    const iy1 = cy + Math.sin(start) * innerR;
    const ix2 = cx + Math.cos(end) * innerR;
    const iy2 = cy + Math.sin(end) * innerR;
    const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${radius} ${radius} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${ix2.toFixed(1)} ${iy2.toFixed(1)} A ${innerR} ${innerR} 0 ${large} 0 ${ix1.toFixed(1)} ${iy1.toFixed(1)} Z`;
    const color = palette[i % palette.length];
    const pct = (frac * 100).toFixed(1);
    start = end;
    return `<path d="${d}" fill="${color}" stroke="var(--color-bg-dark)" stroke-width="2"><title>${escapeHtml(n.nar_label)}: ${n.count} (${pct} %)</title></path>`;
  }).join('');

  const legend = nars.map((n, i) => {
    const pct = ((n.count / entry.total) * 100).toFixed(1);
    return `
      <li class="reg-stats__legend-item">
        <span class="reg-stats__legend-swatch" style="background:${palette[i % palette.length]}"></span>
        <span class="reg-stats__legend-label">${escapeHtml(n.nar_label)}</span>
        <span class="reg-stats__legend-value">${n.count} <small>(${pct} %)</small></span>
      </li>
    `;
  }).join('');

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">${escapeHtml(title)}</h2>
      <div class="reg-stats__pie-wrap">
        <svg class="reg-stats__pie" viewBox="0 0 200 200" role="img" aria-label="${escapeHtml(title)}">
          ${paths}
          <text x="100" y="95" text-anchor="middle" class="reg-stats__pie-center-num">${entry.total}</text>
          <text x="100" y="115" text-anchor="middle" class="reg-stats__pie-center-label">přihlášených</text>
        </svg>
        <ul class="reg-stats__legend">${legend}</ul>
      </div>
    </section>
  `;
}

// --- Registrační křivka v čase ---
function renderTimeline(stats: StatsResponse): string {
  const tl = stats.timeline;
  if (!tl || tl.length === 0) return '';

  const w = 600;
  const h = 220;
  const padL = 50;
  const padB = 40;
  const padT = 20;
  const padR = 20;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const n = tl.length;

  const maxCum = Math.max(...tl.map((p) => p.cumulative), 1);
  const maxDaily = Math.max(...tl.map((p) => p.count), 1);

  // Body kumulativní křivky
  const cumPoints = tl.map((p, i) => {
    const x = padL + (i / Math.max(n - 1, 1)) * innerW;
    const y = padT + innerH - (p.cumulative / maxCum) * innerH;
    return { x, y, ...p };
  });
  const linePath = cumPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  // Denní přírůstky jako vertikální čárky pod křivkou
  const barW = Math.max(1, innerW / Math.max(n, 1) - 2);
  const bars = tl.map((p, i) => {
    const x = padL + (i / Math.max(n - 1, 1)) * innerW;
    const bh = (p.count / maxDaily) * (innerH * 0.5);
    const y = padT + innerH - bh;
    return `<rect x="${(x - barW / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" fill="var(--color-gold-dark, #8A6E34)" opacity="0.45"><title>${p.date}: +${p.count}</title></rect>`;
  }).join('');

  // Y osa popisky (kumulativní)
  const yTicks = 5;
  const yLines: string[] = [];
  for (let i = 0; i <= yTicks; i++) {
    const val = Math.round((maxCum * i) / yTicks);
    const y = padT + innerH - (val / maxCum) * innerH;
    yLines.push(`<line x1="${padL}" y1="${y}" x2="${padL + innerW}" y2="${y}" stroke="var(--color-gold-darkest)" stroke-width="0.5" stroke-dasharray="2,2"/>`);
    yLines.push(`<text x="${padL - 8}" y="${y + 4}" text-anchor="end" class="reg-stats__axis-label">${val}</text>`);
  }

  // X osa popisky — každý 7. den nebo prvni/posledni
  const xLabels = cumPoints.map((p, i) => {
    if (i % 7 !== 0 && i !== 0 && i !== n - 1) return '';
    return `<text x="${p.x}" y="${padT + innerH + 16}" text-anchor="middle" class="reg-stats__axis-label">${escapeHtml(p.date.slice(5))}</text>`;
  }).join('');

  // Stat: medián a 50% milestone
  const totalReg = tl[tl.length - 1].cumulative;
  const halfReg = totalReg / 2;
  const halfIdx = tl.findIndex((p) => p.cumulative >= halfReg);
  const halfDate = halfIdx >= 0 ? tl[halfIdx].date : '—';
  const firstDate = tl[0].date;
  const lastDate = tl[tl.length - 1].date;

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Registrační křivka v čase</h2>
      <p class="reg-stats__note">Kumulativní křivka (čára) a denní přírůstky (sloupečky). Ukazuje, jak rychle se akce zaplňuje. Hodí se pro plánování marketingu na další ročník.</p>
      <div class="reg-stats__cards reg-stats__cards--compact">
        ${statCard('První registrace', firstDate)}
        ${statCard('Polovina kapacity', halfDate)}
        ${statCard('Poslední registrace', lastDate)}
        ${statCard('Celkem registrací', String(totalReg))}
      </div>
      <div class="reg-stats__svg-wrap">
        <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" class="reg-stats__area-chart" role="img" aria-label="Registrační křivka v čase">
          ${yLines.join('')}
          ${bars}
          <path d="${linePath}" fill="none" stroke="var(--color-gold-light, #E0C088)" stroke-width="2"/>
          ${xLabels}
        </svg>
      </div>
    </section>
  `;
}

// --- Distribuce velikosti skupin + Gini ---
function renderGroupSizes(stats: StatsResponse): string {
  const buckets = stats.group_size_buckets;
  if (!buckets || buckets.length === 0) return '';
  const max = Math.max(...buckets.map((b) => b.count), 1);
  const totalInBuckets = buckets.reduce((s, b) => s + b.count, 0);

  const rows = buckets.map((b) => {
    const w = (b.count / max) * 100;
    const pct = totalInBuckets > 0 ? ((b.count / totalInBuckets) * 100).toFixed(1) : '0';
    return `
      <div class="reg-stats__bar-row">
        <div class="reg-stats__bar-label">${escapeHtml(b.key)} ${b.key === 'sólo' ? 'účastník' : 'lidí'}</div>
        <div class="reg-stats__bar-track">
          <div class="reg-stats__bar-fill" style="width:${w.toFixed(1)}%; background: var(--color-gold-dark, #8A6E34)"></div>
        </div>
        <div class="reg-stats__bar-value">${b.count} <small>(${pct} %)</small></div>
      </div>
    `;
  }).join('');

  const gini = stats.gini_groups;
  const giniLabel = gini === null
    ? '—'
    : (gini < 0.2 ? `${gini} (egalitářské)` : gini < 0.4 ? `${gini} (vyrovnané)` : gini < 0.6 ? `${gini} (mírná nerovnost)` : `${gini} (silná nerovnost)`);

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Velikost skupin a družin</h2>
      <p class="reg-stats__note">Kolik lidí přijíždí sólo a kolik v družinách. <strong>Gini koeficient</strong> měří nerovnost — 0 = všichni v stejně velkých skupinách, 1 = jedna skupina pohlcuje vše.</p>
      <div class="reg-stats__cards reg-stats__cards--compact">
        ${statCard('Sólo účastníků', String(stats.group_total_solo))}
        ${statCard('Aktivních družin', String(stats.group_count))}
        ${statCard('Gini koeficient', giniLabel)}
      </div>
      <h3 class="reg-stats__subtitle reg-stats__subtitle--spaced">Rozložení podle velikosti</h3>
      <div class="reg-stats__bars">${rows}</div>
    </section>
  `;
}

// --- Lorenz křivka ---
function renderLorenz(stats: StatsResponse): string {
  const curve = stats.lorenz_groups;
  if (!curve || curve.length < 2) return '';
  const w = 400;
  const h = 300;
  const pad = 40;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;

  // Lorenz curve points (x = % skupin, y = % lidí)
  const pts = curve.map((p) => ({
    x: pad + (p.x / 100) * innerW,
    y: pad + innerH - (p.y / 100) * innerH,
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${(pad + innerW).toFixed(1)} ${(pad + innerH).toFixed(1)} L ${pad} ${(pad + innerH).toFixed(1)} Z`;

  // Diagonální čára rovnosti (od bottom-left k top-right)
  const eqLine = `M ${pad} ${pad + innerH} L ${pad + innerW} ${pad}`;

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Lorenzova křivka — koncentrace lidí ve skupinách</h2>
      <p class="reg-stats__note">Tečkovaná diagonála = ideální rovnost (každý ve stejně velké skupině). Plná křivka = realita. Čím větší prohnutí, tím větší koncentrace — pár "mega-družin" pohlcuje většinu lidí.</p>
      <div class="reg-stats__svg-wrap">
        <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" class="reg-stats__area-chart" role="img" aria-label="Lorenzova křivka">
          <rect x="${pad}" y="${pad}" width="${innerW}" height="${innerH}" fill="none" stroke="var(--color-gold-darkest)" stroke-width="0.5"/>
          <path d="${eqLine}" stroke="var(--color-gold-darkest)" stroke-width="1" stroke-dasharray="4,3" fill="none"/>
          <path d="${areaPath}" fill="var(--color-gold-dark)" opacity="0.2"/>
          <path d="${linePath}" fill="none" stroke="var(--color-gold-light)" stroke-width="2"/>
          <text x="${pad}" y="${pad - 8}" class="reg-stats__axis-label">100 %</text>
          <text x="${pad - 8}" y="${pad + innerH + 4}" text-anchor="end" class="reg-stats__axis-label">0</text>
          <text x="${pad + innerW}" y="${pad + innerH + 16}" text-anchor="end" class="reg-stats__axis-label">100 % skupin</text>
          <text x="${pad}" y="${pad + innerH + 30}" class="reg-stats__axis-label">% lidí ↑</text>
        </svg>
      </div>
    </section>
  `;
}

// --- Generace per strana ---
function renderGenerations(stats: StatsResponse): string {
  const g = stats.generations;
  if (!g || !g.by_side || g.by_side.length === 0) return '';
  const palette = ['#3a6b56', '#5C7855', '#8A6E34', '#9C3D2E', '#5c151a'];

  // Pro každou stranu udělat 100 % stack bar přes 5 generací
  const rows = g.by_side.map((s) => {
    const totalS = s.counts.reduce((a, b) => a + b, 0);
    if (totalS === 0) return '';
    const segs = s.counts.map((cnt, i) => {
      if (cnt === 0) return '';
      const pct = (cnt / totalS) * 100;
      const color = palette[i % palette.length];
      return `<div class="reg-stats__stack-seg" style="width:${pct.toFixed(1)}%;background:${color}" title="${escapeHtml(g.labels[i])}: ${cnt} (${pct.toFixed(1)} %)">${pct > 10 ? `<span>${cnt}</span>` : ''}</div>`;
    }).join('');
    return `
      <div class="reg-stats__stack-row">
        <div class="reg-stats__bar-label">${escapeHtml(s.side_label)} <small>(${totalS})</small></div>
        <div class="reg-stats__stack-bar">${segs}</div>
      </div>
    `;
  }).join('');

  const legend = g.labels.map((label, i) => `
    <li class="reg-stats__legend-item">
      <span class="reg-stats__legend-swatch" style="background:${palette[i % palette.length]}"></span>
      <span class="reg-stats__legend-label">${escapeHtml(label)} <small>${escapeHtml(g.ranges[i])} let</small></span>
    </li>
  `).join('');

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Generační složení podle strany</h2>
      <p class="reg-stats__note">Která strana přitahuje mladší generace a která starší? Generace dle <a href="https://www.pewresearch.org/topics/generations-and-age/" target="_blank" rel="noopener" class="reg-stats__link-info">Pew Research</a>.</p>
      <div class="reg-stats__stacks">${rows}</div>
      <ul class="reg-stats__legend reg-stats__legend--inline">${legend}</ul>
    </section>
  `;
}

// --- Shannon diversity per strana ---
function renderShannon(stats: StatsResponse): string {
  if (!stats.shannon || stats.shannon.length === 0) return '';
  const rows = stats.shannon.map((s) => {
    const w = (s.evenness * 100).toFixed(1);
    const interpret =
      s.evenness >= 0.9 ? 'maximálně vyrovnané' :
      s.evenness >= 0.7 ? 'vyrovnané' :
      s.evenness >= 0.5 ? 'mírně nevyvážené' :
      'silně dominantní jedna armáda';
    return `
      <div class="reg-stats__bar-row">
        <div class="reg-stats__bar-label">${escapeHtml(s.side_label)} <small>(${s.n} v ${s.S} arm.)</small></div>
        <div class="reg-stats__bar-track">
          <div class="reg-stats__bar-fill" style="width:${w}%;background:var(--color-gold-dark)"></div>
        </div>
        <div class="reg-stats__bar-value">${s.evenness.toFixed(2)} <small>${escapeHtml(interpret)}</small></div>
      </div>
    `;
  }).join('');

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Vyrovnanost armád (Shannon evenness)</h2>
      <p class="reg-stats__note">Měří, jak rovnoměrně jsou v rámci strany rozděleny armády. <strong>1.00</strong> = perfektně vyrovnané, <strong>0.00</strong> = jedna armáda dominuje. Výpočet: <em>H' / ln(S)</em>, kde H' je Shannonova entropie a S je počet armád.</p>
      <div class="reg-stats__bars">${rows}</div>
    </section>
  `;
}

// --- Gender × Weapon (mosaic + Cramérovo V) ---
function renderGenderWeapon(stats: StatsResponse): string {
  const gw = stats.gender_weapon;
  if (!gw || gw.total === 0) return '';

  const rows = gw.rows.map((r) => {
    const totalRow = r.male + r.female;
    if (totalRow === 0) return '';
    const malePct = (r.male / totalRow) * 100;
    const femalePct = (r.female / totalRow) * 100;
    // % ženy v této zbrani vůči globálnímu % žen ve výběru (proporce)
    const globalFemPct = gw.total > 0 ? (gw.female_total / gw.total) * 100 : 50;
    const dev = femalePct - globalFemPct;
    const devLabel = dev > 5 ? `↑ ženy ${(dev).toFixed(0)} %` : dev < -5 ? `↓ ženy ${Math.abs(dev).toFixed(0)} %` : '~';
    return `
      <div class="reg-stats__gender-row">
        <div class="reg-stats__bar-label">${escapeHtml(r.weapon_label)} <small>(${totalRow})</small></div>
        <div class="reg-stats__gender-bar">
          <div class="reg-stats__gender-male" style="width:${malePct.toFixed(1)}%" title="Muži: ${r.male} (${malePct.toFixed(1)} %)">${malePct > 12 ? `<span>♂ ${r.male}</span>` : ''}</div>
          <div class="reg-stats__gender-female" style="width:${femalePct.toFixed(1)}%" title="Ženy: ${r.female} (${femalePct.toFixed(1)} %)">${femalePct > 12 ? `<span>♀ ${r.female}</span>` : ''}</div>
        </div>
        <div class="reg-stats__deviation">${escapeHtml(devLabel)}</div>
      </div>
    `;
  }).join('');

  const cv = gw.cramer_v;
  const cvLabel = cv === null
    ? '—'
    : (cv < 0.1 ? `${cv} (zanedbatelné)` : cv < 0.3 ? `${cv} (slabé)` : cv < 0.5 ? `${cv} (střední)` : `${cv} (silné)`);

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Pohlaví × Zbraň (gender weapon preference)</h2>
      <p class="reg-stats__note">Preferují ženy luky a kopí, muži štíty a obouručky? Sloupec "odchylka" ukazuje, jak se podíl žen v dané zbrani liší od jejich celkového podílu. <strong>Cramérovo V</strong> kvantifikuje sílu vztahu pohlaví ↔ volba zbraně (0 = žádný vztah, 1 = perfektní korelace).</p>
      <div class="reg-stats__cards reg-stats__cards--compact">
        ${statCard('Celkem v analýze', String(gw.total))}
        ${statCard('Mužů / žen', `${gw.male_total} / ${gw.female_total}`)}
        ${statCard('Cramérovo V', cvLabel)}
      </div>
      <div class="reg-stats__bars">${rows}</div>
    </section>
  `;
}

// --- Gender × Role nehrajícího (mosaic + Cramérovo V) ---
function renderGenderRole(stats: StatsResponse): string {
  const gr = stats.gender_role;
  if (!gr || gr.total === 0) return '';

  const rows = gr.rows.map((r) => {
    const totalRow = r.male + r.female;
    if (totalRow === 0) return '';
    const malePct = (r.male / totalRow) * 100;
    const femalePct = (r.female / totalRow) * 100;
    const globalFemPct = gr.total > 0 ? (gr.female_total / gr.total) * 100 : 50;
    const dev = femalePct - globalFemPct;
    const devLabel = dev > 5 ? `↑ ženy ${(dev).toFixed(0)} %` : dev < -5 ? `↓ ženy ${Math.abs(dev).toFixed(0)} %` : '~';
    return `
      <div class="reg-stats__gender-row">
        <div class="reg-stats__bar-label">${escapeHtml(r.role_label)} <small>(${totalRow})</small></div>
        <div class="reg-stats__gender-bar">
          <div class="reg-stats__gender-male" style="width:${malePct.toFixed(1)}%" title="Muži: ${r.male}">${malePct > 12 ? `<span>♂ ${r.male}</span>` : ''}</div>
          <div class="reg-stats__gender-female" style="width:${femalePct.toFixed(1)}%" title="Ženy: ${r.female}">${femalePct > 12 ? `<span>♀ ${r.female}</span>` : ''}</div>
        </div>
        <div class="reg-stats__deviation">${escapeHtml(devLabel)}</div>
      </div>
    `;
  }).join('');

  const cv = gr.cramer_v;
  const cvLabel = cv === null
    ? '—'
    : (cv < 0.1 ? `${cv} (zanedbatelné)` : cv < 0.3 ? `${cv} (slabé)` : cv < 0.5 ? `${cv} (střední)` : `${cv} (silné)`);

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Pohlaví × Role nehrajícího (gender role check)</h2>
      <p class="reg-stats__note">Existuje genderový stereotyp v non-combat rolích? Cramérovo V kvantifikuje vztah pohlaví ↔ role.</p>
      <div class="reg-stats__cards reg-stats__cards--compact">
        ${statCard('Celkem nehrajících', String(gr.total))}
        ${statCard('Mužů / žen', `${gr.male_total} / ${gr.female_total}`)}
        ${statCard('Cramérovo V', cvLabel)}
      </div>
      <div class="reg-stats__bars">${rows}</div>
    </section>
  `;
}

// --- Věkové kategorie + Young Adult (18–25) ---
function renderYoungAdult(stats: StatsResponse): string {
  const ya = stats.young_adult;
  if (!ya || ya.total_with_age === 0) return '';

  const fmt = (n: number, pct: number): string =>
    `${n} <small>(${pct.toFixed(1)} %)</small>`;

  const sideBars = ya.by_side.map((s) => {
    return `
      <div class="reg-stats__bar-row">
        <div class="reg-stats__bar-label">${escapeHtml(s.side_label)}</div>
        <div class="reg-stats__bar-track">
          <div class="reg-stats__bar-fill" style="width:${((s.count / Math.max(ya.total, 1)) * 100).toFixed(1)}%;background:${SIDE_COLORS[s.side_key] ?? 'var(--color-gold-dark)'}"></div>
        </div>
        <div class="reg-stats__bar-value">${s.count}</div>
      </div>
    `;
  }).join('');

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Mladí dospělí 18–25 — jádro larpové generace</h2>
      <p class="reg-stats__note">Kolem této věkové skupiny se naše larpová parta drží — kamarádi, kteří se vrací rok co rok. Ostatní kategorie ukazují, jak pestrá je celá naše komunita.</p>
      <div class="reg-stats__cards reg-stats__cards--compact">
        ${statCard('Mladší 18 let', fmt(ya.under_18.count, ya.under_18.percent))}
        ${statCard('Mladí 18–25', fmt(ya.young_adults.count, ya.young_adults.percent))}
        ${statCard('Dospělí 25+', fmt(ya.over_25.count, ya.over_25.percent))}
        ${statCard('Celkem s vyplněným věkem', String(ya.total_with_age))}
      </div>
      <h3 class="reg-stats__subtitle reg-stats__subtitle--spaced">Kde sedí mladí 18–25</h3>
      <div class="reg-stats__bars">${sideBars}</div>
    </section>
  `;
}

// --- Simpson — kosmopolitní družiny ---
function renderSimpsonGroups(stats: StatsResponse): string {
  const groups = stats.simpson_groups;
  if (!groups || groups.length === 0) return '';
  const rows = groups.map((g) => {
    const interpret =
      g.simpson >= 0.6 ? 'silně smíšená' :
      g.simpson >= 0.3 ? 'částečně smíšená' :
      'homogenní';
    return `
      <div class="reg-stats__bar-row">
        <div class="reg-stats__bar-label">${escapeHtml(g.group_name ?? '#' + g.group_id)} <small>(${g.size})</small></div>
        <div class="reg-stats__bar-track">
          <div class="reg-stats__bar-fill" style="width:${(g.simpson * 100).toFixed(1)}%;background:var(--color-gold-dark)"></div>
        </div>
        <div class="reg-stats__bar-value">${g.simpson.toFixed(2)} <small>${escapeHtml(interpret)}</small></div>
      </div>
    `;
  }).join('');

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Kosmopolitní vs homogenní družiny (Simpson Diversity Index)</h2>
      <p class="reg-stats__note">Družiny obsahující hráče z různých stran (cross-faction) vs ty, které drží jednu stranu. <strong>1.00</strong> = max smíšená, <strong>0.00</strong> = všichni z jedné strany. Vzorec: <em>1 − Σ p²</em>. Top 10 nejdiverzifikovanějších.</p>
      <div class="reg-stats__bars">${rows}</div>
    </section>
  `;
}

// --- Outliers — short summary v Přehledu ---
function renderOutliers(stats: StatsResponse): string {
  const o = stats.age_outliers;
  if (!o || (o.youngest.length === 0 && o.oldest.length === 0)) return '';

  const youngest = o.youngest[0];
  const oldest = o.oldest[0];
  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Věkové extrémy</h2>
      <div class="reg-stats__cards">
        ${youngest ? statCard('Nejmladší účastník', `${youngest.age} let — ${youngest.side_label}`) : ''}
        ${oldest ? statCard('Nejstarší účastník', `${oldest.age} let — ${oldest.side_label}`) : ''}
      </div>
    </section>
  `;
}

// --- Outliers detail (sekce Extrémy) ---
function renderOutliersDetail(stats: StatsResponse): string {
  const o = stats.age_outliers;
  if (!o || (o.youngest.length === 0 && o.oldest.length === 0)) return '';
  const renderList = (arr: { age: number; side_label: string }[]): string =>
    arr.map((r) => `<li><strong>${r.age} let</strong> <small>— ${escapeHtml(r.side_label)}</small></li>`).join('');

  return `
    <section class="reg-stats__section">
      <h2 class="reg-stats__h2">Pět nejmladších a nejstarších</h2>
      <p class="reg-stats__note">Anonymně — jen věk + strana. Storytelling pro PR ("hrajou s námi 14-letí i 60+!").</p>
      <div class="reg-stats__outliers">
        <div>
          <h3 class="reg-stats__h3">Nejmladší</h3>
          <ul class="reg-stats__outlier-list">${renderList(o.youngest)}</ul>
        </div>
        <div>
          <h3 class="reg-stats__h3">Nejstarší</h3>
          <ul class="reg-stats__outlier-list">${renderList(o.oldest)}</ul>
        </div>
      </div>
    </section>
  `;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
