/**
 * Lightbox — fullscreen overlay pro YouTube videa a obrázky.
 * Datum: 2026-05-09
 *
 * Použití (HTML):
 *   <a href="https://youtu.be/VIDEOID" data-lightbox-yt="VIDEOID">…</a>
 *   <a href="/img/foo.jpg" data-lightbox-img="/img/foo.jpg" data-lightbox-alt="popis">…</a>
 *
 * Když JavaScript není dostupný (no-JS), kliknutí prostě navede přes <a href>
 * na YouTube/obrázek v novém okně — progressive enhancement.
 *
 * Globální overlay je vytvořen lazy při prvním kliknutí.
 */

let overlay: HTMLDivElement | null = null;
let prevFocus: HTMLElement | null = null;

function createOverlay(): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'lightbox-overlay';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', 'Zobrazení obsahu');
  el.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Zavřít">×</button>
    <div class="lightbox-stage" data-lightbox-stage></div>
  `;
  document.body.appendChild(el);

  // Kliknutí mimo obsah zavře
  el.addEventListener('click', (e) => {
    if (e.target === el) close();
  });
  el.querySelector('.lightbox-close')?.addEventListener('click', close);

  return el;
}

function close() {
  if (!overlay) return;
  overlay.classList.remove('is-open');
  document.documentElement.style.overflow = '';
  // Vyprázdnit stage — zničí iframe a tím zastaví YT video
  const stage = overlay.querySelector<HTMLDivElement>('[data-lightbox-stage]');
  if (stage) stage.innerHTML = '';
  if (prevFocus) {
    prevFocus.focus();
    prevFocus = null;
  }
}

function openYouTube(videoId: string) {
  if (!overlay) overlay = createOverlay();
  const stage = overlay.querySelector<HTMLDivElement>('[data-lightbox-stage]');
  if (!stage) return;
  stage.innerHTML = `
    <div class="lightbox-yt-wrap">
      <iframe
        src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0"
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
    </div>
  `;
  overlay.classList.add('is-open');
  document.documentElement.style.overflow = 'hidden';
  overlay.querySelector<HTMLButtonElement>('.lightbox-close')?.focus();
}

function openImage(src: string, alt: string) {
  if (!overlay) overlay = createOverlay();
  const stage = overlay.querySelector<HTMLDivElement>('[data-lightbox-stage]');
  if (!stage) return;
  stage.innerHTML = `<img src="${src}" alt="${alt.replace(/"/g, '&quot;')}" class="lightbox-img" />`;
  overlay.classList.add('is-open');
  document.documentElement.style.overflow = 'hidden';
  overlay.querySelector<HTMLButtonElement>('.lightbox-close')?.focus();
}

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement | null;
  const trigger = target?.closest<HTMLElement>('[data-lightbox-yt],[data-lightbox-img]');
  if (!trigger) return;
  e.preventDefault();
  prevFocus = document.activeElement as HTMLElement | null;
  const yt = trigger.getAttribute('data-lightbox-yt');
  const img = trigger.getAttribute('data-lightbox-img');
  if (yt) openYouTube(yt);
  else if (img) {
    const alt = trigger.getAttribute('data-lightbox-alt') || '';
    openImage(img, alt);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay?.classList.contains('is-open')) {
    close();
  }
});
