# Stav i18n překladu

> Aktualizováno: 2026-05-03 po pushi `6d69825` (`/hra-v-tabore/`).
> Cílové jazyky: **cs / en / de / sk / uk** (5 jazyků).
> Workflow: jedna stránka = jeden commit + push do `main` → auto-deploy na new.panprstenu.cz.

## Souhrn

- **Hotovo:** 26/45 stránek
- **Zbývá:** 19/45 stránek
- **Všechny role-stránky hotové ✓**
- **Z informačních: hotovo 3/5** (zbývá `/pro-rodice/`, `/pro-novacky/`)

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

## Zbývá — informační stránky

- [ ] `/pro-rodice/` (619 ř.)
- [ ] `/pro-novacky/` (1007 ř.)

## Zbývá — frakce (hub + 9 detailů jako jeden šablonový soubor)

- [ ] `/frakce/` (hub)
- [ ] `/frakce/[slug]` (9 frakcí: gondor, rohan, elfove, trpaslici, skreti, skuruti, harad, umbar, horale-z-vrchoviny)

## Zbývá — svět Středozemě (hub + 7 podstránek)

- [ ] `/svet-stredozeme/` (hub)
- [ ] `/svet-stredozeme/uvod-do-sveta/`
- [ ] `/svet-stredozeme/casova-linka/`
- [ ] `/svet-stredozeme/kralovstvi-a-rise/`
- [ ] `/svet-stredozeme/narody/`
- [ ] `/svet-stredozeme/mistopis/`
- [ ] `/svet-stredozeme/specificke-jednotky/`
- [ ] `/svet-stredozeme/slovnicek/`

## Zbývá — velké / právní

- [ ] `/pravidla/` (~860 řádků)
- [ ] `/prakticke-info/`
- [ ] `/organizacni-informace/`
- [ ] `/registrace/`
- [ ] `/podminky-ucasti-a-registrace/`
- [ ] `/gdpr/`
- [ ] `/cookies/` (~468 řádků)

## Konvence (pro každou stránku)

1. Klíče v `src/i18n/ui.ts` → `page.{slug}.{section}_{detail}` (5 jazyků v pořadí cs → en → de → sk → uk).
2. Inline odkazy splitnout na `*_pre / *_link / *_post`, NE `set:html`.
3. Pro non-cs varianty právních stránek vložit `<AlertBox>{t('legal.jurisdiction_notice')}</AlertBox>`.
4. Strukturovaná data (FAQ, frakce) do separátních `src/data/*.ts` s `Record<Lang, T[]>` nebo `getXxx(lang)` switch funkcí.
5. Build (`npm run build`) → ověřit per-lang grep `dist/{en,de,sk,uk}/{slug}/index.html` → commit + push do `main`.
