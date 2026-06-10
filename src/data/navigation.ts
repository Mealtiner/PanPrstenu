/**
 * Navigation data model — Pán Prstenů 2026
 * Datum: 2026-05-01
 *
 * Hlavní menu se sedmi top-level položkami + CTA Registrovat se.
 * Megamenu položky mají 2–3 sloupce; přímé linky jsou plain.
 *
 * Lokalizace: aktuálně CZ texty fallback; další jazyky doplníme až s lokalizací.
 * URL prefixujeme `/{lang}/` v komponentě, tady necháváme bez prefixu kromě
 * případů, kdy odkaz zůstává na CS variantu (kotvy v aktuálních CS pages).
 */

/** Překladové bloky pro non-cs jazyky (label + description). cs je v rodičovské
 *  property `label`/`description` — to je fallback. */
export type NavLeafI18n = Partial<Record<'en' | 'de' | 'sk' | 'uk', { label?: string; description?: string }>>;

export type NavLeaf = {
  label: string;
  href: string; // bez /{lang}/ prefixu pro relativní stránky; with /cs/ pro fixní kotvy
  description?: string;
  /** Pokud true, href se NEpředponuje s `/{lang}/` (např. již obsahuje /cs/) */
  absolute?: boolean;
  /** Překlady labelů a description pro non-cs jazyky. */
  i18n?: NavLeafI18n;
  /** Pokud true, položka v mega-menu je vizuálně zvýrazněná (rámeček + jemné podbarvení). */
  featured?: boolean;
};

export type NavColumn = {
  heading: string;
  items: NavLeaf[];
};

export type NavHighlight = {
  /** Volitelné info řádky NAD nadpisem (datum, místo, …) */
  info?: { label: string; value: string; i18n?: Partial<Record<'en' | 'de' | 'sk' | 'uk', { label?: string }>> }[];
  title: string;
  text: string;
  links: NavLeaf[];
  /** Volitelné velké CTA tlačítko POD highlightem (např. „Registruj se") */
  cta?: { label: string; href: string; i18n?: NavLeafI18n };
};

export type NavItem =
  | { type: 'link'; label: string; href: string; key: string; description?: string; absolute?: boolean }
  | {
      type: 'mega';
      label: string;
      key: string;
      /** Volitelný odkaz na hub stránku (rozcestník odpovídající megamenu).
       *  Pokud je nastaven, top-level v Headeru je klikací. */
      href?: string;
      columns: NavColumn[];
      highlight?: NavHighlight;
    };

/**
 * Hlavní navigace.
 * Pro href bez `/{lang}/` prefixu používej `/pro-novacky/` apod.
 * Pro absolutní (např. odkaz s kotvou): `/cs/frakce/#role` + absolute: true.
 * (V naší aplikaci si ale generujeme i kotvy z prefixu — viz Header.astro.)
 */
export const mainNavigation: NavItem[] = [
  {
    type: 'link',
    key: 'home',
    label: 'Úvod',
    href: '/',
    description: 'Pán Prstenů 2026 · 20.–23. 8. · Pulkovský mlýn, Rozkoš',
  },
  {
    type: 'link',
    key: 'newcomer',
    label: 'Jedu poprvé',
    href: '/pro-novacky/',
    description: 'První cesta od registrace až po sobotní bitvu.',
  },
  {
    type: 'mega',
    key: 'world',
    label: 'Hra a svět',
    href: '/hra-a-svet/',
    columns: [
      {
        heading: 'Jak se hraje',
        items: [
          { label: 'Pravidla a bezpečnost', href: '/pravidla/', description: 'Boj, zbraně, zásahy, životy, kostýmy a fair play.', featured: true, i18n: { en: { label: 'Rules and safety', description: 'Combat, weapons, hits, lives, costumes and fair play.' }, de: { label: 'Regeln und Sicherheit', description: 'Kampf, Waffen, Treffer, Leben, Kostüme und Fairplay.' }, sk: { label: 'Pravidlá a bezpečnosť', description: 'Boj, zbrane, zásahy, životy, kostýmy a fair play.' }, uk: { label: 'Правила і безпека', description: 'Бій, зброя, влучання, життя, костюми та фер-плей.' } } },
          { label: 'Hra v táboře', href: '/hra-v-tabore/', description: 'Mince, táborový život, páteční program a mikro questy.', i18n: { en: { label: 'Camp life', description: 'Coins, camp life, Friday programme and micro-quests.' }, de: { label: 'Lagerleben', description: 'Münzen, Lagerleben, Freitagsprogramm und Mikro-Quests.' }, sk: { label: 'Hra v tábore', description: 'Mince, táborový život, piatkový program a mikro questy.' }, uk: { label: 'Табірне життя', description: 'Монети, табірне життя, п’ятнична програма і мікроквести.' } } },
          { label: 'Dětská hra', href: '/detska-hra/', description: 'Program pro malé dobrodruhy a informace pro rodiče.', i18n: { en: { label: 'Children\u2019s game', description: 'A programme for little adventurers and info for parents.' }, de: { label: 'Kinderspiel', description: 'Ein Programm für kleine Abenteurer und Infos für Eltern.' }, sk: { label: 'Detská hra', description: 'Program pre malých dobrodruhov a info pre rodičov.' }, uk: { label: 'Дитяча гра', description: 'Програма для маленьких шукачів пригод та інфо для батьків.' } } },
          { label: 'Pravidla focení a natáčení', href: '/fotky-a-video/', description: 'Jak fotit, natáčet a nerušit hru ani účastníky.', i18n: { en: { label: 'Photo and video rules', description: 'How to shoot, film and not disturb the play or others.' }, de: { label: 'Foto- und Videoregeln', description: 'Wie fotografieren und filmen, ohne das Spiel zu stören.' }, sk: { label: 'Pravidlá fotenia a natáčania', description: 'Ako fotiť, natáčať a nerušiť hru ani účastníkov.' }, uk: { label: 'Правила фото та відео', description: 'Як знімати і не заважати грі чи учасникам.' } } },
        ],
      },
      {
        heading: 'Za koho a proč se hraje',
        items: [
          { label: 'Příběh ročníku', href: '/pribeh/', description: 'Zvěsti, motivace stran a příběhový rámec ročníku 2026.', i18n: { en: { label: 'Story of this year', description: 'Rumours, motives of the sides and the narrative frame of 2026.' }, de: { label: 'Geschichte des Jahrgangs', description: 'Gerüchte, Motive der Seiten und erzählerischer Rahmen 2026.' }, sk: { label: 'Príbeh ročníka', description: 'Zvesti, motivácie strán a príbehový rámec ročníka 2026.' }, uk: { label: 'Історія року', description: 'Чутки, мотиви сторін і сюжетний каркас 2026 року.' } } },
          { label: 'Armády a strany', href: '/frakce/', description: 'Vyber si armádu, barvy, kostým a styl hry.', i18n: { en: { label: 'Armies and sides', description: 'Pick an army, colours, costume and play style.' }, de: { label: 'Armeen und Seiten', description: 'Wähle deine Armee, Farben, Kostüm und Spielstil.' }, sk: { label: 'Armády a strany', description: 'Vyber si armádu, farby, kostým a štýl hry.' }, uk: { label: 'Армії та сторони', description: 'Обери армію, кольори, костюм і стиль гри.' } } },
          { label: 'Svobodné národy Středozemě', href: '/frakce/#svobodne-narody', description: 'Gondor, Rohan, Elfové a Trpaslíci.', i18n: { en: { label: 'Free Peoples of Middle-earth', description: 'Gondor, Rohan, Elves and Dwarves.' }, de: { label: 'Freie Völker Mittelerdes', description: 'Gondor, Rohan, Elben und Zwerge.' }, sk: { label: 'Slobodné národy Stredozeme', description: 'Gondor, Rohan, Elfovia a Trpaslíci.' }, uk: { label: 'Вільні народи Середзем’я', description: 'Ґондор, Рохан, Ельфи і Гноми.' } } },
          { label: 'Síly Temného pána', href: '/frakce/#sily-temna', description: 'Skřeti, Skuruti, Harad a Umbar.', i18n: { en: { label: 'Forces of the Dark Lord', description: 'Orcs, Uruk-hai, Harad and Umbar.' }, de: { label: 'Streitkräfte des Dunklen Herrn', description: 'Orks, Uruk-hai, Harad und Umbar.' }, sk: { label: 'Sily Temného pána', description: 'Orkovia, Urukovia, Harad a Umbar.' }, uk: { label: 'Сили Темного володаря', description: 'Орки, Урук-хай, Гарад і Умбар.' } } },
        ],
      },
      {
        heading: 'Svět Středozemě',
        items: [
          { label: 'Svět Středozemě', href: '/svet-stredozeme/', description: 'Lore, národy, království, místopis a časová linka.', i18n: { en: { label: 'World of Middle-earth', description: 'Lore, peoples, kingdoms, places and timeline.' }, de: { label: 'Welt Mittelerdes', description: 'Lore, Völker, Königreiche, Orte und Zeitlinie.' }, sk: { label: 'Svet Stredozeme', description: 'Lore, národy, kráľovstvá, miestopis a časová línia.' }, uk: { label: 'Світ Середзем’я', description: 'Lore, народи, королівства, географія і хронологія.' } } },
          { label: 'Národy a království', href: '/svet-stredozeme/narody/', description: 'Kdo je kdo ve světě, kde se naše hra odehrává.', i18n: { en: { label: 'Peoples and kingdoms', description: 'Who is who in the world where our game is set.' }, de: { label: 'Völker und Königreiche', description: 'Wer ist wer in der Welt, in der unser Spiel stattfindet.' }, sk: { label: 'Národy a kráľovstvá', description: 'Kto je kto vo svete, kde sa hra odohráva.' }, uk: { label: 'Народи і королівства', description: 'Хто є хто у світі, де відбувається наша гра.' } } },
          { label: 'Místopis', href: '/svet-stredozeme/mistopis/', description: 'Rohan, Gondor, Moria, Lórien, Železný pas a další místa.', i18n: { en: { label: 'Places', description: 'Rohan, Gondor, Moria, Lórien, Isengard and other places.' }, de: { label: 'Orte', description: 'Rohan, Gondor, Moria, Lórien, Isengard und andere Orte.' }, sk: { label: 'Miestopis', description: 'Rohan, Gondor, Moria, Lórien, Železný pas a ďalšie miesta.' }, uk: { label: 'Географія', description: 'Рохан, Ґондор, Морія, Лоріен, Ізенґард та інші місця.' } } },
          { label: 'Časová linka', href: '/svet-stredozeme/casova-linka/', description: 'Druhý a Třetí věk, Válka o Prsten, naše herní zasazení.', i18n: { en: { label: 'Timeline', description: 'Second and Third Age, War of the Ring, our setting.' }, de: { label: 'Zeitlinie', description: 'Zweites und Drittes Zeitalter, Ringkrieg, unser Setting.' }, sk: { label: 'Časová os', description: 'Druhý a Tretí vek, Vojna o Prsteň, naše zasadenie hry.' }, uk: { label: 'Хронологія', description: 'Друга і Третя епохи, Війна Персня, наше зосередження гри.' } } },
        ],
      },
    ],
    highlight: {
      title: 'Nevíš, za koho jet?',
      text: 'Začni stránkou Jedu poprvé nebo si projdi přehled armád.',
      links: [
        { label: 'Jedu poprvé', href: '/pro-novacky/', i18n: { en: { label: 'First time here', description: 'A first journey from registration to the Saturday battle.' }, de: { label: 'Erstes Mal', description: 'Der erste Weg von der Anmeldung bis zur Samstags-Schlacht.' }, sk: { label: 'Idem prvýkrát', description: 'Prvá cesta od registrácie po sobotnú bitku.' }, uk: { label: 'Я вперше', description: 'Перша дорога від реєстрації до суботньої битви.' } } },
        { label: 'Vybrat armádu', href: '/frakce/', i18n: { en: { label: 'Choose army' }, de: { label: 'Armee wählen' }, sk: { label: 'Vybrať armádu' }, uk: { label: 'Обрати армію' } } },
      ],
      cta: { label: 'Registruj se', href: '/registrace/', i18n: { en: { label: 'Register' }, de: { label: 'Anmelden' }, sk: { label: 'Registruj sa' }, uk: { label: 'Зареєструйся' } } },
    },
  },
  {
    type: 'mega',
    key: 'practical',
    label: 'Prakticky',
    href: '/prakticky/',
    columns: [
      {
        heading: 'Nejdůležitější před akcí',
        items: [
          { label: 'Organizační informace', href: '/organizacni-informace/', description: 'Termín, místo, program, příjezd, tábořiště, služby na místě, dokumenty, parkování, role účastníků a další provozní věci.', featured: true, i18n: { en: { label: 'Organisation', description: 'Date, place, schedule, arrival, camp, on-site services, documents, parking, participant roles and operational matters.' }, de: { label: 'Organisatorisches', description: 'Termin, Ort, Programm, Anreise, Lager, Vor-Ort-Services, Dokumente, Parken, Teilnehmerrollen und Betriebsthemen.' }, sk: { label: 'Organizačné info', description: 'Termín, miesto, program, príchod, tábor, služby na mieste, dokumenty, parkovanie, úlohy účastníkov a prevádzkové veci.' }, uk: { label: 'Організаційна інформація', description: 'Дата, місце, розклад, приїзд, табір, послуги на місці, документи, парковка, ролі учасників і провадження.' } } },
          { label: 'Harmonogram', href: '/organizacni-informace/#program', description: 'Čtvrtek příjezd, pátek program, sobota bitva, neděle odjezd.', i18n: { en: { label: 'Schedule', description: 'Thursday arrival, Friday programme, Saturday battle, Sunday departure.' }, de: { label: 'Programm', description: 'Donnerstag Anreise, Freitag Programm, Samstag Schlacht, Sonntag Abreise.' }, sk: { label: 'Harmonogram', description: 'Štvrtok príchod, piatok program, sobota bitka, nedeľa odchod.' }, uk: { label: 'Розклад', description: 'Четвер приїзд, п’ятниця програма, субота битва, неділя від’їзд.' } } },
          { label: 'Registrace a poplatky', href: '/registrace/', description: 'Přihlášení, platba, termíny, storno a výše registračního poplatku.', i18n: { en: { label: 'Registration and fees', description: 'Sign-up, payment, deadlines, cancellation and fee amount.' }, de: { label: 'Anmeldung und Gebühren', description: 'Registrierung, Zahlung, Fristen, Storno und Gebührenhöhe.' }, sk: { label: 'Registrácia a poplatky', description: 'Prihlásenie, platba, termíny, storno a výška poplatku.' }, uk: { label: 'Реєстрація та внески', description: 'Запис, оплата, строки, скасування і розмір внеску.' } } },
          { label: 'Kdo jede', href: '/kdo-jede/', description: 'Veřejný přehled přihlášených účastníků podle stran a armád.', i18n: { en: { label: 'Who is coming', description: 'Public list of registered participants by side and army.' }, de: { label: 'Wer kommt', description: 'Öffentliche Liste der angemeldeten Teilnehmer nach Seite und Armee.' }, sk: { label: 'Kto ide', description: 'Verejný prehľad prihlásených účastníkov podľa stráň a armád.' }, uk: { label: 'Хто їде', description: 'Публічний перелік учасників за сторонами й арміями.' } } },
        ],
      },
      {
        heading: 'Rodiny a děti',
        items: [
          { label: 'Dětská hra', href: '/detska-hra/', description: 'Program pro malé dobrodruhy přibližně od 5 do 10 let.', i18n: { en: { label: 'Children\u2019s game', description: 'A programme for little adventurers and info for parents.' }, de: { label: 'Kinderspiel', description: 'Ein Programm für kleine Abenteurer und Infos für Eltern.' }, sk: { label: 'Detská hra', description: 'Program pre malých dobrodruhov a info pre rodičov.' }, uk: { label: 'Дитяча гра', description: 'Програма для маленьких шукачів пригод та інфо для батьків.' } } },
          { label: 'Pro rodiče', href: '/pro-rodice/', description: 'Co děti čeká, co vzít s sebou a jak je přihlásit.', i18n: { en: { label: 'For parents', description: 'What kids will experience, what to bring and how to register.' }, de: { label: 'Für Eltern', description: 'Was Kinder erwartet, was mitnehmen und wie anmelden.' }, sk: { label: 'Pre rodičov', description: 'Čo deti čaká, čo zobrať so sebou a ako ich prihlásiť.' }, uk: { label: 'Для батьків', description: 'Що дітей чекає, що взяти та як їх записати.' } } },
          { label: 'Účast mladších 18 let', href: '/organizacni-informace/#vek-dokumenty', description: 'Souhlas zákonného zástupce a potřebné dokumenty.', i18n: { en: { label: 'Under-18 participation', description: 'Legal guardian consent and required documents.' }, de: { label: 'Teilnahme unter 18', description: 'Einwilligung der Erziehungsberechtigten und Dokumente.' }, sk: { label: 'Účasť mladších 18 rokov', description: 'Súhlas zákonného zástupcu a potrebné dokumenty.' }, uk: { label: 'Участь до 18 років', description: 'Згода законного представника та потрібні документи.' } } },
        ],
      },
      {
        heading: 'Často hledané',
        items: [
          { label: 'FAQ', href: '/faq/', description: 'Odpovědi na nejčastější otázky.', i18n: { en: { label: 'FAQ', description: 'Answers to the most frequent questions.' }, de: { label: 'FAQ', description: 'Antworten auf die häufigsten Fragen.' }, sk: { label: 'FAQ', description: 'Odpovede na najčastejšie otázky.' }, uk: { label: 'FAQ', description: 'Відповіді на найчастіші запитання.' } } },
          { label: 'Stravování', href: '/organizacni-informace/#hospoda', description: 'Jídlo, pitná voda a hospoda U Zeleného draka.', i18n: { en: { label: 'Food and drink', description: 'Meals, drinking water and the U Zeleného draka inn.' }, de: { label: 'Verpflegung', description: 'Essen, Trinkwasser und das Wirtshaus U Zeleného draka.' }, sk: { label: 'Stravovanie', description: 'Jedlo, pitná voda a hostinec U Zeleného draka.' }, uk: { label: 'Харчування', description: 'Їжа, питна вода і корчма «У Zeleného draka».' } } },
          { label: 'Co si vzít s sebou', href: '/organizacni-informace/#vek-dokumenty', description: 'Základní výbava pro první účast.', i18n: { en: { label: 'What to bring', description: 'Basic gear list for first-time participants.' }, de: { label: 'Was mitnehmen', description: 'Grundausrüstung für die erste Teilnahme.' }, sk: { label: 'Čo si vziať so sebou', description: 'Základná výbava pre prvú účasť.' }, uk: { label: 'Що з собою', description: 'Базове спорядження для першої участі.' } } },
          { label: 'Mapa areálu', href: '/mapa/', description: 'Kde akce je, kudy přijet a jak se orientovat na místě.', i18n: { en: { label: 'Site map', description: 'Where the event is, how to get there and how to navigate on site.' }, de: { label: 'Lageplan', description: 'Wo die Veranstaltung ist, Anfahrt und Orientierung vor Ort.' }, sk: { label: 'Mapa areálu', description: 'Kde sa akcia koná, ako prísť a orientácia na mieste.' }, uk: { label: 'Мапа місця', description: 'Де захід, як дістатися та орієнтація на місці.' } } },
          { label: 'Doprava a parkování', href: '/mapa/', description: 'Auto, parkování a navigace na louku.', i18n: { en: { label: 'Transport and parking', description: 'Car, parking and directions to the meadow.' }, de: { label: 'Anfahrt und Parken', description: 'Auto, Parken und Anfahrt zur Wiese.' }, sk: { label: 'Doprava a parkovanie', description: 'Auto, parkovanie a navigácia na lúku.' }, uk: { label: 'Транспорт і паркування', description: 'Авто, паркування та навігація до галявини.' } } },
        ],
      },
    ],
    highlight: {
      info: [
        { label: 'Termín akce', value: '20. až 23. srpna 2026', i18n: { en: { label: 'Event date' }, de: { label: 'Termin' }, sk: { label: 'Termín akcie' }, uk: { label: 'Дата заходу' } } },
        { label: 'Místo konání', value: 'Pulkovský mlýn, Rozkoš', i18n: { en: { label: 'Venue' }, de: { label: 'Ort' }, sk: { label: 'Miesto konania' }, uk: { label: 'Місце проведення' } } },
      ],
      title: 'Hra není jen v sobotu',
      text: 'Pátek patří táborovému programu, dětské hře, jarmarku, arénám a přípravě.',
      links: [
        { label: 'Harmonogram', href: '/organizacni-informace/#program', i18n: { en: { label: 'Schedule', description: 'Thursday arrival, Friday programme, Saturday battle, Sunday departure.' }, de: { label: 'Programm', description: 'Donnerstag Anreise, Freitag Programm, Samstag Schlacht, Sonntag Abreise.' }, sk: { label: 'Harmonogram', description: 'Štvrtok príchod, piatok program, sobota bitka, nedeľa odchod.' }, uk: { label: 'Розклад', description: 'Четвер приїзд, п’ятниця програма, субота битва, неділя від’їзд.' } } },
        { label: 'Hra v táboře', href: '/hra-v-tabore/', i18n: { en: { label: 'Camp life', description: 'Coins, camp life, Friday programme and micro-quests.' }, de: { label: 'Lagerleben', description: 'Münzen, Lagerleben, Freitagsprogramm und Mikro-Quests.' }, sk: { label: 'Hra v tábore', description: 'Mince, táborový život, piatkový program a mikro questy.' }, uk: { label: 'Табірне життя', description: 'Монети, табірне життя, п’ятнична програма і мікроквести.' } } },
      ],
      cta: { label: 'Registruj se', href: '/registrace/', i18n: { en: { label: 'Register' }, de: { label: 'Anmelden' }, sk: { label: 'Registruj sa' }, uk: { label: 'Зареєструйся' } } },
    },
  },
  {
    type: 'mega',
    key: 'community',
    label: 'Komunita',
    href: '/komunita/',
    columns: [
      {
        heading: 'Dění a vzpomínky',
        items: [
          { label: 'Novinky', href: '/novinky/', description: 'Aktuality, oznámení a postupné odhalování programu.', i18n: { en: { label: 'News', description: 'Updates, announcements and progressive programme reveals.' }, de: { label: 'Aktuelles', description: 'Neuigkeiten, Ankündigungen und schrittweise Programmenthüllung.' }, sk: { label: 'Novinky', description: 'Aktuality, oznámenia a postupné odhaľovanie programu.' }, uk: { label: 'Новини', description: 'Оголошення та поступове розкриття програми.' } } },
          { label: 'Galerie', href: '/galerie/', description: 'Fotky z minulých ročníků.', i18n: { en: { label: 'Gallery', description: 'Photos from previous years.' }, de: { label: 'Galerie', description: 'Fotos aus früheren Jahrgängen.' }, sk: { label: 'Galéria', description: 'Fotky z predchádzajúcich ročníkov.' }, uk: { label: 'Галерея', description: 'Світлини з минулих років.' } } },
          { label: 'Kdo jede', href: '/kdo-jede/', description: 'Veřejný přehled přihlášených účastníků podle stran a armád.', i18n: { en: { label: 'Who is coming', description: 'Public list of registered participants by side and army.' }, de: { label: 'Wer kommt', description: 'Öffentliche Liste der angemeldeten Teilnehmer nach Seite und Armee.' }, sk: { label: 'Kto ide', description: 'Verejný prehľad prihlásených účastníkov podľa stráň a armád.' }, uk: { label: 'Хто їде', description: 'Публічний перелік учасників за сторонами й арміями.' } } },
        ],
      },
      {
        heading: 'Táborový život',
        items: [
          { label: 'Hra v táboře', href: '/hra-v-tabore/', description: 'Obchodování, mince, mikro questy a život v ležení.', i18n: { en: { label: 'Camp life', description: 'Coins, camp life, Friday programme and micro-quests.' }, de: { label: 'Lagerleben', description: 'Münzen, Lagerleben, Freitagsprogramm und Mikro-Quests.' }, sk: { label: 'Hra v tábore', description: 'Mince, táborový život, piatkový program a mikro questy.' }, uk: { label: 'Табірне життя', description: 'Монети, табірне життя, п’ятнична програма і мікроквести.' } } },
          { label: 'Stánky a prodejci', href: '/stanky-a-prodejci/', description: 'Kdo bude na místě a co si budeš moct pořídit.', i18n: { en: { label: 'Vendors and market', description: 'Who will be there and what you can buy.' }, de: { label: 'Markt und Aussteller', description: 'Wer vor Ort sein wird und was du kaufen kannst.' }, sk: { label: 'Stánky a predajcovia', description: 'Kto bude na mieste a čo si môžeš zaobstarať.' }, uk: { label: 'Ярмарок і торгівці', description: 'Хто буде на місці і що можна придбати.' } } },
          { label: 'Fotky a video', href: '/fotky-a-video/', description: 'Pravidla focení a natáčení.', i18n: { en: { label: 'Photos and video', description: 'Photo and video rules.' }, de: { label: 'Fotos und Video', description: 'Foto- und Videoregeln.' }, sk: { label: 'Fotky a video', description: 'Pravidlá fotenia a natáčania.' }, uk: { label: 'Фото та відео', description: 'Правила фото та відео.' } } },
          { label: 'FAQ', href: '/faq/', description: 'Než napíšeš organizátorům, mrkni sem.', i18n: { en: { label: 'FAQ', description: 'Answers to the most frequent questions.' }, de: { label: 'FAQ', description: 'Antworten auf die häufigsten Fragen.' }, sk: { label: 'FAQ', description: 'Odpovede na najčastejšie otázky.' }, uk: { label: 'FAQ', description: 'Відповіді на найчастіші запитання.' } } },
        ],
      },
      {
        heading: 'Návody a inspirace',
        items: [
          { label: 'Návody a inspirace', href: '/navody-a-inspirace/', description: 'Rozcestník — návody, kostýmy, výroba a Inspiromat.', i18n: { en: { label: 'Guides and inspiration', description: 'Hub — guides, costumes, crafting and Inspiromat.' }, de: { label: 'Anleitungen und Inspiration', description: 'Verzeichnis — Anleitungen, Kostüme, Bauen und Inspiromat.' }, sk: { label: 'Návody a inšpirácia', description: 'Rozcestník — návody, kostýmy, výroba a Inspiromat.' }, uk: { label: 'Інструкції та натхнення', description: 'Розпуття — інструкції, костюми, виготовлення та Інспіромат.' } } },
          { label: 'Kostýmy a zbraně', href: '/navody-a-inspirace/#kostymy', description: 'Hodnocení 2–4 životů, návody na kostýmy, zbraně a vybavení.', i18n: { en: { label: 'Costumes and weapons', description: '2–4 lives scoring, costume + weapon + gear crafting guides.' }, de: { label: 'Kostüme und Waffen', description: '2–4 Leben Bewertung, Kostüm-, Waffen- und Ausrüstungsanleitungen.' }, sk: { label: 'Kostýmy a zbrane', description: 'Hodnotenie 2–4 životov, návody na kostýmy, zbrane a výbavu.' }, uk: { label: 'Костюми і зброя', description: 'Оцінка 2–4 життів, інструкції з костюмів, зброї та спорядження.' } } },
          { label: 'Inspiromat — fotogalerie kostýmů', href: '/navody-a-inspirace/#inspiromat', description: 'Fotogalerie kostýmů z minulých ročníků pro 9 armád.', i18n: { en: { label: 'Inspiromat — costume photo gallery', description: 'Photo gallery of costumes from past years for 9 armies.' }, de: { label: 'Inspiromat — Kostüm-Fotogalerie', description: 'Fotogalerie der Kostüme aus früheren Jahren für 9 Armeen.' }, sk: { label: 'Inspiromat — fotogaléria kostýmov', description: 'Fotogaléria kostýmov z minulých ročníkov pre 9 armád.' }, uk: { label: 'Інспіромат — фотогалерея костюмів', description: 'Фотогалерея костюмів з минулих років для 9 армій.' } } },
        ],
      },
      {
        heading: 'Archív Pána Prstenů',
        items: [
          { label: 'Minulé ročníky', href: '/minule-rocniky/', description: 'Přehled předchozích ročníků a jejich příběhů.', i18n: { en: { label: 'Past years', description: 'Overview of previous years and their stories.' }, de: { label: 'Frühere Jahrgänge', description: 'Übersicht über frühere Jahrgänge und ihre Geschichten.' }, sk: { label: 'Minulé ročníky', description: 'Prehľad minulých ročníkov a ich príbehov.' }, uk: { label: 'Минулі роки', description: 'Огляд попередніх років та їх історій.' } } },
          { label: 'Ohlasy účastníků', href: '/ohlasy/', description: 'Citace, zkušenosti a vzpomínky z minulých let.', i18n: { en: { label: 'Participant testimonials', description: 'Quotes, experiences and memories from previous years.' }, de: { label: 'Teilnehmer-Stimmen', description: 'Zitate, Erfahrungen und Erinnerungen aus früheren Jahren.' }, sk: { label: 'Ohlasy účastníkov', description: 'Citáty, skúsenosti a spomienky z minulých rokov.' }, uk: { label: 'Відгуки учасників', description: 'Цитати, враження і спогади з минулих років.' } } },
          { label: 'Demografie účastníků', href: '/minule-rocniky/statistiky/', description: 'Statistiky účastníků akce — počty, věk, armády, srovnání ročníků 2024–2026.', i18n: { en: { label: 'Participant demographics', description: 'Event participant statistics — counts, age, armies, year-on-year comparison 2024–2026.' }, de: { label: 'Demografie der Teilnehmer', description: 'Teilnehmerstatistiken — Anzahl, Alter, Armeen, Jahrgangsvergleich 2024–2026.' }, sk: { label: 'Demografia účastníkov', description: 'Štatistiky účastníkov — počty, vek, armády, porovnanie ročníkov 2024–2026.' }, uk: { label: 'Демографія учасників', description: 'Статистика учасників — кількість, вік, армії, порівняння років 2024–2026.' } } },
        ],
      },
    ],
  },
  {
    type: 'mega',
    key: 'collaboration',
    label: 'Spolupráce',
    href: '/spoluprace/',
    columns: [
      {
        heading: 'Chci se zapojit',
        items: [
          { label: 'Pomocníci', href: '/role/pomocnici/', description: 'Chceš pomoct s organizací, programem nebo zázemím?', i18n: { en: { label: 'Helpers', description: 'Want to help with organisation, programme or logistics?' }, de: { label: 'Helfer', description: 'Willst du bei Organisation, Programm oder Logistik helfen?' }, sk: { label: 'Pomocníci', description: 'Chceš pomôcť s organizáciou, programom alebo zázemím?' }, uk: { label: 'Помічники', description: 'Хочеш допомогти з організацією, програмою чи зворотом?' } } },
          { label: 'Pro stánkaře', href: '/role/stankari/', description: 'Chceš na akci prodávat nebo nabídnout služby?', i18n: { en: { label: 'For vendors', description: 'Want to sell or offer services at the event?' }, de: { label: 'Für Aussteller', description: 'Möchtest du beim Event verkaufen oder Dienste anbieten?' }, sk: { label: 'Pre stánkarov', description: 'Chceš na akcii predávať alebo ponúknuť služby?' }, uk: { label: 'Для торгівців', description: 'Хочеш на заході продавати чи пропонувати послуги?' } } },
          { label: 'Fotografové a kameramani', href: '/role/fotografove-a-kameramani/', description: 'Chceš fotit, natáčet nebo tvořit výstupy z akce?', i18n: { en: { label: 'Photo and video crew', description: 'Want to shoot, film or produce content from the event?' }, de: { label: 'Foto- und Videoteam', description: 'Willst du fotografieren, filmen oder Inhalte erstellen?' }, sk: { label: 'Fotografi a kameramani', description: 'Chceš fotiť, natáčať alebo tvoriť výstupy z akcie?' }, uk: { label: 'Фото- та відеогрупа', description: 'Хочеш знімати або створювати матеріали зі заходу?' } } },
          { label: 'Nebojový doprovod', href: '/role/nebojovy-doprovod/', description: 'Chceš jet, být součástí atmosféry, ale nebojovat?', i18n: { en: { label: 'Non-combat companion', description: 'Want to join, be part of the atmosphere but not fight?' }, de: { label: 'Nicht-kämpfende Begleitung', description: 'Willst du dabei sein, Atmosphäre genießen, aber nicht kämpfen?' }, sk: { label: 'Nebojový sprievod', description: 'Chceš ísť, byť súčasťou atmosféry, ale nebojovať?' }, uk: { label: 'Небойовий супровід', description: 'Хочеш долучитися, бути в атмосфері, але не битися?' } } },
        ],
      },
      {
        heading: 'Pro veřejnost a média',
        items: [
          { label: 'Pro média', href: '/pro-media/', description: 'Mediakit, základní informace, kontakt a pravidla natáčení.', i18n: { en: { label: 'For media', description: 'Mediakit, basic info, contact and shooting rules.' }, de: { label: 'Für Medien', description: 'Mediakit, Basisinfos, Kontakt und Aufnahmebedingungen.' }, sk: { label: 'Pre médiá', description: 'Mediakit, základné info, kontakt a pravidlá natáčania.' }, uk: { label: 'Для медіа', description: 'Mediakit, базова інформація, контакт і правила зйомки.' } } },
          { label: 'Stánky a prodejci', href: '/stanky-a-prodejci/', description: 'Seznam potvrzených prodejců pro účastníky.', i18n: { en: { label: 'Vendors and market', description: 'Who will be there and what you can buy.' }, de: { label: 'Markt und Aussteller', description: 'Wer vor Ort sein wird und was du kaufen kannst.' }, sk: { label: 'Stánky a predajcovia', description: 'Kto bude na mieste a čo si môžeš zaobstarať.' }, uk: { label: 'Ярмарок і торгівці', description: 'Хто буде на місці і що можна придбати.' } } },
          { label: 'Pořadatel', href: '/poradatel/', description: 'Moravian LARP, z. s. a identifikační údaje.', i18n: { en: { label: 'Organiser', description: 'Moravian LARP, z. s. and identification details.' }, de: { label: 'Veranstalter', description: 'Moravian LARP, z. s. und Registerdaten.' }, sk: { label: 'Usporiadateľ', description: 'Moravian LARP, z. s. a identifikačné údaje.' }, uk: { label: 'Організатор', description: 'Moravian LARP, z. s. та ідентифікаційні дані.' } } },
        ],
      },
      {
        heading: 'Pořadatel a zázemí',
        items: [
          { label: 'Podpoř účastníky', href: '/podpor-ucastniky/', description: 'Pomoz někomu dostat se do Středozemě.', i18n: { en: { label: 'Support participants', description: 'Help someone make it to Middle-earth.' }, de: { label: 'Teilnehmer unterstützen', description: 'Hilf jemandem, nach Mittelerde zu kommen.' }, sk: { label: 'Podpor účastníkov', description: 'Pomôž niekomu dostať sa do Stredozeme.' }, uk: { label: 'Підтримай учасників', description: 'Допоможи комусь потрапити в Середзем’я.' } } },
          { label: 'Kontakt', href: '/kontakt/', description: 'Napiš nám, když něco nevíš nebo chceš něco domluvit.', i18n: { en: { label: 'Contact', description: 'Write to us when you don’t know or need to arrange something.' }, de: { label: 'Kontakt', description: 'Schreib uns, wenn du etwas nicht weißt oder klären willst.' }, sk: { label: 'Kontakt', description: 'Napíš nám, keď niečo nevieš alebo si potrebuješ niečo dohodnúť.' }, uk: { label: 'Контакт', description: 'Напиши нам, якщо щось не знаєш або хочеш домовитися.' } } },
          { label: 'Přístupnost', href: '/pristupnost/', description: 'Jak pracujeme s čitelností a přístupností webu.', i18n: { en: { label: 'Accessibility', description: 'How we handle readability and accessibility of the site.' }, de: { label: 'Barrierefreiheit', description: 'Wie wir Lesbarkeit und Barrierefreiheit der Seite handhaben.' }, sk: { label: 'Prístupnosť', description: 'Ako pracujeme s čitateľnosťou a prístupnosťou webu.' }, uk: { label: 'Доступність', description: 'Як забезпечуємо читабельність і доступність сайту.' } } },
          { label: 'GDPR', href: '/gdpr/', description: 'Jak pracujeme s osobními údaji.', i18n: { en: { label: 'GDPR', description: 'How we work with personal data.' }, de: { label: 'DSGVO', description: 'Wie wir mit personenbezogenen Daten umgehen.' }, sk: { label: 'GDPR', description: 'Ako pracujeme s osobnými údajmi.' }, uk: { label: 'GDPR', description: 'Як працюємо з персональними даними.' } } },
        ],
      },
    ],
    highlight: {
      title: 'Chceš spolupracovat?',
      text: 'Chceš spolupracovat nebo si o spolupráci promluvit?',
      links: [
        { label: 'Piš na info@panprstenu.cz', href: 'mailto:info@panprstenu.cz', i18n: { en: { label: 'Write to info@panprstenu.cz' }, de: { label: 'Schreibt an info@panprstenu.cz' }, sk: { label: 'Píšte na info@panprstenu.cz' }, uk: { label: 'Пишіть на info@panprstenu.cz' } } },
        { label: 'Volej na 606 369 997', href: 'tel:+420606369997', i18n: { en: { label: 'Call +420 606 369 997' }, de: { label: 'Ruft +420 606 369 997 an' }, sk: { label: 'Volajte na +420 606 369 997' }, uk: { label: 'Телефонуйте +420 606 369 997' } } },
        { label: 'Domluvme si schůzku', href: '/kontakt/', i18n: { en: { label: 'Let’s set up a meeting' }, de: { label: 'Lasst uns ein Treffen vereinbaren' }, sk: { label: 'Dohodnime si stretnutie' }, uk: { label: 'Домовмося про зустріч' } } },
      ],
      cta: { label: 'Přijeď na akci', href: '/registrace/' },
    },
  },
  {
    type: 'link',
    key: 'contact',
    label: 'Kontakt',
    href: '/kontakt/',
  },
];

export const primaryCta = {
  label: 'Registrovat se',
  href: '/registrace/',
  description: 'Registrace, platba a podmínky účasti.',
};

/**
 * Mapping URL → top-level menu key (pro aria-current na megamenu).
 * Pokud URL aktuální stránky začíná některým z prefixů, daná top-level
 * položka má aktivní stav.
 */
export const activePathMap: Record<string, string[]> = {
  home: ['/'],
  newcomer: ['/pro-novacky/'],
  world: ['/hra-a-svet/', '/pribeh/', '/frakce/', '/pravidla/', '/svet-stredozeme/', '/hra-v-tabore/', '/fotky-a-video/', '/detska-hra/'],
  practical: ['/prakticky/', '/organizacni-informace/', '/mapa/', '/bezpecnost/', '/registrace/', '/podminky-ucasti-a-registrace/'],
  community: ['/komunita/', '/novinky/', '/galerie/', '/faq/', '/kdo-jede/', '/stanky-a-prodejci/', '/fotky-a-video/', '/hra-v-tabore/', '/minule-rocniky/', '/ohlasy/'],
  collaboration: ['/spoluprace/', '/pro-media/', '/role/stankari/', '/stanky-a-prodejci/', '/poradatel/', '/pristupnost/', '/podpor-ucastniky/'],
  contact: ['/kontakt/'],
};

/**
 * Helper: vrať key aktivní top-level položky pro danou URL (bez lang prefixu).
 * Vrací null, pokud žádná nesedí (např. legislativa).
 */
export function getActiveKey(pathWithoutLang: string): string | null {
  // přesné /
  if (pathWithoutLang === '/' || pathWithoutLang === '') return 'home';
  for (const [key, prefixes] of Object.entries(activePathMap)) {
    for (const p of prefixes) {
      if (p === '/') continue; // home řešen výše
      if (pathWithoutLang === p || pathWithoutLang.startsWith(p)) {
        return key;
      }
    }
  }
  return null;
}
