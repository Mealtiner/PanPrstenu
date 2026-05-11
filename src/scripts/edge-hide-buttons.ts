/**
 * edge-hide-buttons.ts — progresivní skrytí plovoucích kruhových
 * tlačítek na mobilu (LanguageSwitcher, AccessibilityToolbar, CookieConsent).
 * Datum: 2026-05-11
 *
 * Chování (jen mobile, viewport < 1024 px):
 *  1. Při scrollY = 0 jsou kolečka v default pozici (plně viditelná).
 *  2. Mezi scrollY = 0 a scrollY = 0.5 × innerHeight se kolečka lineárně
 *     posouvají směrem ke svému okraji — levé doleva, pravá doprava.
 *     V cílovém stavu (progress = 1) je každé kolečko z 50 % zasunuté
 *     za okraj (vyčnívá max ~24 px, což je < 29 px tabu MobileSidebarShell).
 *  3. Pohyb sleduje scroll instantně (žádný transition při scrollu).
 *  4. Klik na *schované* kolečko (lastProgress > 0):
 *       a) snap-back animace 280 ms ease-out vrátí všechna tři do pozice 0
 *       b) zablokujeme scroll-driven update (manualOverride)
 *       c) první další scroll event manuální zámek shodí; transition zůstane
 *          aktivní ~330 ms aby se nová pozice nezjevila skokem (hand-off),
 *          pak se transition vypne a pokračuje instant tracking.
 *  5. Desktop (≥ 1024 px) i prefers-reduced-motion → žádný transform.
 */

const MOBILE_BREAKPOINT = 1024;
const SCROLL_TRIGGER_RATIO = 0.5; // 50 % výšky viewportu
const SNAP_BACK_MS = 280;
const HANDOFF_MS = SNAP_BACK_MS + 50;

interface Edge {
  el: HTMLElement;
  side: 'left' | 'right';
}

function init(): void {
  const edges: Edge[] = [];

  const lang = document.querySelector<HTMLElement>('[data-lang-switcher]');
  if (lang) edges.push({ el: lang, side: 'right' });

  const a11y = document.querySelector<HTMLElement>('[data-a11y-toolbar]');
  if (a11y) edges.push({ el: a11y, side: 'right' });

  const cookie = document.querySelector<HTMLElement>('[data-cookie-consent]');
  if (cookie) edges.push({ el: cookie, side: 'left' });

  if (edges.length === 0) return;

  let manualOverride = false;
  let lastProgress = 0;
  let ticking = false;
  let handoffTimeoutId: number | null = null;

  const isMobile = (): boolean => window.innerWidth < MOBILE_BREAKPOINT;
  const prefersReduceMotion = (): boolean =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setTransition(active: boolean): void {
    const value =
      active && !prefersReduceMotion()
        ? `transform ${SNAP_BACK_MS}ms ease-out`
        : 'none';
    for (const { el } of edges) {
      el.style.transition = value;
    }
  }

  function applyProgress(progress: number): void {
    const clamped = Math.max(0, Math.min(1, progress));
    lastProgress = clamped;
    for (const { el, side } of edges) {
      const sign = side === 'right' ? 1 : -1;
      const tx = clamped * 50 * sign; // 0–50 %
      el.style.transform = `translateX(${tx}%)`;
    }
  }

  function computeProgress(): number {
    if (!isMobile()) return 0;
    const denom = window.innerHeight * SCROLL_TRIGGER_RATIO;
    return Math.min(1, window.scrollY / Math.max(1, denom));
  }

  function clearStyles(): void {
    for (const { el } of edges) {
      el.style.transform = '';
      el.style.transition = '';
    }
    lastProgress = 0;
    manualOverride = false;
    if (handoffTimeoutId !== null) {
      clearTimeout(handoffTimeoutId);
      handoffTimeoutId = null;
    }
  }

  function update(): void {
    if (!isMobile()) {
      clearStyles();
      return;
    }
    if (manualOverride) return;
    applyProgress(computeProgress());
  }

  function onScroll(): void {
    if (manualOverride) {
      manualOverride = false;
      // Hand-off: transition už je aktivní ze snap-backu, necháme ji
      // doběhnout aby přechod ze 0 do scrollové pozice byl plynulý.
      if (handoffTimeoutId !== null) clearTimeout(handoffTimeoutId);
      handoffTimeoutId = window.setTimeout(() => {
        handoffTimeoutId = null;
        setTransition(false);
      }, HANDOFF_MS);
    }
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    }
  }

  function onResize(): void {
    update();
  }

  function attachToggle(selector: string): void {
    const btn = document.querySelector<HTMLElement>(selector);
    if (!btn) return;
    btn.addEventListener(
      'click',
      () => {
        if (!isMobile()) return;
        if (lastProgress <= 0) return; // viditelné — neřešíme
        manualOverride = true;
        if (handoffTimeoutId !== null) {
          clearTimeout(handoffTimeoutId);
          handoffTimeoutId = null;
        }
        setTransition(true);
        applyProgress(0);
      },
      { capture: true },
    );
  }

  // Initial state — bez transition (instant nastavení podle aktuálního scrollY).
  setTransition(false);
  update();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  attachToggle('[data-lang-switcher] [data-lang-open]');
  attachToggle('[data-a11y-toolbar] [data-a11y-open]');
  attachToggle('[data-cookie-consent] [data-cookie-action="open-panel"]');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
