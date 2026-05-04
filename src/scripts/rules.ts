/**
 * Rules / Organizace — interaktivní rozšíření informačních stránek
 * Datum: 2026-04-30
 *
 * Funguje na stránkách s `data-rules-root`. Zajišťuje:
 *   - Fulltextové vyhledávání: filtruje sekce a volitelně vykreslí větné výsledky
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
const MAX_SEARCH_RESULTS = 24;

type IndexedRulesSection = {
  el: HTMLDetailsElement;
  content: HTMLElement;
  title: string;
  normalizedText: string;
  sentences: SearchSentence[];
};

type SearchSentence = {
  text: string;
  normalizedText: string;
};

function init() {
  const root = document.querySelector<HTMLElement>('[data-rules-root]');
  if (!root) return;

  setupSearch(root);
  setupAudienceFilter(root);
  setupCrossLinks(root);
  setupScrollSpy(root);
  setupExpandCollapseAll(root);

  if (location.hash) {
    requestAnimationFrame(() => openAndScroll(location.hash));
  }
}

// — Expand / collapse all <details id="…"> v rules-rootu ——————————————————
function setupExpandCollapseAll(root: HTMLElement) {
  const expandBtn = document.querySelector<HTMLButtonElement>('[data-rules-expand-all]');
  const collapseBtn = document.querySelector<HTMLButtonElement>('[data-rules-collapse-all]');
  if (!expandBtn && !collapseBtn) return;
  const detailsList = Array.from(root.querySelectorAll<HTMLDetailsElement>('details[id]'));
  if (detailsList.length === 0) return;

  expandBtn?.addEventListener('click', () => {
    detailsList.forEach((d) => { d.open = true; });
  });
  collapseBtn?.addEventListener('click', () => {
    detailsList.forEach((d) => { d.open = false; });
  });
}

// — ScrollSpy: zvýraznění aktivní kapitoly v levém sidebaru pravidel ——————
//
// Sleduje, která <details id="..."> je vidět ve viewportu, a podle toho
// nastavuje class .active na odpovídající <a data-toc-link="..."> v sidebaru.
// IntersectionObserver na <summary> elementech (vždy renderované, i když
// je <details> sbalený). rootMargin posune detekci tak, aby aktivní byla
// kapitola jejíž heading je v horní třetině viewportu.
function setupScrollSpy(root: HTMLElement) {
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));
  if (links.length === 0) return;

  const summaries = Array.from(
    root.querySelectorAll<HTMLElement>('details[id] > summary'),
  );
  if (summaries.length === 0) return;

  const setActive = (id: string | null) => {
    links.forEach((l) => {
      l.classList.toggle('active', l.dataset.tocLink === id);
    });
  };

  // Sledování pozic kapitol — vybíráme tu, jejíž summary je nejblíž shora
  // ve viditelné horní třetině viewportu.
  const onScroll = () => {
    let activeId: string | null = null;
    let bestTop = -Infinity;
    for (const s of summaries) {
      const rect = s.getBoundingClientRect();
      // chceme summary které prošlo pod horním okrajem (top < threshold)
      // a je co nejblíž k thresholdu = aktuálně čtená sekce
      const threshold = window.innerHeight * 0.3;
      if (rect.top <= threshold && rect.top > bestTop) {
        bestTop = rect.top;
        activeId = s.parentElement?.id ?? null;
      }
    }
    // pokud žádná summary ještě neprošla, aktivní je první
    if (!activeId && summaries[0]) {
      activeId = summaries[0].parentElement?.id ?? null;
    }
    setActive(activeId);
  };

  let ticking = false;
  const onScrollThrottled = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScrollThrottled, { passive: true });
  window.addEventListener('resize', onScrollThrottled, { passive: true });
  onScroll(); // initial state
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
  const sections = getRulesSections(root);
  const counter = root.querySelector<HTMLElement>('[data-rules-counter]');
  const empty = root.querySelector<HTMLElement>('[data-rules-empty]');
  const results = root.querySelector<HTMLElement>('[data-rules-results]');
  if (!input) return;

  const apply = () => {
    const q = normalize(input.value.trim());

    sections.forEach((section) => {
      const hideForSearch = q.length > 0 && !section.normalizedText.includes(q);
      setHiddenReason(section.el, 'search', hideForSearch);
      if (q.length > 0 && !hideForSearch) {
        section.el.open = true;
      }
    });

    updateCounter(sections, counter, empty);
    renderSearchResults(sections, q, results);
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
  sections: IndexedRulesSection[],
  counter: HTMLElement | null,
  empty: HTMLElement | null,
) {
  const visible = sections.filter((section) => !section.el.hasAttribute('hidden')).length;
  if (counter) counter.textContent = String(visible);
  if (empty) empty.toggleAttribute('hidden', visible !== 0);
}

function getRulesSections(root: HTMLElement): IndexedRulesSection[] {
  const contentBlocks = Array.from(root.querySelectorAll<HTMLElement>('[data-rules-section]'));
  const seen = new Set<HTMLDetailsElement>();

  return contentBlocks.flatMap((content) => {
    const el = content instanceof HTMLDetailsElement
      ? content
      : content.closest<HTMLDetailsElement>('details[id]');

    if (!el || seen.has(el)) return [];
    seen.add(el);

    const title = cleanText(el.querySelector<HTMLElement>('summary')?.textContent ?? '');
    const sentences = buildSearchSentences(content, title);
    const normalizedText = normalize([title, ...sentences.map((s) => s.text)].join(' '));

    return [{
      el,
      content,
      title,
      normalizedText,
      sentences,
    }];
  });
}

function renderSearchResults(
  sections: IndexedRulesSection[],
  q: string,
  results: HTMLElement | null,
) {
  if (!results) return;

  if (q.length === 0) {
    results.innerHTML = '';
    results.hidden = true;
    return;
  }

  const items = sections.flatMap((section) => {
    if (section.el.hasAttribute('hidden')) return [];

    return section.sentences
      .filter((sentence) => sentence.normalizedText.includes(q))
      .map((sentence) => ({
        href: `#${section.el.id}`,
        title: section.title,
        text: sentence.text,
      }));
  }).slice(0, MAX_SEARCH_RESULTS);

  if (items.length === 0) {
    results.innerHTML = '';
    results.hidden = true;
    return;
  }

  results.innerHTML = `
    <div class="rules-search-results">
      ${items.map((item) => `
        <a class="rules-search-result" href="${escapeAttribute(item.href)}">
          <span class="rules-search-result-title">${escapeHtml(item.title)}</span>
          <span class="rules-search-result-text">${highlightMatch(item.text, q)}</span>
        </a>
      `).join('')}
    </div>
  `;
  results.hidden = false;
}

function buildSearchSentences(content: HTMLElement, title: string): SearchSentence[] {
  const chunks = collectSearchChunks(content);
  const seen = new Set<string>();
  const sentences = [title, ...chunks.flatMap(splitSentences)]
    .map(cleanText)
    .filter(Boolean)
    .filter((text) => {
      const key = normalize(text);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return sentences.map((text) => ({
    text,
    normalizedText: normalize(text),
  }));
}

function collectSearchChunks(content: HTMLElement): string[] {
  const blocks = Array.from(
    content.querySelectorAll<HTMLElement>('h2, h3, h4, h5, h6, p, li, dt, dd, blockquote, alertbox'),
  );

  if (blocks.length === 0) {
    return [content.textContent ?? ''];
  }

  return blocks.map((block) => block.textContent ?? '');
}

function splitSentences(text: string): string[] {
  const clean = cleanText(text);
  if (clean.length === 0) return [];
  if (clean.length <= 180) return [clean];

  const protectedText = clean
    .replace(/\b([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ])\.\s*/g, '$1<dot> ')
    .replace(/\b(např|tj|atd|apod|tzv|cca|resp|tzn|č|sv)\./gi, '$1<dot>')
    .replace(/(\d)\.(\d)/g, '$1<dot>$2');

  const sentences = protectedText.match(/[^.!?]+[.!?]+(?:["“”»')\]]+)?|[^.!?]+$/g) ?? [protectedText];
  return sentences
    .map((sentence) => cleanText(sentence.replace(/<dot>/g, '.')))
    .filter(Boolean);
}

function cleanText(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function highlightMatch(text: string, q: string): string {
  const normalized = normalizeWithMap(text);
  const ranges: Array<[number, number]> = [];
  let start = normalized.text.indexOf(q);

  while (start !== -1) {
    const end = start + q.length;
    const sourceStart = normalized.map[start] ?? 0;
    const sourceEnd = (normalized.map[end] ?? text.length);
    ranges.push([sourceStart, sourceEnd]);
    start = normalized.text.indexOf(q, end);
  }

  if (ranges.length === 0) return escapeHtml(text);

  let html = '';
  let cursor = 0;
  ranges.forEach(([startIdx, endIdx]) => {
    if (startIdx < cursor) return;
    html += escapeHtml(text.slice(cursor, startIdx));
    html += `<mark>${escapeHtml(text.slice(startIdx, endIdx))}</mark>`;
    cursor = endIdx;
  });
  html += escapeHtml(text.slice(cursor));
  return html;
}

function normalizeWithMap(s: string): { text: string; map: number[] } {
  let text = '';
  const map: number[] = [];
  let sourceIndex = 0;

  Array.from(s).forEach((char) => {
    const normalized = normalize(char);
    Array.from(normalized).forEach((normalizedChar) => {
      text += normalizedChar;
      map.push(sourceIndex);
    });
    sourceIndex += char.length;
  });

  map.push(s.length);
  return { text, map };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(s: string): string {
  return escapeHtml(s);
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

  const sections = getRulesSections(root);
  const counter = root.querySelector<HTMLElement>('[data-rules-counter]');
  const empty = root.querySelector<HTMLElement>('[data-rules-empty]');

  const apply = (audience: string) => {
    sections.forEach((section) => {
      const tags = (section.content.dataset.audiences ?? '').split(',').map((t) => t.trim()).filter(Boolean);
      const hide = audience !== 'all' && !tags.includes(audience);
      setHiddenReason(section.el, 'audience', hide);
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

    const sourceSection = target.closest<HTMLDetailsElement>('details[id]');
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
