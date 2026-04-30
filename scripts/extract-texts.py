#!/usr/bin/env python3
"""
Extraktor textů z buildovaných HTML stránek pro účely korektury.
Datum: 2026-04-30

Vstup:  dist/cs/**/*.html
Výstup: docs/audit/texty.md (jeden velký MD soubor s textovým obsahem
        každé stránky, organizováno podle URL).

Logika:
- vynechá <script>, <style>, <noscript>, <head>
- skipuje globální layout (Header, Footer, AccessibilityToolbar, CookieConsent,
  SideDrawers) — vyhledá <main id="main"> a extrahuje jen jeho obsah
- zachovává hierarchii nadpisů (h1–h6)
- vypisuje odstavce, položky seznamu, tlačítka, citace
- zachovává odkazy s cílem (jen text + → URL na samostatné řádky pro kontext)
- ignoruje SVG a aria-hidden ikony
"""
import sys
import re
from pathlib import Path
from html.parser import HTMLParser
from html import unescape


# ---- Pořadí stránek ve výstupu (logické skupiny, pak abeceda) ----------------
PAGE_ORDER = [
    # 1. Úvod a rozcestníky
    ('cs/index.html', '/cs/', 'Úvodní stránka'),
    ('cs/pribeh/index.html', '/cs/pribeh/', 'Příběh ročníku'),
    ('cs/pro-novacky/index.html', '/cs/pro-novacky/', 'Jedu poprvé'),
    # 2. Hra a svět
    ('cs/pravidla/index.html', '/cs/pravidla/', 'Pravidla a bezpečnost'),
    ('cs/frakce/index.html', '/cs/frakce/', 'Frakce a národy (hub)'),
    ('cs/frakce/gondor/index.html', '/cs/frakce/gondor/', 'Frakce — Gondor'),
    ('cs/frakce/rohan/index.html', '/cs/frakce/rohan/', 'Frakce — Rohan'),
    ('cs/frakce/elves/index.html', '/cs/frakce/elves/', 'Frakce — Elfové'),
    ('cs/frakce/dwarves/index.html', '/cs/frakce/dwarves/', 'Frakce — Trpaslíci'),
    ('cs/frakce/mordor/index.html', '/cs/frakce/mordor/', 'Frakce — Mordor'),
    ('cs/frakce/isengard/index.html', '/cs/frakce/isengard/', 'Frakce — Isengard'),
    ('cs/frakce/easterlings/index.html', '/cs/frakce/easterlings/', 'Frakce — Východňané'),
    ('cs/svet-stredozeme/index.html', '/cs/svet-stredozeme/', 'Svět Středozemě (lore)'),
    ('cs/hra-v-tabore/index.html', '/cs/hra-v-tabore/', 'Hra v táboře'),
    # 3. Děti
    ('cs/detska-hra/index.html', '/cs/detska-hra/', 'Hra pro malé dobrodruhy'),
    # 4. Praktické info
    ('cs/prakticke-info/index.html', '/cs/prakticke-info/', 'Praktické informace'),
    ('cs/organizacni-informace/index.html', '/cs/organizacni-informace/', 'Organizační informace'),
    ('cs/bezpecnost/index.html', '/cs/bezpecnost/', 'Bezpečnost'),
    ('cs/mapa/index.html', '/cs/mapa/', 'Mapa areálu'),
    # 5. Registrace a právo
    ('cs/registrace/index.html', '/cs/registrace/', 'Registrace a platební informace'),
    ('cs/podminky-ucasti-a-registrace/index.html', '/cs/podminky-ucasti-a-registrace/', 'Podmínky účasti a registrace'),
    ('cs/cookies/index.html', '/cs/cookies/', 'Cookies a nastavení soukromí'),
    ('cs/gdpr/index.html', '/cs/gdpr/', 'GDPR / Ochrana osobních údajů'),
    ('cs/fotky-a-video/index.html', '/cs/fotky-a-video/', 'Fotky a video — pravidla'),
    ('cs/pristupnost/index.html', '/cs/pristupnost/', 'Přístupnost'),
    ('cs/poradatel/index.html', '/cs/poradatel/', 'Pořadatel'),
    # 6. Komunita a obsah
    ('cs/novinky/index.html', '/cs/novinky/', 'Novinky'),
    ('cs/galerie/index.html', '/cs/galerie/', 'Galerie'),
    ('cs/faq/index.html', '/cs/faq/', 'FAQ'),
    ('cs/kontakt/index.html', '/cs/kontakt/', 'Kontakt'),
    # 7. Spolupráce / veřejnost
    ('cs/pro-media/index.html', '/cs/pro-media/', 'Pro média'),
    ('cs/pro-stankare/index.html', '/cs/pro-stankare/', 'Pro stánkaře a prodejce'),
    ('cs/stanky-a-prodejci/index.html', '/cs/stanky-a-prodejci/', 'Stánky a prodejci (seznam)'),
]


SKIP_TAGS = {'script', 'style', 'noscript', 'svg', 'head'}
HEADING_TAGS = {'h1', 'h2', 'h3', 'h4', 'h5', 'h6'}
TEXT_TAGS = {'p', 'li', 'dt', 'dd', 'th', 'td', 'figcaption', 'caption',
             'summary', 'blockquote', 'q', 'span', 'strong', 'em', 'b', 'i',
             'a', 'button', 'label', 'time', 'code', 'small'}
BLOCK_TAGS = {'div', 'section', 'article', 'main', 'aside', 'nav', 'header',
              'footer', 'ul', 'ol', 'dl', 'table', 'tr', 'tbody', 'thead',
              'form'}


VOID_TAGS = {'br', 'hr', 'img', 'input', 'meta', 'link', 'source',
             'wbr', 'area', 'base', 'col', 'embed', 'param', 'track',
             'path', 'circle', 'rect', 'line', 'polygon', 'use'}


class MainContentExtractor(HTMLParser):
    """Vyextrahuje obsah <main id="main"> jako čistou strukturu textu.

    Sleduje hloubku přes tag_stack: na start tag se pushne (tag, aria_hidden,
    is_skip). Na end tag pop posledního shodného. Tím se správně zavírají
    bloky aria-hidden a script/style/svg.
    """

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_main = False
        # Stack of dict: {'tag': str, 'aria_hidden': bool, 'skip': bool}
        # Push: na start tag (kromě void). Pop: na end tag dané značky (od konce).
        self.tag_stack = []
        self.lines = []
        self.current_buffer = []
        self.current_kind = None

    @property
    def skip_active(self):
        return any(e['skip'] for e in self.tag_stack)

    @property
    def aria_active(self):
        return any(e['aria_hidden'] for e in self.tag_stack)

    def _attr(self, attrs, name):
        for k, v in attrs:
            if k == name:
                return v
        return None

    def _flush(self):
        if self.current_buffer and self.current_kind:
            text = ' '.join(self.current_buffer).strip()
            text = re.sub(r'\s+', ' ', text)
            if text:
                self.lines.append((self.current_kind, text))
        self.current_buffer = []
        self.current_kind = None

    def _push_tag(self, tag, attrs):
        if tag in VOID_TAGS:
            return
        aria_hidden = self._attr(attrs, 'aria-hidden') == 'true'
        skip = tag in SKIP_TAGS
        self.tag_stack.append({'tag': tag, 'aria_hidden': aria_hidden, 'skip': skip})

    def _pop_tag(self, tag):
        # Hledej od konce stejnou značku; pokud nenajdeš, ignoruj (nevalidní HTML)
        for i in range(len(self.tag_stack) - 1, -1, -1):
            if self.tag_stack[i]['tag'] == tag:
                # Pop everything from i upwards (jakákoli neuzavřená vnořená)
                self.tag_stack = self.tag_stack[:i]
                return True
        return False

    def handle_starttag(self, tag, attrs):
        if tag == 'main':
            mid = self._attr(attrs, 'id')
            if mid == 'main' and not self.in_main:
                self.in_main = True
                self._push_tag(tag, attrs)
                return
            elif self.in_main:
                self._push_tag(tag, attrs)
                return
        if not self.in_main:
            return

        # Push do stacku (řeší aria-hidden + skip skrz boolean property)
        self._push_tag(tag, attrs)

        if self.skip_active or self.aria_active:
            return

        # Nadpisy
        if tag in HEADING_TAGS:
            self._flush()
            self.current_kind = tag
            self.current_buffer = []
            return

        # Paragrafy a list items — flush + nový kind
        if tag in {'p', 'li', 'dt', 'dd', 'figcaption', 'blockquote',
                   'th', 'td', 'summary'}:
            self._flush()
            kind_map = {'p': 'p', 'li': 'li', 'dt': 'dt', 'dd': 'dd',
                        'figcaption': 'p', 'blockquote': 'q',
                        'th': 'th', 'td': 'td', 'summary': 'summary'}
            self.current_kind = kind_map.get(tag, 'p')
            self.current_buffer = []
            return

        if tag == 'button':
            self._flush()
            self.current_kind = 'button'
            self.current_buffer = []
            return

    def handle_startendtag(self, tag, attrs):
        # Self-closing (např. <br />)
        if not self.in_main:
            return
        # Void tagy nepushujeme; ostatní neignorujeme (push+pop simulujeme přes aktuální flag)

    def handle_endtag(self, tag):
        if not self.in_main:
            return

        # Special: main close
        if tag == 'main':
            self._pop_tag(tag)
            # Jakmile se zavře jakákoli main, ukonči (nevnořujeme)
            if not any(e['tag'] == 'main' for e in self.tag_stack):
                self._flush()
                self.in_main = False
            return

        # Obecný pop
        was_in_skip = self.skip_active
        was_in_aria = self.aria_active
        self._pop_tag(tag)

        if self.skip_active or self.aria_active:
            return

        # Pokud jsme zrovna opustili skip/aria, flushni — nově začínající textový blok
        # by mohl mít chybný kontext.
        if was_in_skip or was_in_aria:
            return

        if tag in HEADING_TAGS or tag in {'p', 'li', 'dt', 'dd', 'figcaption',
                                            'blockquote', 'th', 'td', 'summary',
                                            'button'}:
            self._flush()
            return

    def handle_data(self, data):
        if not self.in_main or self.skip_active or self.aria_active:
            return
        if self.current_kind is None:
            return
        text = data.strip()
        if text:
            self.current_buffer.append(text)


def extract_page(html_path: Path):
    """Vrátí seznam (kind, text) pro stránku."""
    try:
        html = html_path.read_text(encoding='utf-8')
    except Exception as e:
        return [('error', f'Chyba čtení: {e}')]
    parser = MainContentExtractor()
    parser.feed(html)
    return parser.lines


def format_lines_to_md(lines):
    """Naformátuje list (kind, text) do Markdown bloku."""
    out = []
    seen_buttons = set()  # deduplikace tlačítek (Button komponenta vykresluje text 2× někdy)
    for kind, text in lines:
        text = unescape(text)
        if kind in HEADING_TAGS:
            level = int(kind[1])
            # h1 → ##, h2 → ###, h3 → ####, ... (root MD má # pro stránku)
            md_level = '#' * (level + 1)
            out.append(f'{md_level} {text}')
        elif kind == 'p':
            out.append(text)
        elif kind == 'li':
            out.append(f'- {text}')
        elif kind == 'dt':
            out.append(f'**{text}**  ')
        elif kind == 'dd':
            out.append(f'{text}')
        elif kind == 'q':
            out.append(f'> {text}')
        elif kind == 'th':
            out.append(f'**[hlavička tabulky]** {text}')
        elif kind == 'td':
            out.append(f'  · {text}')
        elif kind == 'summary':
            out.append(f'**[souhrn]** {text}')
        elif kind == 'button':
            if text in seen_buttons:
                continue
            seen_buttons.add(text)
            out.append(f'**[tlačítko]** {text}')
        else:
            out.append(text)
    return '\n\n'.join(out)


def main():
    repo = Path(__file__).resolve().parent.parent
    dist = repo / 'dist'
    out_path = repo / 'docs' / 'audit' / 'texty.md'

    if not dist.exists():
        print(f'ERROR: {dist} neexistuje. Spusť `npm run build` nejdřív.', file=sys.stderr)
        sys.exit(1)

    blocks = []
    blocks.append('# Texty na webu — pro korekturu\n')
    blocks.append('> **Vygenerováno:** 30. dubna 2026  ')
    blocks.append('> **Verze:** commit `c8fe034` (po audit balíku #5)  ')
    blocks.append('> **Zdroj:** extrakce z buildovaných HTML (`dist/cs/**/*.html`)  ')
    blocks.append('> **Pokrývá:** pouze obsah `<main>` (vynechán Header, Footer, ')
    blocks.append('> AccessibilityToolbar, CookieConsent, SideDrawers — globální komponenty).\n')
    blocks.append('---\n')
    blocks.append('## Obsah\n')

    # TOC
    for rel, url, name in PAGE_ORDER:
        anchor = url.strip('/').replace('/', '-')
        blocks.append(f'- [`{url}` — {name}](#{anchor})')
    blocks.append('\n---\n')

    for rel, url, name in PAGE_ORDER:
        html_path = dist / rel
        anchor = url.strip('/').replace('/', '-')
        blocks.append(f'\n<a id="{anchor}"></a>\n')
        blocks.append(f'# `{url}` — {name}\n')

        if not html_path.exists():
            blocks.append(f'_Soubor neexistuje: `dist/{rel}`._\n')
            continue

        lines = extract_page(html_path)
        if not lines:
            blocks.append('_(Žádný textový obsah extrahován z `<main>`.)_\n')
            continue
        blocks.append(format_lines_to_md(lines))
        blocks.append('\n---\n')

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text('\n'.join(blocks), encoding='utf-8')
    print(f'OK — zapsáno: {out_path}')
    print(f'Stránek: {len(PAGE_ORDER)}')
    size_kb = out_path.stat().st_size / 1024
    print(f'Velikost: {size_kb:.1f} KB')


if __name__ == '__main__':
    main()
