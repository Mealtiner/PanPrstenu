/**
 * Accessibility — runtime helper
 * Datum: 2026-04-30
 *
 * Načte preference z localStorage, aplikuje třídy na <html>, posluchá
 * tlačítka a ukládá změny.
 *
 * Klíče v localStorage: pp.a11y.text-size | contrast | readable-font |
 *                        reduce-motion | line-height
 *
 * Pro inicializaci PŘED render-blocking CSS je v BaseLayout inline skript,
 * který načte hodnoty a nastaví třídy bleskově. Tento skript jen řeší UI
 * interakci s panelem.
 */

const STORAGE_PREFIX = 'pp.a11y.';
const TEXT_SIZE_KEY = `${STORAGE_PREFIX}text-size`;
const TOGGLES = ['contrast', 'readable-font', 'reduce-motion', 'line-height'] as const;
type ToggleKey = (typeof TOGGLES)[number];

const THEME_KEY = 'pp.theme';
type Theme = 'dark' | 'light';

function init() {
  const root = document.querySelector<HTMLElement>('[data-a11y-toolbar]');
  if (!root) return;

  // applyAllPreferences je v init redundantní (inline script v BaseLayout
  // <head> už aplikoval classes na <html> před paintingem). Voláme jen
  // synchronizaci UI toolbaru — bez DOM mutací na <html>, které by
  // způsobily forced reflow.
  setupOpenClose(root);
  setupThemeToggle(root);
  setupTextSize(root);
  setupToggles(root);
  setupReset(root);
}

// — Apply preferences to <html> ———————————————————————————

function applyAllPreferences() {
  // Batched read-then-write: nejdřív čteme VŠECHNY hodnoty z localStorage
  // (pure JS, žádné layout reads), pak zapíšeme classes na <html>
  // v jednom rAF, aby browser provedl jen jeden layout pass.
  const size = (localStorage.getItem(TEXT_SIZE_KEY) ?? 'normal') as 'normal' | 'large' | 'xlarge';
  const toggleStates: Array<[ToggleKey, boolean]> = TOGGLES.map((key) => [
    key,
    localStorage.getItem(`${STORAGE_PREFIX}${key}`) === '1',
  ]);

  requestAnimationFrame(() => {
    applyTextSize(size);
    toggleStates.forEach(([key, on]) => applyToggle(key, on));
  });
}

function applyTextSize(size: 'normal' | 'large' | 'xlarge') {
  const html = document.documentElement;
  // Skip noop: nemodifikujeme classList, pokud už je stav správný.
  // Zbytečné classList.remove/add vyvolává recalc style i kdyby class
  // nebyla přítomna — viz Chromium TimerStats.
  const wantLarge = size === 'large';
  const wantXLarge = size === 'xlarge';
  const hasLarge = html.classList.contains('a11y-text-large');
  const hasXLarge = html.classList.contains('a11y-text-xlarge');
  if (hasLarge !== wantLarge) html.classList.toggle('a11y-text-large', wantLarge);
  if (hasXLarge !== wantXLarge) html.classList.toggle('a11y-text-xlarge', wantXLarge);
}

function applyToggle(key: ToggleKey, on: boolean) {
  const html = document.documentElement;
  const cls = `a11y-${key}`;
  // Skip noop — viz applyTextSize komentář.
  if (html.classList.contains(cls) !== on) {
    html.classList.toggle(cls, on);
  }
  // Dynamický load Atkinson Hyperlegible pouze pokud je toggle aktivní
  // (úspora ~25 KB blokujícího CSS pro 99 % návštěvníků, kteří jej
  // nepotřebují).
  if (key === 'readable-font' && on) loadAtkinsonFont();
}

function loadAtkinsonFont() {
  if (document.getElementById('a11y-atkinson-font')) return;
  const link = document.createElement('link');
  link.id = 'a11y-atkinson-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap';
  document.head.appendChild(link);
}

// — Theme (dark / light) —————————————————————————————————

function getStoredTheme(): Theme | null {
  const v = localStorage.getItem(THEME_KEY);
  return v === 'dark' || v === 'light' ? v : null;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  // Sync meta theme-color pro status bar mobilů (Android Chrome, iOS Safari).
  const metaTheme = document.getElementById('meta-theme-color');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'light' ? '#e6e9dd' : '#0A130D');
  }
}

function setupThemeToggle(root: HTMLElement) {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-theme-mode]'));
  // Default 'dark' (vždy) — viz BaseLayout.astro inline init.
  const current = getStoredTheme() ?? 'dark';

  const sync = (theme: Theme) => {
    buttons.forEach((b) => {
      const active = b.dataset.themeMode === theme;
      b.setAttribute('aria-pressed', String(active));
    });
  };
  sync(current);

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const theme = (btn.dataset.themeMode ?? 'dark') as Theme;
      localStorage.setItem(THEME_KEY, theme);
      applyTheme(theme);
      sync(theme);
    });
  });
}

// — UI: open/close panel ————————————————————————————————

function setupOpenClose(root: HTMLElement) {
  const openBtn = root.querySelector<HTMLButtonElement>('[data-a11y-open]');
  const closeBtn = root.querySelector<HTMLButtonElement>('[data-a11y-close]');
  const panel = root.querySelector<HTMLElement>('#a11y-panel');
  if (!openBtn || !closeBtn || !panel) return;

  const setOpen = (open: boolean) => {
    panel.classList.toggle('hidden', !open);
    openBtn.setAttribute('aria-expanded', String(open));
    if (open) {
      // přesun fokusu na první ovládací prvek panelu pro klávesnici
      const firstControl = panel.querySelector<HTMLElement>('button, input');
      firstControl?.focus();
    }
  };

  openBtn.addEventListener('click', () => setOpen(panel.classList.contains('hidden')));
  closeBtn.addEventListener('click', () => {
    setOpen(false);
    openBtn.focus();
  });

  // Esc zavře panel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.classList.contains('hidden')) {
      setOpen(false);
      openBtn.focus();
    }
  });

  // Klik mimo panel zavře (pokud uživatel klikne někam dál)
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('hidden')) return;
    if (root.contains(e.target as Node)) return;
    setOpen(false);
  });
}

// — UI: velikost textu ————————————————————————————————

function setupTextSize(root: HTMLElement) {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-a11y-text-size]'));
  const current = (localStorage.getItem(TEXT_SIZE_KEY) ?? 'normal') as 'normal' | 'large' | 'xlarge';

  const sync = (size: string) => {
    buttons.forEach((b) => {
      const active = b.dataset.a11yTextSize === size;
      b.setAttribute('aria-pressed', String(active));
    });
  };
  sync(current);

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const size = (btn.dataset.a11yTextSize ?? 'normal') as 'normal' | 'large' | 'xlarge';
      localStorage.setItem(TEXT_SIZE_KEY, size);
      applyTextSize(size);
      sync(size);
    });
  });
}

// — UI: toggle checkboxy ————————————————————————————————

function setupToggles(root: HTMLElement) {
  const inputs = Array.from(root.querySelectorAll<HTMLInputElement>('[data-a11y-toggle]'));
  inputs.forEach((input) => {
    const key = input.dataset.a11yToggle as ToggleKey;
    if (!key) return;
    input.checked = localStorage.getItem(`${STORAGE_PREFIX}${key}`) === '1';
    input.addEventListener('change', () => {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, input.checked ? '1' : '0');
      applyToggle(key, input.checked);
    });
  });
}

// — UI: reset ——————————————————————————————————————

function setupReset(root: HTMLElement) {
  const btn = root.querySelector<HTMLButtonElement>('[data-a11y-reset]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    localStorage.removeItem(TEXT_SIZE_KEY);
    localStorage.removeItem(THEME_KEY);
    TOGGLES.forEach((k) => localStorage.removeItem(`${STORAGE_PREFIX}${k}`));
    applyAllPreferences();
    // Téma zpět na default 'dark' (atmosféra Středozemě, ne systémové preference).
    const defaultTheme: Theme = 'dark';
    applyTheme(defaultTheme);
    // Reset UI stavu pillů a checkboxů
    root.querySelectorAll<HTMLButtonElement>('[data-a11y-text-size]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.a11yTextSize === 'normal'));
    });
    root.querySelectorAll<HTMLButtonElement>('[data-theme-mode]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.themeMode === defaultTheme));
    });
    root.querySelectorAll<HTMLInputElement>('[data-a11y-toggle]').forEach((i) => {
      i.checked = false;
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

export {};
