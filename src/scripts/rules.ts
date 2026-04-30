/**
 * Rules / Organizace — interaktivní rozšíření informačních stránek
 * Datum: 2026-04-30
 *
 * Funguje na stránkách s `data-rules-root`. Zajišťuje:
 *   - Fulltextové vyhledávání: filtruje rozbalovací sekce <details> podle textContent
 *   - Audience filter: pills `[data-audience-filter]` skrývají/zobrazují sekce
 *     podle `data-audiences` (čárkou oddělené tagy). Filtr a search se
 *     skládají — sekce je viditelná jen když ji nezakrývá ani jeden.
 *   - Smart cross-linky: kliknutí na <a href="#sekce"> otevře cíl, scroll, flash
 *     highlight; zachová zdrojovou sekci otevřenou.
 *
 * JS-less fallback: stránka funguje i bez tohoto skriptu — accordion je nativní
 * <details>, hash linky fungují přes prohlížeč. JS přidává jen filtr a animace.
 */

const FLASH_CLASS = 'rules-flash';
const FLASH_DURATION = 1500;

function init() {
  const root = document.querySelector<HTMLElement>('[data-rules-root]');
  if (!root) return;

  setupSearch(root);
  setupAudienceFilter(root);
  setupCrossLinks(root);

  if (location.hash) {
    requestAnimationFrame(() => openAndScroll(location.hash));
  }
}

// — Pomocná logika viditelnosti ————————————————————————————

/**
 * Hidden reason tracking — kombinujeme více filtrů (search + audience)
 * tak, aby se navzájem nepřepisovaly. Element je `hidden` dokud má
 * v `data-hide-reason` aspoň jeden důvod.
 */
function setHiddenReason(el: HTMLElement, reason: string, hide: boolean) {
  const current = (el.dataset.hideReason ?? '').split(' ').filter(Boolean);
  let next: string[];
  if (hide) {
    next = current.includes(reason) ? current : [...current, reason];
  } else {
    next = current.filter((r) => r !== reason);
  }
  if (next.length === 0) {
    delete el.dataset.hideReason;
    el.removeAttribute('hidden');
  } else {
    el.dataset.hideReason = next.join(' ');
    el.setAttribute('hidden', '');
  }
}

// — Search ——————————————————————————————————————————————————

function setupSearch(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>('[data-rules-search]');
  const sections = Array.from(
    root.querySelectorAll<HTMLDetailsElement>('details[data-rules-section]'),
  );
  const counter = root.querySelector<HTMLElement>('[data-rules-counter]');
  const empty = root.querySelector<HTMLElement>('[data-rules-empty]');
  if (!input) return;

  const indexed = sections.map((el) => ({
    el,
    text: normalize((el.textContent ?? '').trim()),
  }));

  const apply = () => {
    const q = normalize(input.value.trim());

    indexed.forEach(({ el, text }) => {
      const hideForSearch = q.length > 0 && !text.includes(q);
      setHiddenReason(el, 'search', hideForSearch);
      if (q.length > 0 && !hideForSearch) {
        el.open = true;
      }
    });

    updateCounter(sections, counter, empty);
  };

  input.addEventListener('input', apply);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      apply();
      input.blur();
    }
  });

  apply();
}

function updateCounter(
  sections: HTMLDetailsElement[],
  counter: HTMLElement | null,
  empty: HTMLElement | null,
) {
  const visible = sections.filter((el) => !el.hasAttribute('hidden')).length;
  if (counter) counter.textContent = String(visible);
  if (empty) empty.toggleAttribute('hidden', visible !== 0);
}

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

// — Audience filter ————————————————————————————————————————

function setupAudienceFilter(root: HTMLElement) {
  const buttons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-audience-filter]'),
  );
  if (buttons.length === 0) return; // stránka filter nepoužívá

  const sections = Array.from(
    root.querySelectorAll<HTMLDetailsElement>('details[data-rules-section]'),
  );
  const counter = root.querySelector<HTMLElement>('[data-rules-counter]');
  const empty = root.querySelector<HTMLElement>('[data-rules-empty]');

  const apply = (audience: string) => {
    sections.forEach((el) => {
      const tags = (el.dataset.audiences ?? '').split(',').map((t) => t.trim()).filter(Boolean);
      const hide = audience !== 'all' && !tags.includes(audience);
      setHiddenReason(el, 'audience', hide);
    });
    updateCounter(sections, counter, empty);
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const audience = btn.dataset.audienceFilter ?? 'all';
      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      apply(audience);
    });
  });

  // Initial state — pokud má některé tlačítko `data-audience-filter="all"`
  // a třídu `is-active`, výchozí audience je 'all'. Jinak nic neaplikujeme.
  const initial = buttons.find((b) => b.classList.contains('is-active'));
  if (initial) apply(initial.dataset.audienceFilter ?? 'all');
}

// — Cross-link handler —————————————————————————————————————

function setupCrossLinks(root: HTMLElement) {
  root.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!target) return;
    const href = target.getAttribute('href');
    if (!href || href === '#') return;

    const id = href.substring(1);
    const dest = document.getElementById(id);
    if (!dest) return;

    e.preventDefault();
    history.pushState(null, '', href);

    const sourceSection = target.closest<HTMLDetailsElement>('details[data-rules-section]');
    openAndScroll(href, sourceSection);
  });
}

function openAndScroll(hash: string, keepOpen?: HTMLDetailsElement | null) {
  const id = hash.startsWith('#') ? hash.substring(1) : hash;
  const dest = document.getElementById(id);
  if (!dest) return;

  let detailsTarget: HTMLDetailsElement | null =
    dest.tagName === 'DETAILS' ? (dest as HTMLDetailsElement) : dest.closest('details');
  if (detailsTarget) detailsTarget.open = true;

  if (keepOpen) keepOpen.open = true;

  requestAnimationFrame(() => {
    dest.scrollIntoView({ behavior: 'smooth', block: 'start' });
    flash(detailsTarget ?? dest);
  });
}

function flash(el: Element) {
  el.classList.add(FLASH_CLASS);
  window.setTimeout(() => el.classList.remove(FLASH_CLASS), FLASH_DURATION);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
