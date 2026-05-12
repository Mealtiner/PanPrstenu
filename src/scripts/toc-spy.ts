/**
 * Generic ScrollSpy pro stránky se sticky levým sidebarem.
 * Datum: 2026-05-03
 *
 * Aktivuje se na elementu s `data-toc-root`. Sleduje viditelné cíle
 * `section[id]`, `details[id]` a `h2[id]` ve viewportu a nastavuje class
 * `.active` na odpovídající `<a data-toc-link="id">` v sidebaru.
 *
 * Stránky, které ho používají:
 *   - /pro-novacky/  → flat sekce, 10 kroků + extras
 *   - /faq/          → 17 kategorií
 *
 * JS-less fallback: linky fungují přes prohlížeč, jen není zvýraznění.
 */

// Stav drží closure, aby šel init() volat víckrát (refresh po dynamickém
// rerenderu sidebar — např. registrace). Listenery se registrují jen poprvé.
let links: HTMLAnchorElement[] = [];
let targets: HTMLElement[] = [];
let listenersAttached = false;

function scan(): void {
  const root = document.querySelector<HTMLElement>('[data-toc-root]');
  if (!root) {
    links = [];
    targets = [];
    return;
  }
  links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));
  targets = Array.from(
    root.querySelectorAll<HTMLElement>('section[id], details[id], h2[id]'),
  );
}

function setActive(id: string | null): void {
  links.forEach((l) => {
    l.classList.toggle('active', l.dataset.tocLink === id);
  });
}

function onScroll(): void {
  if (links.length === 0 || targets.length === 0) return;
  let activeId: string | null = null;
  let bestTop = -Infinity;
  const threshold = window.innerHeight * 0.3;
  for (const t of targets) {
    const rect = t.getBoundingClientRect();
    if (rect.top <= threshold && rect.top > bestTop) {
      bestTop = rect.top;
      activeId = t.id || null;
    }
  }
  if (!activeId && targets[0]) {
    activeId = targets[0].id || null;
  }
  setActive(activeId);
}

let ticking = false;
function onScrollThrottled(): void {
  if (!ticking) {
    requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
    ticking = true;
  }
}

function init(): void {
  scan();
  if (links.length === 0 || targets.length === 0) return;
  if (!listenersAttached) {
    window.addEventListener('scroll', onScrollThrottled, { passive: true });
    window.addEventListener('resize', onScrollThrottled, { passive: true });
    listenersAttached = true;
  }
  onScroll();
}

// Expose refresh — dynamicky generovaný sidebar (registrace) zavolá po
// hydrataci, aby toc-spy převzal nově přidané `[data-toc-link]` odkazy.
declare global {
  interface Window {
    __ppTocSpyRefresh?: () => void;
  }
}
if (typeof window !== 'undefined') {
  window.__ppTocSpyRefresh = init;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};
