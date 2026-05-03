/**
 * /pro-novacky/ — ScrollSpy pro levý sticky sidebar.
 * Datum: 2026-05-03
 *
 * Sleduje viditelnou sekci ve viewportu a nastavuje class .active na
 * odpovídající <a data-toc-link="..."> ve sticky sidebaru. Funguje i bez
 * IntersectionObserveru (scroll listener s rAF throttle).
 *
 * Stránka má `data-novacky-root`. Sekce jsou <section id="..."> nebo přímo
 * <h2 id="..."> uvnitř článku — script bere obojí.
 */

function init() {
  const root = document.querySelector<HTMLElement>('[data-novacky-root]');
  if (!root) return;

  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));
  if (links.length === 0) return;

  const targets = Array.from(
    root.querySelectorAll<HTMLElement>('section[id], h2[id]'),
  );
  if (targets.length === 0) return;

  const setActive = (id: string | null) => {
    links.forEach((l) => {
      l.classList.toggle('active', l.dataset.tocLink === id);
    });
  };

  const onScroll = () => {
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
  onScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
