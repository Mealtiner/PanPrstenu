# CLAUDE.md — Kontext projektu pro Claude Code

> **Tento soubor čte Claude Code automaticky při startu každého vlákna v tomto projektu.**
> Je závazný. Nepřepisuj ho bez výslovného pokynu uživatele (Michal Truhlář, info@panprstenu.cz).

---

## 0. Identita a cíl projektu

**Projekt:** Pán Prstenů — Bitva o Středozem
**Pořadatel:** Moravian LARP, z. s. (IČO 22669167, spis. zn. L 12656 KS Brno, sídlo Starobrněnská 289/7, 602 00 Brno)
**Web:** https://www.panprstenu.cz
**Akce:** 20.–23. 8. 2026, **Pulkovský mlýn, u obce Rozkoš** (pomezí Znojemska a Třebíčska) — louka u vesnice Rozkoš, parkování na vyhrazené louce u Pulkovského mlýna. V roce 2025 proběhl přesun na větší louku v blízkosti dřívějšího tábořiště.
**GPS:** 49.0388528, 15.9743275
**Mapa (dočasná):** https://mapy.com/s/bosadatoko
**Hlavní bitva:** pouze v sobotu 22. 8. 2026
**Účastníci:** ~500
**Věk:** hlavní hra od 12 let. Pro mladší samostatná dětská hra. Pod 18 souhlas zástupce, pod 15 doprovod osoby 18+.
**Stravování:** organizátoři nezajišťují. Na místě domluvená hospoda U Zeleného draka.
**Cílovka:** 12–25 (primární), 25+ (sekundární), rodiče dětí 12–17 (terciární)

**Cíl:** Postavit moderní statický web pro larpovou akci — rychlý, krásný, vícejazyčný, snadno editovatelný editory bez znalostí kódu (Sveltia CMS přijde v pozdější fázi).

**Termín MVP launch:** 1. 5. 2026 (cíl) / 15. 5. 2026 (realistický)

---

## 1. Stack — ZÁVAZNÉ verze

| Vrstva | Technologie | Verze | Poznámka |
|---|---|---|---|
| Runtime | Node.js | **22.22.2 LTS** | viz `.nvmrc` |
| Generátor | Astro | **6.1.x** | latest stable z března 2026 |
| CSS | Tailwind CSS | **4.2.x** | přes `@tailwindcss/vite` plugin |
| TS | TypeScript | **5.9.x** | NE 6.0 (transition release) |
| Ikony | astro-icon | **1.1.x** | Lucide + Game Icons sady |
| Obsah | MDX | **5.0.x** | `@astrojs/mdx` |
| Sitemap | `@astrojs/sitemap` | **3.7.x** | i18n-aware |
| Image | Sharp | **0.34.x** | image optimalizace |

### CO NEINSTALOVAT (causes peer dep konflikty)
- ❌ React (`@astrojs/react`)
- ❌ Svelte (`@astrojs/svelte`)
- ❌ Vue (`@astrojs/vue`)
- ❌ tailwind.config.js (Tailwind 4 je CSS-first, vše v `@theme` directive)

Pokud někdy budeš potřebovat island s interaktivitou navíc, prober to NEJDŘÍVE s uživatelem.

---

## 2. Astro 6 — kritické rozdíly oproti Astro 5

Pokud najdeš online tutoriály, **nesleduj je slepě** — většinou jsou pro Astro 5. V Astro 6 platí:

```ts
// ❌ STARÉ (Astro 5, většina tutoriálů)
import { defineCollection, z } from 'astro:content';
const collection = defineCollection({
  type: 'content',  // ← TOTO JE V ASTRO 6 PRYČ
  schema: z.object({...}),
});

// ✅ NOVÉ (Astro 6, používáme)
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';  // ← Zod 4 z 'astro/zod'

const collection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/x' }),
  schema: z.object({...}),
});
```

Další změny:
- `entry.slug` → **`entry.id`**
- `import.meta.env` se **inlineuje při buildu** — pro runtime env vars použij `process.env`
- Zod 4 — některé starší schemata mohou potřebovat update
- Vite 7 interně

---

## 3. Tailwind 4 — CSS-first

**Žádný `tailwind.config.js`!** Vše je v CSS.

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  --color-bg-dark: #0F1A14;
  --color-gold: #C9A75E;
  --font-display: "Cinzel", Georgia, serif;
  /* atd. */
}
```

Použití v komponentech:
```astro
<div class="bg-[var(--color-bg-dark)] text-[var(--color-gold)] font-[family-name:var(--font-display)]">
```

---

## 4. Designové tokeny — ZÁVAZNÉ

Všechny barvy, fonty a layouty vychází z 12 mockupů v `grafika/`. Tyto hodnoty NEMĚŇ.

### Barvy
```
Pozadí (tmavá paleta):
  --color-bg-darkest:   #0A130D   (footer, deeper akcent)
  --color-bg-dark:      #0F1A14   (hlavní pozadí)
  --color-bg-medium:    #142319   (karty, sekundární pozadí)

Pergamen (světlá paleta):
  --color-parchment-light:  #F3E8D0
  --color-parchment-base:   #E8DAB9
  --color-parchment-dark:   #D8C79A

Zlatá (akcent):
  --color-gold-light:   #E0C088
  --color-gold:         #C9A75E   (hlavní)
  --color-gold-dark:    #8A6E34
  --color-gold-darkest: #5E4A23

Texty:
  --color-text-on-dark:        #E8DDC3
  --color-text-on-dark-muted:  #A8A290
  --color-text-on-light:       #2A1F0E

Strany (frakce):
  --color-side-free:    #2E4C3A   (Svobodné národy, zelená)
  --color-side-evil:    #7B1E20   (Síly Temna, tmavě červená)
```

### Fonty
- **Cinzel** (display) — všechny nadpisy, tlačítka, navigace, uppercase, tracking-wider
- **Cormorant Garamond Italic** (serif) — sub-headlines, citáty
- **Inter** (body) — běžný text, popisky, formuláře

### Ornamentální prvky
- Diamant `◆` jako separátor: `━ ◆ Nadpis ◆ ━`
- Vosková pečeť u registračních boxů
- Erbové medailony u sekcí frakcí
- Rohové ornamenty u pergamenových rámečků
- Horizontální dividery se zlatou linkou + diamantem uprostřed

### Animace — úroveň 3/5
Jen CSS animace: scroll fade-up, hover lift, parallax, shimmer.
**NE GSAP, NE aggressive animace.** Respektuj `prefers-reduced-motion`.

---

## 5. Struktura projektu

```
PanPrstenu/
├── .claude/                 (Claude Code config — gitignored)
├── .github/workflows/       (CI/CD — staging + production)
├── .nvmrc                   (Node 22.22.2)
├── CLAUDE.md                (TENTO SOUBOR)
├── HANDOFF.md               (stav projektu, aktuálně v1.2)
├── README.md                (rychlý start)
├── astro.config.mjs         (Astro 6.1 + Tailwind 4 + i18n)
├── package.json
├── tsconfig.json            (path aliasy)
│
├── grafika/                 ← MOCKUPY, NEMODIFIKOVAT, NEDEPLOYOVAT
│
├── public/                  ← statické soubory (kopírují se do dist/)
│   ├── images/              (hero, frakce, galerie, …)
│   ├── fonts/
│   └── favicon.svg
│
├── src/
│   ├── pages/               ← Astro routing
│   │   ├── index.astro      (/ → redirect na /cs/)
│   │   └── [lang]/          (dynamický prefix)
│   │       └── index.astro  (úvodní stránka pro každý jazyk)
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro
│   │
│   ├── components/
│   │   ├── ui/              (Button, Input, Tag, Badge, …)
│   │   ├── layout/          (Header, Footer, Logo)
│   │   ├── sections/        (Hero, WhyJoin, …)
│   │   ├── decorative/      (Divider, CornerOrnament, WaxSeal, …)
│   │   └── blocks/          (InfoCard, Accordion, Quote, …)
│   │
│   ├── content/             ← Content Collections
│   │   ├── config.ts        (schemata v Astro 6 syntaxi)
│   │   ├── pages/           (markdown stránky per jazyk)
│   │   ├── news/            (novinky per jazyk)
│   │   └── factions/        (YAML data o frakcích)
│   │
│   ├── i18n/
│   │   └── ui.ts            (překlady pro 4 jazyky)
│   │
│   ├── styles/
│   │   └── global.css       (Tailwind 4 + design tokeny)
│   │
│   ├── scripts/
│   │   └── header.ts        (sticky header + mobile menu)
│   │
│   └── data/                (další strukturovaná data)
│
└── docs/                    (rozšířená dokumentace)
```

### Path aliasy (tsconfig.json)
```ts
"@/*":           ["src/*"]
"@components/*": ["src/components/*"]
"@layouts/*":    ["src/layouts/*"]
"@i18n/*":       ["src/i18n/*"]
"@data/*":       ["src/data/*"]
"@content/*":    ["src/content/*"]
"@styles/*":     ["src/styles/*"]
"@scripts/*":    ["src/scripts/*"]
```

---

## 6. Internationalization (i18n)

### Jazyky
- **cs** (čeština) — primární, plně přeložené, default lang
- **en** (English) — postupně doplňováno
- **de** (Deutsch) — postupně doplňováno
- **sk** (Slovenčina) — postupně doplňováno

### Strategie
- Všechny URL mají prefix: `/cs/`, `/en/`, `/de/`, `/sk/`
- `/` → redirect na `/cs/`
- Chybějící překlady → fallback na `cs`
- `astro.config.mjs`: `prefixDefaultLocale: true`, `redirectToDefaultLocale: true`

### Použití v komponentech
```ts
import { getTranslation, getLangFromUrl } from '@i18n/ui';
const lang = getLangFromUrl(Astro.url);
const t = getTranslation(lang);
// pak: {t('nav.home')}
```

---

## 7. Git workflow + Deploy

### Větvení
```
main       ← produkce (deploy na new.panprstenu.cz, později panprstenu.cz)
  └─ staging   ← staging (deploy na dev.panprstenu.cz)
       └─ feature/*   ← vývojové větve
```

**Pravidla:**
- Vše do `main` POUZE přes Pull Request ze `staging`
- Editoři (později přes Sveltia CMS) commitují do `staging`
- `main` má branch protection rule

### Deploy targety
| Prostředí | URL | Větev | Auto-deploy |
|---|---|---|---|
| Lokální | localhost:4321 | jakákoli | `npm run dev` |
| **DEV (staging)** | dev.panprstenu.cz | `staging` | ✅ při push (deploy-staging.yml) |
| **NEW (preprod)** | new.panprstenu.cz | `main` | ✅ při merge (deploy-production.yml), `PUBLIC_NOINDEX=true` |
| **LIVE (ostrá)** | panprstenu.cz / www.panprstenu.cz | `main` | manuální FTP upload z lokálního `public_html/` (postbuild generuje) NEBO `deploy-live.yml` přes `gh workflow run` |

Viz §13 pro detail rozdílů mezi DEV / NEW / LIVE.

### Hosting: WebGlobe SFTP
- Server: `62.109.151.48`
- **SFTP port: `222`** (jediný funkční protokol — server je `mod_sftp` z ProFTPd)
- FTP/FTPS na portu 21 NEFUNGUJE pro tyto subaccounty
- Webové nástroje: phpMyAdmin (https://dbadmin.webglobe.cz), WebFTP (https://ftp.webglobe.cz)

### SFTP podúčty (WebGlobe)
Vytvořeny jsou 2 podúčty pro oddělené prostředí:

| Účet | Username | Jail cesta na serveru |
|---|---|---|
| DEV | `dev.panprstenu.cz` | `/home/html/panprstenu.cz/_sub/dev/` |
| NEW | `new.panprstenu.cz` | `/home/html/panprstenu.cz/_sub/new/` |

> ⚠️ **Username formát** používá tečku (`dev.panprstenu.cz`), NE zavináč. To je specifikum WebGlobe.
>
> 🔒 **Hesla nikdy nepiš do tohoto souboru ani jiných tracked souborů.** Drží se výhradně v GitHub Secrets. Pro lokální test si je drž v `~/.ssh/config` nebo macOS Keychain.

### GitHub Secrets — povinné
| Secret name | Hodnota |
|---|---|
| `WEBGLOBE_FTP_HOST` | `62.109.151.48` |
| `WEBGLOBE_FTP_DEV_USERNAME` | `dev.panprstenu.cz` |
| `WEBGLOBE_FTP_DEV_PASSWORD` | (drženo v GitHub Secrets) |
| `WEBGLOBE_FTP_DEV_PATH` | `/` (root vzhledem k jail dev podúčtu) |
| `WEBGLOBE_FTP_NEW_USERNAME` | `new.panprstenu.cz` |
| `WEBGLOBE_FTP_NEW_PASSWORD` | (drženo v GitHub Secrets) |
| `WEBGLOBE_FTP_NEW_PATH` | `/` (root vzhledem k jail new podúčtu) |

> **Poznámka k cestě:** WebGlobe SFTP podúčty jsou jailed do své subdomény. Po přihlášení dev účtem jsi rovnou v `/home/html/panprstenu.cz/_sub/dev/`, takže relativní cesta `/` znamená root této složky.

### Lokální test SFTP credentials
```bash
sshpass -p 'HESLO' sftp -P 222 \
  -o StrictHostKeyChecking=no \
  -o PreferredAuthentications=password \
  -o PubkeyAuthentication=no \
  'dev.panprstenu.cz'@62.109.151.48
# → měl bys vidět `sftp>` prompt; po pwd: "Remote working directory: /"
```

### CI/CD — GitHub Actions
- [.github/workflows/deploy-staging.yml](.github/workflows/deploy-staging.yml) — push do `staging` → upload na DEV
- [.github/workflows/deploy-production.yml](.github/workflows/deploy-production.yml) — push do `main` → upload na NEW (s `noindex`)
- Deploy přes **`lftp mirror -R --delete --parallel=4`** přes SFTP/222 (apt-installable, žádný third-party action)
- `SamKirkland/FTP-Deploy-Action` SFTP nepodporuje, proto použit lftp v shell stepu

### Astro `site` URL
**Vždy `https://www.panprstenu.cz`** — i když fyzicky deployujeme na `new.panprstenu.cz`.
Důvod: po přepnutí DNS budou všechny canonical/OG/sitemap odkazy hned správné.
NEW prostředí má `PUBLIC_NOINDEX=true`, aby ho Google neindexoval.

---

## 8. Aktuální stav (k 12. 5. 2026, verze 4.0.0)

> **Release v4.0** zahrnuje vše z 3.x série (3.6 – 3.9): překlady, statistiky, personal card, registrace UI; plus mimo Astro repo: kompletní Fio API integrace na registracka.cz (auto-pair plateb, refund detekce, admin GUI v `/api/fio/admin/queue.php`, editovatelné e-mailové šablony, manuální fronta nespárovaných). Od této verze povolen deploy i do `public_html/` (LIVE = www.panprstenu.cz), ne jen na NEW.



### ✅ Hotovo
- **Konfigurace + Build:** Astro 6.1, Tailwind 4.2, Node 22.22.2, TS 5.9, 0 TS errors
- **Layout/komponenty:** BaseLayout, Header (mega menu + mobile drawer), Footer (5 sloupců), Logo, 10 UI, 5 dekorativních, 7 obsahových bloků, 9 HP sekcí (Hero, QuickLinksTriad, WhyJoin, Factions, Program, RegistrationBox, VideoGallery, FAQTeaser, HraVTaboreTeaser)
- **53 unique routes** × 5 jazyků = 347 stránek (vč. faction detail × 9, novinky, mapa-webu, RSS, atd.)
- **i18n KOMPLETNÍ (v3.2.0):** 48/48 stránek 100 % ve všech 4 cílových jazycích (EN/DE/SK/UK). Audit: 0 same-as-cs stringů.
- **SEO:** sitemap-index + sitemap-0.xml (canonical www), JSON-LD Organization (sameAs + logo + contactPoint), Event (organizer + performer), WebPage, BreadcrumbList, FAQPage na home, hreflang 5 jazyků, RSS feed per jazyk
- **Analytics:** GA4 (G-MS0YG5PXGE) s Consent Mode v2 (default DENIED, granted po cookie consent)
- **Účast Cookiebot + accessibility toolbar** + jazykový přepínač jako mobile-friendly kolečka (40 × 40 px, edge-hide animace při scrollu)
- **3 deploy targety:** `dev.panprstenu.cz` (staging branch), `new.panprstenu.cz` (main, preprod s noindex), `panprstenu.cz` (live, manuální FTP upload z `public_html/`)
- **Faction slugy:** unifikované česky (`/frakce/elfove/`, `/frakce/trpaslici/`, ne `elves`/`dwarves`); .htaccess 301 redirecty ze starých slugů

### ⏳ Otevřené úkoly

**Vyšší priorita:**
- **#7 hCaptcha** — kontaktní formulář používá Web3Forms demo sitekey, nefunguje. Varianta A vypnout (5 min, honeypot stačí)
- **#20 Faction YAML i18n** — `combat_style`, `recommended_for`, `lore_sections.paragraphs`, `ruler.description` jen v CS pro EN/DE/SK/UK. ~1 500 polí napříč 9 frakcemi × 4 jazyky. Doporučeno přes `auto-translate.mjs` (LARP/Tolkien kontext) — viz §13

**Nice-to-have:**
- **#3 EventStats na homepage** — komponenta existuje, není použita (33 ročníků / 700+ účastníků / 9 armád / 4 dny)
- **#8 Gallery na home** mezi Factions a Program (komponenta existuje)
- **#3 Footer sociálky** — Instagram/Discord/YouTube zatím `href="#"` stuby (čekáme na URL)
- **Newsletter signup** (Brevo / Mailerlite) pro registrační launch 15. 5.
- **Sentry / IndexNow** — volitelné

---

## 9. Pravidla práce — DODRŽUJ

### Co dělat
- ✅ Komponenty psát jako `.astro` (ne `.tsx`, ne `.svelte`)
- ✅ Používat path aliasy (`@components/`, `@layouts/`, `@i18n/`)
- ✅ Komentáře v češtině, v hlavičce souboru `Datum: YYYY-MM-DD`
- ✅ TypeScript everywhere — žádný `any` bez vysvětlení
- ✅ Mobile-first responsive design
- ✅ Dodržovat Astro 6 syntax (Content Layer API, Zod 4)
- ✅ Pro inspiraci se vždy podívat do `grafika/` (mockupy)
- ✅ Kontrolovat existující komponenty před vytvářením nových
- ✅ Testovat lokálně přes `npm run dev` před commitem

### Co NEDĚLAT
- ❌ Neinstalovat React/Svelte/Vue integrace
- ❌ Neměnit Astro nebo Tailwind majoritní verzi
- ❌ Nepřidávat `tailwind.config.js`
- ❌ Nepoužívat starou Astro 5 syntaxi (`type: 'content'`, `import { z } from 'astro:content'`)
- ❌ Nemodifikovat soubory v `grafika/`
- ❌ Nepushovat přímo do `main` (vždy přes PR ze `staging`)
- ❌ Nezapisovat hesla, FTP credentials, API klíče do kódu/commitů
- ❌ Nepřidávat externí trackovací skripty bez výslovného souhlasu
- ❌ Negenerovat `web/dev/` nebo `web/new/` složky v repu (deploy targety jsou na FTP serveru, ne v repu)

### Stylistické konvence
- Soubory komponent: `PascalCase.astro` (např. `HeroMain.astro`)
- TypeScript moduly: `kebab-case.ts` (např. `header.ts`)
- Třídy v CSS: `kebab-case` (např. `.faction-card`)
- Markdown soubory: `kebab-case.md` (např. `gondor.md`)
- Commit messages: Conventional Commits (`feat:`, `fix:`, `chore:`, `ci:`, `docs:`)

---

## 10. Klient — co preferuje

**Michal Truhlář** (info@panprstenu.cz, info@jrdm.cz)

- Komunikuje primárně **česky**.
- Preferuje strukturované, praktické odpovědi (nadpisy, body, tabulky).
- Pracuje ve **VS Code** s GitHub Copilot, Codex, Claude Code.
- Učí se GitHub Actions (vysvětluj, pokud něco děláš v CI/CD).
- Má rád upřímné odpovědi včetně rizik a alternativ — ne servilní souhlas.
- Rozhodnutí dělá rád informovaně — když si nejsi jistý, zeptej se.

---

## 11. Slug konvence (URL identifikátory)

Po refactor commitu `bea9792` (v3.2.0+) platí: **VŠECHNY URL slugy jsou v češtině**, nemixuj angličtinu uprostřed jinak českých cest.

✅ Správně:
- `/frakce/gondor/`, `/frakce/rohan/`, `/frakce/elfove/`, `/frakce/trpaslici/`, `/frakce/skreti/`, `/frakce/skuruti/`, `/frakce/harad/`, `/frakce/umbar/`, `/frakce/vrchovina/`
- `/role/hobiti/`, `/role/pomocnici/`, `/role/stankari/`, `/role/fotografove-a-kameramani/`, `/role/nebojovy-doprovod/`, `/role/organizatori/`
- `/svet-stredozeme/narody/`, `/svet-stredozeme/kralovstvi-a-rise/`, `/svet-stredozeme/specificke-jednotky/`, atd.

❌ Špatně (deprecated):
- `/frakce/elves/`, `/frakce/dwarves/` → 301 redirect v `.htaccess` na české slugy

**Pravidlo:** Faction YAML soubor v `src/content/factions/` se jmenuje stejně jako slug (`elfove.yml`, ne `elves.yml`). Mapping na ikony (`factionIcons.ts`) a inspiromat slugy (`/frakce/[slug].astro`) jsou identity (slug = icon slug).

Při přidání nové frakce / role / stránky **drž českou normalizaci** (bez diakritiky, kebab-case, ASCII jen). Anglické slugy patří jen pokud je položka skutečně anglicky pojmenovaná (např. `B5A`, `LARP.cz`).

---

## 12. i18n workflow (auto-translate + manuální)

### Audit pokrytí překladů
```bash
npm run audit:i18n
# → vypíše per-jazyk počty hotových stránek a same-as-cs stringů
# Výstup: src/data/translation-status.json (commitnutý)
```

### Auto-translate (Claude API)
Pro velké překladové dávky (např. faction YAML `combat_style` + `lore_sections`) — používá Anthropic API s LARP/Tolkien kontextovým system promptem.

```bash
export ANTHROPIC_API_KEY=sk-ant-...
node scripts/auto-translate.mjs --dry          # preview všech jazyků
node scripts/auto-translate.mjs --lang sk      # jen SK
node scripts/auto-translate.mjs --page minule-rocniky  # jen jedna stránka
node scripts/auto-translate.mjs                 # vše < 100 %
```

Náklady: ~$5–15 na kompletní pass (4 jazyky × ~2 477 stringů).

### Manuální překlad — strategie cognates
SK je lexikálně velmi blízko CS — většina stringů je identická (Pomocníci, IČO, Sídlo, Hasiči atd.). Místo opakovaného přepisu **používej `src/data/translation-allowlist.json`**:
- `patterns`: regex `<slug>::<key>$` pro per-page intentional sameness
- `valueGlobs`: exact-match hodnoty (brand names, Tolkien proper nouns, krátké cognaty)

Audit (`translation-status.mjs`) respektuje allowlist a tyto stringy nepočítá jako "nepřeloženo".

### Build pipeline
```
npm run build
  ├─ prebuild: translation-status.mjs (audit) + generate-llms.mjs (llms.txt)
  ├─ astro build → dist/
  └─ postbuild: sync-deploy-folders.mjs → public_html/ + public_html_new/
```

---

## 13. Deploy targety

| Prostředí | URL | Branch | Workflow |
|---|---|---|---|
| Lokální | `localhost:4321` | jakákoli | `npm run dev` |
| **DEV (staging)** | `dev.panprstenu.cz` | `staging` | `.github/workflows/deploy-staging.yml` (auto on push) |
| **NEW (preprod)** | `new.panprstenu.cz` | `main` | `.github/workflows/deploy-production.yml` (auto on push), `PUBLIC_NOINDEX=true` |
| **LIVE (ostrá)** | `panprstenu.cz` / `www.panprstenu.cz` | manuální FTP upload z `public_html/` | `.github/workflows/deploy-live.yml` (workflow_dispatch only) |

**Astro `site`:** vždy `https://www.panprstenu.cz` (canonical, OG, sitemap absolute URLs).

**Slug staging:** `dev.panprstenu.cz` má `PUBLIC_NOINDEX=false`, takže může být indexovaný — ale je tam jen testovací data. Pro CI/CD bez indexace doporučeno přidat noindex meta tag globálně přes env var v deploy-staging.yml.

---

## 14. Odkazy na další dokumenty v repu

- `README.md` — rychlý start (instalace, dev server, build, npm scripty)
- `docs/SETUP.md` — onboarding nového developera (Node, Git, GitHub repo, FTP creds)
- `docs/HANDOFF-v2.1.md` — archivní hand-off ze staršího vlákna (cca v2.1, **historický referent**)
- `docs/ROADMAP.md` — historický roadmap z 1. fáze projektu
- `docs/i18n-status.md`, `docs/translation-status.md` — historické audity překladů (aktuální = `src/data/translation-status.json`)
- `docs/cms-status.md` — historický check Sveltia CMS (odložené)
- `grafika/` — 12 hi-fi mockupů (READ-ONLY pro Claude Code, gitignored)
- `Navody/`, `Analyzy/` — místní podklady, gitignored

---

## 15. Když si nejsi jistý

Pokud narazíš na situaci, která není pokrytá v tomto dokumentu:

1. Podívej se do `src/data/translation-status.json` pro aktuální stav překladů
2. Podívej se do `grafika/` — tam je vizuální reference
3. Podívej se do existujících komponent — drž jejich konvence
4. Pokud stále nevíš → **zeptej se uživatele**, nehádej

---

## 16. Modal design spec — ZÁVAZNÉ

**Všechny modal / dialog / lightbox UI surfaces na webu MUSÍ dodržet tuto specifikaci.**
Cíl: jednotná vizuální identita, WCAG AA/AAA kontrast v každém theme módu, předvídatelná interakce, žádné překvapení pro uživatele.

### Sdílené chování (povinné)

- **Pozice:** vždy `position: fixed`, `inset: 0`, centrované **střed-střed** (flex `align-items: center; justify-content: center`).
- **Velikost:** flexibilní podle obsahu (`max-width` per kontext, ale ne fixní výška). Vždy `width: 100%` a `padding: 1rem` na backdropu (margin to okraje obrazovky).
- **Mount:** přidat do `document.body` (jinak se mu cestou nahoru perou z-index kontextů).
- **z-index baseline:** `var(--pp-modal-z)` = 200 pro běžné modaly, `var(--pp-modal-z-lightbox)` = 1000 pro lightbox (může vyjet z modalu).
- **Klávesnice:** `Escape` zavírá; první focusable element po otevření dostane focus. `Enter` na primárním tlačítku potvrzuje.
- **Klik mimo modal:** zavírá (kliknutí na `.backdrop`, ne na samotný modal).
- **Animace:** `scale(0.92–0.94) → 1` při otevření, opacity backdropu 0 → 1. Vždy v media query `prefers-reduced-motion: reduce` vypnout.
- **`backdrop-filter: blur(var(--pp-modal-backdrop-blur))`** — automaticky se vypne v `.a11y-contrast` (token nastaven na 0).

### Tokeny — VŽDY používat (nikdy hardcode hex)

Definované v [`src/styles/global.css`](src/styles/global.css):

| Token | Účel | Adaptace |
|---|---|---|
| `--pp-modal-backdrop` | barva podkladu pod modalem | dark / light / HC |
| `--pp-modal-backdrop-blur` | blur podkladu | HC = 0 |
| `--pp-modal-bg` | pozadí modalu | dark / light |
| `--pp-modal-text` | běžný text | dark / light / HC |
| `--pp-modal-text-muted` | sekundární text | dark / light |
| `--pp-modal-border` | barva rámečku | default = gold, varianty přepisují |
| `--pp-modal-border-width` | tloušťka rámečku | default 2px, HC 3px |
| `--pp-modal-divider` | dělící linka (border-bottom hlavičky) | adaptuje s borderem |
| `--pp-modal-title` | barva nadpisu | adaptuje s variantou |
| `--pp-modal-shadow` | stínování / elevation | dark / light / HC |
| `--pp-modal-btn-bg` | pozadí primárního tlačítka | adaptuje s variantou |
| `--pp-modal-btn-text` | text primárního tlačítka | adaptuje (HC dark = #000) |

### Sémantické varianty (závazné)

Stavový modal **MUSÍ** dostat jednu z těchto variant třídy podle stavu:

| Variant | Pro co | Override tokenů |
|---|---|---|
| `.pp-modal--ok` *(nebo lokální `.reg-feedback--success` apod.)* | Pozitivní stav: úspěch, registrace uložena, akce dokončena | border + title + button → `--color-state-success*` (theme-aware zelená) |
| `.pp-modal--nok` *(nebo lokální `.reg-feedback--error` apod.)* | Negativní stav: chyba, validace neprošla, akce selhala | border + title + button → `--color-state-danger*` (theme-aware červená) |
| **bez variantu** | Neutrální (confirm, info, výpis, lightbox) | Gold akcent (`--color-gold`) — výchozí |

Stávající `.kj-modal--free` / `.kj-modal--evil` jsou **herní strany**, NE OK/NOK status. Drží zelený / červený tón pro vizuální identitu armád, ne pro sémantický stav.

### Typografie

- **Title:** font `Cinzel`, `text-transform: uppercase`, `letter-spacing: 0.06em`, font-weight 700, color = `var(--pp-modal-title)`.
- **Body:** font `Inter` / `Source Sans 3`, line-height 1.55, color = `var(--pp-modal-text)`.
- **Button:** font `Cinzel`, uppercase, tracking 0.08em, font-weight 700.

### WCAG kontrast — povinný cíl

| Element | WCAG | Cíl |
|---|---|---|
| Body text na modal bg | AA | ≥ 4.5:1 |
| Title na modal bg | AA | ≥ 4.5:1 |
| Button text na button bg | AA | ≥ 4.5:1 |
| Border / dělící linka | UI | ≥ 3:1 |
| Focus ring | UI | ≥ 3:1 |
| Vysoký kontrast (`.a11y-contrast`) | AAA | ≥ 7:1 pro běžný text |

Tokeny ve specifikaci jsou pre-validované pro všechny 4 theme módy (dark, light, dark-HC, light-HC). Pokud přidáváš novou variantu, ověř kontrast nástrojem (např. WebAIM Contrast Checker) **ve všech 4 módech**.

### Přístupnost — povinné `[data-theme]` + `.a11y-contrast`

Modal **MUSÍ**:
- adaptovat barvy podle `[data-theme="light"]` (= pergamenový režim, viz §13),
- respektovat `.a11y-contrast` (vysoký kontrast — silnější border, žádný blur, AAA kontrast),
- vypnout transitions v `@media (prefers-reduced-motion: reduce)`,
- v lightboxu (`.a11y-contrast`) vypnout `filter: contrast(1.08) brightness(1.02)` na obrazové content (jinak by se barevně rozladil).

### Reference (existující modaly)

| Komponenta | CSS | Trigger | Status |
|---|---|---|---|
| `.reg-dialog` | [registration.css](src/styles/registration.css) | `showConfirmDialog`, `showAlertDialog` ([dialog.ts](src/scripts/registration/dialog.ts)) | confirm / alert; používá `.reg-btn--danger` pro destruktivní akce |
| `.kj-modal` | tamtéž | `openParticipantsModal` ([participants-modal.ts](src/scripts/participants-modal.ts)) | výpis přihlášených; varianty `--free` / `--evil` (game sides) |
| `.reg-feedback` | tamtéž | inline v [`index.ts`](src/scripts/registration/index.ts) → `showRegistrationFeedback` | OK/NOK feedback po guest registraci |
| `.lightbox-overlay` | [`global.css`](src/styles/global.css) | [`lightbox.ts`](src/scripts/lightbox.ts) | obrázky + YouTube ve stránkách |
| `<dialog data-video-lightbox>` | inline v [`VideoGallery.astro`](src/components/sections/VideoGallery.astro) | inline JS | YouTube lightbox na home |

Při vytváření **nového modal-u**:
1. Pojmenuj selektor `.tvuj-modal-backdrop` + `.tvuj-modal` (BEM, ne kj-* ani reg-*).
2. Použij **VÝHRADNĚ** tokeny `--pp-modal-*` na barvy.
3. Pro stavový pridej variant `.pp-modal--ok` / `.pp-modal--nok` přímo do HTML.
4. Otestuj ve všech 4 theme módech (dark / light / dark+a11y-contrast / light+a11y-contrast).
5. Ověř `Escape` zavírá, focus trap funguje, click-outside zavírá, ESC vrací focus na trigger.

### Z-index strategie pro mobile

**POZOR:** Mobile sidebar drawer (TOC, registration sidebar, ...) má `z-index: 40`, jeho backdrop `z-index: 30`. **Žádný formulářový blok na stránce nesmí mít explicit `z-index ≥ 40`**, jinak drawer overlay z mobilního menu prochází pod formulářem a menu je nedostupné. Modaly v `document.body` mají `z-index: 200+` (above sidebar, OK — modal záměrně překrývá vše).

---

**Poslední revize:** 2026-05-15
**Verze:** 4.0.0
