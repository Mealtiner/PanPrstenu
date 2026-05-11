/**
 * SideDrawers — runtime helper
 * Datum: 2026-04-30
 *
 * Spravuje vyjížděcí panely (Checklist + Jedu poprvé) na pravé straně.
 * - Klik na založku otevře panel.
 * - Klik mimo nebo Esc zavře.
 * - Stav checkboxů se ukládá do sessionStorage (ne na server).
 * - Otevře se vždy jen jeden panel — pokud kliknu na druhou záložku,
 *   první se zavře.
 */

const STORAGE_PREFIX = 'pp.checklist.';

function init() {
  const drawers = Array.from(document.querySelectorAll<HTMLElement>('[data-side-drawer]'));
  if (drawers.length === 0) return;

  const closeAll = (except?: HTMLElement) => {
    drawers.forEach((d) => {
      if (d === except) return;
      const tab = d.querySelector<HTMLButtonElement>('[data-side-drawer-tab]');
      const panel = d.querySelector<HTMLElement>('.side-drawer__panel');
      panel?.classList.add('hidden');
      tab?.setAttribute('aria-expanded', 'false');
    });
  };

  drawers.forEach((drawer) => {
    const tab = drawer.querySelector<HTMLButtonElement>('[data-side-drawer-tab]');
    const panel = drawer.querySelector<HTMLElement>('.side-drawer__panel');
    const closeBtn = drawer.querySelector<HTMLButtonElement>('[data-side-drawer-close]');
    if (!tab || !panel) return;

    tab.addEventListener('click', () => {
      const isOpen = !panel.classList.contains('hidden');
      if (isOpen) {
        panel.classList.add('hidden');
        tab.setAttribute('aria-expanded', 'false');
      } else {
        closeAll(drawer);
        panel.classList.remove('hidden');
        tab.setAttribute('aria-expanded', 'true');
        // focus na první ovládací prvek panelu pro klávesnici
        const first = panel.querySelector<HTMLElement>('button, input, a');
        first?.focus();
      }
    });

    closeBtn?.addEventListener('click', () => {
      panel.classList.add('hidden');
      tab.setAttribute('aria-expanded', 'false');
      tab.focus();
    });

    // Persist checkbox state v sessionStorage
    const checkboxes = drawer.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-checklist-item]');
    checkboxes.forEach((cb) => {
      const key = STORAGE_PREFIX + (cb.dataset.checklistItem || 'unknown');
      try {
        cb.checked = sessionStorage.getItem(key) === 'true';
      } catch {
        /* sessionStorage zakázaný */
      }
      cb.addEventListener('change', () => {
        try {
          sessionStorage.setItem(key, String(cb.checked));
        } catch {
          /* sessionStorage zakázaný */
        }
      });
    });
  });

  // Klik mimo některý panel jej zavře
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    drawers.forEach((drawer) => {
      const panel = drawer.querySelector<HTMLElement>('.side-drawer__panel');
      const tab = drawer.querySelector<HTMLButtonElement>('[data-side-drawer-tab]');
      if (!panel || panel.classList.contains('hidden')) return;
      if (drawer.contains(target)) return;
      panel.classList.add('hidden');
      tab?.setAttribute('aria-expanded', 'false');
    });
  });

  // Esc zavře všechny otevřené
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const anyOpen = drawers.some((d) => !d.querySelector('.side-drawer__panel')?.classList.contains('hidden'));
    if (anyOpen) closeAll();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

export {};
