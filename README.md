# Pán Prstenů — Bitva o Středozem

Web pro larpovou akci Pán Prstenů — Bitva o Středozem (Moravian LARP, z. s.).
**20.–23. 8. 2026, Strážovice, jižní Morava** • ~500 účastníků.

**Verze:** 0.3.0 (M1+M2 sjednoceno s CLAUDE.md, build 2026-04-29)
**Cíl spuštění:** 1. 5. 2026 / 15. 5. 2026 (realistický)

> **Závazný zdroj pravidel:** [CLAUDE.md](CLAUDE.md). Tento README je jen rychlý start.

---

## Stack (CLAUDE.md §1)

| Vrstva | Technologie | Verze |
|---|---|---|
| Runtime | Node.js | 22.22.2 LTS (pinováno v `.nvmrc`) |
| Generátor | Astro | 6.1.x |
| CSS | Tailwind | 4.2.x (přes Vite plugin, CSS-first `@theme`) |
| TS | TypeScript | 5.9.x |
| Ikony | astro-icon (Lucide + Game Icons) | 1.1.x |
| Obsah | Markdown/MDX + YAML | — |
| i18n | Astro nativní | 4 jazyky (cs, en, de, sk) |
| Hosting | WebGlobe FTP (62.109.151.48) | 2 jailed podúčty: dev + new |
| CI/CD | GitHub Actions + FTP-Deploy v4.4.0 | FTPS port 21 |

**Žádný React, žádný Svelte, žádný Vue, žádný `tailwind.config.js`** (CLAUDE.md §1).

---

## Rychlý start

```bash
# 1. Použij Node z .nvmrc
nvm use      # nebo nvm install

# 2. Závislosti
npm install

# 3. Dev server
npm run dev
# → http://localhost:4321 → redirect na /cs/

# 4. Produkční build
npm run build

# 5. Preview produkčního buildu
npm run preview

# 6. Type check
npm run check

# 7. Format
npm run format
```

---

## Struktura projektu

```
PanPrstenu/
├── .nvmrc                  # Node 22.22.2
├── .gitignore              # vč. zákazu web/ (CLAUDE.md §9)
├── astro.config.mjs        # Astro 6.1 + Tailwind 4 + i18n, site: panprstenu.cz
├── package.json
├── tsconfig.json           # path aliases (@components, @layouts, …)
├── CLAUDE.md               ← závazný zdroj pravidel
├── HANDOFF.md              ← stav implementace
├── README.md               ← tento soubor
│
├── .github/workflows/
│   ├── deploy-staging.yml      # push staging → FTPS → dev.panprstenu.cz
│   └── deploy-production.yml   # push main (PUBLIC_NOINDEX=true) → FTPS → new.panprstenu.cz
│
├── grafika/                # zdrojové grafické podklady (READ-ONLY, CLAUDE.md §11)
│
├── public/                 # statické soubory (kopírují se do dist/)
│   ├── favicon.svg
│   ├── images/
│   │   ├── factions/       # ⏳ obrázky frakcí
│   │   ├── gallery/        # ⏳ galerie z předchozích ročníků
│   │   ├── hero/           # ⏳ hero pozadí (taboriste.jpg)
│   │   ├── icons/          # ⏳
│   │   └── patterns/       # ⏳ pergamen, ornamenty
│   └── fonts/              # ⏳ vlastní fonty (volitelně)
│
├── src/
│   ├── pages/
│   │   ├── 404.astro
│   │   ├── index.astro                # / → redirect /cs/
│   │   └── [lang]/
│   │       ├── index.astro            # landing
│   │       ├── pribeh/index.astro
│   │       ├── pravidla/index.astro
│   │       ├── prakticke-info/index.astro
│   │       ├── frakce/
│   │       │   ├── index.astro        # hub
│   │       │   └── [slug].astro       # detail (4 lang × 7 frakcí)
│   │       ├── registrace/index.astro
│   │       ├── kontakt/index.astro
│   │       ├── faq/index.astro
│   │       ├── galerie/index.astro
│   │       ├── novinky/index.astro
│   │       ├── pro-novacky/index.astro
│   │       ├── gdpr/index.astro
│   │       └── cookies/index.astro
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro           # vč. PUBLIC_NOINDEX podpory
│   │
│   ├── components/
│   │   ├── ui/                  # Button, Input, Textarea, Select, Checkbox, Radio, Tag, Badge, Breadcrumb, Pagination
│   │   ├── layout/              # Logo, Header, Footer
│   │   ├── sections/            # Hero, QuickLinksTriad, WhyJoin, Factions, Program, RegistrationBox, Gallery, FAQTeaser
│   │   ├── decorative/          # Divider, CornerOrnament, WaxSeal, EmblemMedallion, Ribbon
│   │   └── blocks/              # InfoCard, Accordion, Quote, Checklist, AlertBox, EventStats, SidebarNav
│   │
│   ├── content/
│   │   ├── config.ts            # schemata pro pages/news/factions
│   │   ├── factions/            # 7 frakcí seed YAML (gondor, rohan, elves, dwarves, mordor, isengard, easterlings)
│   │   ├── pages/               # ⏳ Markdown stránky per jazyk
│   │   └── news/                # ⏳ Novinky per jazyk
│   │
│   ├── i18n/
│   │   └── ui.ts                # překlady UI stringů
│   │
│   ├── styles/
│   │   └── global.css           # Tailwind 4 @theme + design tokeny
│   │
│   ├── scripts/
│   │   └── header.ts
│   │
│   └── data/                    # ⏳ další strukturovaná data
│
└── docs/                        # ⏳ rozšířená dokumentace
```

**Legenda:** ⏳ = adresář existuje, ale je zatím prázdný (placeholder pro klientský obsah).

> **Pozor (CLAUDE.md §9):** Negeneruj v repu složky `web/dev/` ani `web/new/`. Deploy targety jsou na FTP serveru, build artefakty se v repu nedrží.

---

## Stav implementace

Detailní přehled všech komponent a stránek najdeš v [HANDOFF.md](HANDOFF.md).

### ✅ Hotovo (M1 + M2 MVP scope)
- Konfigurace, DevOps (workflowy pro DEV + NEW podúčty)
- Layout, Header, Footer, Logo
- 10 UI komponent, 5 dekorativních, 7 obsahových bloků, 8 HP sekcí
- 13 routes (z toho `frakce/[slug]` generuje 28 detailů: 4 jazyky × 7 frakcí)
- Seed data 7 frakcí
- 404, sitemap, hreflang

### ⏳ K doplnění klientem
- Logo SVG, hero fotka, galerie fotek, OG image, apple-touch-icon
- Reálné texty (z migrace starého panprstenu.cz)
- IČO Moravian LARP, z. s.
- URL na Registracka.cz pro ročník 2026
- GDPR text schválený pověřencem

---

## Git workflow (CLAUDE.md §7)

```
main       ← produkce (deploy na new.panprstenu.cz, později DNS přepnutí na panprstenu.cz)
  └─ staging   ← staging (deploy na dev.panprstenu.cz)
       └─ feature/*   ← vývojové větve
```

**Pravidla:**
- Vše do `main` POUZE přes Pull Request ze `staging`
- `main` musí mít branch protection rule
- Commity: Conventional Commits (`feat:`, `fix:`, `chore:`, `ci:`, `docs:`)

---

## Deploy

| Prostředí | URL | Větev | Build env |
|---|---|---|---|
| Lokální | localhost:4321 | jakákoli | — |
| **DEV (staging)** | dev.panprstenu.cz | `staging` | `PUBLIC_NOINDEX=false` |
| **NEW (preprod)** | new.panprstenu.cz | `main` | `PUBLIC_NOINDEX=true` |
| **PRODUKCE** | panprstenu.cz | `main` po DNS přepnutí | `PUBLIC_NOINDEX=false` |

Astro `site` URL je **vždy** `https://www.panprstenu.cz` — i když fyzicky deployujeme na `new.panprstenu.cz`. Po DNS přepnutí budou všechny canonical/OG/sitemap odkazy hned správné.

### Potřebné GitHub Secrets (CLAUDE.md §7)
V Settings → Secrets and variables → Actions:

| Secret | Hodnota |
|---|---|
| `WEBGLOBE_FTP_HOST` | `62.109.151.48` |
| `WEBGLOBE_FTP_DEV_USERNAME` | `dev@panprstenu.cz` |
| `WEBGLOBE_FTP_DEV_PASSWORD` | (heslo k dev účtu) |
| `WEBGLOBE_FTP_DEV_PATH` | `/` |
| `WEBGLOBE_FTP_NEW_USERNAME` | `new@panprstenu.cz` |
| `WEBGLOBE_FTP_NEW_PASSWORD` | (heslo k new účtu) |
| `WEBGLOBE_FTP_NEW_PATH` | `/` |

> **Cesta `/` znamená root jailed podúčtu** (`/home/html/panprstenu.cz/_sub/dev/` resp. `/_sub/new/`). Žádný `_sub/` prefix v `server-dir`.

---

## Kontakt

- **Pořadatel:** Moravian LARP, z. s.
- **Email:** info@panprstenu.cz
- **Web:** https://www.panprstenu.cz
- **Klient:** Michal Truhlář (info@jrdm.cz)
