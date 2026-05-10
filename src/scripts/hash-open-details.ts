/**
 * Globální hash-handler — pokud URL obsahuje #anchor a cíl je uvnitř <details>,
 * tak se daný <details> otevře a scrollne se na něj.
 *
 * Funguje pro:
 *   - direct load (https://…/page/#anchor)
 *   - in-page klik na <a href="#anchor">
 *   - back/forward s hash
 *
 * Datum: 2026-05-08
 */

function openDetailsForHash(hash: string): boolean {
  if (!hash || hash === '#') return false;
  const id = hash.startsWith('#') ? hash.substring(1) : hash;
  const target = document.getElementById(id);
  if (!target) return false;

  // Najdi nejbližší <details> (cíl sám nebo rodič) + všechny vnořené předky
  const detailsToOpen: HTMLDetailsElement[] = [];
  const closest =
    target.tagName === 'DETAILS'
      ? (target as HTMLDetailsElement)
      : target.closest<HTMLDetailsElement>('details');
  if (closest) detailsToOpen.push(closest);

  // Otevři i všechny vyšší <details> (kotva může být uvnitř nested accordion)
  let parent = (closest ?? target).parentElement;
  while (parent) {
    if (parent.tagName === 'DETAILS') {
      detailsToOpen.push(parent as HTMLDetailsElement);
    }
    parent = parent.parentElement;
  }

  detailsToOpen.forEach((d) => { d.open = true; });

  // Double rAF — první frame otevření vyšle layout invalidation,
  // druhý frame má aktuální layout pro scrollIntoView.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  return detailsToOpen.length > 0;
}

// Initial load — počkat na DOMContentLoaded, aby všechny <details> existovaly v DOM.
function initialOpen() {
  if (window.location.hash) {
    openDetailsForHash(window.location.hash);
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialOpen, { once: true });
} else {
  initialOpen();
}

// Hashchange (back/forward, in-page klik)
window.addEventListener('hashchange', () => {
  openDetailsForHash(window.location.hash);
});

// In-page klik na <a href="#…"> — některé prohlížeče nevyhodí hashchange
// pokud je hash stejný jako už je v URL. Ošetříme klik přímo.
document.addEventListener('click', (e) => {
  const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
  if (!link) return;
  const hash = link.getAttribute('href');
  if (!hash || hash === '#') return;
  // Otevři details i když se hash nezmění
  if (openDetailsForHash(hash)) {
    // Necháme prohlížeč scroll si vyřídit sám (preventDefault by potlačil)
  }
});
