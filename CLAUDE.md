# CLAUDE.md — Kontext projektu pro Claude Code

> **Tento soubor čte Claude Code automaticky při startu každého vlákna v tomto projektu.**
> Je závazný. Nepřepisuj ho bez výslovného pokynu uživatele (Michal Truhlář, info@panprstenu.cz).

---

## 0. Identita a cíl projektu

**Projekt:** Pán Prstenů — Bitva o Středozem
**Pořadatel:** Moravian LARP, z. s.
**Web:** https://www.panprstenu.cz
**Akce:** 20.–23. 8. 2026, Strážovice (jižní Morava)
**Účastníci:** ~500
**Cílovka:** 16–25 (primární), 25+ (sekundární), rodiče dětí 12–17 (terciární)

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
| **DEV (staging)** | dev.panprstenu.cz | `staging` | ✅ při push |
| **NEW (preprod)** | new.panprstenu.cz | `main` | ✅ při merge |
| **PRODUKCE** | panprstenu.cz | `main` | DNS přepnutí v den D |

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

## 8. Aktuální stav (k 29. 4. 2026)

### ✅ Hotovo (M1 Foundation)
- Konfigurace (Astro 6.1, Tailwind 4.2, Node 22.22.2, TS 5.9)
- Design tokeny v `global.css`
- Layouty: BaseLayout
- Komponenty layout: Header (sticky + scroll-hide + mobile drawer), Footer (4 sloupce), Logo (placeholder)
- UI: Button (4 varianty)
- Sekce: Hero, QuickLinksTriad, WhyJoin
- i18n systém pro 4 jazyky
- Content Collections v Astro 6 syntaxi
- GitHub Actions workflow soubory
- HANDOFF.md v1.2 (aktuální stav)

### ⏳ Otevřené úkoly (M2 a dál)

**Priorita 1 — chybějící HP sekce:**
- Frakce a strany (2 sloupce: Svobodné národy / Síly Temna)
- Program akce (3 dny)
- Co tě čeká (checklist)
- Registrační box (pergamenový)
- Galerie z předchozích ročníků
- FAQ accordion
- CTA banner

**Priorita 2 — chybějící stránky pro MVP:**
- Pravidla a bezpečnost (Image 3, 4)
- Frakce hub + detail (Image 5, 6)
- Praktické info (Image 7, 8)
- Registrace (odkaz/iframe na Registracka.cz)
- Kontakt (zatím mailto:)
- FAQ
- GDPR + Cookies

**Priorita 3 — UI komponenty z Image 9:**
Input, Select, Checkbox, Radio, Toggle, Tag/Pill, Badge, Breadcrumb, Pagination, Tooltip

**Priorita 4 — dekorativní z Image 10:**
Divider varianty, CornerOrnament, WaxSeal, EmblemMedallion, Ribbon

**Priorita 5 — obsahové bloky z Image 11:**
InfoCard, Accordion, Quote, Checklist, AlertBox, Sidebar Navigation, EventStats

**Priorita 6 — formuláře z Image 12:**
ContactForm, TicketCard, Success/Error stavy, StepProcess

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

## 11. Odkazy na další dokumenty v repu

- `HANDOFF.md` — detailní stav projektu, co je hotové, co dál
- `README.md` — rychlý start (instalace, dev server, build)
- `docs/` — rozšířená dokumentace (až bude potřeba)
- `grafika/` — všech 12 hi-fi mockupů (READ-ONLY pro Claude Code)

---

## 12. Když si nejsi jistý

Pokud narazíš na situaci, která není pokrytá v tomto dokumentu:

1. Podívej se do `HANDOFF.md` — tam je aktuální plán
2. Podívej se do `grafika/` — tam je vizuální reference
3. Podívej se do existujících komponent — drž jejich konvence
4. Pokud stále nevíš → **zeptej se uživatele**, nehádej

---

**Poslední revize:** 29. 4. 2026
**Verze:** 1.0
