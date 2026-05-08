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

  // Najdi nejbližší <details> (cíl sám nebo rodič)
  const details =
    target.tagName === 'DETAILS'
      ? (target as HTMLDetailsElement)
      : target.closest<HTMLDetailsElement>('details');

  if (details) {
    details.open = true;
  }

  // Také otevři vnořené details (pokud je cíl hluboko vnořený)
  let parent = target.parentElement;
  while (parent) {
    if (parent.tagName === 'DETAILS') {
      (parent as HTMLDetailsElement).open = true;
    }
    parent = parent.parentElement;
  }

  // Scroll na cíl po otevření (rAF aby se DOM stihl přerenderovat)
  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  return true;
}

// Initial load
if (window.location.hash) {
  // Mírná pauza aby se stihl načíst layout
  requestAnimationFrame(() => openDetailsForHash(window.location.hash));
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
