#!/usr/bin/env python3
"""
Audit interních odkazů a kotev na webu PP 2026.
Datum: 2026-05-01

Vstup:  dist/cs/**/*.html (běh po `npm run build`)
Výstup: docs/audit/odkazy-audit.md + návratový kód:
        0 = vše OK, 1 = nalezeny problémy

Co kontroluje:
  1) Broken interní URL (odkaz na /cs/foo/, ale dist/cs/foo/index.html neexistuje)
  2) Broken hash kotvy (URL existuje, ale ID v cílové stránce chybí)
  3) Orphan stránky (existuje dist/cs/foo/, ale neukazuje na ni žádný interní odkaz)
  4) Stránky chybějící v Header (megamenu) nebo Footer
  5) Sjednocení: legislativní stránky (cookies, gdpr, podminky, fotky-a-video,
     pristupnost) MUSÍ být ve footeru
"""
from __future__ import annotations
import re
import sys
from collections import defaultdict
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse


REPO = Path(__file__).resolve().parent.parent
DIST = REPO / 'dist'
LANG = 'cs'  # auditujeme jen CS verzi
LANG_ROOT = DIST / LANG
OUT_PATH = REPO / 'docs' / 'audit' / 'odkazy-audit.md'

# Stránky, které musí být v patičce (legislativní + nastavení)
LEGAL_REQUIRED_IN_FOOTER = {
    f'/{LANG}/cookies/',
    f'/{LANG}/gdpr/',
    f'/{LANG}/podminky-ucasti-a-registrace/',
    f'/{LANG}/fotky-a-video/',
    f'/{LANG}/pristupnost/',
}

# Stránky, které je v pohodě nemít přímo v menu/footeru, pokud na ně ukazují
# stránky z menu/footeru (subpages, dynamické). Sem patří např. detail frakce.
ALLOWED_NOT_IN_NAV = {
    # /cs/frakce/[slug]/ — dosažitelné z /cs/frakce/ hubu
    f'/{LANG}/frakce/dwarves/',
    f'/{LANG}/frakce/harad/',
    f'/{LANG}/frakce/elves/',
    f'/{LANG}/frakce/gondor/',
    f'/{LANG}/frakce/umbar/',
    f'/{LANG}/frakce/skreti/',
    f'/{LANG}/frakce/skuruti/',
    f'/{LANG}/frakce/vrchovina/',
    f'/{LANG}/frakce/rohan/',
    # Lore subpages — dosažitelné z /cs/svet-stredozeme/ hubu
    f'/{LANG}/svet-stredozeme/casova-linka/',
    f'/{LANG}/svet-stredozeme/kralovstvi-a-rise/',
    f'/{LANG}/svet-stredozeme/mistopis/',
    f'/{LANG}/svet-stredozeme/narody/',
    f'/{LANG}/svet-stredozeme/slovnicek/',
    f'/{LANG}/svet-stredozeme/specificke-jednotky/',
    f'/{LANG}/svet-stredozeme/uvod-do-sveta/',
    # Role stránky — dosažitelné z /cs/frakce/ hubu (#role) a sidebaru detailů
    f'/{LANG}/role/nebojovy-doprovod/',
    f'/{LANG}/role/fotografove-a-kameramani/',
    f'/{LANG}/role/stankari/',
    f'/{LANG}/role/pomocnici/',
    f'/{LANG}/role/hobiti/',
    f'/{LANG}/role/organizatori/',
    # Sub-stránky /registrace/ — dosažitelné z /cs/registrace/
    f'/{LANG}/registrace/kdyz-je-poplatek-problem/',
}


class LinksExtractor(HTMLParser):
    """Vytáhne všechny <a href> a <button data-cookie-action> + všechna id.
    Rozliší podle nadřazeného region elementu (header/footer/main)."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links_header: list[tuple[str, int]] = []   # (href, line)
        self.links_footer: list[tuple[str, int]] = []
        self.links_main: list[tuple[str, int]] = []
        self.ids: set[str] = set()
        self.cookie_actions_in_footer: list[str] = []
        # stack regionu: 'header' | 'footer' | 'main' | None
        self.region_stack: list[str | None] = []

    def _attr(self, attrs, name):
        for k, v in attrs:
            if k == name:
                return v
        return None

    def _current_region(self) -> str | None:
        for r in reversed(self.region_stack):
            if r:
                return r
        return None

    def handle_starttag(self, tag, attrs):
        # Region tracking
        if tag == 'header':
            self.region_stack.append('header')
        elif tag == 'footer':
            self.region_stack.append('footer')
        elif tag == 'main':
            self.region_stack.append('main')
        else:
            self.region_stack.append(None)

        # Sbírej id — odkudkoli
        elem_id = self._attr(attrs, 'id')
        if elem_id:
            self.ids.add(elem_id)

        # Sbírej a tagy
        if tag == 'a':
            href = self._attr(attrs, 'href')
            if not href:
                return
            line, _ = self.getpos()
            region = self._current_region()
            if region == 'header':
                self.links_header.append((href, line))
            elif region == 'footer':
                self.links_footer.append((href, line))
            elif region == 'main':
                self.links_main.append((href, line))
            # mimo region (např. <body> přímo) ignorujeme
        elif tag == 'button':
            action = self._attr(attrs, 'data-cookie-action')
            if action and self._current_region() == 'footer':
                self.cookie_actions_in_footer.append(action)

    def handle_endtag(self, tag):
        if self.region_stack:
            self.region_stack.pop()


def extract(html_path: Path):
    p = LinksExtractor()
    try:
        p.feed(html_path.read_text(encoding='utf-8'))
    except Exception as e:
        print(f'WARN: parse error {html_path}: {e}', file=sys.stderr)
    return p


def url_to_dist_path(url: str) -> Path | None:
    """Z URL ve tvaru /cs/foo/ vrať dist/cs/foo/index.html, jinak None."""
    if not url.startswith('/'):
        return None
    if not url.endswith('/') and '#' not in url and '.' not in url.rsplit('/', 1)[-1]:
        # bez trailing slash a bez koncovky — zkus to s trailing slash
        url = url + '/'
    parsed = urlparse(url)
    path = parsed.path.lstrip('/')
    if path.endswith('/') or path == '':
        candidate = DIST / path / 'index.html'
    else:
        candidate = DIST / path
    return candidate


def normalize_internal(href: str) -> str:
    """Vrať canonical /cs/.../ URL bez fragmentu/query, s trailing slash."""
    parsed = urlparse(href)
    path = parsed.path
    if path and not path.endswith('/'):
        # pokud končí .html nebo .xml, nech bez slash; jinak přidej
        last = path.rsplit('/', 1)[-1]
        if '.' not in last:
            path += '/'
    return path


def is_internal(href: str) -> bool:
    if href.startswith('mailto:') or href.startswith('tel:'):
        return False
    if href.startswith('http://') or href.startswith('https://'):
        return False
    if href.startswith('//'):
        return False
    if href.startswith('#'):
        return True  # in-page hash
    if href.startswith('/'):
        return True
    # relativní, např. ../foo
    return True


# Obrázky/dokumenty — broken target je problém pro asset, ne navigaci
ASSET_EXTS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif',
              '.pdf', '.doc', '.docx', '.zip', '.mp4', '.webm'}

def is_asset_link(href: str) -> bool:
    parsed = urlparse(href)
    path = parsed.path.lower()
    last = path.rsplit('/', 1)[-1] if '/' in path else path
    if '.' not in last:
        return False
    ext = '.' + last.rsplit('.', 1)[-1]
    return ext in ASSET_EXTS


def main():
    if not LANG_ROOT.exists():
        print(f'ERROR: {LANG_ROOT} neexistuje. Spusť `npm run build` nejdřív.', file=sys.stderr)
        return 1

    # 1) Sezbírej všechny HTML stránky
    html_files = sorted(LANG_ROOT.rglob('*.html'))

    # 2) Extrakce
    page_data: dict[Path, LinksExtractor] = {}
    page_url: dict[Path, str] = {}
    for hf in html_files:
        rel = hf.relative_to(DIST).as_posix()
        # dist/cs/foo/index.html → /cs/foo/
        if rel.endswith('/index.html'):
            url = '/' + rel[: -len('index.html')]
        else:
            url = '/' + rel
        page_url[hf] = url
        page_data[hf] = extract(hf)

    # 3) Mapy stránek
    all_urls = set(page_url.values())  # všechny canonical URL
    url_to_path = {v: k for k, v in page_url.items()}

    # 4) Validace
    broken_links: list[tuple[str, str, str, int]] = []   # (page, href, region, line)
    broken_assets: list[tuple[str, str, str, int]] = []  # missing image/file targets
    broken_anchors: list[tuple[str, str, str, str, int]] = []  # (page, href, target_url, hash, line)
    referenced_urls: set[str] = set()  # množina canonical URL, na které se odkazuje (z mainu kdekoli)
    referenced_from_header: set[str] = set()
    referenced_from_footer: set[str] = set()

    external_links: defaultdict[str, list[str]] = defaultdict(list)
    mailto_links: defaultdict[str, list[str]] = defaultdict(list)

    for hf, ext in page_data.items():
        url = page_url[hf]
        for region, links in [('header', ext.links_header), ('footer', ext.links_footer), ('main', ext.links_main)]:
            for href, line in links:
                if href.startswith('mailto:'):
                    mailto_links[href].append(url)
                    continue
                if href.startswith('tel:'):
                    continue
                if href.startswith('http://') or href.startswith('https://') or href.startswith('//'):
                    external_links[href].append(url)
                    continue
                if href.startswith('#'):
                    # in-page hash — ověř proti aktuální stránce
                    target_id = href[1:]
                    if target_id and target_id not in ext.ids:
                        broken_anchors.append((url, href, url, target_id, line))
                    continue
                # interní cesta
                parsed = urlparse(href)
                target_path = parsed.path
                target_hash = parsed.fragment
                # canonical target URL
                if target_path:
                    if not target_path.endswith('/') and '.' not in target_path.rsplit('/', 1)[-1]:
                        target_path = target_path + '/'
                else:
                    target_path = url  # in-page (#hash bez path)

                target_url = target_path
                # zaznamenej referenci
                if region == 'header':
                    referenced_from_header.add(target_url)
                if region == 'footer':
                    referenced_from_footer.add(target_url)
                referenced_urls.add(target_url)

                # broken URL?
                if target_url not in all_urls and target_url != url:
                    # zkus i bez trailing slash
                    alt = target_url.rstrip('/')
                    if alt + '/' not in all_urls and alt not in all_urls:
                        # Asset (image/PDF/...) — separátní kategorie
                        if is_asset_link(href):
                            # Ověř, jestli soubor opravdu existuje
                            asset_path = DIST / parsed.path.lstrip('/')
                            if not asset_path.exists():
                                broken_assets.append((url, href, region, line))
                        else:
                            broken_links.append((url, href, region, line))
                        continue

                # hash check
                if target_hash:
                    target_file = url_to_path.get(target_url)
                    if target_file and target_file in page_data:
                        target_ids = page_data[target_file].ids
                        if target_hash not in target_ids:
                            broken_anchors.append((url, href, target_url, target_hash, line))

    # 5) Orphan check — stránky, na které neexistuje žádný odkaz
    # Vyloučíme samotnou homepage (vstupní bod) a explicitně povolené.
    orphans: list[str] = []
    for u in sorted(all_urls):
        if u == f'/{LANG}/':
            continue  # homepage je root
        if u == '/':
            continue
        if u not in referenced_urls and u not in ALLOWED_NOT_IN_NAV:
            orphans.append(u)

    # 6) Pages chybějící v Header navigation
    in_header_only = referenced_from_header
    pages_missing_in_header: list[str] = []
    for u in sorted(all_urls):
        if u == f'/{LANG}/' or u == '/':
            continue
        if u in ALLOWED_NOT_IN_NAV:
            continue
        if u not in in_header_only and u not in referenced_from_footer:
            # stránka není ani v hlavičce ani v patičce — to je problém pro audit
            pages_missing_in_header.append(u)

    # 7) Legal pages MUST be in footer
    legal_missing_in_footer = []
    for u in sorted(LEGAL_REQUIRED_IN_FOOTER):
        if u not in referenced_from_footer:
            legal_missing_in_footer.append(u)

    # === REPORT ===
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    lines: list[str] = []
    lines.append('# Audit odkazů a navigace — Pán Prstenů 2026\n')
    lines.append(f'> **Vygenerováno:** 1. května 2026  ')
    lines.append(f'> **Stránek auditováno:** {len(html_files)} (jazyk: `{LANG}`)  ')
    lines.append(f'> **Externí odkazy:** {len(external_links)} unikátních URL  ')
    lines.append(f'> **Mailto:** {len(mailto_links)} unikátních adres\n')
    lines.append('---\n')

    # 1. Broken links
    lines.append('## 1) Broken interní odkazy\n')
    if broken_links:
        lines.append('| Zdrojová stránka | Region | Href | Řádek |')
        lines.append('|---|---|---|---|')
        for page, href, region, line in broken_links:
            lines.append(f'| `{page}` | {region} | `{href}` | {line} |')
        lines.append('')
    else:
        lines.append('✅ **Žádné broken interní odkazy.**\n')

    # 1b. Broken assets (image/PDF) — kategorie informativní, ne fatal
    lines.append('### 1b) Broken assety (chybějící obrázky / PDF / videa)\n')
    if broken_assets:
        lines.append('Tyto cíle jsou _assety_ (`.jpg`, `.png`, `.pdf`, …), které ještě neexistují '
                     'v `public/`. Není to chyba navigace — je to chybějící content asset.\n')
        lines.append('| Zdrojová stránka | Region | Asset | Řádek |')
        lines.append('|---|---|---|---|')
        for page, href, region, line in broken_assets:
            lines.append(f'| `{page}` | {region} | `{href}` | {line} |')
        lines.append('')
    else:
        lines.append('✅ **Všechny obrazové a souborové assety existují.**\n')

    # 2. Broken anchors
    lines.append('## 2) Broken hash kotvy\n')
    if broken_anchors:
        lines.append('| Zdrojová stránka | Href | Cílová stránka | Chybějící ID | Řádek |')
        lines.append('|---|---|---|---|---|')
        for page, href, target, hsh, line in broken_anchors:
            lines.append(f'| `{page}` | `{href}` | `{target}` | `#{hsh}` | {line} |')
        lines.append('')
    else:
        lines.append('✅ **Všechny hash kotvy mají existující cíl.**\n')

    # 3. Orphan pages
    lines.append('## 3) Orphan stránky (neexistuje žádný interní odkaz)\n')
    if orphans:
        for u in orphans:
            lines.append(f'- `{u}`')
        lines.append('')
    else:
        lines.append('✅ **Všechny stránky mají alespoň jeden příchozí interní odkaz.**\n')

    # 4. Pages chybějící v Header/Footer
    lines.append('## 4) Stránky chybějící v Header (megamenu) i Footer\n')
    if pages_missing_in_header:
        for u in pages_missing_in_header:
            lines.append(f'- `{u}`')
        lines.append('')
    else:
        lines.append('✅ **Všechny stránky jsou dosažitelné z Headeru nebo Footeru.**\n')

    # 5. Legal pages in footer
    lines.append('## 5) Legislativní stránky ve Footeru\n')
    lines.append('Tyto stránky **musí** být odkazované z patičky (cookies, GDPR, podmínky, fotky a video, přístupnost):\n')
    for u in sorted(LEGAL_REQUIRED_IN_FOOTER):
        in_footer = u in referenced_from_footer
        mark = '✅' if in_footer else '❌'
        lines.append(f'- {mark} `{u}`')
    lines.append('')
    if legal_missing_in_footer:
        lines.append('### Chybí ve footeru:')
        for u in legal_missing_in_footer:
            lines.append(f'- `{u}`')
        lines.append('')

    # 6. Header coverage
    lines.append('## 6) Pokrytí stránek v hlavičce (megamenu)\n')
    lines.append('Stránky odkazované z `<header>` (přímý link nebo megamenu):\n')
    for u in sorted(referenced_from_header):
        lines.append(f'- `{u}`')
    lines.append('')

    # 7. Footer coverage
    lines.append('## 7) Pokrytí stránek v patičce\n')
    lines.append('Stránky odkazované z `<footer>`:\n')
    for u in sorted(referenced_from_footer):
        lines.append(f'- `{u}`')
    lines.append('')

    # 8. Externí odkazy (přehled, nejde o problém)
    lines.append('## 8) Externí odkazy\n')
    if external_links:
        lines.append('| URL | Použito na stránkách |')
        lines.append('|---|---|')
        for url, pages in sorted(external_links.items()):
            lines.append(f'| `{url}` | {len(set(pages))} |')
        lines.append('')

    # 9. Mailto
    lines.append('## 9) Mailto odkazy\n')
    if mailto_links:
        for addr, pages in sorted(mailto_links.items()):
            lines.append(f'- `{addr}` — {len(set(pages))} stránek')
        lines.append('')

    OUT_PATH.write_text('\n'.join(lines), encoding='utf-8')

    # Stručný shrnující výstup do konzole
    print(f'== AUDIT REPORT ==')
    print(f'Stránek: {len(html_files)}')
    print(f'Broken interní odkazy (page-level): {len(broken_links)}')
    print(f'Broken assety (image/PDF): {len(broken_assets)}  (informativní)')
    print(f'Broken hash kotvy: {len(broken_anchors)}')
    print(f'Orphan stránky: {len(orphans)}')
    print(f'Stránky chybějící v Header+Footer: {len(pages_missing_in_header)}')
    print(f'Legal v footeru chybí: {len(legal_missing_in_footer)}')
    print(f'Report: {OUT_PATH}')

    # Fatal jen na navigaci, assety jsou informativní
    has_navigation_problems = bool(
        broken_links or broken_anchors or orphans
        or pages_missing_in_header or legal_missing_in_footer
    )
    return 1 if has_navigation_problems else 0


if __name__ == '__main__':
    sys.exit(main())
