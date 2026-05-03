/**
 * UI překlady — Pán Prstenů, 5 jazyků
 * Datum: 2026-05-03
 *
 * Strategie:
 *   - cs primární jazyk (zdroj pravdy), plně přeložené
 *   - en, de, sk, uk plně přeložené (paritní pokrytí UI klíčů)
 *   - chybějící klíče v jakémkoli jazyce → fallback na cs
 *
 * Použití:
 *   import { getTranslation } from '@i18n/ui';
 *   const t = getTranslation(lang);
 *   <h1>{t('nav.home')}</h1>
 *
 * Pozn. k překladům:
 *   - „Pán Prstenů — Bitva o Středozem" je název akce/eventu, v EN se
 *     nepřekládá doslovně podle Tolkienova přeložení; používáme blízký
 *     anglický překlad „The Lord of the Rings — Battle for Middle-earth".
 *   - Tykání se zachovává napříč jazyky (DE: du/dich, EN: you, SK: ty, UK: ти).
 */

export const languages = {
  cs: 'Čeština',
  en: 'English',
  de: 'Deutsch',
  sk: 'Slovenčina',
  uk: 'Українська',
} as const;

export const defaultLang = 'cs' as const;
export type Lang = keyof typeof languages;

const cs = {
  // META
  'site.title': 'Pán Prstenů — Bitva o Středozem',
  'site.description': 'Velká několikadenní bitva inspirovaná Tolkienovou Středozemí. Příběh, bitvy, kostýmy a komunita hráčů z celé republiky.',

  // NAVIGACE
  'nav.home': 'Úvod',
  'nav.story': 'Příběh',
  'nav.factions': 'Armády a strany',
  'nav.rules': 'Pravidla',
  'nav.organization': 'Organizačně',
  'nav.practical': 'Praktické info',
  'nav.registration': 'Registrace',
  'nav.news': 'Novinky',
  'nav.gallery': 'Galerie',
  'nav.faq': 'FAQ',
  'nav.contact': 'Kontakt',
  'nav.menu': 'Menu',
  'nav.close': 'Zavřít',

  // CTA
  'cta.register': 'Registrovat se',
  'cta.i_want_to_come': 'Chci na akci',
  'cta.how_it_works': 'Jak to funguje',
  'cta.read_more': 'Číst dál',
  'cta.go_to_registration': 'Přejít na registraci',
  'cta.show_program': 'Zobrazit program',
  'cta.show_all_factions': 'Zobrazit všechny armády a strany',
  'cta.show_gallery': 'Zobrazit galerii',
  'cta.show_all_answers': 'Zobrazit všechny odpovědi',
  'cta.contact_us': 'Kontaktujte nás',

  // HERO
  'hero.title': 'Pán Prstenů',
  'hero.subtitle': 'Bitva o Středozem',
  'hero.year': '2026',
  'hero.lede': 'Velká několikadenní bitva inspirovaná Tolkienovou Středozemí. Příběh, bitvy, kostýmy a komunita hráčů z celé republiky.',
  'hero.date_chip': '20.–23. 8. 2026',
  'hero.location_chip': 'Křtiny / Bukovina, jižní Morava',

  // QUICK LINKS (pod hero)
  'quicklinks.story.title': 'Příběh letošního ročníku',
  'quicklinks.story.desc': 'Každý ročník přináší nové napětí, motivace stran a silný příběhový rámec.',
  'quicklinks.factions.title': 'Armády, kostýmy a strany',
  'quicklinks.factions.desc': 'Vyber si armádu, dolaď kostým a zapoj se do atmosféry Středozemě.',
  'quicklinks.rules.title': 'Pravidla a bezpečnost',
  'quicklinks.rules.desc': 'Přehledná pravidla pro boj, zbraně, zbroje i bezpečný průběh akce.',

  // PROČ PŘIJET
  'why.heading': 'Proč přijet',
  'why.atmosphere.title': 'Atmosféra',
  'why.atmosphere.desc': 'Jedinečná atmosféra Středozemě, kterou tvoří příroda, příběhové a detailní zpracování světa.',
  'why.battles.title': 'Bitvy',
  'why.battles.desc': 'Velkolepé bitvy a střety stran, kde strategie, odvaha a týmová spolupráce rozhodují.',
  'why.community.title': 'Komunita',
  'why.community.desc': 'Silná komunita hráčů, přátelství a zážitky, na které se nezapomíná ani po konci akce.',
  'why.costumes.title': 'Kostýmy',
  'why.costumes.desc': 'Kostýmy, zbroje, zbraně a řemeslo, které vytváří autentický svět Středozemě.',

  // ARMÁDY A STRANY
  'factions.heading': 'Armády a strany',
  'factions.subheading': 'Svobodní, temní i ti mezi — spojeni v příběhu',
  'factions.free': 'Svobodné národy Středozemě',
  'factions.evil': 'Síly Temného pána',
  'factions.mercenary': 'Žoldáci',

  // PROGRAM
  'program.heading': 'Program akce',
  'program.day_1': 'Čtvrtek 20. 8.',
  'program.day_1_desc': 'Příjezd, tábořiště, registrace, první setkání a večerní oheň.',
  'program.day_2': 'Pátek 21. 8.',
  'program.day_2_desc': 'Hra v tábořišti, doprovodný program, dětská hra, jarmark, arény a schvalování.',
  'program.day_3': 'Sobota 22. 8.',
  'program.day_3_desc': 'Hlavní hra / bitva.',
  'program.day_4': 'Neděle 23. 8.',
  'program.day_4_desc': 'Balení, úklid a odjezd.',

  // CO TĚ ČEKÁ
  'whatsexpected.heading': 'Co tě čeká',
  'whatsexpected.item_1': 'Sobotní hlavní bitva a strategické střety',
  'whatsexpected.item_2': 'Páteční hra v tábořišti a doprovodný program',
  'whatsexpected.item_3': 'Armády, strany, panovníci a společné táboření',
  'whatsexpected.item_4': 'Dětská hra pro malé dobrodruhy',
  'whatsexpected.item_5': 'Jarmark, arény, táborové hry a mikro questy',
  'whatsexpected.item_6': 'Večerní ohně, hudba a komunita',

  // REGISTRAČNÍ BOX
  'reg_box.heading': 'Registrace',
  'reg_box.item_1': 'Registrace probíhá online přes Registračka.cz',
  'reg_box.item_2': 'Platbu je potřeba provést do 10 dnů od registrace',
  'reg_box.item_3': 'Při příjezdu měj připravené potřebné dokumenty',
  'reg_box.item_4': 'Mladší účastníci potřebují souhlas zákonných zástupců',

  // GALERIE
  'gallery.heading': 'Galerie z předchozích ročníků',

  // FAQ
  'faq.heading': 'Časté dotazy',
  'faq.subheading': 'Nejčastější otázky před akcí',
  'faq.q1': 'Je akce vhodná pro nováčky?',
  'faq.a1': 'Ano, máme připraven program pro úplné nováčky včetně úvodních workshopů, vysvětlení pravidel a možnosti připojit se k některé z větších skupin.',
  'faq.q2': 'Co potřebuji ke kostýmu?',
  'faq.a2': 'Základní kostým musí odpovídat tématu Středozemě dané armády. Konkrétní požadavky najdeš v sekci Armády u tvé strany. Pokud kostým ještě nemáš, doporučujeme si nastudovat sekci Pro nováčky.',
  'faq.q3': 'Jak funguje registrace?',
  'faq.a3': 'Registrace probíhá online přes Registračka.cz. Po vyplnění formuláře dostaneš potvrzení a pokyny k platbě. Platbu je nutné provést do 10 dnů.',
  'faq.q4': 'Co když se zraním?',
  'faq.a4': 'Na akci je vždy přítomen zdravotník. Pravidla boje jsou navržena tak, aby minimalizovala riziko zranění. V případě jakýchkoli problémů se obrať na nejbližšího organizátora.',
  'faq.q5': 'Kolik akce stojí?',
  'faq.a5': 'Cena vstupenky se odvíjí od termínu registrace. Aktuální cenu najdeš v sekci Registrace.',
  'faq.q6': 'Můžu si vzít vlastní zbraň?',
  'faq.a6': 'Pouze larpovou zbraň, která projde bezpečnostní kontrolou (čekem). Ostré, kovové ani nevhodně tvrdé zbraně nejsou povoleny.',

  // FOOTER
  'footer.organizer': 'Pořadatel',
  'footer.quick_links': 'Rychlé odkazy',
  'footer.legislation': 'Legislativa',
  'footer.copyright': '© {year} Moravian LARP, z. s. Všechna práva vyhrazena.',
  'footer.legal.privacy': 'GDPR / Ochrana osobních údajů',
  'footer.legal.cookies': 'Cookies',
  'footer.legal.terms': 'Podmínky registrace',
  'footer.legal.event_rules': 'Pravidla účasti',

  // LANGUAGE
  'language.switch': 'Přepnout jazyk',

  // PAGES — META
  'page.home.title': 'Úvod',
  'page.rules.title': 'Pravidla a bezpečnost',
  'page.factions.title': 'Armády a strany',
  'page.practical.title': 'Praktické informace',
  'page.faq.title': 'Časté dotazy',
  'page.contact.title': 'Kontakt',
} as const;

const en: typeof cs = {
  // META
  'site.title': 'The Lord of the Rings — Battle for Middle-earth',
  'site.description': 'A multi-day fantasy LARP battle inspired by Tolkien’s Middle-earth. Story, battles, costumes and a community of players from across the country.',

  // NAV
  'nav.home': 'Home',
  'nav.story': 'Story',
  'nav.factions': 'Armies & sides',
  'nav.rules': 'Rules',
  'nav.organization': 'Organisation',
  'nav.practical': 'Practical info',
  'nav.registration': 'Registration',
  'nav.news': 'News',
  'nav.gallery': 'Gallery',
  'nav.faq': 'FAQ',
  'nav.contact': 'Contact',
  'nav.menu': 'Menu',
  'nav.close': 'Close',

  // CTA
  'cta.register': 'Register',
  'cta.i_want_to_come': 'I want to come',
  'cta.how_it_works': 'How it works',
  'cta.read_more': 'Read more',
  'cta.go_to_registration': 'Go to registration',
  'cta.show_program': 'Show schedule',
  'cta.show_all_factions': 'Show all armies and sides',
  'cta.show_gallery': 'Show gallery',
  'cta.show_all_answers': 'Show all answers',
  'cta.contact_us': 'Contact us',

  // HERO
  'hero.title': 'The Lord of the Rings',
  'hero.subtitle': 'Battle for Middle-earth',
  'hero.year': '2026',
  'hero.lede': 'A multi-day fantasy LARP battle inspired by Tolkien’s Middle-earth. Story, battles, costumes and a community of players from across the country.',
  'hero.date_chip': '20–23 Aug 2026',
  'hero.location_chip': 'Křtiny / Bukovina, South Moravia',

  // QUICK LINKS
  'quicklinks.story.title': 'Story of this year',
  'quicklinks.story.desc': 'Every year brings new tension, faction motives and a strong narrative frame.',
  'quicklinks.factions.title': 'Armies, costumes and sides',
  'quicklinks.factions.desc': 'Pick an army, fine-tune your costume and step into the atmosphere of Middle-earth.',
  'quicklinks.rules.title': 'Rules and safety',
  'quicklinks.rules.desc': 'Clear rules for combat, weapons, armour and a safe course of the event.',

  // WHY
  'why.heading': 'Why come',
  'why.atmosphere.title': 'Atmosphere',
  'why.atmosphere.desc': 'A unique atmosphere of Middle-earth shaped by nature, story and detailed worldcraft.',
  'why.battles.title': 'Battles',
  'why.battles.desc': 'Grand battles and clashes between sides where strategy, courage and teamwork decide.',
  'why.community.title': 'Community',
  'why.community.desc': 'A strong community of players, friendships and memories that last long after the event.',
  'why.costumes.title': 'Costumes',
  'why.costumes.desc': 'Costumes, armour, weapons and craft that build an authentic world of Middle-earth.',

  // FACTIONS
  'factions.heading': 'Armies and sides',
  'factions.subheading': 'The free, the dark and those between — bound by the story',
  'factions.free': 'Free Peoples of Middle-earth',
  'factions.evil': 'Forces of the Dark Lord',
  'factions.mercenary': 'Mercenaries',

  // PROGRAM
  'program.heading': 'Event schedule',
  'program.day_1': 'Thursday 20 Aug',
  'program.day_1_desc': 'Arrival, camp, registration, first meet-ups and an evening fire.',
  'program.day_2': 'Friday 21 Aug',
  'program.day_2_desc': 'Camp game, side programme, children’s game, market, arenas and gear approval.',
  'program.day_3': 'Saturday 22 Aug',
  'program.day_3_desc': 'Main game / battle.',
  'program.day_4': 'Sunday 23 Aug',
  'program.day_4_desc': 'Packing, clean-up and departure.',

  // WHAT TO EXPECT
  'whatsexpected.heading': 'What to expect',
  'whatsexpected.item_1': 'Saturday main battle and strategic clashes',
  'whatsexpected.item_2': 'Friday camp game and side programme',
  'whatsexpected.item_3': 'Armies, sides, rulers and shared camping',
  'whatsexpected.item_4': 'Children’s game for little adventurers',
  'whatsexpected.item_5': 'Market, arenas, camp games and micro-quests',
  'whatsexpected.item_6': 'Evening fires, music and community',

  // REGISTRATION BOX
  'reg_box.heading': 'Registration',
  'reg_box.item_1': 'Registration is online via Registračka.cz',
  'reg_box.item_2': 'Payment must be made within 10 days of registration',
  'reg_box.item_3': 'Bring the required documents on arrival',
  'reg_box.item_4': 'Younger participants need consent from a legal guardian',

  // GALLERY
  'gallery.heading': 'Gallery from previous years',

  // FAQ
  'faq.heading': 'Frequently asked questions',
  'faq.subheading': 'The most common questions before the event',
  'faq.q1': 'Is the event suitable for newcomers?',
  'faq.a1': 'Yes — we run a programme for complete newcomers including intro workshops, rule briefings and the option to join one of the bigger groups.',
  'faq.q2': 'What do I need for a costume?',
  'faq.a2': 'A basic costume must match the Middle-earth theme of your chosen army. Specific requirements are in the Armies section of your side. If you don’t have a costume yet, see the Newcomers section.',
  'faq.q3': 'How does registration work?',
  'faq.a3': 'Registration runs online via Registračka.cz. After filling in the form you’ll get confirmation and payment instructions. Payment must be made within 10 days.',
  'faq.q4': 'What if I get hurt?',
  'faq.a4': 'A medic is always present at the event. Combat rules are designed to minimise injury risk. If anything happens, find the nearest organiser.',
  'faq.q5': 'How much does the event cost?',
  'faq.a5': 'The fee depends on the date of registration. The current price is in the Registration section.',
  'faq.q6': 'Can I bring my own weapon?',
  'faq.a6': 'Only LARP-safe weapons that pass the safety check. Sharp, metal or unsafely hard weapons are not allowed.',

  // FOOTER
  'footer.organizer': 'Organiser',
  'footer.quick_links': 'Quick links',
  'footer.legislation': 'Legal',
  'footer.copyright': '© {year} Moravian LARP, z. s. All rights reserved.',
  'footer.legal.privacy': 'GDPR / Privacy policy',
  'footer.legal.cookies': 'Cookies',
  'footer.legal.terms': 'Terms of registration',
  'footer.legal.event_rules': 'Event rules',

  // LANGUAGE
  'language.switch': 'Switch language',

  // PAGES — META
  'page.home.title': 'Home',
  'page.rules.title': 'Rules and safety',
  'page.factions.title': 'Armies and sides',
  'page.practical.title': 'Practical information',
  'page.faq.title': 'Frequently asked questions',
  'page.contact.title': 'Contact',
};

const de: typeof cs = {
  'site.title': 'Der Herr der Ringe — Schlacht um Mittelerde',
  'site.description': 'Eine mehrtägige Fantasy-LARP-Schlacht inspiriert von Tolkiens Mittelerde. Geschichte, Schlachten, Kostüme und eine Spielergemeinschaft aus dem ganzen Land.',

  'nav.home': 'Start',
  'nav.story': 'Geschichte',
  'nav.factions': 'Armeen & Seiten',
  'nav.rules': 'Regeln',
  'nav.organization': 'Organisatorisches',
  'nav.practical': 'Praktische Infos',
  'nav.registration': 'Anmeldung',
  'nav.news': 'Aktuelles',
  'nav.gallery': 'Galerie',
  'nav.faq': 'FAQ',
  'nav.contact': 'Kontakt',
  'nav.menu': 'Menü',
  'nav.close': 'Schließen',

  'cta.register': 'Anmelden',
  'cta.i_want_to_come': 'Ich möchte teilnehmen',
  'cta.how_it_works': 'So läuft’s ab',
  'cta.read_more': 'Mehr lesen',
  'cta.go_to_registration': 'Zur Anmeldung',
  'cta.show_program': 'Programm anzeigen',
  'cta.show_all_factions': 'Alle Armeen und Seiten anzeigen',
  'cta.show_gallery': 'Galerie anzeigen',
  'cta.show_all_answers': 'Alle Antworten anzeigen',
  'cta.contact_us': 'Kontakt',

  'hero.title': 'Der Herr der Ringe',
  'hero.subtitle': 'Schlacht um Mittelerde',
  'hero.year': '2026',
  'hero.lede': 'Eine mehrtägige Fantasy-LARP-Schlacht inspiriert von Tolkiens Mittelerde. Geschichte, Schlachten, Kostüme und eine Spielergemeinschaft aus dem ganzen Land.',
  'hero.date_chip': '20.–23. 8. 2026',
  'hero.location_chip': 'Křtiny / Bukovina, Südmähren',

  'quicklinks.story.title': 'Geschichte des Jahrgangs',
  'quicklinks.story.desc': 'Jeder Jahrgang bringt neue Spannung, Motive der Seiten und einen starken erzählerischen Rahmen.',
  'quicklinks.factions.title': 'Armeen, Kostüme und Seiten',
  'quicklinks.factions.desc': 'Wähle deine Armee, verfeinere dein Kostüm und tauch in die Atmosphäre Mittelerdes ein.',
  'quicklinks.rules.title': 'Regeln und Sicherheit',
  'quicklinks.rules.desc': 'Übersichtliche Regeln für Kampf, Waffen, Rüstung und einen sicheren Ablauf.',

  'why.heading': 'Warum teilnehmen',
  'why.atmosphere.title': 'Atmosphäre',
  'why.atmosphere.desc': 'Eine einzigartige Atmosphäre Mittelerdes aus Natur, Geschichte und liebevoller Weltgestaltung.',
  'why.battles.title': 'Schlachten',
  'why.battles.desc': 'Große Schlachten und Zusammenstöße der Seiten, in denen Strategie, Mut und Teamarbeit entscheiden.',
  'why.community.title': 'Gemeinschaft',
  'why.community.desc': 'Eine starke Spielergemeinschaft, Freundschaften und Erlebnisse, die noch lange nachwirken.',
  'why.costumes.title': 'Kostüme',
  'why.costumes.desc': 'Kostüme, Rüstungen, Waffen und Handwerk, die eine authentische Welt Mittelerdes erschaffen.',

  'factions.heading': 'Armeen und Seiten',
  'factions.subheading': 'Freie, Dunkle und die dazwischen — verbunden durch die Geschichte',
  'factions.free': 'Freie Völker Mittelerdes',
  'factions.evil': 'Streitkräfte des Dunklen Herrn',
  'factions.mercenary': 'Söldner',

  'program.heading': 'Programm',
  'program.day_1': 'Donnerstag, 20. 8.',
  'program.day_1_desc': 'Anreise, Lager, Anmeldung, erste Treffen und Lagerfeuer am Abend.',
  'program.day_2': 'Freitag, 21. 8.',
  'program.day_2_desc': 'Lagerspiel, Begleitprogramm, Kinderspiel, Jahrmarkt, Arenen und Ausrüstungsabnahme.',
  'program.day_3': 'Samstag, 22. 8.',
  'program.day_3_desc': 'Hauptspiel / Schlacht.',
  'program.day_4': 'Sonntag, 23. 8.',
  'program.day_4_desc': 'Packen, Aufräumen und Abreise.',

  'whatsexpected.heading': 'Was dich erwartet',
  'whatsexpected.item_1': 'Samstägliche Hauptschlacht und strategische Zusammenstöße',
  'whatsexpected.item_2': 'Freitags Lagerspiel und Begleitprogramm',
  'whatsexpected.item_3': 'Armeen, Seiten, Herrscher und gemeinsames Lagern',
  'whatsexpected.item_4': 'Kinderspiel für kleine Abenteurer',
  'whatsexpected.item_5': 'Jahrmarkt, Arenen, Lagerspiele und Mikro-Quests',
  'whatsexpected.item_6': 'Lagerfeuer am Abend, Musik und Gemeinschaft',

  'reg_box.heading': 'Anmeldung',
  'reg_box.item_1': 'Die Anmeldung läuft online über Registračka.cz',
  'reg_box.item_2': 'Die Zahlung ist binnen 10 Tagen nach der Anmeldung fällig',
  'reg_box.item_3': 'Bring die nötigen Dokumente bei der Anreise mit',
  'reg_box.item_4': 'Minderjährige brauchen die Einwilligung der Erziehungsberechtigten',

  'gallery.heading': 'Galerie aus früheren Jahrgängen',

  'faq.heading': 'Häufige Fragen',
  'faq.subheading': 'Die häufigsten Fragen vor der Veranstaltung',
  'faq.q1': 'Ist die Veranstaltung für Einsteiger geeignet?',
  'faq.a1': 'Ja — wir bieten ein Programm für komplette Einsteiger inklusive Intro-Workshops, Regelerklärung und der Möglichkeit, sich einer größeren Gruppe anzuschließen.',
  'faq.q2': 'Was brauche ich fürs Kostüm?',
  'faq.a2': 'Ein Basiskostüm muss zum Mittelerde-Thema deiner Armee passen. Konkrete Anforderungen findest du im Bereich Armeen deiner Seite. Wenn du noch kein Kostüm hast, schau in den Bereich Für Einsteiger.',
  'faq.q3': 'Wie funktioniert die Anmeldung?',
  'faq.a3': 'Die Anmeldung läuft online über Registračka.cz. Nach dem Ausfüllen erhältst du eine Bestätigung und Zahlungshinweise. Die Zahlung muss innerhalb von 10 Tagen erfolgen.',
  'faq.q4': 'Was, wenn ich mich verletze?',
  'faq.a4': 'Vor Ort ist immer ein Sanitäter präsent. Die Kampfregeln minimieren das Verletzungsrisiko. Bei Problemen wende dich an den nächsten Organisator.',
  'faq.q5': 'Was kostet die Veranstaltung?',
  'faq.a5': 'Der Preis hängt vom Anmeldedatum ab. Den aktuellen Preis findest du im Bereich Anmeldung.',
  'faq.q6': 'Darf ich eigene Waffen mitbringen?',
  'faq.a6': 'Nur LARP-sichere Waffen, die die Sicherheitsabnahme bestehen. Scharfe, metallische oder zu harte Waffen sind nicht erlaubt.',

  'footer.organizer': 'Veranstalter',
  'footer.quick_links': 'Schnelllinks',
  'footer.legislation': 'Rechtliches',
  'footer.copyright': '© {year} Moravian LARP, z. s. Alle Rechte vorbehalten.',
  'footer.legal.privacy': 'DSGVO / Datenschutz',
  'footer.legal.cookies': 'Cookies',
  'footer.legal.terms': 'Anmeldebedingungen',
  'footer.legal.event_rules': 'Teilnahmebedingungen',

  'language.switch': 'Sprache wechseln',

  'page.home.title': 'Start',
  'page.rules.title': 'Regeln und Sicherheit',
  'page.factions.title': 'Armeen und Seiten',
  'page.practical.title': 'Praktische Informationen',
  'page.faq.title': 'Häufige Fragen',
  'page.contact.title': 'Kontakt',
};

const sk: typeof cs = {
  'site.title': 'Pán Prsteňov — Bitka o Stredozem',
  'site.description': 'Veľká niekoľkodňová bitka inšpirovaná Tolkienovou Stredozemou. Príbeh, bitky, kostýmy a komunita hráčov z celej republiky.',

  'nav.home': 'Úvod',
  'nav.story': 'Príbeh',
  'nav.factions': 'Armády a strany',
  'nav.rules': 'Pravidlá',
  'nav.organization': 'Organizačne',
  'nav.practical': 'Praktické info',
  'nav.registration': 'Registrácia',
  'nav.news': 'Novinky',
  'nav.gallery': 'Galéria',
  'nav.faq': 'FAQ',
  'nav.contact': 'Kontakt',
  'nav.menu': 'Menu',
  'nav.close': 'Zavrieť',

  'cta.register': 'Registrovať sa',
  'cta.i_want_to_come': 'Chcem na akciu',
  'cta.how_it_works': 'Ako to funguje',
  'cta.read_more': 'Čítať ďalej',
  'cta.go_to_registration': 'Prejsť na registráciu',
  'cta.show_program': 'Zobraziť program',
  'cta.show_all_factions': 'Zobraziť všetky armády a strany',
  'cta.show_gallery': 'Zobraziť galériu',
  'cta.show_all_answers': 'Zobraziť všetky odpovede',
  'cta.contact_us': 'Kontaktujte nás',

  'hero.title': 'Pán Prsteňov',
  'hero.subtitle': 'Bitka o Stredozem',
  'hero.year': '2026',
  'hero.lede': 'Veľká niekoľkodňová bitka inšpirovaná Tolkienovou Stredozemou. Príbeh, bitky, kostýmy a komunita hráčov z celej republiky.',
  'hero.date_chip': '20.–23. 8. 2026',
  'hero.location_chip': 'Křtiny / Bukovina, južná Morava',

  'quicklinks.story.title': 'Príbeh tohtoročného ročníka',
  'quicklinks.story.desc': 'Každý ročník prináša nové napätie, motívy strán a silný príbehový rámec.',
  'quicklinks.factions.title': 'Armády, kostýmy a strany',
  'quicklinks.factions.desc': 'Vyber si armádu, dolaď kostým a zapoj sa do atmosféry Stredozeme.',
  'quicklinks.rules.title': 'Pravidlá a bezpečnosť',
  'quicklinks.rules.desc': 'Prehľadné pravidlá pre boj, zbrane, zbroje a bezpečný priebeh akcie.',

  'why.heading': 'Prečo prísť',
  'why.atmosphere.title': 'Atmosféra',
  'why.atmosphere.desc': 'Jedinečná atmosféra Stredozeme, ktorú tvorí príroda, príbeh a detailné spracovanie sveta.',
  'why.battles.title': 'Bitky',
  'why.battles.desc': 'Veľkolepé bitky a stretnutia strán, kde rozhoduje stratégia, odvaha a tímová spolupráca.',
  'why.community.title': 'Komunita',
  'why.community.desc': 'Silná komunita hráčov, priateľstvá a zážitky, na ktoré sa nezabúda ani po skončení akcie.',
  'why.costumes.title': 'Kostýmy',
  'why.costumes.desc': 'Kostýmy, zbroje, zbrane a remeslo, ktoré tvoria autentický svet Stredozeme.',

  'factions.heading': 'Armády a strany',
  'factions.subheading': 'Slobodní, temní aj tí medzi — spojení v príbehu',
  'factions.free': 'Slobodné národy Stredozeme',
  'factions.evil': 'Sily Temného pána',
  'factions.mercenary': 'Žoldnieri',

  'program.heading': 'Program akcie',
  'program.day_1': 'Štvrtok 20. 8.',
  'program.day_1_desc': 'Príchod, tábor, registrácia, prvé stretnutia a večerný oheň.',
  'program.day_2': 'Piatok 21. 8.',
  'program.day_2_desc': 'Hra v tábore, sprievodný program, detská hra, jarmok, arény a schvaľovanie.',
  'program.day_3': 'Sobota 22. 8.',
  'program.day_3_desc': 'Hlavná hra / bitka.',
  'program.day_4': 'Nedeľa 23. 8.',
  'program.day_4_desc': 'Balenie, upratovanie a odchod.',

  'whatsexpected.heading': 'Čo ťa čaká',
  'whatsexpected.item_1': 'Sobotná hlavná bitka a strategické stretnutia',
  'whatsexpected.item_2': 'Piatková hra v tábore a sprievodný program',
  'whatsexpected.item_3': 'Armády, strany, panovníci a spoločné táborenie',
  'whatsexpected.item_4': 'Detská hra pre malých dobrodruhov',
  'whatsexpected.item_5': 'Jarmok, arény, táborové hry a mikro questy',
  'whatsexpected.item_6': 'Večerné ohne, hudba a komunita',

  'reg_box.heading': 'Registrácia',
  'reg_box.item_1': 'Registrácia prebieha online cez Registračka.cz',
  'reg_box.item_2': 'Platbu treba vykonať do 10 dní od registrácie',
  'reg_box.item_3': 'Pri príchode maj pripravené potrebné dokumenty',
  'reg_box.item_4': 'Mladší účastníci potrebujú súhlas zákonných zástupcov',

  'gallery.heading': 'Galéria z predchádzajúcich ročníkov',

  'faq.heading': 'Časté otázky',
  'faq.subheading': 'Najčastejšie otázky pred akciou',
  'faq.q1': 'Je akcia vhodná pre nováčikov?',
  'faq.a1': 'Áno, máme pripravený program pre úplných nováčikov vrátane úvodných workshopov, vysvetlenia pravidiel a možnosti pripojiť sa k niektorej z väčších skupín.',
  'faq.q2': 'Čo potrebujem ku kostýmu?',
  'faq.a2': 'Základný kostým musí zodpovedať téme Stredozeme danej armády. Konkrétne požiadavky nájdeš v sekcii Armády pri tvojej strane. Ak kostým ešte nemáš, odporúčame si naštudovať sekciu Pre nováčikov.',
  'faq.q3': 'Ako funguje registrácia?',
  'faq.a3': 'Registrácia prebieha online cez Registračka.cz. Po vyplnení formulára dostaneš potvrdenie a pokyny k platbe. Platbu treba vykonať do 10 dní.',
  'faq.q4': 'Čo ak sa zraním?',
  'faq.a4': 'Na akcii je vždy prítomný zdravotník. Pravidlá boja sú navrhnuté tak, aby minimalizovali riziko zranenia. V prípade akýchkoľvek problémov sa obráť na najbližšieho organizátora.',
  'faq.q5': 'Koľko akcia stojí?',
  'faq.a5': 'Cena vstupenky závisí od termínu registrácie. Aktuálnu cenu nájdeš v sekcii Registrácia.',
  'faq.q6': 'Môžem si zobrať vlastnú zbraň?',
  'faq.a6': 'Iba larpovú zbraň, ktorá prejde bezpečnostnou kontrolou (čekom). Ostré, kovové ani neprimerane tvrdé zbrane nie sú povolené.',

  'footer.organizer': 'Usporiadateľ',
  'footer.quick_links': 'Rýchle odkazy',
  'footer.legislation': 'Legislatíva',
  'footer.copyright': '© {year} Moravian LARP, z. s. Všetky práva vyhradené.',
  'footer.legal.privacy': 'GDPR / Ochrana osobných údajov',
  'footer.legal.cookies': 'Cookies',
  'footer.legal.terms': 'Podmienky registrácie',
  'footer.legal.event_rules': 'Pravidlá účasti',

  'language.switch': 'Prepnúť jazyk',

  'page.home.title': 'Úvod',
  'page.rules.title': 'Pravidlá a bezpečnosť',
  'page.factions.title': 'Armády a strany',
  'page.practical.title': 'Praktické informácie',
  'page.faq.title': 'Časté otázky',
  'page.contact.title': 'Kontakt',
};

const uk: typeof cs = {
  'site.title': 'Володар Перснів — Битва за Середзем’я',
  'site.description': 'Велика кількаденна ЛАРП-битва за мотивами Толкінового Середзем’я. Історія, бої, костюми та спільнота гравців з усієї країни.',

  'nav.home': 'Головна',
  'nav.story': 'Історія',
  'nav.factions': 'Армії та сторони',
  'nav.rules': 'Правила',
  'nav.organization': 'Організація',
  'nav.practical': 'Практична інформація',
  'nav.registration': 'Реєстрація',
  'nav.news': 'Новини',
  'nav.gallery': 'Галерея',
  'nav.faq': 'FAQ',
  'nav.contact': 'Контакт',
  'nav.menu': 'Меню',
  'nav.close': 'Закрити',

  'cta.register': 'Зареєструватися',
  'cta.i_want_to_come': 'Хочу взяти участь',
  'cta.how_it_works': 'Як це працює',
  'cta.read_more': 'Читати далі',
  'cta.go_to_registration': 'Перейти до реєстрації',
  'cta.show_program': 'Показати програму',
  'cta.show_all_factions': 'Показати всі армії та сторони',
  'cta.show_gallery': 'Показати галерею',
  'cta.show_all_answers': 'Показати всі відповіді',
  'cta.contact_us': 'Зв’яжіться з нами',

  'hero.title': 'Володар Перснів',
  'hero.subtitle': 'Битва за Середзем’я',
  'hero.year': '2026',
  'hero.lede': 'Велика кількаденна ЛАРП-битва за мотивами Толкінового Середзем’я. Історія, бої, костюми та спільнота гравців з усієї країни.',
  'hero.date_chip': '20–23.08.2026',
  'hero.location_chip': 'Кржтини / Буковіна, південна Моравія',

  'quicklinks.story.title': 'Історія цьогорічного ракурсу',
  'quicklinks.story.desc': 'Кожен рік приносить нову напругу, мотиви сторін і міцну сюжетну рамку.',
  'quicklinks.factions.title': 'Армії, костюми та сторони',
  'quicklinks.factions.desc': 'Обери армію, доопрацюй костюм і зануришся в атмосферу Середзем’я.',
  'quicklinks.rules.title': 'Правила і безпека',
  'quicklinks.rules.desc': 'Зрозумілі правила бою, зброї, обладунків і безпечного перебігу заходу.',

  'why.heading': 'Чому варто приїхати',
  'why.atmosphere.title': 'Атмосфера',
  'why.atmosphere.desc': 'Унікальна атмосфера Середзем’я, яку творить природа, історія й детальне опрацювання світу.',
  'why.battles.title': 'Бої',
  'why.battles.desc': 'Великі бої та зіткнення сторін, де вирішують стратегія, відвага та командна робота.',
  'why.community.title': 'Спільнота',
  'why.community.desc': 'Сильна спільнота гравців, дружба та враження, які залишаються надовго після заходу.',
  'why.costumes.title': 'Костюми',
  'why.costumes.desc': 'Костюми, обладунки, зброя і ремесло, що творять автентичний світ Середзем’я.',

  'factions.heading': 'Армії та сторони',
  'factions.subheading': 'Вільні, темні та ті між ними — поєднані в історії',
  'factions.free': 'Вільні народи Середзем’я',
  'factions.evil': 'Сили Темного володаря',
  'factions.mercenary': 'Найманці',

  'program.heading': 'Програма заходу',
  'program.day_1': 'Четвер 20.08.',
  'program.day_1_desc': 'Приїзд, табір, реєстрація, перші зустрічі та вечірнє багаття.',
  'program.day_2': 'П’ятниця 21.08.',
  'program.day_2_desc': 'Гра в таборі, супровідна програма, дитяча гра, ярмарок, арени та допуск спорядження.',
  'program.day_3': 'Субота 22.08.',
  'program.day_3_desc': 'Головна гра / битва.',
  'program.day_4': 'Неділя 23.08.',
  'program.day_4_desc': 'Збори, прибирання та від’їзд.',

  'whatsexpected.heading': 'Що тебе чекає',
  'whatsexpected.item_1': 'Суботня головна битва та стратегічні зіткнення',
  'whatsexpected.item_2': 'П’ятнична гра в таборі й супровідна програма',
  'whatsexpected.item_3': 'Армії, сторони, правителі та спільне табірне життя',
  'whatsexpected.item_4': 'Дитяча гра для маленьких шукачів пригод',
  'whatsexpected.item_5': 'Ярмарок, арени, табірні ігри та мікроквести',
  'whatsexpected.item_6': 'Вечірні багаття, музика та спільнота',

  'reg_box.heading': 'Реєстрація',
  'reg_box.item_1': 'Реєстрація онлайн через Registračka.cz',
  'reg_box.item_2': 'Оплату слід здійснити протягом 10 днів від реєстрації',
  'reg_box.item_3': 'На приїзд май готові потрібні документи',
  'reg_box.item_4': 'Молодші учасники потребують згоди законних представників',

  'gallery.heading': 'Галерея з минулих років',

  'faq.heading': 'Часті запитання',
  'faq.subheading': 'Найчастіші запитання перед заходом',
  'faq.q1': 'Чи захід підходить новачкам?',
  'faq.a1': 'Так — маємо програму для повних новачків, включно зі вступними воркшопами, поясненням правил і можливістю приєднатися до однієї з більших груп.',
  'faq.q2': 'Що потрібно для костюма?',
  'faq.a2': 'Базовий костюм має відповідати темі Середзем’я для обраної армії. Конкретні вимоги знайдеш у розділі Армії своєї сторони. Якщо ще не маєш костюма, перегляньте розділ Для новачків.',
  'faq.q3': 'Як працює реєстрація?',
  'faq.a3': 'Реєстрація онлайн через Registračka.cz. Після заповнення форми отримаєш підтвердження та інструкції до оплати. Оплату слід здійснити впродовж 10 днів.',
  'faq.q4': 'Що, якщо я отримаю травму?',
  'faq.a4': 'На заході завжди присутній медик. Правила бою спроєктовані так, щоб мінімізувати ризик травм. У будь-якій ситуації звернись до найближчого організатора.',
  'faq.q5': 'Скільки коштує захід?',
  'faq.a5': 'Вартість залежить від дати реєстрації. Актуальну ціну знайдеш у розділі Реєстрація.',
  'faq.q6': 'Чи можна привезти власну зброю?',
  'faq.a6': 'Лише ЛАРП-зброю, яка проходить перевірку безпеки. Гостра, металева або надміру тверда зброя заборонена.',

  'footer.organizer': 'Організатор',
  'footer.quick_links': 'Швидкі посилання',
  'footer.legislation': 'Юридична інформація',
  'footer.copyright': '© {year} Moravian LARP, z. s. Усі права захищено.',
  'footer.legal.privacy': 'GDPR / Захист персональних даних',
  'footer.legal.cookies': 'Cookies',
  'footer.legal.terms': 'Умови реєстрації',
  'footer.legal.event_rules': 'Правила участі',

  'language.switch': 'Змінити мову',

  'page.home.title': 'Головна',
  'page.rules.title': 'Правила і безпека',
  'page.factions.title': 'Армії та сторони',
  'page.practical.title': 'Практична інформація',
  'page.faq.title': 'Часті запитання',
  'page.contact.title': 'Контакт',
};

export const ui = { cs, en, de, sk, uk } as const;

type TranslationKey = keyof typeof cs;

export function getTranslation(lang: Lang) {
  return (key: TranslationKey, params?: Record<string, string | number>): string => {
    const langDict = ui[lang] as Record<string, string>;
    const csDict = ui.cs as Record<string, string>;
    let str = langDict[key] ?? csDict[key] ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    return str;
  };
}

export function getLangFromUrl(url: URL): Lang {
  const [, segment] = url.pathname.split('/');
  if (segment in ui) return segment as Lang;
  return defaultLang;
}

export function getLocalizedPath(path: string, lang: Lang): string {
  const cleanPath = path.replace(/^\/(cs|en|de|sk|uk)/, '');
  return `/${lang}${cleanPath || '/'}`;
}

export function getPathWithoutLang(path: string): string {
  return path.replace(/^\/(cs|en|de|sk|uk)/, '') || '/';
}
