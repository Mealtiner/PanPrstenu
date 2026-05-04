# Roadmap — Pán Prstenů web

**Aktualizováno:** 2026-05-04
**Aktuální verze:** v2.1.0
**Cíl:** MVP launch 1. 5. 2026 (cíl) / 15. 5. 2026 (realistický)
**Akce:** 20.–23. 8. 2026

> Tento dokument je prioritizovaný seznam **otevřených úkolů** napříč
> všemi oblastmi (obsah, technika, infrastruktura, marketing). Každý
> úkol má odhad pracnosti, prioritu, kontext a akceptační kritéria.

---

## Legenda priorit

- **P0** 🔴 — blokátor launchu / kritická chyba
- **P1** 🟠 — high — udělat před launchem
- **P2** 🟡 — medium — chtělo by, ale launch může bez toho
- **P3** 🟢 — low / nice to have — po launchu

Odhad pracnosti: **XS** = <1h, **S** = 1–4h, **M** = 4h–1den, **L** = 1–3 dny, **XL** = 1+ týden.

---

# OBSAH (texty, překlady, lore data)

## 🔴 P0 — Obsah, který blokuje launch

### [ ] Překlad lore dat armád do EN/DE/SK/UK
- **Pracnost:** XL (~5 dnů na všech 9 armád × 4 jazyky)
- **Kontext:** Aktuálně `src/content/factions/*.yml` má `i18n.{en,de,sk,uk}` jako kopii CS placeholderu. Strukturně to je přeloženo, ale fakticky to jsou CS texty pro non-CS uživatele.
- **Co konkrétně:**
  - `combat_style[]`, `recommended_for[]`, `not_recommended_for[]`, `tags[]`
  - `newbie_costume_hint`, `camp_hook`, `costume_colors_text`, `heraldry_text`
  - `ruler.title`, `ruler.description`
  - `lore_sections[].title`, `lore_sections[].paragraphs[]` (cca 1500–3000 slov per armáda)
- **Akceptace:** `docs/translation-status.md` ukazuje pro `factions/*` všech 5 jazyků jako `✅ full`.
- **Pozn.:** Lze delegovat překladateli nebo udělat přes překladač + revize.

### [ ] Překlad lore dat svět-stredozeme
- **Pracnost:** L (~2 dny)
- **Soubory:** `src/content/pages/svet-stredozeme/{mistopis,narody}/{en,de,sk,uk}.json` — `regions[].places[].desc`, `peoples[].paragraphs[]`
- **Aktuálně:** Non-CS varianty mají CS body s `lang_notice` AlertBoxem.
- **Akceptace:** Místa a národy popsány v každém jazyce, lang_notice odstraněn.

### [ ] Překlad markdown legal stránek
- **Pracnost:** M (~6h)
- **Soubory:** `src/content/pages-long/{cookies,gdpr,podminky-ucasti-a-registrace,pravidla,pro-novacky}/{en,de,sk,uk}.md`
- **Aktuálně:** Body je CS placeholder, frontmatter je přeložen.
- **Pozn.:** Pro legal stránky stačí čerstvý body v EN; DE/SK/UK lze odkázat na EN přes `legal.jurisdiction_notice`.
- **Akceptace:** EN má vlastní body; DE/SK/UK alespoň 1 odstavec úvodu + odkaz na CS originál (EN volitelně).

## 🟠 P1 — High obsahové

### [ ] Reálné fotky armád místo placeholderu
- **Pracnost:** L (focení + úprava)
- **Aktuálně:** `public/images/armady/{slug}-{dark,light}.webp` jsou patrně AI-generované nebo z předchozích ročníků.
- **Akceptace:** Každá armáda má 1 hero fotku z reálné akce, optimalizovanou ve formátu WebP + AVIF.

### [ ] Skutečné jméno + fotka organizátorů
- **Pracnost:** S (data) + M (focení)
- **Soubor:** `src/content/pages/role/organizatori/{lang}.json` — aktuálně `name_placeholder: "Konkrétní jméno: bude doplněno"`
- **Akceptace:** Jména a fotky 8 týmových rolí.

### [ ] Doplnění konkrétních cen do registrace
- **Pracnost:** S
- **Soubor:** `src/content/pages/registrace/cs.json` — tabulka cen má placeholdery
- **Akceptace:** Schválené ceny v tabulce v cs.json.

### [ ] Aktuální FAQ (revize obsahu)
- **Pracnost:** M
- **Soubor:** `src/data/faq.ts` (1167 řádků)
- **Aktuálně:** ~17 kategorií × 100 Q&A × 5 jazyků (auto-generováno)
- **Akceptace:** Michal Truhlář projde FAQ a doplní/upraví podle předchozích ročníků.

## 🟡 P2 — Medium obsahové

### [ ] Příběh ročníku 2026 (`/pribeh/`)
- **Pracnost:** M
- **Aktuálně:** Stránka existuje s placeholder textem.
- **Akceptace:** Konkrétní zápletka ročníku 2026 (motivy stran, klíčové postavy, gradace) napsaná organizátory.

### [ ] Galerie z předchozích ročníků
- **Pracnost:** L (kurátor + úprava)
- **Soubor:** `src/pages/[lang]/galerie/index.astro` + `public/images/galerie/`
- **Akceptace:** Min. 30 fotek z 2024+2025 ročníků seřazených chronologicky.

### [ ] Citáty + ohlasy účastníků
- **Pracnost:** S
- **Soubor:** `src/content/pages/ohlasy/{lang}.json`
- **Akceptace:** 10–20 ověřených citátů s jménem (nebo přezdívkou) účastníka, datum ročníku, foto je volitelné.

---

# PERFORMANCE

## 🟠 P1

### [ ] Migrace YouTube embed → lokální video (Hero)
- **Pracnost:** M (export videa + integration)
- **Aktuálně:** Hero používá YouTube iframe (~500 KB JS, externí dependency, GDPR concern). v2.1 už neload na mobilu.
- **Cíl:** `<video poster="hero-poster.webp">` s `.webm`/`.mp4` (cca 2–4 MB pro 30s loop) v `public/videos/`.
- **Pros:** Eliminuje youtube-nocookie.com dependency, plnou kontrolu, žádný IFrame API JS.
- **Akceptace:** Hero přehrává lokální video bez externí service.

### [ ] AVIF formát obrázků
- **Pracnost:** S
- **Aktuálně:** Vše je WebP.
- **Cíl:** `<picture>` s `<source type="image/avif">` + `<source type="image/webp">` + `<img>` fallback.
- **Akceptace:** Lighthouse auditor neflaguje image format.

## 🟡 P2

### [ ] Critical CSS inlining
- **Pracnost:** S
- **Aktuálně:** Astro `inlineStylesheets: 'auto'` (smart default).
- **Test:** Nastavit `'always'` a změřit dopad na FCP / TBT.
- **Akceptace:** Buď zlepšení >5% FCP, nebo závěr "auto je optimální".

### [ ] Service Worker (offline fallback)
- **Pracnost:** M
- **Cíl:** Cache hlavních stránek (úvod, registrace, pravidla) pro offline. Vhodné pro účastníky na akci s nestabilním připojením.
- **Akceptace:** Při výpadku sítě se zobrazí cached úvodní stránka místo offline browseru.

### [ ] Image lazy-loading audit
- **Pracnost:** XS
- **Cíl:** Ověřit že hero image NEMÁ `loading="lazy"` (musí být eager pro LCP).
- **Akceptace:** Hero poster: `fetchpriority="high"`, ne lazy. Vše ostatní lazy.

---

# SEO

## 🟠 P1

### [ ] Reálné OG image (Open Graph)
- **Pracnost:** S
- **Aktuálně:** `BaseLayout.astro` má default OG image, ale není custom designed.
- **Cíl:** 1200×630 OG image s logem + tagline + datum, optimalizované pro FB/Twitter/LinkedIn preview.
- **Akceptace:** Sdílení odkazu na FB ukazuje krásnou kartu.

### [ ] Sitemap quality audit
- **Pracnost:** XS
- **Aktuálně:** Astro generuje `sitemap-index.xml` automaticky.
- **Cíl:** Ověřit `priority`, `changefreq`, `lastmod`, `<xhtml:link rel="alternate">` pro 5 jazyků.
- **Akceptace:** Google Search Console accepts bez warning.

### [ ] Robots.txt finalizace
- **Pracnost:** XS
- **Aktuálně:** `Allow: /`, sitemap odkaz.
- **Cíl:** Po DNS switchi na `panprstenu.cz` sundat `noindex` env z production.
- **Akceptace:** Live `panprstenu.cz/robots.txt` umožňuje indexaci.

### [ ] Canonical URLs ověření
- **Pracnost:** XS
- **Akceptace:** Každá stránka v každém jazyce má jeden canonical, hreflang alternates pro ostatní.

## 🟡 P2

### [ ] Google Search Console setup
- **Pracnost:** XS
- **Cíl:** Registrace property, submit sitemap, monitoring crawl errors.

### [ ] Structured data testing
- **Pracnost:** S
- **Cíl:** Otestovat Schema.org Event, Organization, FAQPage, NewsArticle přes [Google Rich Results Test](https://search.google.com/test/rich-results).
- **Akceptace:** Žádné errors, warnings minimální.

### [ ] Internal linking audit
- **Pracnost:** S
- **Cíl:** Z každé stránky alespoň 3–5 internal links na relevantní stránky.

---

# CMS / Admin

## 🟡 P2

### [ ] Sveltia CMS (nebo alternativa) integrace
- **Pracnost:** L
- **Cíl:** Editor pro Michala Truhláře a další org-team členy bez znalosti gitu.
- **Aktuálně:** Struktura JSON / Markdown / YAML je CMS-ready (viz `docs/HANDOFF-v2.1.md`).
- **Možnosti:**
  - **Sveltia CMS** — free, open-source, edituje přímo git. Self-hosted nebo přes Netlify/CloudFlare.
  - **Decap CMS** (formerly Netlify CMS) — free, edituje git.
  - **Directus** — full headless CMS s DB pod kapotou (víc featur, víc komplexity).
  - **TinaCMS** — free pro open-source projekty.
- **Doporučení:** Sveltia (lehká, git-based, perfektně pasuje k aktuální architektuře).
- **Akceptace:** Org-team může přes web UI editovat JSON/MD soubory bez gitu.

### [ ] Migrace `src/data/faq.ts` → `src/content/faq/{lang}.json`
- **Pracnost:** M (1167 řádků TS → 5× JSON)
- **Důvod:** Pro plně CMS-ready FAQ. Aktuálně faq.ts má dynamic L() funkci pro per-lang URLs, kterou musí JSON nahradit s placeholdery typu `{lang}`.
- **Akceptace:** FAQ stránka funguje stejně, ale obsah edituje CMS.

### [ ] Migrace `src/data/navigation.ts` → JSON
- **Pracnost:** M
- **Důvod:** Aby Sveltia / Directus mohlo editovat menu.

### [ ] Faction YAML → JSON+MD format
- **Pracnost:** M
- **Důvod:** Konzistence s ostatními stránkami (audit doc to navrhl).
- **Format:** `src/content/factions/{slug}/meta.json` + `{slug}/{lang}.md` místo `{slug}.yml`.
- **Akceptace:** Schema upgrade + migration script + frakce/[slug].astro update.

---

# UX / DESIGN

## 🟠 P1

### [ ] Mobile menu reorganizace
- **Pracnost:** S
- **Aktuálně:** Hamburger menu funguje, ale po přidání hub stránek (v2.0) je hluboce vnořeno.
- **Cíl:** UX pass — zda hub stránka link je dostupná v mobile menu.
- **Akceptace:** Uživatel se dostane k hub stránce za max. 2 taps.

### [ ] Search v rámci celého webu (Pagefind)
- **Pracnost:** M
- **Cíl:** `Cmd+K` / vyhledávací box v headeru. Pagefind dělá static-time index z buildu.
- **Akceptace:** Uživatel může hledat napříč stránkami.

### [ ] Cookie banner (GDPR)
- **Pracnost:** M
- **Aktuálně:** `/cookies/` stránka popisuje cookies, ale nemáme implementovaný banner pro souhlas.
- **Cíl:** Implementovat banner při první návštěvě + Consent Mode v2 pro Google Analytics/Ads.
- **Akceptace:** Banner se zobrazí, uloží volbu do localStorage, respektuje volbu pro analytiku.

## 🟡 P2

### [ ] Print stylesheet
- **Pracnost:** S
- **Cíl:** Krásné vytištění pravidel, harmonogramu, registrační smlouvy.

### [ ] Dark/Light theme test
- **Pracnost:** S
- **Cíl:** Projít všechny stránky v light theme a opravit kontrast / čitelnost.

### [ ] Animace audit
- **Pracnost:** XS
- **Cíl:** Ověřit že všechny animace respektují `prefers-reduced-motion`.

---

# TESTING

## 🟠 P1

### [ ] E2E testy klíčových flows (Playwright)
- **Pracnost:** L
- **Cíl:** Pokrytí pro:
  - Otevření úvodní stránky → klik na CTA → registrace
  - Změna jazyka cs ↔ en
  - Otevření cookies → změna preferencí
  - Mobile menu → navigace
- **Akceptace:** CI běží Playwright na každý PR.

### [ ] Lighthouse CI v GitHub Actions
- **Pracnost:** S
- **Cíl:** Automaticky měřit performance/SEO score per commit.
- **Akceptace:** Lighthouse CI běží, výsledky v PR komentech.

## 🟡 P2

### [ ] Visual regression tests (Percy / Chromatic)
- **Pracnost:** M
- **Cíl:** Detect visual regressions automatically.

### [ ] axe-core a11y testy
- **Pracnost:** S
- **Cíl:** Automatické testy přístupnosti.

---

# INFRASTRUKTURA / DEPLOY

## 🟠 P1

### [ ] DNS přepnutí na produkční doménu (den D)
- **Pracnost:** XS (akce technická)
- **Aktuálně:** Web na `new.panprstenu.cz`, čeká se na DNS switch.
- **Akceptace:** `panprstenu.cz` zobrazuje aktuální produkci.
- **Před tím:** odstranit `noindex` ENV var.

### [ ] Backup + recovery plán
- **Pracnost:** S
- **Cíl:** Pravidelný export Registračka.cz dat. Git repo redundance (GitHub + GitLab mirror?).

### [ ] Monitoring (uptime + error tracking)
- **Pracnost:** S
- **Cíl:** UptimeRobot / Pingdom pro panprstenu.cz, Sentry pro JS errors (volitelné).

## 🟡 P2

### [ ] CDN (Cloudflare?)
- **Pracnost:** S
- **Aktuálně:** WebGlobe SFTP server.
- **Cíl:** Cloudflare proxy pro DDoS protection, edge caching.

### [ ] Brotli komprese ověření na WebGlobe
- **Pracnost:** XS
- **Cíl:** Ověřit že `mod_brotli` na WebGlobe Apache opravdu funguje (`.htaccess` ho aktivuje, ale nemusí být nainstalovaný).
- **Akceptace:** `curl -H "Accept-Encoding: br"` vrací `Content-Encoding: br`.

---

# DOKUMENTACE

## 🟡 P2

### [ ] User-facing dokumentace pro CMS editor
- **Pracnost:** M
- **Cíl:** "Jak edituji obsah" guide pro Michala T. + další org-team členy.
- **Po čem:** Po Sveltia CMS integraci.

### [ ] CONTRIBUTING.md
- **Pracnost:** S
- **Cíl:** Pro budoucí přispěvatele — git flow, code style, jak přidat stránku.

### [ ] Architecture Decision Records (ADR)
- **Pracnost:** S
- **Cíl:** Zaznamenat klíčová rozhodnutí (Astro 6 vs 5, JSON vs MD, fonty self-hosted, atd.).

---

# ANALYTIKA + MARKETING

## 🟠 P1

### [ ] Google Analytics 4 setup
- **Pracnost:** S
- **Aktuálně:** `/cookies/` stránka mluví o GA4, ale nenasazeno.
- **Cíl:** GA4 tag s Consent Mode v2.
- **Akceptace:** Po opt-in souhlasu se posílá page view.

### [ ] Google Ads tag (volitelné)
- **Pracnost:** S
- **Cíl:** Pro budoucí kampaně (např. retargeting po Registracka.cz).

## 🟡 P2

### [ ] Newsletter (Mailchimp / SendinBlue)
- **Pracnost:** M
- **Cíl:** Sběr e-mailů pro updates ohledně akce.
- **Akceptace:** Form na webu → API → mailing list.

### [ ] Open Graph karty per stránka
- **Pracnost:** M
- **Cíl:** Custom OG image per stránka (např. armády mají vlastní obrázek).

---

# AUDIT REPORTY (auto-generované)

Spustit pravidelně pro tracking pokroku:

```bash
node --experimental-strip-types scripts/audit-pages.mjs --table > /tmp/audit.md
node --experimental-strip-types scripts/generate-cms-status.mjs       # → docs/cms-status.md
node --experimental-strip-types scripts/generate-translation-status.mjs # → docs/translation-status.md
```

Reporty:
- `docs/cms-status.md` — kde má každá stránka obsah uložen (json/md)
- `docs/translation-status.md` — kolik klíčů per jazyk × stránka je přeloženo

## Aktuální stav (2026-05-04)

- 🟢 **51/55 stránek** CMS-ready (texty externalizované)
- 🟠 **0** partial
- 🔴 **0** hardcoded
- ⚪ **4** n/a (redirecty + per-lang error pages)

Per-jazyk překlady (non-CS):
- ✅ **69** stránek s plným překladem (ve všech 4 non-CS jazycích = 276 hotových buněk)
- 🟡 **98** částečných (běžně přeložená UI, lore data CS)
- 🟠 **29** většinou CS placeholder (lore-heavy stránky)
- ⚠️ **8** čistý CS placeholder (markdown legal stránky pro non-CS)
- — **0** chybějících souborů

---

# Časová osa launchu

```
2026-04-29 ────●──── v1.0 MVP foundation (Astro 6, Tailwind 4, i18n)
2026-05-04 ────●──── v2.0 CMS-ready architektura
2026-05-04 ────●──── v2.1 Performance + self-hosted fonts
                │
                ↓
              [ NYNÍ ]
                │
2026-05-?? ────● ── P1 obsahové (lore translations, fotky, ceny)
2026-05-15 ────●──── 🎯 MVP launch (DNS switch panprstenu.cz)
2026-05-?? ────● ── P1 SEO (OG images, GSC setup, robots prod)
2026-05-?? ────● ── P1 analytika (GA4 + cookie banner)
2026-06-?? ────● ── P2 CMS integrace (Sveltia)
2026-07-?? ────● ── P2 testing (Playwright + Lighthouse CI)
                │
2026-08-20 ────●──── 🎉 Akce začíná
2026-08-22 ────●──── ⚔️ Hlavní bitva
```

---

# Kontakty

| Otázka | Kdo | Kontakt |
|---|---|---|
| Obsah, překlady, marketing | Michal Truhlář | info@panprstenu.cz |
| Pořadatel | Moravian LARP, z. s. | info@panprstenu.cz |
| Web technika | (delegováno na vývojáře) | — |

---

**Tento dokument je živý.** Aktualizovat při každé větší dokončené fázi.
Pro detailní stav technologie viz `docs/HANDOFF-v2.1.md`.
Pro changelog viz `VERSION.md`.
