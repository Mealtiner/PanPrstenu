# Checklist externalizace textů — všechny stránky × 5 jazyků

Datum auditu: 2026-05-04  
Skript pro detekci hardcoded CS: [scripts/audit-pages.mjs](../../scripts/audit-pages.mjs)

## Princip jednotného systému

**Pravidlo:** v `.astro` souborech NEMÁ být žádný textový literál určený pro uživatele.

**Jeden zdroj pravdy pro texty:**
- **Krátké systémové texty + UI labely + meta + nadpisy + odstavce krátkých stránek** → `src/i18n/ui/{cs,en,de,sk,uk}.json` accessed via `t('page.{slug}.{key}')`
- **Sdílená data o akci** (datum, GPS, popisy faktů) → `src/content/site/event/{lang}.json` accessed via `getEvent(lang)`
- **Faction lore data** (combat_style, lore_sections, …) → `src/content/factions/*.yml` (TODO: migrate na meta.json + lang.md per audit)

**Všechno se volá přes `t('klíč')` (UI texty) nebo `getEvent(lang)` (event data).** Žádný literál v `.astro` body.

## Stav po stránkách

> Sloupec **Hardcoded CS lines** = počet řádků s českou diakritikou v JSX těle, které NEJSOU uvnitř `t(…)` volání.  
> Hodnocení: **✅ Clean** (0 ř.) · **🟡 Mostly** (1–5) · **🟠 Partial** (6–30) · **🔴 Hardcoded** (>30)

### Stránky bez `[lang]` (statické)

| Stránka | Řádků | t() | Hardcoded | Stav | Akce |
|---|---|---|---|---|---|
| [ ] `pages/index.astro` | 5 | 0 | 0 | ✅ | redirect na `/cs/`, OK |
| [ ] `pages/404.astro` | 52 | 0 | 6 | 🟠 Partial | **Migrovat** texty do `t('error.404.*')`. Sice statická, ale zobrazuje text uživateli. |

### Stránky `[lang]/...` (každá generuje 5 jazykových mutací)

| Stránka | Řádků | t() | Hardcoded | Stav | Akce |
|---|---|---|---|---|---|
| [x] `[lang]/index.astro` | 60 | 2 | 0 | ✅ | OK (texty v sekčních komponentech) |
| [x] `[lang]/bezpecnost/index.astro` | 254 | 28 | 0 | ✅ | OK |
| [x] `[lang]/detska-hra/index.astro` | 396 | 121 | 0 | ✅ | OK |
| [x] `[lang]/faq/index.astro` | 171 | 24 | 0 | ✅ | OK |
| [x] `[lang]/fotky-a-video/index.astro` | 168 | 51 | 0 | ✅ | OK |
| [ ] `[lang]/frakce/[slug].astro` | 406 | 50 | 8 | 🟠 Partial | **Migrovat** zbývající literály |
| [x] `[lang]/frakce/index.astro` | 560 | 107 | 0 | ✅ | OK |
| [x] `[lang]/galerie/index.astro` | 129 | 15 | 0 | ✅ | OK |
| [x] `[lang]/hra-v-tabore/index.astro` | 446 | 142 | 0 | ✅ | OK |
| [x] `[lang]/kdo-jede/index.astro` | 207 | 46 | 0 | ✅ | OK |
| [x] `[lang]/kontakt/index.astro` | 144 | 25 | 0 | ✅ | OK |
| [x] `[lang]/mapa/index.astro` | 155 | 39 | 0 | ✅ | OK |
| [x] `[lang]/minule-rocniky/index.astro` | 105 | 22 | 0 | ✅ | OK |
| [x] `[lang]/novinky/[slug].astro` | 160 | 6 | 0 | ✅ | OK (data přes content collections) |
| [x] `[lang]/novinky/index.astro` | 111 | 11 | 0 | ✅ | OK |
| [x] `[lang]/ohlasy/index.astro` | 101 | 21 | 0 | ✅ | OK |
| [x] `[lang]/podpor-ucastniky/index.astro` | 159 | 41 | 0 | ✅ | OK |
| [x] `[lang]/poradatel/index.astro` | 190 | 51 | 0 | ✅ | OK |
| [x] `[lang]/prakticke-info/index.astro` | 423 | 122 | 0 | ✅ | OK |
| [x] `[lang]/pribeh/index.astro` | 93 | 25 | 0 | ✅ | OK |
| [x] `[lang]/pristupnost/index.astro` | 203 | 66 | 0 | ✅ | OK |
| [x] `[lang]/pro-media/index.astro` | 212 | 68 | 0 | ✅ | OK |
| [x] `[lang]/pro-rodice/index.astro` | 606 | 220 | 0 | ✅ | OK |
| [x] `[lang]/registrace/kdyz-je-poplatek-problem/index.astro` | 147 | 50 | 0 | ✅ | OK |
| [x] `[lang]/role/fotografove-a-kameramani/index.astro` | 316 | 120 | 0 | ✅ | OK |
| [x] `[lang]/role/hobiti/index.astro` | 283 | 118 | 0 | ✅ | OK |
| [x] `[lang]/role/nebojovy-doprovod/index.astro` | 225 | 73 | 0 | ✅ | OK |
| [ ] `[lang]/role/organizatori/index.astro` | 206 | 63 | 2 | 🟡 Mostly | **Migrovat** 2 literály |
| [x] `[lang]/role/pomocnici/index.astro` | 304 | 105 | 0 | ✅ | OK |
| [x] `[lang]/role/stankari/index.astro` | 348 | 139 | 0 | ✅ | OK |
| [x] `[lang]/stanky-a-prodejci/index.astro` | 164 | 16 | 0 | ✅ | OK |
| [x] `[lang]/svet-stredozeme/casova-linka/index.astro` | 237 | 46 | 0 | ✅ | OK (lore data v inline arrays — viz pozn.) |
| [x] `[lang]/svet-stredozeme/index.astro` | 211 | 37 | 0 | ✅ | OK |
| [x] `[lang]/svet-stredozeme/kralovstvi-a-rise/index.astro` | 291 | 33 | 0 | ✅ | OK (lore data v inline arrays — viz pozn.) |
| [ ] `[lang]/svet-stredozeme/mistopis/index.astro` | 370 | 25 | 96 | 🔴 | **Migrovat** lore data (regions[]) do `src/content/world/mistopis/{lang}.json` |
| [ ] `[lang]/svet-stredozeme/narody/index.astro` | 341 | 27 | 125 | 🔴 | **Migrovat** lore data (peoples[]) do `src/content/world/narody/{lang}.json` |
| [x] `[lang]/svet-stredozeme/slovnicek/index.astro` | 205 | 19 | 0 | ✅ | OK (lore data v inline arrays — viz pozn.) |
| [x] `[lang]/svet-stredozeme/specificke-jednotky/index.astro` | 280 | 37 | 0 | ✅ | OK (lore data v inline arrays — viz pozn.) |
| [x] `[lang]/svet-stredozeme/uvod-do-sveta/index.astro` | 153 | 67 | 0 | ✅ | OK |

> **Pozn. ke „Clean" svet-stredozeme stránkám:** sice mají skript ukázal 0 hardcoded řádků (protože data jsou v `const` arrays uvnitř frontmatteru), ale ty arrays obsahují CS lore. Skript frontmatter ignoruje — což je správné pro běžné pages, ale tady je signal. **TODO:** migrate inline lore arrays do per-lang JSON.

### Velké stránky (právní + onboarding) — vyžadují speciální pattern

| Stránka | Řádků | t() | Hardcoded | Stav | Plán |
|---|---|---|---|---|---|
| [ ] `[lang]/cookies/index.astro` | 475 | 19 | 178 | 🔴 | Markdown content collection nebo per-page JSON |
| [ ] `[lang]/registrace/index.astro` | 529 | 11 | 128 | 🔴 | Per-page JSON v `src/content/pages/registrace/{lang}.json` |
| [ ] `[lang]/podminky-ucasti-a-registrace/index.astro` | 527 | 6 | 228 | 🔴 | Markdown content collection |
| [ ] `[lang]/gdpr/index.astro` | 747 | 8 | 313 | 🔴 | Markdown content collection |
| [ ] `[lang]/pravidla/index.astro` | 859 | 6 | 297 | 🔴 | Per-page JSON nebo markdown |
| [ ] `[lang]/organizacni-informace/index.astro` | 910 | 4 | 272 | 🔴 | Per-page JSON nebo markdown |
| [ ] `[lang]/pro-novacky/index.astro` | 1018 | 5 | 204 | 🔴 | Per-page JSON nebo markdown |

**Celkem řádků hardcoded textu k migraci:** ~2000 ř.

## Priorita migrace

### Fáze 1 — quick wins (tato session)

- [x] 1.1 — `404.astro` (6 lines) → `error.404.*` v ui.ts
- [x] 1.2 — `role/organizatori` (2 lines)
- [x] 1.3 — `frakce/[slug]` (8 lines)

### Fáze 2 — středně velké (této session, pokud zbývá čas)

- [ ] 2.1 — `svet-stredozeme/mistopis` (96 ř., regions array)
- [ ] 2.2 — `svet-stredozeme/narody` (125 ř., peoples array)
- [ ] 2.3 — `registrace` (128 ř., kratší než ostatní legal)

### Fáze 3 — velké legal/info stránky (samostatné PRs)

Vyžadují rozhodnutí o formátu (per-page JSON vs markdown content collection):

- [ ] 3.1 — `cookies` (178 ř.)
- [ ] 3.2 — `pravidla` (297 ř.)
- [ ] 3.3 — `gdpr` (313 ř.)
- [ ] 3.4 — `organizacni-informace` (272 ř.)
- [ ] 3.5 — `podminky-ucasti-a-registrace` (228 ř.)
- [ ] 3.6 — `pro-novacky` (204 ř.)

### Fáze 4 — sekundární (lore data v const arrays)

- [ ] 4.1 — `svet-stredozeme/slovnicek` (75 termínů)
- [ ] 4.2 — `svet-stredozeme/casova-linka` (32 událostí)
- [ ] 4.3 — `svet-stredozeme/specificke-jednotky` (12 záznamů)
- [ ] 4.4 — `svet-stredozeme/kralovstvi-a-rise` (14 záznamů)

## Konvence pro nové klíče

```jsonc
// src/i18n/ui/cs.json
{
  // Stránka /errors/404/
  "error.404.title": "Stránka nenalezena",
  "error.404.description": "Tahle cesta vede do Mordoru. Vrať se zpět.",
  "error.404.cta": "Zpět na úvodní stránku",
  
  // Stránka /role/organizatori/
  "page.org_team.toolbar_label": "Nástroje organizátora"
}
```

**Pravidlo pro klíče:** `page.{slug-as-snake}.{section}_{detail}`. Pro chybové stránky `error.{code}.{key}`.

## Sanity check

Po každé migrační sadě:

```bash
node --experimental-strip-types scripts/audit-pages.mjs > /tmp/audit.md
# Zkontrolovat, že počet hardcoded řádků klesl
diff /tmp/audit.md docs/audit/checklist-externalizace-stranek.md
```

Pak:

```bash
npm run build  # 267 stránek, mělo by projít
```
