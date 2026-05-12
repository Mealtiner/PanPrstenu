/**
 * Mobile sidebar drawer — TocSidebar a FactionRolesSidebar.
 * Datum: 2026-05-03
 *
 * Pro každý element s `data-mobile-sidebar-root` (= wrapper kolem buttonu,
 * backdropu a draweru) připojí toggle / backdrop / Esc / link-close.
 *
 * Aktivuje se jen na mobilu/tabletu na výšku (do lg breakpointu, < 1024 px).
 * Na desktopu je sidebar sticky sloupec a drawer chování se ignoruje.
 */

export {};

function init() {
  const roots = document.querySelectorAll<HTMLElement>('[data-mobile-sidebar-root]');
  if (roots.length === 0) return;

  roots.forEach((root) => {
    const toggle = root.querySelector<HTMLElement>('[data-mobile-sidebar-toggle]');
    const drawer = root.querySelector<HTMLElement>('[data-mobile-sidebar-drawer]');
    const backdrop = root.querySelector<HTMLElement>('[data-mobile-sidebar-backdrop]');
    const closeBtn = root.querySelector<HTMLElement>('[data-mobile-sidebar-close]');
    if (!toggle || !drawer || !backdrop) return;

    const open = () => {
      drawer.classList.add('is-open');
      backdrop.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      drawer.classList.contains('is-open') ? close() : open();
    });
    closeBtn?.addEventListener('click', close);
    backdrop.addEventListener('click', close);

    // Klik na link nebo akční button uvnitř draweru → zavři drawer.
    // Event delegation — funguje i pro DYNAMICKY přidané prvky (registrace
    // naplňuje sidebar async po fetchi /me a /schema; přímé attachnutí
    // na links/buttons při init() by se na nově přidané nezachytilo).
    // Výjimky: <summary> (expand/collapse <details>), close/toggle buttons
    // samotného draweru.
    drawer.addEventListener('click', (e) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      // Klik uvnitř <summary> rozšiřuje sub-menu — nezavírej drawer
      if (t.closest('summary')) return;
      const closeable = t.closest<HTMLElement>(
        'a, button:not([data-mobile-sidebar-close]):not([data-mobile-sidebar-toggle])',
      );
      if (closeable) {
        // krátké zpoždění, ať se anchor scroll/navigace/handlery stihnou spustit
        setTimeout(close, 50);
      }
    });

    // Esc zavře
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        close();
        toggle.focus();
      }
    });

    // Při resize do desktopu zavři (drawer chování platí jen na mobilu)
    const mq = window.matchMedia('(min-width: 1024px)');
    mq.addEventListener('change', (e) => {
      if (e.matches && drawer.classList.contains('is-open')) close();
    });
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
