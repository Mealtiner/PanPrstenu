#!/usr/bin/env node
/**
 * translate-statistiky-vypisy.mjs — překlad content collections
 * Datum: 2026-05-12
 *
 * Přeloží 4 content collections (cs → en/de/sk/uk):
 *   - src/content/pages/minule-rocniky/statistiky/
 *   - src/content/pages/minule-rocniky/statistiky/year/
 *   - src/content/pages/minule-rocniky/statistiky/srovnani/
 *   - src/content/pages/registrace/vypisy/
 *
 * Volný překlad s Tolkien/LARP kontextem. Spuštění:
 *   node scripts/translate-statistiky-vypisy.mjs
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const PAGES = {
  'minule-rocniky/statistiky': {
    en: {
      meta: {
        title: "Participant demographics — Pán Prstenů",
        description: "Participant demographics for the Pán Prstenů LARP: growth of the event since 1992, detailed breakdown of years 2024–2026, year-on-year trends.",
      },
      breadcrumb: {
        minule_rocniky: "Past years",
        demografie: "Participant demographics",
      },
      hero: {
        h1: "Participant demographics",
        lead: "How many we are each year, who we are, and how Pán Prstenů changes year by year.",
      },
      intro: {
        icon: "lucide:database",
        h2: "What participant data we collect",
        lead: "During registration we collect (with your consent) the data we need to organise the event — and at the same time these data allow us to paint a demographic picture of the Pán Prstenů community. The statistics are pre-aggregated — individual records never leave the registration system.",
        data_categories: [
          { label: "Side and army", desc: "(Free Peoples, Forces of the Dark Lord, Mercenaries, Non-playing companions, Children's game) and factions within (Gondor, Rohan, Elves, Dwarves, Orcs, Harad, Umbar, Wold)." },
          { label: "Age", desc: "— calculated from the year of birth. Used for the age pyramid and generational composition." },
          { label: "Gender", desc: "— self-declared (male / female / other / unspecified)." },
          { label: "Weapon choice", desc: "— one-handed, shield, long, bow, spear — for in-game logistics and balance." },
          { label: "Group or warband", desc: "— who you bring with you (families, parties, warbands). Used for Lorenz and Simpson group-cohesion analyses." },
          { label: "Arrival day", desc: "— for travel and campsite planning." },
          { label: "Registration date", desc: "— for the registration dynamics (who signs up early, who at the last minute)." },
        ],
        api_note_prefix: "No personal data (names, e-mails, contacts) is published in this archive. The pages rely exclusively on aggregated numbers — see API endpoint",
        api_note_endpoint: "/api/v1/events/PP{rok}/stats",
        api_note_suffix: ".",
      },
      graf_section: {
        after_note_prefix: "You'll find detailed context for individual eras in the",
        after_note_link_label: "Past years",
      },
      cards_section: {
        icon: "lucide:layout-grid",
        h2: "Statistics by year",
        lead: "Click a year — you'll see the full demographic breakdown: armies, age pyramid, weapon distribution, groups, registration dynamics.",
        cards: [
          { slug: "srovnani", icon: "lucide:git-compare-arrows", title: "Year-on-year comparison", desc: "Trends 2024 → 2026 side by side: attendance, age, armies, weapons, gender, registration dynamics. 10 chart sections.", accent_var: "--color-gold-light" },
          { slug: "2026", icon: "lucide:calendar-clock", title: "Year 2026", desc: "Current registration. Figures update in real time as sign-ups roll in. Tracked through the event day on 22 Aug 2026.", accent_var: "--color-gold" },
          { slug: "2025", icon: "lucide:archive", title: "Year 2025", desc: "Second-strongest modern year — 689 participants, main battle on 23 Aug 2025. Detailed breakdown of armies, age, groups.", accent_var: "--color-gold-dark" },
          { slug: "2024", icon: "lucide:archive", title: "Year 2024", desc: "511 participants, main battle on 24 Aug 2024. Mercenaries were still part of the Dark Forces — the side restructure only happened in 2025.", accent_var: "--color-gold-darkest" },
        ],
      },
      sidebar_aria: "Participant demographics",
    },
    de: {
      meta: {
        title: "Teilnehmerdemografie — Pán Prstenů",
        description: "Teilnehmerdemografie des LARPs Pán Prstenů: Wachstum der Veranstaltung seit 1992, detaillierte Analyse der Jahrgänge 2024–2026, Trends im Jahresvergleich.",
      },
      breadcrumb: {
        minule_rocniky: "Frühere Jahrgänge",
        demografie: "Teilnehmerdemografie",
      },
      hero: {
        h1: "Teilnehmerdemografie",
        lead: "Wie viele wir jedes Jahr sind, wer wir sind und wie sich Pán Prstenů Jahr für Jahr wandelt.",
      },
      intro: {
        icon: "lucide:database",
        h2: "Welche Daten wir über Teilnehmende erfassen",
        lead: "Bei der Anmeldung erheben wir mit Einverständnis Daten, die wir für die Organisation der Veranstaltung brauchen — und die zugleich ein demografisches Bild der Pán-Prstenů-Community zeichnen. Die Statistiken sind vorab aggregiert — einzelne Datensätze verlassen das Anmeldesystem nie.",
        data_categories: [
          { label: "Seite und Armee", desc: "(Freie Völker, Streitkräfte des Dunklen Herrschers, Söldner, Nicht-spielende Begleitung, Kinderspiel) und Fraktionen darin (Gondor, Rohan, Elben, Zwerge, Orks, Harad, Umbar, Wold)." },
          { label: "Alter", desc: "— berechnet aus dem Geburtsjahr. Dient der Alterspyramide und Generationenzusammensetzung." },
          { label: "Geschlecht", desc: "— selbstbestimmt (männlich / weiblich / divers / nicht angegeben)." },
          { label: "Waffenwahl", desc: "— einhändig, Schild, lang, Bogen, Speer — für Spiellogistik und Balance." },
          { label: "Gruppe oder Trupp", desc: "— wen du mitbringst (Familien, Gruppen, Trupps). Dient Lorenz- und Simpson-Analysen der Gruppenkohäsion." },
          { label: "Anreisetag", desc: "— für Reise- und Campsite-Planung." },
          { label: "Anmeldedatum", desc: "— für die Anmeldungsdynamik (wer sich früh anmeldet, wer in letzter Minute)." },
        ],
        api_note_prefix: "Keine persönlichen Daten (Namen, E-Mails, Kontakte) werden in diesem Archiv veröffentlicht. Die Seiten stützen sich ausschließlich auf aggregierte Zahlen — siehe API-Endpoint",
        api_note_endpoint: "/api/v1/events/PP{rok}/stats",
        api_note_suffix: ".",
      },
      graf_section: {
        after_note_prefix: "Den detaillierten Kontext zu den einzelnen Epochen findest du im Abschnitt",
        after_note_link_label: "Frühere Jahrgänge",
      },
      cards_section: {
        icon: "lucide:layout-grid",
        h2: "Statistiken nach Jahrgängen",
        lead: "Klicke auf einen Jahrgang — du siehst die vollständige demografische Analyse: Armeen, Alterspyramide, Waffenverteilung, Gruppen, Anmeldungsdynamik.",
        cards: [
          { slug: "srovnani", icon: "lucide:git-compare-arrows", title: "Jahresvergleich", desc: "Trends 2024 → 2026 nebeneinander: Teilnahme, Alter, Armeen, Waffen, Geschlecht, Anmeldungsdynamik. 10 Diagrammabschnitte.", accent_var: "--color-gold-light" },
          { slug: "2026", icon: "lucide:calendar-clock", title: "Jahrgang 2026", desc: "Aktuelle Anmeldung. Zahlen aktualisieren sich in Echtzeit, sobald Anmeldungen eintreffen. Verfolgt bis zum Veranstaltungstag am 22. 8. 2026.", accent_var: "--color-gold" },
          { slug: "2025", icon: "lucide:archive", title: "Jahrgang 2025", desc: "Zweitstärkster moderner Jahrgang — 689 Teilnehmende, Hauptschlacht am 23. 8. 2025. Detaillierte Analyse von Armeen, Alter, Gruppen.", accent_var: "--color-gold-dark" },
          { slug: "2024", icon: "lucide:archive", title: "Jahrgang 2024", desc: "511 Teilnehmende, Hauptschlacht am 24. 8. 2024. Söldner waren noch Teil der Dunklen Mächte — die Seitenneuordnung erfolgte erst 2025.", accent_var: "--color-gold-darkest" },
        ],
      },
      sidebar_aria: "Teilnehmerdemografie",
    },
    sk: {
      meta: {
        title: "Demografia účastníkov — Pán Prsteňov",
        description: "Demografické štatistiky účastníkov larpu Pán Prsteňov: rast akcie od roku 1992, detailný rozbor ročníkov 2024–2026, porovnanie trendov.",
      },
      breadcrumb: {
        minule_rocniky: "Minulé ročníky",
        demografie: "Demografia účastníkov",
      },
      hero: {
        h1: "Demografia účastníkov",
        lead: "Koľko nás každoročne je, kto sme a ako sa Pán Prsteňov mení ročník po ročníku.",
      },
      intro: {
        icon: "lucide:database",
        h2: "Aké údaje o účastníkoch evidujeme",
        lead: "Pri registrácii zbierame od účastníkov (s ich súhlasom) údaje, ktoré potrebujeme pre organizáciu akcie a ktoré zároveň umožňujú vykresliť demografický obraz komunity Pána Prsteňov. Štatistiky sú vopred agregované — jednotlivé dáta nikdy neopúšťajú registračný systém.",
        data_categories: [
          { label: "Strana a armáda", desc: "(Slobodné národy, Sily Temného pána, Žoldnieri, Nehrajúci sprievod, Detská hra) a frakcie vnútri (Gondor, Rohan, Elfovia, Trpaslíci, Škreti, Harad, Umbar, Vrchovina)." },
          { label: "Vek", desc: "— vypočítaný z roku narodenia. Slúži k vekovej pyramíde a generačnému zloženiu." },
          { label: "Pohlavie", desc: "— sebaurčené (muž / žena / iné / neuvedené)." },
          { label: "Voľba zbrane", desc: "— jednoručná, štít, dlhá, luk, kopija — pre hernú logistiku a balanc." },
          { label: "Skupina alebo družina", desc: "— koho so sebou účastník berie (rodiny, party, družiny). Slúži k Lorenzovým a Simpsonovým analýzam kohézie." },
          { label: "Deň príchodu", desc: "— pre plánovanie dopravy a tábora." },
          { label: "Dátum prihlásenia", desc: "— pre registračnú dynamiku (kto sa prihlasuje skoro, kto na poslednú chvíľu)." },
        ],
        api_note_prefix: "Žiadne osobné dáta (mená, e-maily, kontakty) nie sú v tomto archíve zverejnené. Stránky vychádzajú výhradne z agregovaných čísel — pozri API endpoint",
        api_note_endpoint: "/api/v1/events/PP{rok}/stats",
        api_note_suffix: ".",
      },
      graf_section: {
        after_note_prefix: "Detailný kontext jednotlivých ér nájdeš v sekcii",
        after_note_link_label: "Minulé ročníky",
      },
      cards_section: {
        icon: "lucide:layout-grid",
        h2: "Štatistiky pre jednotlivé ročníky",
        lead: "Klikni na ročník — uvidíš plný demografický rozbor: armády, vekovú pyramídu, distribúciu zbraní, skupiny, registračnú dynamiku.",
        cards: [
          { slug: "srovnani", icon: "lucide:git-compare-arrows", title: "Porovnanie ročníkov", desc: "Trendy 2024 → 2026 vedľa seba: účasť, vek, armády, zbrane, pohlavie, dynamika registrácie. 10 sekcií grafov.", accent_var: "--color-gold-light" },
          { slug: "2026", icon: "lucide:calendar-clock", title: "Ročník 2026", desc: "Aktuálna registrácia. Údaje sa menia v reálnom čase, ako pribúdajú prihlášky. Dianím sledované do dňa akcie 22. 8. 2026.", accent_var: "--color-gold" },
          { slug: "2025", icon: "lucide:archive", title: "Ročník 2025", desc: "Druhý najsilnejší novodobý ročník — 689 účastníkov, hlavná bitka 23. 8. 2025. Detailný rozbor armád, veku, skupín.", accent_var: "--color-gold-dark" },
          { slug: "2024", icon: "lucide:archive", title: "Ročník 2024", desc: "511 účastníkov, hlavná bitka 24. 8. 2024. Žoldnieri ešte ako súčasť Síl Temna — reštrukturalizácia strán prebehla až v 2025.", accent_var: "--color-gold-darkest" },
        ],
      },
      sidebar_aria: "Demografia účastníkov",
    },
    uk: {
      meta: {
        title: "Демографія учасників — Пан Перстенів",
        description: "Демографічна статистика учасників ларпу Пан Перстенів: зростання заходу з 1992 року, детальний розбір років 2024–2026, порівняння тенденцій.",
      },
      breadcrumb: {
        minule_rocniky: "Минулі роки",
        demografie: "Демографія учасників",
      },
      hero: {
        h1: "Демографія учасників",
        lead: "Скільки нас щороку, хто ми і як Пан Перстенів змінюється рік за роком.",
      },
      intro: {
        icon: "lucide:database",
        h2: "Які дані про учасників ми збираємо",
        lead: "Під час реєстрації ми збираємо (за згодою учасників) дані, потрібні для організації заходу — і ці дані водночас дозволяють побачити демографічну картину спільноти Пана Перстенів. Статистика попередньо агрегована — окремі записи ніколи не залишають реєстраційну систему.",
        data_categories: [
          { label: "Сторона і армія", desc: "(Вільні народи, Сили Темного володаря, Найманці, Небойовий супровід, Дитяча гра) і фракції всередині (Гондор, Рохан, Ельфи, Ґноми, Орки, Гарад, Умбар, Волд)." },
          { label: "Вік", desc: "— обчислений із року народження. Використовується для вікової піраміди та поколіннєвого складу." },
          { label: "Стать", desc: "— самовизначена (чоловік / жінка / інше / не вказано)." },
          { label: "Вибір зброї", desc: "— однорука, щит, довга, лук, спис — для ігрової логістики та балансу." },
          { label: "Група чи дружина", desc: "— з ким учасник приходить (сім'ї, групи, дружини). Використовується для аналізів згуртованості (Лоренц, Сімпсон)." },
          { label: "День прибуття", desc: "— для планування транспорту і табору." },
          { label: "Дата реєстрації", desc: "— для динаміки реєстрації (хто реєструється рано, хто в останню хвилину)." },
        ],
        api_note_prefix: "Жодні персональні дані (імена, електронні адреси, контакти) у цьому архіві не публікуються. Сторінки спираються виключно на агреговані числа — див. API-ендпоінт",
        api_note_endpoint: "/api/v1/events/PP{rok}/stats",
        api_note_suffix: ".",
      },
      graf_section: {
        after_note_prefix: "Детальний контекст окремих епох знайдеш у розділі",
        after_note_link_label: "Минулі роки",
      },
      cards_section: {
        icon: "lucide:layout-grid",
        h2: "Статистика за роками",
        lead: "Натисни на рік — побачиш повний демографічний розбір: армії, вікову піраміду, розподіл зброї, групи, реєстраційну динаміку.",
        cards: [
          { slug: "srovnani", icon: "lucide:git-compare-arrows", title: "Порівняння років", desc: "Тенденції 2024 → 2026 поруч: участь, вік, армії, зброя, стать, динаміка реєстрації. 10 розділів графіків.", accent_var: "--color-gold-light" },
          { slug: "2026", icon: "lucide:calendar-clock", title: "Рік 2026", desc: "Поточна реєстрація. Дані оновлюються в реальному часі, як надходять реєстрації. Відстежується до дня заходу 22. 8. 2026.", accent_var: "--color-gold" },
          { slug: "2025", icon: "lucide:archive", title: "Рік 2025", desc: "Другий найсильніший сучасний рік — 689 учасників, головна битва 23. 8. 2025. Детальний розбір армій, віку, груп.", accent_var: "--color-gold-dark" },
          { slug: "2024", icon: "lucide:archive", title: "Рік 2024", desc: "511 учасників, головна битва 24. 8. 2024. Найманці ще були частиною Темних сил — переструктурування сторін відбулося лише у 2025.", accent_var: "--color-gold-darkest" },
        ],
      },
      sidebar_aria: "Демографія учасників",
    },
  },
  'minule-rocniky/statistiky/year': {
    en: {
      meta_title: "Participant demographics {year} — Pán Prstenů",
      meta_description: "Pre-aggregated demographic overview from the {year} edition — counts, age, gender, armies, weapons.",
      breadcrumb: { minule_rocniky: "Past years", demografie: "Participant demographics", year: "Year {year}" },
      headline: "Participant demographics {year}",
      lead: "Pre-aggregated demographic overview from the {year} edition — counts, age, gender, armies, weapons.",
      sidebar_aria: "Participant demographics",
    },
    de: {
      meta_title: "Teilnehmerdemografie {year} — Pán Prstenů",
      meta_description: "Vorab aggregierte demografische Übersicht zum Jahrgang {year} — Anzahl, Alter, Geschlecht, Armeen, Waffen.",
      breadcrumb: { minule_rocniky: "Frühere Jahrgänge", demografie: "Teilnehmerdemografie", year: "Jahrgang {year}" },
      headline: "Teilnehmerdemografie {year}",
      lead: "Vorab aggregierte demografische Übersicht zum Jahrgang {year} — Anzahl, Alter, Geschlecht, Armeen, Waffen.",
      sidebar_aria: "Teilnehmerdemografie",
    },
    sk: {
      meta_title: "Demografia účastníkov {year} — Pán Prsteňov",
      meta_description: "Vopred agregované demografické prehľady z registrácie ročníka {year} — počty, vek, pohlavie, armády, zbrane.",
      breadcrumb: { minule_rocniky: "Minulé ročníky", demografie: "Demografia účastníkov", year: "Ročník {year}" },
      headline: "Demografia účastníkov {year}",
      lead: "Vopred agregované demografické prehľady z registrácie ročníka {year} — počty, vek, pohlavie, armády, zbrane.",
      sidebar_aria: "Demografia účastníkov",
    },
    uk: {
      meta_title: "Демографія учасників {year} — Пан Перстенів",
      meta_description: "Попередньо агрегований демографічний огляд із реєстрації року {year} — кількість, вік, стать, армії, зброя.",
      breadcrumb: { minule_rocniky: "Минулі роки", demografie: "Демографія учасників", year: "Рік {year}" },
      headline: "Демографія учасників {year}",
      lead: "Попередньо агрегований демографічний огляд із реєстрації року {year} — кількість, вік, стать, армії, зброя.",
      sidebar_aria: "Демографія учасників",
    },
  },
  'minule-rocniky/statistiky/srovnani': {
    en: {
      meta: {
        title: "Year-on-year comparison 2024–2026 — Pán Prstenů",
        description: "Year-on-year comparison of participant demographics at Pán Prstenů LARP: attendance growth, shifts in armies, age, gender, weapons and registration dynamics across 2024, 2025, 2026.",
      },
      breadcrumb: { minule_rocniky: "Past years", demografie: "Participant demographics", comparison: "Year-on-year comparison" },
      hero: {
        h1: "Year-on-year comparison 2024 – 2025 – 2026",
        lead: "How Pán Prstenů changes year by year — where armies grow, where age shifts, who signs up earlier.",
      },
      sidebar_aria: "Participant demographics",
    },
    de: {
      meta: {
        title: "Jahresvergleich 2024–2026 — Pán Prstenů",
        description: "Jahresvergleich der Teilnehmerdemografie beim LARP Pán Prstenů: Wachstum der Teilnahme, Verschiebungen bei Armeen, Alter, Geschlecht, Waffen und Anmeldungsdynamiken 2024, 2025, 2026.",
      },
      breadcrumb: { minule_rocniky: "Frühere Jahrgänge", demografie: "Teilnehmerdemografie", comparison: "Jahresvergleich" },
      hero: {
        h1: "Jahresvergleich 2024 – 2025 – 2026",
        lead: "Wie sich Pán Prstenů Jahr für Jahr wandelt — wo Armeen wachsen, wo sich das Alter verschiebt, wer sich früher anmeldet.",
      },
      sidebar_aria: "Teilnehmerdemografie",
    },
    sk: {
      meta: {
        title: "Porovnanie ročníkov 2024–2026 — Pán Prsteňov",
        description: "Medziročníkové porovnanie demografie účastníkov larpu Pán Prsteňov: rast účasti, posuny v armádach, veku, pohlaví, zbraniach a registračnej dynamike 2024, 2025, 2026.",
      },
      breadcrumb: { minule_rocniky: "Minulé ročníky", demografie: "Demografia účastníkov", comparison: "Porovnanie ročníkov" },
      hero: {
        h1: "Porovnanie ročníkov 2024 – 2025 – 2026",
        lead: "Ako sa Pán Prsteňov mení ročník od ročníka — kde rastú armády, kde sa posúva vek, kto sa registruje skôr.",
      },
      sidebar_aria: "Demografia účastníkov",
    },
    uk: {
      meta: {
        title: "Порівняння років 2024–2026 — Пан Перстенів",
        description: "Порівняння демографії учасників ларпу Пан Перстенів за роками: зростання участі, зміни в арміях, віці, статі, зброї та реєстраційній динаміці 2024, 2025, 2026.",
      },
      breadcrumb: { minule_rocniky: "Минулі роки", demografie: "Демографія учасників", comparison: "Порівняння років" },
      hero: {
        h1: "Порівняння років 2024 – 2025 – 2026",
        lead: "Як Пан Перстенів змінюється рік за роком — де армії ростуть, де змінюється вік, хто реєструється раніше.",
      },
      sidebar_aria: "Демографія учасників",
    },
  },
  'registrace/vypisy': {
    en: {
      meta_title_template: "{title} — Pán Prstenů 2026",
      meta_description_template: "{title} for the Pán Prstenů 2026 LARP.",
      breadcrumb: { vypis: "Participant list" },
      titulky: {
        "celkovy": "Complete list",
        "svobodne-narody": "Free Peoples of Middle-earth",
        "sily-temneho-pana": "Forces of the Dark Lord",
        "zoldaci": "Mercenaries — Highlanders of the Wold",
        "nehrajici": "Non-playing / Support",
        "detska-hra": "Children's game",
      },
      titulek_fallback: "Participant list",
      lead: "Registered participants of the Pán Prstenů 2026 LARP.",
      sidebar_aria: "Registration menu",
    },
    de: {
      meta_title_template: "{title} — Pán Prstenů 2026",
      meta_description_template: "{title} zum LARP Pán Prstenů 2026.",
      breadcrumb: { vypis: "Teilnehmerliste" },
      titulky: {
        "celkovy": "Gesamtliste",
        "svobodne-narody": "Freie Völker Mittelerdes",
        "sily-temneho-pana": "Streitkräfte des Dunklen Herrschers",
        "zoldaci": "Söldner — Hochländer aus Wold",
        "nehrajici": "Nicht-Spielende / Begleitung",
        "detska-hra": "Kinderspiel",
      },
      titulek_fallback: "Teilnehmerliste",
      lead: "Angemeldete Teilnehmende am LARP Pán Prstenů 2026.",
      sidebar_aria: "Anmeldemenü",
    },
    sk: {
      meta_title_template: "{title} — Pán Prsteňov 2026",
      meta_description_template: "{title} na larp Pán Prsteňov 2026.",
      breadcrumb: { vypis: "Zoznam prihlásených" },
      titulky: {
        "celkovy": "Celkový zoznam",
        "svobodne-narody": "Slobodné národy Stredozeme",
        "sily-temneho-pana": "Sily Temného pána",
        "zoldaci": "Žoldnieri — Horali z Vrchoviny",
        "nehrajici": "Nehrajúci / Nebojový sprievod",
        "detska-hra": "Detská hra",
      },
      titulek_fallback: "Zoznam prihlásených",
      lead: "Prihlásení účastníci larpu Pán Prsteňov 2026.",
      sidebar_aria: "Menu registrácie",
    },
    uk: {
      meta_title_template: "{title} — Пан Перстенів 2026",
      meta_description_template: "{title} на ларп Пан Перстенів 2026.",
      breadcrumb: { vypis: "Список учасників" },
      titulky: {
        "celkovy": "Повний список",
        "svobodne-narody": "Вільні народи Середзем'я",
        "sily-temneho-pana": "Сили Темного володаря",
        "zoldaci": "Найманці — Горяни з Волду",
        "nehrajici": "Неграючі / Небойовий супровід",
        "detska-hra": "Дитяча гра",
      },
      titulek_fallback: "Список учасників",
      lead: "Зареєстровані учасники ларпу Пан Перстенів 2026.",
      sidebar_aria: "Меню реєстрації",
    },
  },
};

let total = 0;
for (const [slug, langs] of Object.entries(PAGES)) {
  for (const [lang, data] of Object.entries(langs)) {
    const path = join(ROOT, 'src', 'content', 'pages', slug, `${lang}.json`);
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
    total++;
  }
  console.log(`✓ ${slug}: en/de/sk/uk written`);
}
console.log(`\n✓ Celkem ${total} souborů přeloženo`);
