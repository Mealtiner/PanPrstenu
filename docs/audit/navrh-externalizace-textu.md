# Návrh externalizace textů a migrace pro Claude Code

Datum auditu: 2026-05-03  
Projekt: Pán Prstenů / Astro web  
Jazyky: `cs`, `en`, `de`, `sk`, `uk`

## Cíl

Cílem je dostat editovatelné texty mimo `.astro` komponenty a stránky, aby:

- texty šly upravovat bez zásahu do kódu,
- jeden obsah existoval vždy na jednom místě,
- šlo bezpečně spravovat 5 jazykových verzí,
- bylo možné později napojit WYSIWYG/headless editor,
- `.astro` soubory řešily hlavně strukturu, layout a vykreslení.

## Základní pravidlo

V `.astro` souborech nemají být celé věty, odstavce, nadpisy, popisy karet, CTA texty, položky menu ani texty patičky.

Výjimky:

- technické atributy a CSS třídy,
- neviditelné konstanty bez redakční hodnoty,
- ikony, slugy, ID sekcí, datové atributy,
- krátké fallbacky pouze dočasně při migraci.

## Doporučená cílová struktura

```text
src/
  i18n/
    ui/
      cs.json
      en.json
      de.json
      sk.json
      uk.json
    index.ts

  content/
    config.ts

    pages/
      cs/
        registrace/
          index.md
          kdyz-je-poplatek-problem.md
        pravidla.md
        gdpr.md
        cookies.md
        pro-novacky.md
        organizacni-informace.md
        prakticke-info.md
      en/
      de/
      sk/
      uk/

    factions/
      gondor/
        meta.json
        cs.md
        en.md
        de.md
        sk.md
        uk.md
      rohan/
      elves/
      dwarves/
      skreti/
      skuruti/
      harad/
      umbar/
      vrchovina/

    roles/
      hobiti/
        meta.json
        cs.md
        en.md
        de.md
        sk.md
        uk.md
      nebojovy-doprovod/
      fotografove-a-kameramani/
      stankari/
      pomocnici/
      organizatori/
      detska-hra/

    site/
      navigation/
        cs.json
        en.json
        de.json
        sk.json
        uk.json
      footer/
        cs.json
        en.json
        de.json
        sk.json
        uk.json
      drawers/
        cs.json
        en.json
        de.json
        sk.json
        uk.json
      event/
        cs.json
        en.json
        de.json
        sk.json
        uk.json
      faq/
        cs.json
        en.json
        de.json
        sk.json
        uk.json
      gallery/
        cs.json
        en.json
        de.json
        sk.json
        uk.json
```

## Co patří kam

### `src/i18n/ui/*.json`

Krátké systémové a opakované UI texty:

- `Zavřít`, `Číst dál`, `Zpět`, `Menu`,
- aria-labely,
- formulářové labely,
- cookie panel,
- panel přístupnosti,
- obecné hlášky,
- opakované názvy tlačítek.

Příklad:

```json
{
  "common.close": "Zavřít",
  "common.read_more": "Číst dál",
  "nav.menu": "Menu",
  "a11y.skip_to_main": "Přeskočit na hlavní obsah"
}
```

### `src/content/pages/{lang}/.../*.md`

Běžné obsahové stránky:

- pravidla,
- registrace,
- GDPR,
- cookies,
- praktické informace,
- organizační informace,
- svět Středozemě,
- podpůrné a právní stránky.

Markdown + frontmatter je nejvhodnější pro budoucí WYSIWYG, protože redaktor může upravovat obsah bez znalosti Astro šablon.

Příklad:

```md
---
title: "Když je registrační poplatek problém"
description: "Ozvi se nám. Pokusíme se najít cestu."
hero:
  eyebrow: "Registrace"
  title: "Když je registrační poplatek problém"
  text: "Víme, že účast na vícedenní akci může být finančně náročná."
toc:
  - id: kontakt
    label: "Jak se ozvat"
  - id: moznosti
    label: "Možnosti pomoci"
---

## Jak se ozvat

Napiš nám co nejdřív. Čím dřív víme, tím snáz můžeme hledat řešení.

## Možnosti pomoci

Podle situace může jít o individuální domluvu, podporu nebo jiný způsob zapojení.
```

### `src/content/factions/...`

Armády držet zvlášť, protože nejsou jen jedna stránka. Jsou to opakovaně používané datové entity:

- přehled armád,
- detail armády,
- boční navigace,
- stránka `kdo-jede`,
- budoucí registrace/kapacity/filtry,
- barvy, ikony, strana, obtížnost, pořadí.

Doporučený tvar jedné armády:

```text
src/content/factions/gondor/
  meta.json
  cs.md
  en.md
  de.md
  sk.md
  uk.md
```

`meta.json`:

```json
{
  "slug": "gondor",
  "side": "free",
  "order": 10,
  "colors": ["#1a3a5e", "#c9a75e"],
  "icon": "gondor",
  "difficultyForNewcomer": 2,
  "costumeDifficulty": 3,
  "roleplayDifficulty": 3
}
```

`cs.md`:

```md
---
name: "Gondor"
tagline: "Strážci západu, krev Númenoru"
ruler:
  name: "Aragorn"
  title: "Král Gondoru, dědic Isildurův"
costumeColors: "modrá, bílá, šedá, hnědá a stříbrná"
recommendedFor:
  - "hráči hledající vznešený a heraldický styl"
notRecommendedFor:
  - "hráči, kteří nemají čas připravit kostým s heraldikou"
---

## O gondorské armádě

Text o armádě.

## Stylizace kostýmu

Text o kostýmu.
```

### `src/content/roles/...`

Role jsou podobné armádám, ale mají vlastní katalog:

- hobiti,
- nebojový doprovod,
- fotografové a kameramani,
- stánkaři,
- pomocníci,
- organizátoři,
- dětská hra.

Struktura stejná jako u armád: `meta.json` pro technické údaje, jazykové `.md` pro obsah.

### `src/content/site/navigation/*.json`

Kompletní menu, megamenu a CTA. Komponenta `Header.astro` má jen vykreslovat data podle aktuálního jazyka.

Příklad:

```json
{
  "primaryCta": {
    "label": "Registrovat se",
    "href": "/registrace/"
  },
  "items": [
    {
      "type": "link",
      "key": "home",
      "label": "Úvod",
      "href": "/"
    },
    {
      "type": "mega",
      "key": "world",
      "label": "Hra a svět",
      "columns": []
    }
  ]
}
```

### `src/content/site/footer/*.json`

Patička webu:

- sloupce odkazů,
- popisy,
- kontaktní texty,
- právní odkazy,
- texty pro tlačítko nastavení cookies.

Technické odkazy mohou zůstat v JSON jako `href`, redakční texty jako `label`.

### `src/content/site/drawers/*.json`

Vyjížděcí karty:

- checklist,
- karta `Jedu poprvé`,
- texty tabů,
- nadpisy,
- kroky,
- odkazy.

Příklad:

```json
{
  "checklist": {
    "tab": "Checklist",
    "title": "Než vyrazíš",
    "intro": "Krátký praktický seznam věcí před akcí.",
    "items": [
      { "id": "registered", "text": "Jsem registrovaný" },
      { "id": "rules-read", "text": "Přečetl jsem pravidla" }
    ]
  },
  "newcomer": {
    "tab": "Jedu poprvé",
    "title": "První cesta",
    "steps": []
  }
}
```

### `src/content/site/event/*.json`

Sdílená fakta o akci:

- termín,
- místo,
- region,
- věk,
- registrační systém,
- platební texty,
- krátké opakované popisky.

Pozor: číselné a technické hodnoty mohou být společné, ale slovní popisy musí být po jazycích.

### `src/content/site/faq/*.json`

FAQ je redakční obsah, ale je strukturovaný. Proto jej dát mimo `src/data/faq.ts`.

Příklad:

```json
{
  "groups": [
    {
      "id": "registrace",
      "label": "Registrace, platba a storno",
      "icon": "lucide:credit-card",
      "items": [
        {
          "question": "Jak funguje registrace?",
          "answer": "Registrace probíhá online přes systém Registračka.cz."
        }
      ]
    }
  ]
}
```

## Doporučené helpery

Vytvořit malou vrstvu pro načítání obsahu, aby stránky nemusely znát fyzické cesty k souborům.

Navržené soubory:

```text
src/lib/content/pages.ts
src/lib/content/site.ts
src/lib/content/factions.ts
src/lib/content/roles.ts
```

Příklad použití ve stránce:

```astro
---
import { getPageContent } from '@lib/content/pages';

const page = await getPageContent(Astro.params.lang, 'registrace/kdyz-je-poplatek-problem');
---

<BaseLayout title={page.title} description={page.description}>
  <PageHero {...page.hero} />
  <MarkdownContent content={page.body} />
</BaseLayout>
```

## Stránky s tvrdě vloženými texty

Následující stránky mají texty přímo v `.astro` šablonách a mají být migrovány do `src/content/pages`, `src/content/roles` nebo `src/content/factions`.

### Nejvyšší priorita

Tyto stránky mají nejvíc obsahu natvrdo:

- `src/pages/[lang]/pravidla/index.astro`
- `src/pages/[lang]/organizacni-informace/index.astro`
- `src/pages/[lang]/pro-novacky/index.astro`
- `src/pages/[lang]/gdpr/index.astro`
- `src/pages/[lang]/cookies/index.astro`
- `src/pages/[lang]/hra-v-tabore/index.astro`
- `src/pages/[lang]/registrace/index.astro`
- `src/pages/[lang]/podminky-ucasti-a-registrace/index.astro`
- `src/pages/[lang]/prakticke-info/index.astro`

### Běžné obsahové stránky

- `src/pages/[lang]/bezpecnost/index.astro`
- `src/pages/[lang]/fotky-a-video/index.astro`
- `src/pages/[lang]/pro-media/index.astro`
- `src/pages/[lang]/pro-rodice/index.astro`
- `src/pages/[lang]/podpor-ucastniky/index.astro`
- `src/pages/[lang]/registrace/kdyz-je-poplatek-problem/index.astro`
- `src/pages/[lang]/stanky-a-prodejci/index.astro`
- `src/pages/404.astro`

### Armády a frakce

- `src/pages/[lang]/frakce/index.astro`
- `src/pages/[lang]/frakce/[slug].astro`
- `src/content/factions/*.yml`

Poznámka: `src/content/factions/*.yml` je už mimo stránku, ale struktura není ideální pro 5 jazyků a WYSIWYG. Doporučení je rozdělit armády na `meta.json` + jazykové `.md`.

### Role

- `src/pages/[lang]/role/fotografove-a-kameramani/index.astro`
- `src/pages/[lang]/role/hobiti/index.astro`
- `src/pages/[lang]/role/nebojovy-doprovod/index.astro`
- `src/pages/[lang]/role/organizatori/index.astro`
- `src/pages/[lang]/role/pomocnici/index.astro`
- `src/pages/[lang]/role/stankari/index.astro`
- `src/pages/[lang]/detska-hra/index.astro`

### Svět Středozemě

- `src/pages/[lang]/svet-stredozeme/index.astro`
- `src/pages/[lang]/svet-stredozeme/casova-linka/index.astro`
- `src/pages/[lang]/svet-stredozeme/kralovstvi-a-rise/index.astro`
- `src/pages/[lang]/svet-stredozeme/mistopis/index.astro`
- `src/pages/[lang]/svet-stredozeme/narody/index.astro`
- `src/pages/[lang]/svet-stredozeme/slovnicek/index.astro`
- `src/pages/[lang]/svet-stredozeme/specificke-jednotky/index.astro`
- `src/pages/[lang]/svet-stredozeme/uvod-do-sveta/index.astro`

### Drobné nálezy

- `src/pages/[lang]/galerie/index.astro` - hlavně alt text galerie.
- `src/pages/[lang]/mapa/index.astro` - audit zde našel hlavně CSS třídu, reálný obsah je převážně přes `t()`.

### Stránky, které jsou relativně v pořádku

Tyto šablony už vypadají převážně externalizovaně přes `t()` nebo obsahové kolekce:

- `src/pages/[lang]/index.astro`
- `src/pages/[lang]/faq/index.astro`
- `src/pages/[lang]/kdo-jede/index.astro`
- `src/pages/[lang]/kontakt/index.astro`
- `src/pages/[lang]/mapa/index.astro`
- `src/pages/[lang]/minule-rocniky/index.astro`
- `src/pages/[lang]/novinky/index.astro`
- `src/pages/[lang]/novinky/[slug].astro`
- `src/pages/[lang]/ohlasy/index.astro`
- `src/pages/[lang]/poradatel/index.astro`
- `src/pages/[lang]/pribeh/index.astro`
- `src/pages/[lang]/pristupnost/index.astro`
- `src/pages/index.astro`

## Sdílené prvky s tvrdě vloženými texty

Tyto soubory nejsou stránky, ale jejich texty jsou viditelné pro uživatele:

- `src/components/layout/Header.astro`
- `src/data/navigation.ts`
- `src/components/layout/Footer.astro`
- `src/components/layout/Logo.astro`
- `src/components/layout/LanguageSwitcher.astro`
- `src/components/blocks/TocSidebar.astro`
- `src/components/blocks/MobileSidebarShell.astro`
- `src/components/blocks/FactionRolesSidebar.astro`
- `src/components/blocks/EventFactsBlock.astro`
- `src/components/blocks/RegistraceBigCta.astro`
- `src/components/blocks/TranslationInProgressNotice.astro`
- `src/components/ui/Breadcrumb.astro`
- `src/components/ui/Pagination.astro`
- `src/data/event.ts`
- `src/data/faq.ts`
- `src/data/navigation.ts`

## Doporučený postup migrace

### 1. Připravit infrastrukturu

1. Vytvořit `src/content/config.ts`.
2. Definovat kolekce pro `pages`, `factions`, `roles`, `site`.
3. Vytvořit helpery pro načítání obsahu podle jazyka.
4. Připravit fallback strategii:
   - primárně aktuální jazyk,
   - fallback na `cs`,
   - u chybějícího překladu volitelně zobrazit `TranslationInProgressNotice`.

### 2. Rozdělit `src/i18n/ui.ts`

1. Převést současný `src/i18n/ui.ts` na JSON soubory po jazycích.
2. Ponechat `src/i18n/index.ts` jako typed loader a funkci `t(key)`.
3. Do UI překladů dávat jen krátké opakované texty.
4. Dlouhé odstavce z UI překladů nepřidávat; patří do Markdownu nebo JSON dat.

### 3. Migrovat globální prvky

Pořadí:

1. `navigation` - přesunout `src/data/navigation.ts` do `src/content/site/navigation/*.json`.
2. `Header.astro` upravit tak, aby nepoužíval české fallback labely z kódu.
3. `footer` - přesunout texty patičky do `src/content/site/footer/*.json`.
4. `drawers` - přesunout vyjížděcí karty do `src/content/site/drawers/*.json`.
5. `event` - přesunout viditelné texty z `src/data/event.ts` do `src/content/site/event/*.json`.
6. `FAQ` - přesunout `src/data/faq.ts` do `src/content/site/faq/*.json`.

### 4. Migrovat stránky po skupinách

Nemigrovat všech 35 stránek najednou. Dělat malé sady a po každé sadě spustit build.

Doporučené pořadí:

1. Malé stránky:
   - `registrace/kdyz-je-poplatek-problem`
   - `podpor-ucastniky`
   - `stanky-a-prodejci`
   - `fotky-a-video`
   - `bezpecnost`
2. Registrační a právní blok:
   - `registrace`
   - `podminky-ucasti-a-registrace`
   - `gdpr`
   - `cookies`
3. Praktické informace:
   - `prakticke-info`
   - `organizacni-informace`
   - `pro-novacky`
   - `pro-rodice`
4. Herní obsah:
   - `pravidla`
   - `hra-v-tabore`
   - `detska-hra`
5. Role:
   - `hobiti`
   - `nebojovy-doprovod`
   - `fotografove-a-kameramani`
   - `stankari`
   - `pomocnici`
   - `organizatori`
6. Svět Středozemě:
   - hub,
   - úvod do světa,
   - národy,
   - místopis,
   - království a říše,
   - časová linka,
   - specifické jednotky,
   - slovníček.
7. Armády:
   - převést YAML na `meta.json` + jazykové `.md`,
   - upravit přehled a detail armády.

### 5. Zachovat URL

Při migraci nesmí dojít ke změně veřejných URL:

- `/cs/registrace/`
- `/cs/registrace/kdyz-je-poplatek-problem/`
- `/cs/pravidla/`
- `/cs/frakce/gondor/`
- atd.

Mění se pouze zdroj obsahu, ne routy.

### 6. Šablony sjednotit, ale nepřerefaktorovat design

Claude Code má při migraci zachovat současný vzhled. Úkolem není redesign.

Doporučené sdílené šablony:

- `ContentPage.astro` - běžné stránky s hero, TOC a markdown obsahem.
- `LegalPage.astro` - právní stránky typu GDPR/cookies/podmínky.
- `RolePage.astro` - detail role.
- `FactionPage.astro` - detail armády.
- `WorldPage.astro` - lore stránky.

Pokud je současná stránka vizuálně specifická, nejdřív jen vytáhnout texty a zachovat stávající HTML strukturu. Sdílené šablony dělat až ve druhé fázi.

## Kontrolní pravidla pro Claude Code

Při každé migrační sadě:

1. Nejdřív vytvořit obsahové soubory pro všech 5 jazyků.
2. Pokud překlad neexistuje, dočasně zkopírovat český obsah a označit frontmatterem:

```yaml
translationStatus: "needs-review"
sourceLang: "cs"
```

3. Potom upravit `.astro` stránku, aby načítala obsah z nové struktury.
4. Z kódu odstranit původní tvrdé texty.
5. Zachovat všechny existující URL, kotvy a interní odkazy.
6. Po každé sadě spustit:

```bash
npm run build
```

7. Pokud existuje typová kontrola:

```bash
npm run check
```

8. Po dokončení udělat rychlý audit:

```bash
rg -n "[ÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž]" src/pages src/components src/layouts src/data -g "*.astro" -g "*.ts"
```

Tento příkaz nemá být úplně prázdný, protože komentáře a technické výjimky mohou zůstat, ale nesmí ukazovat dlouhé viditelné texty stránek.

## Kritéria hotovo

Migrace je hotová, když:

- dlouhé texty stránek nejsou v `.astro`,
- menu je mimo `src/data/navigation.ts`,
- patička je mimo `Footer.astro`,
- vyjížděcí karty jsou mimo `SideDrawers.astro`,
- FAQ je mimo `src/data/faq.ts`,
- event texty jsou mimo `src/data/event.ts`,
- armády a role jsou jako redakční obsah v `src/content`,
- všech 5 jazyků má vlastní soubory,
- chybějící překlady jsou označené `translationStatus: "needs-review"`,
- build projde,
- URL zůstanou stejné.

## Poznámka k budoucímu WYSIWYG

Navržená struktura je vhodná pro pozdější napojení editoru typu TinaCMS, Decap/Static CMS nebo vlastní jednoduchý editor.

WYSIWYG by měl upravovat pouze:

- `src/content/pages/**`,
- `src/content/factions/**`,
- `src/content/roles/**`,
- `src/content/site/**`,
- `src/i18n/ui/*.json`.

Neměl by upravovat:

- `src/pages/**`,
- `src/components/**`,
- `src/layouts/**`,
- `src/styles/**`.

Tím zůstane oddělená redakční práce od vývoje.
