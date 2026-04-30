/**
 * CookieConsent — runtime helper
 * Datum: 2026-04-30
 *
 * Spravuje stav souhlasu s cookies v localStorage:
 *
 *   pp.cookie.consent = {
 *     id: string (UUID),
 *     date: string (ISO),
 *     necessary: true (vždy),
 *     analytics: boolean,
 *     marketing: boolean,
 *     external: boolean
 *   }
 *
 * Pokud klíč neexistuje, zobrazí se inline banner pro první návštěvu.
 * Po uložení se banner skryje a stav je k dispozici v `window.ppConsent`
 * (pro budoucí integraci GA4 / Google Ads přes consent mode).
 *
 * Komponenty (AccessibilityToolbar, CookieConsent) reagují stejným patternem
 * — kliknutí mimo panel jej zavře, Esc taktéž.
 */

const STORAGE_KEY = 'pp.cookie.consent';

export type CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'external';

export interface CookieConsent {
  id: string;
  date: string;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  external: boolean;
}

declare global {
  interface Window {
    ppConsent?: CookieConsent;
  }
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback pro starší prohlížeče
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function loadConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (typeof parsed.id !== 'string' || typeof parsed.date !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent(consent: CookieConsent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    window.ppConsent = consent;
  } catch {
    /* localStorage zakázaný */
  }
}

function buildConsent(opts: { analytics: boolean; marketing: boolean; external: boolean }): CookieConsent {
  return {
    id: generateUUID(),
    date: new Date().toISOString(),
    necessary: true,
    analytics: opts.analytics,
    marketing: opts.marketing,
    external: opts.external,
  };
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

// — UI ———————————————————————————————————————————

function init() {
  const banner = document.querySelector<HTMLElement>('[data-cookie-banner]');
  const root = document.querySelector<HTMLElement>('[data-cookie-consent]');
  const panel = document.querySelector<HTMLElement>('#cookie-panel');
  if (!banner || !root || !panel) return;

  const checkboxes = Array.from(panel.querySelectorAll<HTMLInputElement>('[data-cookie-cat]'));
  const meta = panel.querySelector<HTMLElement>('[data-cookie-meta]');
  const dateEl = panel.querySelector<HTMLElement>('[data-cookie-date]');
  const idEl = panel.querySelector<HTMLElement>('[data-cookie-id]');
  const openBtn = root.querySelector<HTMLButtonElement>('[data-cookie-action="open-panel"]');

  const syncUI = (consent: CookieConsent | null) => {
    checkboxes.forEach((cb) => {
      const cat = cb.dataset.cookieCat as CookieCategory;
      cb.checked = consent ? Boolean(consent[cat]) : false;
    });
    if (consent && meta && dateEl && idEl) {
      dateEl.textContent = formatDate(consent.date);
      idEl.textContent = consent.id;
      meta.removeAttribute('hidden');
    } else if (meta) {
      meta.setAttribute('hidden', '');
    }
  };

  const setPanelOpen = (open: boolean) => {
    panel.classList.toggle('hidden', !open);
    openBtn?.setAttribute('aria-expanded', String(open));
    if (open) {
      const firstControl = panel.querySelector<HTMLElement>('button, input');
      firstControl?.focus();
    }
  };

  const showBanner = (visible: boolean) => {
    banner.toggleAttribute('hidden', !visible);
  };

  const apply = (consent: CookieConsent) => {
    saveConsent(consent);
    syncUI(consent);
    showBanner(false);
    setPanelOpen(false);
    // Dispatch custom event — pro budoucí GA4 / Ads integrace
    document.dispatchEvent(
      new CustomEvent('pp-consent-change', { detail: consent }),
    );
  };

  // — Akce ————————————————————————————————————————

  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cookie-action]');
    if (!target) return;
    const action = target.dataset.cookieAction;

    if (action === 'open-panel') {
      setPanelOpen(panel.classList.contains('hidden'));
    } else if (action === 'close-panel') {
      setPanelOpen(false);
      openBtn?.focus();
    } else if (action === 'accept-all') {
      apply(buildConsent({ analytics: true, marketing: true, external: true }));
    } else if (action === 'reject-non-essential') {
      apply(buildConsent({ analytics: false, marketing: false, external: false }));
    } else if (action === 'save') {
      const opts = {
        analytics: false,
        marketing: false,
        external: false,
      };
      checkboxes.forEach((cb) => {
        const cat = cb.dataset.cookieCat as CookieCategory;
        if (cat === 'analytics' || cat === 'marketing' || cat === 'external') {
          opts[cat] = cb.checked;
        }
      });
      apply(buildConsent(opts));
    }
  });

  // Klik mimo panel jej zavře
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('hidden')) return;
    if (root.contains(e.target as Node)) return;
    setPanelOpen(false);
  });

  // Esc zavře panel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.classList.contains('hidden')) {
      setPanelOpen(false);
      openBtn?.focus();
    }
  });

  // — Init ————————————————————————————————————————

  const stored = loadConsent();
  if (stored) {
    window.ppConsent = stored;
    syncUI(stored);
    showBanner(false);
  } else {
    syncUI(null);
    showBanner(true);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
