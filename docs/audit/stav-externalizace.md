# Stav externalizace textů — checklist

Datum: 2026-05-03  
Vychází z [navrh-externalizace-textu.md](./navrh-externalizace-textu.md).

## Hotovo

### ✅ Krok 2 — Rozdělit `src/i18n/ui.ts`

**Commit:** `c5f7038`

- `src/i18n/ui/{cs,en,de,sk,uk}.json` — 2482 klíčů × 5 jazyků (~12 446 řádků JSON)
- `src/i18n/ui.ts` — typed loader (~75 řádků), importuje JSON přes `import * from './ui/{lang}.json'`
- Veřejné API zachováno: `getTranslation`, `getLangFromUrl`, `getLocalizedPath`, `Lang`, `TranslationKey`
- `scripts/extract-ui-to-json.mjs` — one-shot extrakční skript (zachován pro historii)

**Důsledek:** Krátké systémové UI texty jsou nyní přímo editovatelné v JSON bez znalosti TS. Ready pro budoucí WYSIWYG.

### ✅ Krok 3 (částečně) — Migrace `src/data/event.ts` (POC)

**Co je hotovo:**
- `src/content/site/event/meta.json` — language-agnostic hodnoty (datum, GPS, year, čísla)
- `src/content/site/event/{cs,en,de,sk,uk}.json` — localizované labely (title, region, popisy, payment_methods, …)
- `src/data/event.ts` přepsán jako typed loader: `getEvent(lang)` vrací `EventData`. `event` const zachován pro backward-compat (deprecated).
- `src/components/blocks/EventFactsBlock.astro` přepnut z `event` na `getEvent(lang)` — region a textové popisky se nyní lokalizují podle jazyka.

**Co zbývá v EventFactsBlock:**
- Hard-coded CS labely (`Akce v kostce`, `Termín`, `Místo`, `Účastníků`, `Věk`, `Armád`, `Tábořiště`, `Chceš jet do Středozemě?`, button labely) zůstávají v CS — patří jako t() klíče do `src/i18n/ui/{lang}.json`.

**Důsledek:** Pattern „shared meta + per-lang labels" je ověřený. Stejný přístup lze aplikovat na navigation/footer/drawers/faq (krok 3 zbytek).

## Zbývá

### ⏳ Krok 1 — Připravit infrastrukturu (content collections)

**Co je potřeba:**
- Rozšířit `src/content/config.ts` o nové kolekce: `pages`, `factions`, `roles`, `site`
- Vytvořit helpery v `src/lib/content/`:
  - `pages.ts` — `getPageContent(lang, slug)`
  - `site.ts` — `getSiteData(lang, segment)` (navigation, footer, drawers, event, faq)
  - `factions.ts` — `getFaction(slug, lang)`, `getAllFactions(lang)`
  - `roles.ts` — `getRole(slug, lang)`, `getAllRoles(lang)`
- Fallback strategie: aktuální jazyk → cs → `TranslationInProgressNotice`

**Riziko:** Střední. Astro Content Layer API (Astro 6) má svou specifika — `loader: glob({...})` musí být použito (NE starý `type: 'content'`).

### ⏳ Krok 3 — Migrovat globální prvky

V pořadí podle auditu:

- [ ] `src/data/navigation.ts` (278 ř.) → `src/content/site/navigation/{lang}.json`
  - Header.astro upravit, aby nepoužíval CS fallback z kódu
  - Riziko: vysoké (mění klíčový komponent na všech stránkách)
- [ ] `src/components/layout/Footer.astro` → `src/content/site/footer/{lang}.json`
- [ ] `src/components/layout/SideDrawers.astro` → `src/content/site/drawers/{lang}.json`
- [ ] `src/data/event.ts` (36 ř.) — split na `meta.json` (shared) + `{lang}.json` (popisy). Updatuje EventFactsBlock.astro
- [ ] `src/data/faq.ts` (1167 ř.) → `src/content/site/faq/{lang}.json`
  - **Pozor:** odpovědi obsahují inline `<a href="${L('/path/')}">` → potřeba placeholder (`{lang}` substituce) nebo pre-rendering URL při buildu

### ⏳ Krok 4 — Migrovat stránky po skupinách

Doporučené pořadí dle auditu:

**Sada 1 — malé stránky:**
- [ ] `registrace/kdyz-je-poplatek-problem`
- [ ] `podpor-ucastniky`
- [ ] `stanky-a-prodejci`
- [ ] `fotky-a-video`
- [ ] `bezpecnost`

**Sada 2 — registrační a právní:**
- [ ] `registrace`
- [ ] `podminky-ucasti-a-registrace`
- [ ] `gdpr`
- [ ] `cookies`

**Sada 3 — praktické:**
- [ ] `prakticke-info`
- [ ] `organizacni-informace`
- [ ] `pro-novacky`
- [ ] `pro-rodice`

**Sada 4 — herní obsah:**
- [ ] `pravidla`
- [ ] `hra-v-tabore`
- [ ] `detska-hra`

**Sada 5 — role:**
- [ ] `hobiti`, `nebojovy-doprovod`, `fotografove-a-kameramani`, `stankari`, `pomocnici`, `organizatori`

**Sada 6 — svět Středozemě (8 stránek):**
- [ ] hub, úvod, národy, místopis, království a říše, časová linka, specifické jednotky, slovníček

**Sada 7 — armády:**
- [ ] Převést `src/content/factions/*.yml` na `meta.json` + `{lang}.md`
- [ ] Upravit `frakce/index.astro` a `frakce/[slug].astro`

### ⏳ Krok 6 — Sjednocené šablony (volitelné, druhá fáze)

- [ ] `ContentPage.astro` — běžné stránky (hero, TOC, markdown body)
- [ ] `LegalPage.astro` — GDPR/cookies/podmínky
- [ ] `RolePage.astro` — detail role
- [ ] `FactionPage.astro` — detail armády
- [ ] `WorldPage.astro` — lore stránky

## Doporučení pro další session

1. **Začít krokem 1 (infrastruktura)** — bez něj nelze efektivně dělat krok 4. Cca 2–3 hod.
2. **Pak krok 3 v pořadí: event → footer → navigation → drawers → faq.** event.ts je nejmenší (sanity check pattern), navigation je riskantní (Header je všude). Cca 1–2 dny.
3. **Krok 4 dělat po sadách** — po každé sadě build + ručně otestovat 3–4 reprezentativní stránky × 5 jazyků.
4. **Po každé sadě commit + push do main**. Stejný workflow jako i18n překlady.
5. **Krok 6 (šablony) až úplně nakonec** nebo vůbec, pokud současné stránky vypadají OK.

## Kontrolní příkaz (z auditu)

```bash
rg -n "[ÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž]" src/pages src/components src/layouts src/data -g "*.astro" -g "*.ts"
```

Tento výpis by měl postupně klesat. Hotovo, když ukazuje jen komentáře, technické konstanty a CSS hodnoty.

## Build sanity check

Po každé migrační sadě:

```bash
npm run build  # 267 stránek, mělo by projít beze změny počtu
npm run check  # type check (volitelné)
```
