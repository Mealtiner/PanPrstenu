# HANDOFF — Stav projektu k 29. 4. 2026

**Pro:** Claude Code v VS Code (následné vlákno)
**Účel:** Předání plného kontextu, ať lze pokračovat plynule

> **Závazný zdroj pravidel = [CLAUDE.md](CLAUDE.md).** Tento dokument popisuje aktuální stav implementace, CLAUDE.md určuje pravidla a verze.

---

## ⚡ 30sekundový souhrn

Stavíme web pro larpovou akci **Pán Prstenů — Bitva o Středozem** (Moravian LARP, z. s.).
**Akce:** 20.–23. 8. 2026, **Strážovice, jižní Morava**, ~500 účastníků.
Stack: **statický web na Astro 6.1 + Tailwind 4.2 + Node 22.22.2 LTS**, deploy přes GitHub Actions na WebGlobe FTP do dvou jailed podúčtů (`dev@panprstenu.cz` a `new@panprstenu.cz`).

**Termín:** 1. 5. 2026 cíl / 15. 5. 2026 realistický MVP launch.

**Stack je čistý — žádný React, žádný Svelte, žádný peer dep konflikt** (CLAUDE.md §1).

**MVP scope je hotový** — chybí `npm install`, klientské texty, fotky a logo, zapojení FTP secrets v GitHub.

---

## 🎨 Co projekt staví

Na základě **12 designových mockupů** v [grafika/](grafika/) (READ-ONLY pro Claude Code, CLAUDE.md §11):
- **Image 1, 2:** Úvodní stránka (desktop + mobil)
- **Image 3, 4:** Stránka Pravidla (desktop + mobil)
- **Image 5, 6:** Frakce a národy (desktop + mobil)
- **Image 7, 8:** Praktické informace (desktop + mobil)
- **Image 9:** UI komponenty
- **Image 10:** Dekorativní prvky
- **Image 11:** Obsahové bloky
- **Image 12:** Formuláře a registrace

**Designový systém** (CLAUDE.md §4): tmavě zelená/zlatá/pergamen, fonty Cinzel + Cormorant Garamond + Inter, ornamentální prvky (◆, vosková pečeť, erbové medailony).

---

## ✅ Co je hotové

### Konfigurace
- [x] [package.json](package.json) — Astro 6.1.0, Tailwind 4.2.0, Node ≥22.12.0
- [x] [astro.config.mjs](astro.config.mjs) — `site: 'https://www.panprstenu.cz'` (CLAUDE.md §7), i18n (cs/en/de/sk), Tailwind via Vite, MDX, sitemap, ikony
- [x] [tsconfig.json](tsconfig.json) — path aliasy (CLAUDE.md §5)
- [x] [.nvmrc](.nvmrc) — Node 22.22.2
- [x] [.gitignore](.gitignore) — vč. zákazu `web/` (CLAUDE.md §9)

### DevOps (CLAUDE.md §7)
- [x] [.github/workflows/deploy-staging.yml](.github/workflows/deploy-staging.yml) — push `staging` → build → FTPS deploy přes účet `dev@panprstenu.cz` na `dev.panprstenu.cz`
- [x] [.github/workflows/deploy-production.yml](.github/workflows/deploy-production.yml) — push `main` → build (`PUBLIC_NOINDEX=true`) → FTPS deploy přes účet `new@panprstenu.cz` na `new.panprstenu.cz`
- [x] **Deploy přímo z `dist/`** — žádný mirror přes `web/dev/`/`web/new/` (zakázáno CLAUDE.md §9)
- [x] **Protokol:** FTPS over TLS, port 21 (WebGlobe). Možný upgrade na SFTP/22 (jiný GH action) až provider zpřístupní.

### Architektura
- [x] [src/i18n/ui.ts](src/i18n/ui.ts) — překlady pro 4 jazyky s fallback na cs (vč. FAQ a `hero.location_chip = "Strážovice, jižní Morava"`)
- [x] [src/content/config.ts](src/content/config.ts) — Content Collections **v Astro 6 syntaxi** (Content Layer API, Zod 4) — kolekce `pages`, `news`, `factions`
- [x] [src/styles/global.css](src/styles/global.css) — Tailwind 4 s `@theme` direktivou, design tokeny CLAUDE.md §4
- [x] [src/scripts/header.ts](src/scripts/header.ts) — sticky header + mobile menu
- [x] [public/favicon.svg](public/favicon.svg)

### Layout
- [x] [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro) — SEO meta, hreflang, OG, Twitter, **PUBLIC_NOINDEX env support pro NEW preprod**

### Komponenty — layout
- [x] [Logo.astro](src/components/layout/Logo.astro), [Header.astro](src/components/layout/Header.astro), [Footer.astro](src/components/layout/Footer.astro) (vč. lokality Strážovice)

### Komponenty — UI (10) ([src/components/ui/](src/components/ui/))
[Button](src/components/ui/Button.astro), [Input](src/components/ui/Input.astro), [Textarea](src/components/ui/Textarea.astro), [Select](src/components/ui/Select.astro), [Checkbox](src/components/ui/Checkbox.astro), [Radio](src/components/ui/Radio.astro), [Tag](src/components/ui/Tag.astro), [Badge](src/components/ui/Badge.astro), [Breadcrumb](src/components/ui/Breadcrumb.astro), [Pagination](src/components/ui/Pagination.astro)

### Komponenty — dekorativní (5) ([src/components/decorative/](src/components/decorative/))
[Divider](src/components/decorative/Divider.astro), [CornerOrnament](src/components/decorative/CornerOrnament.astro), [WaxSeal](src/components/decorative/WaxSeal.astro), [EmblemMedallion](src/components/decorative/EmblemMedallion.astro), [Ribbon](src/components/decorative/Ribbon.astro)

### Komponenty — bloky (7) ([src/components/blocks/](src/components/blocks/))
[InfoCard](src/components/blocks/InfoCard.astro), [Accordion](src/components/blocks/Accordion.astro), [Quote](src/components/blocks/Quote.astro), [Checklist](src/components/blocks/Checklist.astro), [AlertBox](src/components/blocks/AlertBox.astro), [EventStats](src/components/blocks/EventStats.astro), [SidebarNav](src/components/blocks/SidebarNav.astro)

### Komponenty — sekce (8) ([src/components/sections/](src/components/sections/))
[Hero](src/components/sections/Hero.astro), [QuickLinksTriad](src/components/sections/QuickLinksTriad.astro), [WhyJoin](src/components/sections/WhyJoin.astro), [Factions](src/components/sections/Factions.astro), [Program](src/components/sections/Program.astro), [RegistrationBox](src/components/sections/RegistrationBox.astro), [Gallery](src/components/sections/Gallery.astro), [FAQTeaser](src/components/sections/FAQTeaser.astro)

### Stránky (13 routes)
- [x] [src/pages/index.astro](src/pages/index.astro) — `/` redirect na `/cs/`
- [x] [src/pages/404.astro](src/pages/404.astro)
- [x] [src/pages/[lang]/index.astro](src/pages/[lang]/index.astro) — landing pro 4 jazyky
- [x] [src/pages/[lang]/pribeh/](src/pages/[lang]/pribeh/index.astro)
- [x] [src/pages/[lang]/pravidla/](src/pages/[lang]/pravidla/index.astro)
- [x] [src/pages/[lang]/frakce/](src/pages/[lang]/frakce/index.astro) — hub
- [x] [src/pages/[lang]/frakce/[slug].astro](src/pages/[lang]/frakce/[slug].astro) — detail (4 jazyky × 7 frakcí = 28 stránek)
- [x] [src/pages/[lang]/prakticke-info/](src/pages/[lang]/prakticke-info/index.astro) — vč. ~500 účastníků
- [x] [src/pages/[lang]/registrace/](src/pages/[lang]/registrace/index.astro)
- [x] [src/pages/[lang]/kontakt/](src/pages/[lang]/kontakt/index.astro)
- [x] [src/pages/[lang]/faq/](src/pages/[lang]/faq/index.astro)
- [x] [src/pages/[lang]/galerie/](src/pages/[lang]/galerie/index.astro)
- [x] [src/pages/[lang]/novinky/](src/pages/[lang]/novinky/index.astro)
- [x] [src/pages/[lang]/pro-novacky/](src/pages/[lang]/pro-novacky/index.astro)
- [x] [src/pages/[lang]/gdpr/](src/pages/[lang]/gdpr/index.astro)
- [x] [src/pages/[lang]/cookies/](src/pages/[lang]/cookies/index.astro)

### Seed data
- [x] [src/content/factions/](src/content/factions/) — 7 frakcí (Gondor, Rohan, Elfové, Trpaslíci × Mordor, Isengard, Východňané), všechny s i18n cs/en/de/sk

### Mimo build pipeline
- [x] [grafika/](grafika/) — zdrojové grafické podklady (mockupy Image 1–12, ikony, ornamenty); netranzituje do `dist/`, **READ-ONLY** (CLAUDE.md §9)

---

## 🔄 Změny po refaktoru CLAUDE.md (29. 4. 2026 odpoledne)

| Změna | Důvod |
|---|---|
| Smazána složka `web/dev/`, `web/new/` | Zakázáno CLAUDE.md §9 — deploy targety jsou na FTP, ne v repu |
| Přepsány workflowy — deploy z `dist/`, ne přes `web/*/` mirror | Stejný důvod |
| Workflowy používají oddělené secrets `DEV_USERNAME/PASSWORD` + `NEW_USERNAME/PASSWORD` | CLAUDE.md §7 — dva jailed podúčty na WebGlobe |
| Workflowy nastaveny na FTPS port 21 | WebGlobe FTPS over TLS (SamKirkland action SFTP nepodporuje; pro SFTP/22 by se přidal jiný action) |
| `PUBLIC_NOINDEX=true` v production buildu | CLAUDE.md §7 — NEW prostředí nesmí být indexováno |
| BaseLayout přidává `<meta robots noindex>` při env příznaku | Per-page `noIndex` prop má i nadále přednost |
| Footer: přidán řádek s lokalitou (Strážovice) | CLAUDE.md §0 |
| `hero.location_chip` → "Strážovice, jižní Morava" | Stejně |
| EventStats: `300+` → `~500` účastníků | CLAUDE.md §0 |
| Refaktor `text-[var(--text-Nxl)]` → `text-Nxl` napříč 21 soubory | Tailwind 4 generuje `text-3xl` atd. z `@theme` automaticky; bracket syntax pro font-size konfliktovala s `text-[var(--color-...)]` |
| Footer právní odkazy přesměrovány na existující `/registrace/` a `/pravidla/` | Předchozí `/podminky-registrace/` a `/pravidla-ucasti/` neexistovaly |

---

## 🟡 Co dělat dál

### Priorita 1 — pre-launch (do 1./15. 5. 2026)
- [ ] **`npm install`** v projektu
- [ ] **`npm run dev`** ověřit landing
- [ ] **`npm run build`** ověřit produkční build (vyřeší `npm` warningy o chybějících typech)
- [ ] **GitHub repo** — založit, pushnout do `main`/`staging`, zapojit branch protection na `main` (CLAUDE.md §7)
- [ ] **GitHub Secrets** — nastavit 7 secrets (CLAUDE.md §7):
  - `WEBGLOBE_FTP_HOST` = `62.109.151.48`
  - `WEBGLOBE_FTP_DEV_USERNAME` = `dev@panprstenu.cz`
  - `WEBGLOBE_FTP_DEV_PASSWORD`
  - `WEBGLOBE_FTP_DEV_PATH` = `/`
  - `WEBGLOBE_FTP_NEW_USERNAME` = `new@panprstenu.cz`
  - `WEBGLOBE_FTP_NEW_PASSWORD`
  - `WEBGLOBE_FTP_NEW_PATH` = `/`
- [ ] **Logo SVG** — nahradit placeholder v [Logo.astro](src/components/layout/Logo.astro)
- [ ] **Hero fotka** — `public/images/hero/taboriste.jpg` + odkomentovat tag v [Hero.astro](src/components/sections/Hero.astro)
- [ ] **Galerie fotek** — `public/images/gallery/2024-NN.jpg`, `2023-NN.jpg`
- [ ] **`public/apple-touch-icon.png`** (180×180) — generovat z finálního loga
- [ ] **OG default image** — `public/images/og-default.jpg` (1200×630)
- [ ] **Reálné texty** — finalizovat z migrace ze starého panprstenu.cz
- [ ] **URL na Registracka.cz** — doplnit konstantu `REGISTRATION_URL` v [registrace/index.astro](src/pages/[lang]/registrace/index.astro)
- [ ] **GDPR text** — schválení pověřencem; doplnit IČO Moravian LARP, z. s.

### Priorita 2 — post-launch (M3+)
- [ ] **Frakce — detail texty** — Markdown soubory v `src/content/pages/{lang}/frakce/<slug>.md`
- [ ] **Detail článku** — `src/pages/[lang]/novinky/[slug].astro`
- [ ] **Novinky** — 3+ úvodní články do `src/content/news/cs/`
- [ ] **Příběh — plný text** — z dramaturgie do 30. 6.
- [ ] **YouTube embed** — pod hero
- [ ] **Externí registrace** — buď jen odkaz, nebo iframe přes Registracka.cz

### Priorita 3 — vylepšení
- [ ] **Kontakt formulář s backendem** — Cloudflare Worker / Netlify Forms / EmailJS (zatím mailto)
- [ ] **CMS** — Sveltia CMS (M5+) napojit na content collections
- [ ] **Vyhledávání** — Pagefind nebo prostý fuse.js přes JSON
- [ ] **Tooltip / Toggle** komponenty
- [ ] **TicketCard / SuccessAlert / ErrorAlert / StepProcess** (Image 12)
- [ ] **Po DNS přepnutí na panprstenu.cz** — odebrat `PUBLIC_NOINDEX` z production workflow

---

## 📂 Důležitá rozhodnutí

| Otázka | Rozhodnutí | Zdroj |
|---|---|---|
| Astro verze | **6.1.x** | CLAUDE.md §1 |
| Tailwind verze | **4.2.x** (CSS-first config v `@theme`) | CLAUDE.md §1, §3 |
| Node verze | **22.22.2 LTS** — pinováno v `.nvmrc` | CLAUDE.md §1 |
| TypeScript | **5.9.x** (ne 6.0 — transition release) | CLAUDE.md §1 |
| Svelte/React/Vue | **NE** | CLAUDE.md §1 |
| Hosting | **WebGlobe FTP** (62.109.151.48) | CLAUDE.md §7 |
| Server-side: 2 jailed podúčty | `dev@panprstenu.cz` + `new@panprstenu.cz` | CLAUDE.md §7 |
| CI/CD | **GitHub Actions + FTP-Deploy v4.4.0**, FTPS port 21 | CLAUDE.md §7 |
| Astro `site` URL | **vždy `https://www.panprstenu.cz`** | CLAUDE.md §7 |
| NEW prostředí | `PUBLIC_NOINDEX=true` (preprod) | CLAUDE.md §7 |
| `web/` v repu | **NE** — generuje se na FTP, ne v repu | CLAUDE.md §9 |
| CMS | Žádný v M1/M2 (Sveltia až M5+) | CLAUDE.md §1 |
| i18n | 4 jazyky cs/en/de/sk, prefixDefaultLocale | CLAUDE.md §6 |
| Default jazyk | cs (galonech), ostatní fallback na cs | CLAUDE.md §6 |
| Accordion | Bezestavový (native `<details>`) — žádný JS | konvence |
| Registrace | Externí přes Registracka.cz | konvence |
| Kontakt formulář | Mailto (MVP); backend M3+ | konvence |

---

## 🚨 Astro 6 vs Astro 5 — kritické rozdíly

Pokud Claude Code vidí starší tutoriály, **neřiď se podle nich** (CLAUDE.md §2):

```ts
// ❌ STARÉ (Astro 5)
import { defineCollection, z } from 'astro:content';
const collection = defineCollection({
  type: 'content',  // ← V Astro 6 PRYČ
  schema: z.object({...}),
});

// ✅ NOVÉ (Astro 6)
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
const collection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/x' }),
  schema: z.object({...}),
});
```

A `entry.slug` → **`entry.id`**. **Tailwind 4** je CSS-first (žádný `tailwind.config.js`).

---

## 🎯 Doporučený postup pro Claude Code

```
1. cd ~/Projects/panprstenu (nebo aktuální cesta)
2. nvm use   # podle .nvmrc → Node 22.22.2
3. npm install
4. npm run dev → http://localhost:4321/cs/
5. Pokud build fail → pošli error log
6. npm run build  → ověř že vše buildí

REPO + DEPLOY:
7. git init, git add ., git commit -m "feat: M2 MVP scope"
8. Vytvořit GitHub repo + nastavit 7 FTP secrets (viz Priorita 1)
9. git push origin main → triggeruje deploy-production workflow
10. git checkout -b staging && git push → triggeruje deploy-staging

OBSAH:
11. Doplnit logo SVG, hero fotku, OG image, apple-touch-icon
12. Migrovat texty ze starého panprstenu.cz
13. Doplnit content/pages/cs/frakce/<slug>.md pro detaily frakcí
14. Vyplnit content/news/cs/ prvními 3 články
15. Schválit GDPR text s pověřencem

LAUNCH:
16. Push do main → new.panprstenu.cz (preprod, noindex)
17. Po schválení → DNS přepne na panprstenu.cz
18. Odebrat PUBLIC_NOINDEX z production workflow + redeploy
```

---

## ❓ Otevřené otázky pro klienta

- **Hero fotka** (původní tábořiště) — klient slíbil dodat
- **Logo SVG** — klient má, dodá později (zatím placeholder zlatý prsten)
- **Apple touch icon PNG** (180×180) — vygenerovat z finálního loga
- **OG default image** (1200×630)
- **YouTube video ID** pro embed pod hero
- **GitHub repo** — klient ještě nezaložil; potřeba 7 secrets (CLAUDE.md §7)
- **WebGlobe FTP hesla** pro DEV i NEW podúčty (zadat do GitHub Secrets, ne do kódu — CLAUDE.md §7, §9)
- **Texty stránek** — placeholder; reálné z migrace ze starého panprstenu.cz
- **Konkrétní URL na Registracka.cz** pro ročník 2026
- **IČO Moravian LARP, z. s.** — doplnit do GDPR a Footer
- **GDPR text** — schválit pověřencem před spuštěním registrace
- **Strategie DNS přepnutí** — kdy `panprstenu.cz` ukáže na `new.` instalaci? Po DNS odstranit noindex.

---

**Verze:** 3.0 (29. 4. 2026 odpoledne) — sjednoceno s CLAUDE.md jako zdrojem pravidel; smazána `web/`, přepsány workflowy, přidán PUBLIC_NOINDEX, refaktor Tailwind text-size tříd.
