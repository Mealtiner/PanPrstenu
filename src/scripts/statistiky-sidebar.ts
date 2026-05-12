/**
 * Sidebar pro statistiky pages (/<lang>/minule-rocniky/statistiky/).
 * Datum: 2026-05-12
 *
 * Renderuje sekci "Demografie účastníků" se 4 odkazy:
 *   - Ročník 2026 / 2025 / 2024 / Srovnání ročníků
 *
 * Active state detekovaný z URL. Použito na landing (index), ročnících
 * ([rok]) i srovnání (srovnani). Sdílený script napříč všemi 4 stránkami.
 *
 * Sidebar se renderuje dynamicky do <aside id="statistiky-sidebar">.
 * Stránka zařadí <MobileSidebarShell asideId="statistiky-sidebar"> a tento
 * script ho po DOMContentLoaded naplní.
 */

interface SidebarItem {
  href: string;
  label: string;
  isActive: boolean;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function detectLang(): string {
  const m = /^\/(cs|en|de|sk|uk)\//.exec(window.location.pathname);
  return m?.[1] ?? 'cs';
}

function buildItems(lang: string): SidebarItem[] {
  const base = `/${lang}/minule-rocniky/statistiky`;
  const path = window.location.pathname;
  const yearMatch = /\/minule-rocniky\/statistiky\/(20\d{2})\/?$/.exec(path);
  const currentYear = yearMatch?.[1] ?? '';
  const onComparison = /\/minule-rocniky\/statistiky\/srovnani\/?$/.test(path);
  const onLanding = /\/minule-rocniky\/statistiky\/?$/.test(path);

  return [
    { href: `${base}/2026/`, label: 'Ročník 2026', isActive: currentYear === '2026' },
    { href: `${base}/2025/`, label: 'Ročník 2025', isActive: currentYear === '2025' },
    { href: `${base}/2024/`, label: 'Ročník 2024', isActive: currentYear === '2024' },
    { href: `${base}/srovnani/`, label: 'Srovnání ročníků', isActive: onComparison },
    // Když je user na landingu, žádná z výše uvedených není active — to je OK.
    // (Landing má vlastní nadpis "Demografie účastníků", tj. sekce sama
    // je "active" implicitně.)
    ...(onLanding ? [] : []),
  ];
}

export function initStatistikySidebar(): void {
  const aside = document.getElementById('statistiky-sidebar');
  if (!aside) return;

  const lang = detectLang();
  const items = buildItems(lang);

  const itemsHtml = items.map((it) => {
    const cls = it.isActive
      ? 'reg-sidebar__item active'
      : 'reg-sidebar__item';
    return `<a class="${cls}" data-toc-link="${escapeHtml(it.href)}" href="${escapeHtml(it.href)}">${escapeHtml(it.label)}</a>`;
  }).join('');

  aside.classList.add('reg-sidebar');
  aside.innerHTML = `
    <div class="reg-sidebar__section">
      <h3 class="reg-sidebar__heading">Demografie účastníků</h3>
      <nav class="reg-sidebar__items">${itemsHtml}</nav>
    </div>
  `;

  // Po dynamickém naplnění oznámit toc-spy, aby převzal odkazy (i když na
  // statistiky stránce není scroll-spy aktivní, refresh je no-op).
  if (typeof window !== 'undefined' && window.__ppTocSpyRefresh) {
    window.__ppTocSpyRefresh();
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStatistikySidebar);
  } else {
    initStatistikySidebar();
  }
}
