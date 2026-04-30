/**
 * Header — sticky chování + mobilní menu
 * Datum: 2026-04-29
 */

export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  let ticking = false;
  const scrollThreshold = 50;

  const updateHeader = () => {
    const currentScrollY = window.scrollY;

    // Pozadí — drobná změna po scrollu (jemný shadow + krapku tmavší alpha).
    // Header zůstává VŽDY viditelný na PC i tabletu — žádný auto-hide.
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
  updateHeader();
}

// Mobile menu toggle
export function initMobileMenu() {
  const toggle = document.querySelector<HTMLElement>('[data-mobile-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');

  if (!toggle || !menu) return;

  const openMenu = () => {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    if (menu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Zavřít při kliku na link
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Zavřít při ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Zavřít při zvětšení okna
  const mediaQuery = window.matchMedia('(min-width: 1024px)');
  mediaQuery.addEventListener('change', (e) => {
    if (e.matches && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

// Auto-init
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initHeader();
      initMobileMenu();
    });
  } else {
    initHeader();
    initMobileMenu();
  }
}
