/**
 * UI překlady — Pán Prstenů, 4 jazyky
 * Datum: 2026-04-29
 *
 * Strategie:
 *   - cs primární jazyk (galonech), plně přeložené
 *   - en, de, sk obsahují základ; chybějící klíče → fallback na cs
 *
 * Použití:
 *   import { getTranslation } from '@i18n/ui';
 *   const t = getTranslation(lang);
 *   <h1>{t('nav.home')}</h1>
 */

export const languages = {
  cs: 'Čeština',
  en: 'English',
  de: 'Deutsch',
  sk: 'Slovenčina',
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
  'nav.factions': 'Frakce',
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
  'cta.show_all_factions': 'Zobrazit všechny frakce a strany',
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
  'quicklinks.factions.title': 'Kostýmy a strany',
  'quicklinks.factions.desc': 'Vyber si frakci, dolaď kostým a zapoj se do atmosféry Středozemě.',
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

  // FRAKCE
  'factions.heading': 'Frakce a strany',
  'factions.subheading': 'Svobodní i temní, spojeni v příběhu',
  'factions.free': 'Svobodné národy',
  'factions.evil': 'Síly Temna',

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
  'whatsexpected.item_3': 'Frakce, armády, panovníci a společné táboření',
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
  'faq.a2': 'Základní kostým musí odpovídat tématu Středozemě dané frakce. Konkrétní požadavky najdeš v sekci Frakce u tvé strany. Pokud kostým ještě nemáš, doporučujeme si nastudovat sekci Pro nováčky.',
  'faq.q3': 'Jak funguje registrace?',
  'faq.a3': 'Registrace probíhá online přes Registračka.cz. Po vyplnění formuláře dostaneš potvrzení a pokyny k platbě. Platbu je nutné provést do 10 dnů.',
  'faq.q4': 'Co když se zraním?',
  'faq.a4': 'Na akci je vždy přítomna zdravotnická služba. Pravidla boje jsou navržena tak, aby minimalizovala riziko zranění. V případě jakýchkoli problémů se obrať na nejbližšího organizátora.',
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
  'page.factions.title': 'Frakce a národy',
  'page.practical.title': 'Praktické informace',
  'page.faq.title': 'Časté dotazy',
  'page.contact.title': 'Kontakt',
} as const;

const en = {
  'site.title': 'The Lord of the Rings — Battle for Middle-earth',
  'nav.home': 'Home',
  'nav.story': 'Story',
  'nav.factions': 'Factions',
  'nav.rules': 'Rules',
  'nav.contact': 'Contact',
  'nav.menu': 'Menu',
  'cta.register': 'Register',
  'hero.title': 'The Lord of the Rings',
  'hero.subtitle': 'Battle for Middle-earth',
  'page.home.title': 'Home',
} as const;

const de = {
  'site.title': 'Der Herr der Ringe — Schlacht um Mittelerde',
  'nav.home': 'Start',
  'nav.factions': 'Fraktionen',
  'nav.rules': 'Regeln',
  'nav.contact': 'Kontakt',
  'nav.menu': 'Menü',
  'cta.register': 'Anmelden',
  'hero.title': 'Der Herr der Ringe',
  'hero.subtitle': 'Schlacht um Mittelerde',
  'page.home.title': 'Start',
} as const;

const sk = {
  'site.title': 'Pán Prsteňov — Bitka o Stredozem',
  'nav.home': 'Úvod',
  'nav.factions': 'Frakcie',
  'nav.rules': 'Pravidlá',
  'nav.contact': 'Kontakt',
  'nav.menu': 'Menu',
  'cta.register': 'Registrovať sa',
  'hero.title': 'Pán Prsteňov',
  'hero.subtitle': 'Bitka o Stredozem',
  'page.home.title': 'Úvod',
} as const;

export const ui = { cs, en, de, sk } as const;

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
  const cleanPath = path.replace(/^\/(cs|en|de|sk)/, '');
  return `/${lang}${cleanPath || '/'}`;
}

export function getPathWithoutLang(path: string): string {
  return path.replace(/^\/(cs|en|de|sk)/, '') || '/';
}
