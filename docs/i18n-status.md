# Stav i18n překladu

> Aktualizováno: 2026-05-03 po pushi commit `2542c10` (svět Středozemě batch — 8 stránek) + práce na `/prakticke-info/`.
> Cílové jazyky: **cs / en / de / sk / uk** (5 jazyků).
> Workflow: jedna stránka = jeden commit + push do `main` → auto-deploy na new.panprstenu.cz.

## Souhrn

- **Hotovo:** 38/45 stránek (frakce hub + 9 frakcí jako 1 šablona = 10 stránek/lang; svět Středozemě = 8 stránek)
- **Zbývá:** 7/45 stránek
- **Všechny role-stránky hotové ✓**
- **Všechny svět Středozemě stránky hotové ✓** (UI plně přeloženo, lore data místo s `lang_notice`)
- **Frakce hub + detail šablona ✓** (UI texty; YAML lore data zůstávají v CS)

## Hlavní obsahové stránky

- [x] `/` — úvodní (page.home.* + 17 nových klíčů + opraven HraVTaboreTeaser)
- [x] `/pribeh/` — page.story.*
- [x] `/novinky/` (listing) + `/novinky/[slug]` (detail blogu)
- [x] `/faq/` — `src/data/faq.ts` s `getFaqGroups(lang)`, ~17 kategorií × 100 Q&A × 5 langs
- [x] `/kontakt/` — page.contact.*
- [x] `/poradatel/` — page.organizer.* + AlertBox jurisdikce
- [x] `/minule-rocniky/`
- [x] `/ohlasy/`
- [x] `/galerie/`
- [x] `/mapa/`
- [x] `/pristupnost/` — WCAG prohlášení (~70 klíčů)
- [x] `/kdo-jede/` — page.attendees.*
- [x] `/podpor-ucastniky/`
- [x] `/fotky-a-video/`
- [x] `/stanky-a-prodejci/`
- [x] `/pro-media/` — page.media.* (~50 klíčů)
- [x] `/registrace/kdyz-je-poplatek-problem/` — page.fee_problem.*
- [x] `/role/organizatori/` — page.org_team.*
- [x] `/role/pomocnici/` — page.helpers.* (~91 klíčů)
- [x] `/role/nebojovy-doprovod/` — page.escort.* (~71 klíčů)
- [x] `/role/hobiti/` — page.hobbits.* (~110 klíčů včetně 6-sekčního plného popisu role)
- [x] `/role/fotografove-a-kameramani/` — page.photographers.* (~100 klíčů)
- [x] `/role/stankari/` — page.stalls.* (~130 klíčů; namespace `page.stalls.*` ne `page.vendors.*`, který používá veřejná stránka `/stanky-a-prodejci/`)

## Informační stránky — hotovo

- [x] `/bezpecnost/` — page.safety.* (~60 klíčů)
- [x] `/detska-hra/` — page.kids.* (~130 klíčů včetně programové tabulky)
- [x] `/hra-v-tabore/` — page.camp_life.* (~150 klíčů včetně 6 karet novinek)
- [x] `/pro-rodice/` — page.parents.* (~180 klíčů, 16-položkový TOC + FAQ accordion + 10× related links)

## Zbývá — informační stránky

(žádné — `/pro-novacky/` přesunuto k velkým/právním kvůli rozsahu)

## Frakce — hotovo

- [x] `/frakce/` (hub) — page.factions.* (~85 klíčů)
- [x] `/frakce/[slug]` (9 frakcí, šablona) — page.faction_detail.* (~40 klíčů)
  - **Pozn.:** UI texty templatu plně přeložené, ale lore data v `src/content/factions/*.yml` (combat_style, lore_sections, ruler popis, recommended_for) zatím jen v CS. Pro non-CS prohlížeče se zobrazí jako lore fallback. Plný překlad lore = samostatný ticket (~360 polí).

## Svět Středozemě — hotovo

- [x] `/svet-stredozeme/` (hub) — page.world.*
- [x] `/svet-stredozeme/uvod-do-sveta/` — page.world_intro.*
- [x] `/svet-stredozeme/casova-linka/` — page.timeline.* (UI; popisy událostí v CS s lang_notice)
- [x] `/svet-stredozeme/kralovstvi-a-rise/` — page.realms.* (UI; lore v CS s lang_notice)
- [x] `/svet-stredozeme/narody/` — page.peoples.* (UI; lore v CS s lang_notice)
- [x] `/svet-stredozeme/mistopis/` — page.geography.* (UI; popisy regionů v CS s lang_notice)
- [x] `/svet-stredozeme/specificke-jednotky/` — page.units.* (UI; popisy v CS s lang_notice)
- [x] `/svet-stredozeme/slovnicek/` — page.glossary.* (UI; termíny v CS s lang_notice)

## Velké / právní — částečně hotovo

- [x] `/prakticke-info/` — page.practical.* (~110 klíčů, plný překlad včetně harmonogramu, karet, checklistu, alert boxů)

## Zbývá — velké / právní

- [ ] `/cookies/` (~468 řádků)
- [ ] `/registrace/` (~518 řádků)
- [ ] `/podminky-ucasti-a-registrace/` (~519 řádků)
- [ ] `/gdpr/` (~739 řádků)
- [ ] `/pravidla/` (~860 řádků)
- [ ] `/organizacni-informace/` (~910 řádků)
- [ ] `/pro-novacky/` (~1007 řádků)

## Konvence (pro každou stránku)

1. Klíče v `src/i18n/ui.ts` → `page.{slug}.{section}_{detail}` (5 jazyků v pořadí cs → en → de → sk → uk).
2. Inline odkazy splitnout na `*_pre / *_link / *_post`, NE `set:html`.
3. Pro non-cs varianty právních stránek vložit `<AlertBox>{t('legal.jurisdiction_notice')}</AlertBox>`.
4. Strukturovaná data (FAQ, frakce) do separátních `src/data/*.ts` s `Record<Lang, T[]>` nebo `getXxx(lang)` switch funkcí.
5. Build (`npm run build`) → ověřit per-lang grep `dist/{en,de,sk,uk}/{slug}/index.html` → commit + push do `main`.
