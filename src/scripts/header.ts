/**
 * Header — sticky chování + mobilní menu + desktop megamenu
 * Datum: 2026-05-01
 */

export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  let ticking = false;
  const scrollThreshold = 50;

  const updateHeader = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > scrollThreshold) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  // Iniciální stav posuneme do rAF, aby se nevolal synchronně v rámci
  // DOMContentLoaded init dávky. `window.scrollY` je layout-read; pokud
  // se mu předchází classList mutace (a11y preferences na <html>),
  // prohlížeč musí dělat forced reflow. rAF nás dostane po prvním paintu.
  requestAnimationFrame(updateHeader);
}

// === Mobile menu ===
export function initMobileMenu() {
  const toggle = document.querySelector<HTMLElement>('[data-mobile-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
  if (!toggle || !menu) return;

  const openMenu = () => {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    if (menu.classList.contains('is-open')) closeMenu();
    else openMenu();
  });

  // Zavřít při kliku na link uvnitř menu
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  // Při zvětšení okna do desktopu zavři mobile menu
  const mediaQuery = window.matchMedia('(min-width: 1024px)');
  mediaQuery.addEventListener('change', (e) => {
    if (e.matches && menu.classList.contains('is-open')) closeMenu();
  });
}

// === Desktop megamenu ===
export function initMegamenu() {
  const root = document.querySelector<HTMLElement>('[data-megamenu-root]');
  if (!root) return;

  const toggles = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-mega-toggle]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-mega-panel]'));
  if (toggles.length === 0 || panels.length === 0) return;

  const panelByKey = new Map<string, HTMLElement>();
  panels.forEach((p) => {
    const key = p.dataset.megaPanel;
    if (key) panelByKey.set(key, p);
  });

  let openKey: string | null = null;
  let lastFocusedToggle: HTMLButtonElement | null = null;

  const closeAll = () => {
    toggles.forEach((t) => t.setAttribute('aria-expanded', 'false'));
    panels.forEach((p) => {
      p.classList.add('hidden');
      p.classList.remove('is-open');
    });
    openKey = null;
  };

  const open = (key: string, focusFirst = false) => {
    if (openKey === key) {
      closeAll();
      return;
    }
    closeAll();
    const panel = panelByKey.get(key);
    const toggle = toggles.find((t) => t.dataset.megaToggle === key);
    if (!panel || !toggle) return;
    panel.classList.remove('hidden');
    requestAnimationFrame(() => panel.classList.add('is-open'));
    toggle.setAttribute('aria-expanded', 'true');
    lastFocusedToggle = toggle;
    openKey = key;
    if (focusFirst) {
      const firstLink = panel.querySelector<HTMLElement>('a, button');
      firstLink?.focus();
    }
  };

  // Klik na toggle → open/close
  toggles.forEach((t) => {
    t.addEventListener('click', (e) => {
      e.preventDefault();
      const key = t.dataset.megaToggle;
      if (!key) return;
      open(key);
    });
  });

  // Hover na CELÉ top-level <li> (text odkaz + šipka tlačítko zároveň),
  // aby se megamenu otevíralo na desktopu plynule kdekoli nad položkou.
  const megaItems = Array.from(root.querySelectorAll<HTMLElement>('[data-mega-item]'));
  megaItems.forEach((li) => {
    let hoverTimer: number | null = null;
    li.addEventListener('mouseenter', () => {
      if (!window.matchMedia('(min-width: 1024px)').matches) return;
      const key = li.dataset.megaItem;
      if (!key) return;
      // Krátké zpoždění, aby se otevřelo plynule (zabrání flickering při
      // rychlém přejíždění napříč více položkami).
      if (hoverTimer) window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => {
        if (openKey !== key) open(key);
      }, 60);
    });
    li.addEventListener('mouseleave', () => {
      if (hoverTimer) {
        window.clearTimeout(hoverTimer);
        hoverTimer = null;
      }
    });
  });

  // Hover ven z headeru ale s tolerancí přes panely
  const headerEl = root.closest<HTMLElement>('[data-header]');
  if (headerEl) {
    let leaveTimer: number | null = null;
    headerEl.addEventListener('mouseleave', () => {
      if (!window.matchMedia('(min-width: 1024px)').matches) return;
      leaveTimer = window.setTimeout(closeAll, 220);
    });
    headerEl.addEventListener('mouseenter', () => {
      if (leaveTimer) {
        window.clearTimeout(leaveTimer);
        leaveTimer = null;
      }
    });
  }

  // Esc zavře a vrátí focus
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openKey) {
      const t = lastFocusedToggle;
      closeAll();
      t?.focus();
    }
  });

  // Klik mimo zavře
  document.addEventListener('click', (e) => {
    if (!openKey) return;
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (root.contains(target)) return;
    const openPanel = panelByKey.get(openKey);
    if (openPanel && openPanel.contains(target)) return;
    closeAll();
  });

  // Klik na link uvnitř panelu zavře, a pokud cíl je hash kotva na aktuální
  // stránce, ručně scrollni — browser jinak ignoruje stejnou URL.
  panels.forEach((p) => {
    p.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href') || '';
        const hashIdx = href.indexOf('#');
        if (hashIdx >= 0) {
          const targetPath = href.slice(0, hashIdx);
          const hash = href.slice(hashIdx + 1);
          const currentPath = window.location.pathname;
          // Cíl je stejná stránka? (porovnáváme s i bez trailing slash)
          const sameTarget =
            !targetPath ||
            targetPath === currentPath ||
            targetPath.replace(/\/$/, '') === currentPath.replace(/\/$/, '');
          if (sameTarget && hash) {
            const target = document.getElementById(hash);
            if (target) {
              e.preventDefault();
              closeAll();
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              try {
                history.replaceState(null, '', '#' + hash);
              } catch {
                /* ignore */
              }
              return;
            }
          }
        }
        closeAll();
      });
    });
  });
}

// === Auto-init ===
if (typeof window !== 'undefined') {
  const init = () => {
    initHeader();
    initMobileMenu();
    initMegamenu();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
