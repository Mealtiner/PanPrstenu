# Sitemap — Pán Prstenů 2026

> Vygenerováno: 30. dubna 2026
> Verze webu: commit `c8fe034` (po audit balíku #5 + mikroanimace)
> Stav: **134 stránek build** (33 unikátních CS × 4 jazyky + redirecty + frakce detail)

---

## 1. Seznam stránek (CS) — ploché URL

```
/                                      → redirect na /cs/
/cs/                                   Úvodní stránka
/cs/pribeh/                            Příběh ročníku
/cs/pravidla/                          Pravidla a bezpečnost
/cs/frakce/                            Frakce a národy (hub)
/cs/frakce/gondor/                     Frakce — Gondor
/cs/frakce/rohan/                      Frakce — Rohan
/cs/frakce/elves/                      Frakce — Elfové
/cs/frakce/dwarves/                    Frakce — Trpaslíci
/cs/frakce/mordor/                     Frakce — Mordor
/cs/frakce/isengard/                   Frakce — Isengard
/cs/frakce/easterlings/                Frakce — Východňané
/cs/svet-stredozeme/                   Svět Středozemě (lore)
/cs/pro-novacky/                       Jedu poprvé
/cs/hra-v-tabore/                      Hra v táboře
/cs/detska-hra/                        Hra pro malé dobrodruhy
/cs/prakticke-info/                    Praktické informace
/cs/organizacni-informace/             Organizační informace
/cs/bezpecnost/                        Bezpečnost
/cs/mapa/                              Mapa areálu
/cs/registrace/                        Registrace a platební informace
/cs/podminky-ucasti-a-registrace/      Podmínky účasti a registrace
/cs/novinky/                           Novinky
/cs/galerie/                           Galerie
/cs/fotky-a-video/                     Fotky a video — pravidla
/cs/faq/                               FAQ
/cs/kontakt/                           Kontakt
/cs/pro-media/                         Pro média (mediakit)
/cs/pro-stankare/                      Pro stánkaře a prodejce
/cs/stanky-a-prodejci/                 Stánky a prodejci (seznam)
/cs/poradatel/                         Pořadatel — Moravian LARP, z. s.
/cs/cookies/                           Cookies a nastavení soukromí
/cs/gdpr/                              GDPR / Ochrana osobních údajů
/cs/pristupnost/                       Přístupnost
```

**Mutace:** každá stránka existuje ve 4 jazycích (`cs`, `en`, `de`, `sk`).
EN/DE/SK aktuálně používají fallback na CZ texty pro většinu obsahu (lokalizace
neproběhla).

---

## 2. Strom struktury

```
panprstenu.cz/
│
├── /                                     [redirect → /cs/]
│
├── ÚVOD A ROZCESTNÍKY
│   ├── /cs/                              ★ Úvodní stránka
│   ├── /cs/pribeh/                       Příběh ročníku
│   └── /cs/pro-novacky/                  Jedu poprvé (novácký rozcestník)
│
├── HRA A SVĚT
│   ├── /cs/pravidla/                     Pravidla a bezpečnost (s vyhledáváním)
│   ├── /cs/frakce/                       Frakce a národy (hub, 2 sloupce)
│   │   ├── Svobodné národy
│   │   │   ├── /cs/frakce/gondor/
│   │   │   ├── /cs/frakce/rohan/
│   │   │   ├── /cs/frakce/elves/
│   │   │   └── /cs/frakce/dwarves/
│   │   └── Síly Temna
│   │       ├── /cs/frakce/mordor/
│   │       ├── /cs/frakce/isengard/
│   │       └── /cs/frakce/easterlings/
│   ├── /cs/svet-stredozeme/              Lore a setting (rozcestník)
│   └── /cs/hra-v-tabore/                 Hra v táboře (mince, vlajkovaná, RP)
│
├── DĚTI
│   └── /cs/detska-hra/                   Hra pro malé dobrodruhy
│
├── PRAKTICKÉ INFO
│   ├── /cs/prakticke-info/               Praktické informace + harmonogram
│   ├── /cs/organizacni-informace/        Organizační info (filtr podle role)
│   ├── /cs/bezpecnost/                   Bezpečnost
│   └── /cs/mapa/                         Mapa areálu (Google Maps embed)
│
├── REGISTRACE A PRÁVO
│   ├── /cs/registrace/                   Registrace + platební informace
│   ├── /cs/podminky-ucasti-a-registrace/ Podmínky účasti, storno, vyšší moc
│   ├── /cs/cookies/                      Cookies a nastavení soukromí
│   ├── /cs/gdpr/                         GDPR / Ochrana osobních údajů
│   ├── /cs/fotky-a-video/                Pravidla pro fotky a video
│   ├── /cs/pristupnost/                  Přístupnost (WCAG)
│   └── /cs/poradatel/                    Pořadatel (detailní identifikace)
│
├── KOMUNITA A OBSAH
│   ├── /cs/novinky/                      Novinky / blog
│   ├── /cs/galerie/                      Galerie z minulých ročníků
│   ├── /cs/faq/                          FAQ
│   └── /cs/kontakt/                      Kontakt
│
└── SPOLUPRÁCE / VEŘEJNOST
    ├── /cs/pro-media/                    Pro média (mediakit)
    ├── /cs/pro-stankare/                 Pro stánkaře (přihláška)
    └── /cs/stanky-a-prodejci/            Seznam přihlášených prodejců
```

---

## 3. Globální komponenty (společné napříč stránkami)

| Komponenta | Pozice | Popis |
|---|---|---|
| **Header** | `top, fixed` | Logo, hlavní navigace, hamburger (mobile), CTA Registrace |
| **Footer** | `bottom` | 5 sloupců: Brand / Pořadatel / Pro účastníky / Spolupráce / Legislativa + identifikační řádek |
| **AccessibilityToolbar** | `fixed bottom-right` | Téma, velikost písma, kontrast, čitelný font, omezení pohybu |
| **CookieConsent** | `fixed bottom-left` | Kruhové tlačítko cookies + first-visit banner s 4 kategoriemi |
| **SideDrawers** | `fixed right ~28vh` | Checklist + Jedu poprvé (md+ only) |
| **Skip-link** | `top-left, focus only` | „Přejít na hlavní obsah" — WCAG 2.4.1 |

---

## 4. Hlavní navigace v Headeru

```
Úvod · Příběh · Frakce · Pravidla · Praktické info · Novinky · Galerie · Kontakt
                                                                              [CTA: Registrovat se]
```

(Mobile: hamburger drawer s plnou navigací)

---

## 5. Položky ve Footeru (5 sloupců)

```
[1] Pán Prstenů           [2] Pořadatel         [3] Pro účastníky    [4] Spolupráce      [5] Legislativa
    Logo + popis              Moravian LARP        Jedu poprvé          a veřejnost        GDPR
    20.–23. 8. 2026           IČO 22669167         Praktické info       Dětská hra         Cookies
    Křtiny / Bukovina         info@panprstenu.cz   Hra v táboře         Org. info          Podmínky účasti
    [Soc. sítě]               www.panprstenu.cz    Pravidla             Pro média          Pravidla
                                                   Frakce               Pro stánkaře       Bezpečnost
                                                   Svět Středozemě      Stánky a prodejci  Mapa areálu
                                                   Registrace           Galerie            Přístupnost
                                                                        FAQ
```

Identifikační řádek pod sloupci:
```
Moravian LARP, z. s. · IČO 22669167 · Spisová značka L 12656 (Krajský soud v Brně)
· Sídlo Starobrněnská 289/7, 602 00 Brno · info@panprstenu.cz · Detail pořadatele
```

---

## 6. Plovoucí UX prvky

```
                                                      ┌─────────────────────┐
                                                      │  Side drawers       │ ← (md+ only)
                                                      │  • Checklist        │
                                                      │  • Jedu poprvé      │
                                                      └─────────────────────┘

┌──────────────────┐                            ┌──────────────────┐
│ 🍪 Cookies        │                            │ ♿ Přístupnost   │
│ (kruhové tlač.)  │                            │ (kruhové tlač.)  │
└──────────────────┘                            └──────────────────┘
   bottom-left                                       bottom-right
```

---

## 7. SEO / strojová čitelnost

- **JSON-LD** v `<head>` každé stránky:
  - `Organization` (Moravian LARP, IČO, sídlo) — sdílené napříč
  - `WebPage` (lang, name, description, url) — per stránka
  - `Event` (Pán Prstenů 2026) — pouze na úvodní stránce
  - `BreadcrumbList` — pokud má stránka drobečky
- **Hreflang** — 4 jazyky + `x-default` na CS
- **Open Graph + Twitter Card** — title, description, image
- **Canonical URL** — vždy na `https://www.panprstenu.cz/...`
- **Sitemap** — automaticky generovaný `/sitemap-index.xml` (i18n-aware)
- **robots.txt** — povoluje crawl produkce, blokuje NEW preprod
- **llms.txt** — strukturovaný index pro LLM/AI nástroje
- **PUBLIC_NOINDEX=true** na NEW preprod (new.panprstenu.cz) → `<meta robots>` noindex

---

## 8. Statistika

| Metrika | Hodnota |
|---|---|
| Unikátní CS stránky | 33 |
| Jazykové mutace | 4 (cs, en, de, sk) |
| Build celkem | 134 stránek |
| Sekce v `/pravidla/` (accordion) | 11 |
| Sekce v `/organizacni-informace/` | 11 |
| Frakcí (Svobodné národy) | 4 |
| Frakcí (Síly Temna) | 3 |
| Sloupce ve footeru (desktop) | 5 |

---

**Konec sitemap.**
