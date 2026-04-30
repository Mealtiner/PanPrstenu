/**
 * Pravidla — interaktivní rozšíření stránky
 * Datum: 2026-04-30
 *
 * Funguje na stránce /[lang]/pravidla/. Zajišťuje:
 *  - Fulltextové vyhledávání: filtruje rozbalovací sekce <details> podle textContent
 *  - Smart cross-linky: kliknutí na <a href="#sekce"> otevře cíl, scroll, flash highlight
 *  - Zachovává zdrojovou sekci otevřenou (nezavírá ji při proklikem křížového odkazu)
 *
 * JS-less fallback: stránka funguje i bez tohoto skriptu — je to progressive enhancement.
 * Search input se default skrývá CSS přes :has nebo class no-js, ale tady raději bez.
 */

const FLASH_CLASS = 'rules-flash';
const FLASH_DURATION = 1500;

function init() {
  const root = document.querySelector<HTMLElement>('[data-rules-root]');
  if (!root) return;

  setupSearch(root);
  setupCrossLinks(root);
  setupQuickAccess(root);

  // Na initial load zpracuj případný hash v URL — otevři target a scroll
  if (location.hash) {
    requestAnimationFrame(() => openAndScroll(location.hash));
  }
}

// — Search ——————————————————————————————————————————————————————

function setupSearch(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>('[data-rules-search]');
  const sections = Array.from(root.querySelectorAll<HTMLDetailsElement>('details[data-rules-section]'));
  const counter = root.querySelector<HTMLElement>('[data-rules-counter]');
  const empty = root.querySelector<HTMLElement>('[data-rules-empty]');
  if (!input) return;

  // Cache plain-text obsahu pro rychlé hledání
  const indexed = sections.map((el) => ({
    el,
    text: normalize((el.textContent ?? '').trim()),
  }));

  const apply = () => {
    const q = normalize(input.value.trim());
    let visible = 0;

    if (q.length === 0) {
      // Prázdný dotaz → vše viditelné, žádné force-open
      indexed.forEach(({ el }) => el.removeAttribute('hidden'));
      visible = indexed.length;
    } else {
      indexed.forEach(({ el, text }) => {
        const match = text.includes(q);
        if (match) {
          el.removeAttribute('hidden');
          el.open = true; // otevři, ať uživatel rovnou vidí výsledky
          visible++;
        } else {
          el.setAttribute('hidden', '');
        }
      });
    }

    if (counter) counter.textContent = String(visible);
    if (empty) empty.toggleAttribute('hidden', visible !== 0);
  };

  input.addEventListener('input', apply);

  // Esc vyčistí input
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      apply();
      input.blur();
    }
  });

  apply();
}

// Sjednoť diakritiku, lowercase, zvládnutelné pro hledání v CZ textu
function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

// — Cross-link handler ———————————————————————————————————————

function setupCrossLinks(root: HTMLElement) {
  // Capture libovolné kliknutí na anchor směřující na #id v rámci téže stránky
  root.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!target) return;
    const href = target.getAttribute('href');
    if (!href || href === '#') return;

    // Podporujeme jen vnitřní fragment (např. #zbrane-povolene)
    const id = href.substring(1);
    const dest = document.getElementById(id);
    if (!dest) return;

    e.preventDefault();
    history.pushState(null, '', href); // ať se hash dostane do URL pro sdílení

    // Najdi rodičovskou sekci linku — tu chceme nechat otevřenou
    const sourceSection = target.closest<HTMLDetailsElement>('details[data-rules-section]');

    openAndScroll(href, sourceSection);
  });
}

function openAndScroll(hash: string, keepOpen?: HTMLDetailsElement | null) {
  const id = hash.startsWith('#') ? hash.substring(1) : hash;
  const dest = document.getElementById(id);
  if (!dest) return;

  // Otevři cílový <details> (nebo libovolný předek <details>, kdyby ID
  // ukazovalo na vnořený nadpis)
  let detailsTarget: HTMLDetailsElement | null = dest as HTMLDetailsElement;
  if (detailsTarget.tagName !== 'DETAILS') {
    detailsTarget = dest.closest('details');
  }
  if (detailsTarget && detailsTarget.tagName === 'DETAILS') {
    detailsTarget.open = true;
  }

  // Zdrojovou sekci ponecháme otevřenou (pravidlo z UX zadání)
  if (keepOpen) keepOpen.open = true;

  // Scroll + flash. Drobné `requestAnimationFrame` aby se layout
  // stihl přepočítat po `open=true`.
  requestAnimationFrame(() => {
    dest.scrollIntoView({ behavior: 'smooth', block: 'start' });
    flash(detailsTarget ?? dest);
  });
}

function flash(el: Element) {
  el.classList.add(FLASH_CLASS);
  window.setTimeout(() => el.classList.remove(FLASH_CLASS), FLASH_DURATION);
}

// — Quick-access tiles ————————————————————————————————————————
// Tiles používají href="#…", takže je odchytí setupCrossLinks. Tahle
// funkce je tu pro případné další chování (analytika, focus).
function setupQuickAccess(_root: HTMLElement) {
  // Zatím prázdné — ponecháno pro budoucí rozšíření.
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
