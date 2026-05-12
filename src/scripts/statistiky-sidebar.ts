/**
 * Sidebar pro statistiky pages (/<lang>/minule-rocniky/statistiky/).
 * Datum: 2026-05-12 (revize — i18n přes @i18n/ui)
 *
 * Renderuje sekci "Demografie účastníků" se 4 odkazy.
 * Active state per URL. Sdílený script napříč všemi 4 stránkami pod
 * /minule-rocniky/statistiky/ (index, [rok], srovnani).
 */

import { getDomTranslator } from './i18n-helper';

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

function buildItems(lang: string, t: ReturnType<typeof getDomTranslator>): SidebarItem[] {
  const base = `/${lang}/minule-rocniky/statistiky`;
  const path = window.location.pathname;
  const yearMatch = /\/minule-rocniky\/statistiky\/(20\d{2})\/?$/.exec(path);
  const currentYear = yearMatch?.[1] ?? '';
  const onComparison = /\/minule-rocniky\/statistiky\/srovnani\/?$/.test(path);

  return [
    { href: `${base}/2026/`, label: t('reg.sidebar.year_2026'), isActive: currentYear === '2026' },
    { href: `${base}/2025/`, label: t('reg.sidebar.year_2025'), isActive: currentYear === '2025' },
    { href: `${base}/2024/`, label: t('reg.sidebar.year_2024'), isActive: currentYear === '2024' },
    { href: `${base}/srovnani/`, label: t('reg.sidebar.comparison'), isActive: onComparison },
  ];
}

export function initStatistikySidebar(): void {
  const aside = document.getElementById('statistiky-sidebar');
  if (!aside) return;

  const lang = detectLang();
  const t = getDomTranslator();
  const items = buildItems(lang, t);

  const itemsHtml = items.map((it) => {
    const cls = it.isActive
      ? 'reg-sidebar__item active'
      : 'reg-sidebar__item';
    return `<a class="${cls}" data-toc-link="${escapeHtml(it.href)}" href="${escapeHtml(it.href)}">${escapeHtml(it.label)}</a>`;
  }).join('');

  aside.classList.add('reg-sidebar');
  aside.innerHTML = `
    <div class="reg-sidebar__section">
      <h3 class="reg-sidebar__heading">${escapeHtml(t('reg.sidebar.heading_demographics'))}</h3>
      <nav class="reg-sidebar__items">${itemsHtml}</nav>
    </div>
  `;

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
