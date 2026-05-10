/**
 * Fulltext vyhledávání ve FAQ.
 * Datum: 2026-05-10
 *
 * Indexuje všechny <details>/<summary> v rámci [data-faq-root].
 * Při zadání query:
 *   - skryje sekce, které neobsahují žádný match
 *   - otevře accordiony s match a zvýrazní matched termy
 *   - aktualizuje counter "Nalezeno X otázek z Y kategorií"
 *
 * Bez query: vrátí všechny sekce, zavře accordiony (default state).
 *
 * Funguje paralelně s @scripts/toc-spy.ts (sidebar zvýraznění).
 */

interface FaqEntry {
  section: HTMLElement;
  details: HTMLDetailsElement;
  summary: HTMLElement;
  contentHtml: string;
  questionText: string;
  answerText: string;
  normalized: string;
}

const FLASH_DURATION = 1500;

function normalize(s: string): string {
  return s
    .toLocaleLowerCase('cs')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlightMatches(html: string, terms: string[]): string {
  if (!terms.length) return html;
  // Naivní replace v textových uzlech: rozdělíme HTML na text mimo tagů a zvýrazníme.
  // Pro jednoduchost regex přes celý HTML — bezpečné jen pokud terms neobsahují HTML.
  const safeTerms = terms.filter((t) => t && t.length >= 2);
  if (!safeTerms.length) return html;
  const pattern = new RegExp('(' + safeTerms.map(escapeRegex).join('|') + ')', 'giu');
  // Skip nahrazení uvnitř HTML tagů — split podle "<...>" a zpracuj jen text části
  return html
    .split(/(<[^>]+>)/g)
    .map((part, i) => {
      if (i % 2 === 1) return part; // HTML tag — nezasahovat
      return part.replace(pattern, '<mark class="bg-[var(--color-gold)]/30 text-[var(--color-gold-light)] px-0.5 rounded-sm">$1</mark>');
    })
    .join('');
}

function init() {
  const root = document.querySelector<HTMLElement>('[data-faq-root]');
  if (!root) return;

  const input = document.querySelector<HTMLInputElement>('[data-faq-search]');
  const counter = document.querySelector<HTMLElement>('[data-faq-counter]');
  const empty = document.querySelector<HTMLElement>('[data-faq-empty]');
  if (!input) return;

  // Sestav index: každý <details> uvnitř <section id="...">.
  const sections = Array.from(root.querySelectorAll<HTMLElement>('section[id]'));
  const entries: FaqEntry[] = [];

  for (const section of sections) {
    const details = section.querySelectorAll<HTMLDetailsElement>('details');
    for (const d of Array.from(details)) {
      const summary = d.querySelector<HTMLElement>('summary');
      if (!summary) continue;
      const contentEl = d.querySelector<HTMLElement>(':scope > div, :scope > p');
      const questionText = (summary.textContent || '').trim();
      const answerText = ((contentEl?.textContent) || '').trim();
      // Originální HTML — pro highlighting bez ztráty struktury
      const contentHtml = contentEl?.innerHTML || '';
      entries.push({
        section,
        details: d,
        summary,
        contentHtml,
        questionText,
        answerText,
        normalized: normalize(questionText + ' ' + answerText),
      });
    }
  }

  function reset() {
    sections.forEach((s) => { s.removeAttribute('hidden'); });
    entries.forEach((e) => {
      // Vrátit původní HTML (bez <mark>)
      const contentEl = e.details.querySelector<HTMLElement>(':scope > div, :scope > p');
      if (contentEl) contentEl.innerHTML = e.contentHtml;
      // Reset summary text (může mít highlight)
      e.summary.textContent = e.questionText;
      e.details.open = false;
      e.details.removeAttribute('hidden');
    });
    if (counter) counter.textContent = '—';
    if (empty) empty.setAttribute('hidden', '');
  }

  function search(query: string) {
    const q = normalize(query);
    if (!q) {
      reset();
      return;
    }
    const terms = q.split(' ').filter(Boolean);
    let matchedDetails = 0;
    const matchedSections = new Set<HTMLElement>();

    entries.forEach((e) => {
      const hit = terms.every((t) => e.normalized.includes(t));
      if (hit) {
        matchedDetails++;
        matchedSections.add(e.section);
        e.details.open = true;
        e.details.removeAttribute('hidden');
        // Highlight terms v question + answer
        e.summary.innerHTML = highlightMatches(escapeHtml(e.questionText), terms);
        const contentEl = e.details.querySelector<HTMLElement>(':scope > div, :scope > p');
        if (contentEl) contentEl.innerHTML = highlightMatches(e.contentHtml, terms);
      } else {
        e.details.open = false;
        e.details.setAttribute('hidden', '');
        // Reset (pro případ že byl předtím zvýrazněn)
        e.summary.textContent = e.questionText;
        const contentEl = e.details.querySelector<HTMLElement>(':scope > div, :scope > p');
        if (contentEl) contentEl.innerHTML = e.contentHtml;
      }
    });

    // Sekce: zobraz jen ty s alespoň 1 match
    sections.forEach((s) => {
      if (matchedSections.has(s)) s.removeAttribute('hidden');
      else s.setAttribute('hidden', '');
    });

    if (counter) counter.textContent = String(matchedDetails);
    if (empty) {
      if (matchedDetails === 0) empty.removeAttribute('hidden');
      else empty.setAttribute('hidden', '');
    }
  }

  let debounceTimer: number | undefined;
  input.addEventListener('input', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => search(input.value), 150);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      reset();
    }
  });

  // Click na výsledek → scroll + flash highlight (vyřeší native <a href="#">,
  // ale tady zajistíme aspoň scroll na sekci pokud accordion má být otevřený).
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

export {};
// Suppress "unused" pro flash-related konstanty
void FLASH_DURATION;
