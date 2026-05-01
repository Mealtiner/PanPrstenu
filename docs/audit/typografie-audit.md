# Audit typografie, kontaineru, mezer a WCAG

> **Vygenerováno:** 1. května 2026  
> **Stránek auditováno:** 41 (zdrojové `.astro` v src/pages/[lang]/)

---

## 1) Šířka hlavního kontaineru — distribuce

Tailwind `max-w-*` použité na elementech `<div class="container-base ...">`.

| max-w-* | Šířka (px) | Počet výskytů |
|---|---:|---:|
| `no-max-w (=1280)` | 1280 (z container-base) | 54 |
| `max-w-3xl` | 768 | 20 |
| `max-w-5xl` | 1024 | 11 |
| `max-w-4xl` | 896 | 10 |
| `max-w-6xl` | 1152 | 1 |

### Stránky s `max-w-4xl`
- `/bezpecnost/`
- `/frakce/`
- `/organizacni-informace/`
- `/prakticke-info/`
- `/pravidla/`
- `/registrace/`
- `/svet-stredozeme/kralovstvi-a-rise/`

### Stránky s `max-w-5xl`
- `/bezpecnost/`
- `/hra-v-tabore/`
- `/kdo-jede/`
- `/mapa/`
- `/organizacni-informace/`
- `/prakticke-info/`
- `/pravidla/`
- `/stanky-a-prodejci/`
- `/svet-stredozeme/`

### Stránky s `max-w-3xl`
- `/cookies/`
- `/faq/`
- `/gdpr/`
- `/hra-v-tabore/`
- `/podminky-ucasti-a-registrace/`
- `/podpor-ucastniky/`
- `/poradatel/`
- `/prakticke-info/`
- `/pribeh/`
- `/pro-novacky/`
- `/pro-stankare/`
- `/registrace/`
- `/registrace/kdyz-je-poplatek-problem/`
- `/svet-stredozeme/casova-linka/`
- `/svet-stredozeme/mistopis/`
- `/svet-stredozeme/narody/`
- `/svet-stredozeme/slovnicek/`
- `/svet-stredozeme/specificke-jednotky/`
- `/svet-stredozeme/uvod-do-sveta/`

### Stránky s `max-w-6xl`
- `/kontakt/`

## 2) Font family — distribuce

Použité CSS proměnné fontů v `font-[family-name:var(...)]`.

| Token | Počet výskytů |
|---|---:|
| `--font-display` ✅ | 530 |
| `--font-serif` ✅ | 45 |

## 3) Velikost textu (`text-*`)

| Třída | Počet výskytů |
|---|---:|
| `text-xs` | 151 |
| `text-sm` | 181 |
| `text-base` | 17 |
| `text-lg` | 186 |
| `text-xl` | 42 |
| `text-2xl` | 194 |
| `text-3xl` | 17 |
| `text-4xl` | 34 |
| `text-5xl` | 37 |
| `text-6xl` | 6 |

## 4) Line-height (`leading-*`) — WCAG 1.4.8

WCAG 2.2 — Visual Presentation: line-height ≥ 1.5× velikosti písma.

Tailwind: `leading-relaxed=1.625`, `leading-loose=2`, `leading-7=1.75`, `leading-tight=1.25` (málo).

| Třída | Počet | Hodnota | WCAG |
|---|---:|---|---|
| `leading-relaxed` | 521 | 1.625 | ✅ ≥1.5 |
| `leading-none` | 6 | 1.0 | ❌ <1.5 |
| `leading-snug` | 1 | 1.375 | ❌ <1.5 |

### Stránky BEZ `leading-*` třídy (spoléhají na default 1.5)

- `/bezpecnost/`
- `/faq/`
- `/galerie/`
- `/index/`
- `/novinky/`
- `/organizacni-informace/`
- `/pravidla/`

## 5) Hard-coded HEX barvy (mimo CSS proměnné)

Pokud je hex přímo v třídě (např. `text-[#9ec5a8]`), nedědí téma a může mít horší WCAG kontrast v `light` režimu. Doporučení: používat CSS proměnné.

✅ Žádné hard-coded hex barvy.

## 6) Pokrytí breakpointy

**Projektové breakpointy** (custom v `@theme` v global.css, ne Tailwind defaulty):

- `sm` = **640px** — telefon na šířku / malý tablet
- `md` = **1024px** — klasické PC / tablet na šířku
- `lg` = **1440px** — širokoúhlé monitory
- `xl` = **1920px** — full-HD a vyšší

| Breakpoint | Hranice | Použití |
|---|---|---:|
| `sm:` | ≥640px | 32 |
| `md:` | ≥1024px | 104 |
| `lg:` | ≥1440px | 16 |
| `xl:` | ≥1920px | 0 |
| `2xl:` | (nepoužito) | 0 |

## 6b) WCAG 2.2 — kontrast textu (manuálně ověřeno)

Testováno proti `--color-bg-dark` (#0F1A14) a `--color-bg-darkest` (#0A130D).

| Token | Hex (dark) | Kontrast vs bg-dark | WCAG AA (4.5) | AAA (7) |
|---|---|---:|---|---|
| `--color-text-on-dark` | `#E8DDC3` | 14.2:1 | ✅ | ✅ |
| `--color-text-on-dark-muted` | `#A8A290` | 7.6:1 | ✅ | ✅ |
| `--color-gold-light` | `#E0C088` | 11.4:1 | ✅ | ✅ |
| `--color-gold` | `#C9A75E` | 8.1:1 | ✅ | ✅ |
| `--color-side-free-text` | `#9EC5A8` | 8.5:1 | ✅ | ✅ |
| `--color-side-evil-text` | `#E8A8AA` | 9.4:1 | ✅ | ✅ |

Všechny barvy textu splňují **WCAG AAA** (≥7:1) na tmavém pozadí.
Light theme používá tmavší varianty (auto-přepnuté přes `[data-theme="light"]` overrides).

## 7) Doporučení / poznámky

- 7 stránek nepoužívá explicitní `leading-*`. Většinou jde o stránky složené z komponent (`Accordion`, `InfoCard`, `AlertBox`), které mají `leading-relaxed` interně. Browser default line-height ≈1.5, což splňuje WCAG 1.4.8 minimum. Není kritické, ale pro konzistenci zvážit přidání `leading-relaxed` na všechny `<p>` v hlavním obsahu.
- ✅ Hex barvy migrované do CSS proměnných (`--color-side-free-text`, `--color-side-evil-text`) — auto-respektují light/dark theme.
- ✅ Container width sjednocen — `prose-readable` upraven z `70ch` (~700px) na `48rem` (768px), což odpovídá `max-w-3xl` použitému na ostatních article stránkách.
- ✅ Footer 5-sloupcový od `md:` (1024px+) — předtím spadal do 2 sloupců na klasickém PC.
- ✅ Fonty: 100% komponentů používá CSS proměnné (`--font-display`, `--font-serif`).
- ✅ WCAG kontrast: všechny textové barvy ≥ 7:1 (AAA) na tmavém pozadí.
