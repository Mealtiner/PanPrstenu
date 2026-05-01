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

export type NavLeaf = {
  label: string;
  href: string; // bez /{lang}/ prefixu pro relativní stránky; with /cs/ pro fixní kotvy
  description?: string;
  /** Pokud true, href se NEpředponuje s `/{lang}/` (např. již obsahuje /cs/) */
  absolute?: boolean;
};

export type NavColumn = {
  heading: string;
  items: NavLeaf[];
};

export type NavHighlight = {
  /** Volitelné info řádky NAD nadpisem (datum, místo, …) */
  info?: { label: string; value: string }[];
  title: string;
  text: string;
  links: NavLeaf[];
  /** Volitelné velké CTA tlačítko POD highlightem (např. „Registruj se") */
  cta?: { label: string; href: string };
};

export type NavItem =
  | { type: 'link'; label: string; href: string; key: string; description?: string; absolute?: boolean }
  | {
      type: 'mega';
      label: string;
      key: string;
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
    description: 'Pán Prstenů 2026 · 20.–23. 8. · Křtiny / Bukovina',
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
    columns: [
      {
        heading: 'Za koho a proč se hraje',
        items: [
          { label: 'Příběh ročníku', href: '/pribeh/', description: 'Zvěsti, motivace stran a příběhový rámec ročníku 2026.' },
          { label: 'Frakce a národy', href: '/frakce/', description: 'Vyber si armádu, barvy, kostým a styl hry.' },
          { label: 'Svobodné národy', href: '/frakce/#svobodne-narody', description: 'Gondor, Rohan, Elfové a Trpaslíci.' },
          { label: 'Síly Temna', href: '/frakce/#sily-temna', description: 'Mordor, Isengard a Východňané.' },
        ],
      },
      {
        heading: 'Jak se hraje',
        items: [
          { label: 'Pravidla a bezpečnost', href: '/pravidla/', description: 'Boj, zbraně, zásahy, životy, kostýmy a fair play.' },
          { label: 'Bezpečnost', href: '/bezpecnost/', description: 'Zdraví, bezpečné chování, důvěrníci a krizové situace.' },
          { label: 'Hra v táboře', href: '/hra-v-tabore/', description: 'Mince, táborový život, páteční program a mikro questy.' },
          { label: 'Fotky a video', href: '/fotky-a-video/', description: 'Jak fotit, natáčet a nerušit hru ani účastníky.' },
        ],
      },
      {
        heading: 'Svět Středozemě',
        items: [
          { label: 'Svět Středozemě', href: '/svet-stredozeme/', description: 'Lore, národy, království, místopis a časová linka.' },
          { label: 'Národy a království', href: '/svet-stredozeme/narody/', description: 'Kdo je kdo ve světě, kde se naše hra odehrává.' },
          { label: 'Místopis', href: '/svet-stredozeme/mistopis/', description: 'Rohan, Gondor, Moria, Lórien, Železný pas a další místa.' },
          { label: 'Časová linka', href: '/svet-stredozeme/casova-linka/', description: 'Druhý a Třetí věk, Válka o Prsten, naše herní zasazení.' },
        ],
      },
    ],
    highlight: {
      title: 'Nevíš, za koho jet?',
      text: 'Začni stránkou Jedu poprvé nebo si projdi přehled frakcí.',
      links: [
        { label: 'Jedu poprvé', href: '/pro-novacky/' },
        { label: 'Vybrat frakci', href: '/frakce/' },
      ],
      cta: { label: 'Registruj se', href: '/registrace/' },
    },
  },
  {
    type: 'mega',
    key: 'practical',
    label: 'Prakticky',
    columns: [
      {
        heading: 'Nejdůležitější před akcí',
        items: [
          { label: 'Praktické informace', href: '/prakticke-info/', description: 'Termín, místo, program, příjezd, tábořiště a služby na místě.' },
          { label: 'Harmonogram', href: '/prakticke-info/#harmonogram', description: 'Čtvrtek příjezd, pátek program, sobota bitva, neděle odjezd.' },
          { label: 'Mapa areálu', href: '/mapa/', description: 'Kde akce je, kudy přijet a jak se orientovat na místě.' },
          { label: 'Organizační informace', href: '/organizacni-informace/', description: 'Dokumenty, parkování, role účastníků a další provozní věci.' },
        ],
      },
      {
        heading: 'Rodiny a děti',
        items: [
          { label: 'Dětská hra', href: '/detska-hra/', description: 'Program pro malé dobrodruhy přibližně od 5 do 10 let.' },
          { label: 'Pro rodiče', href: '/detska-hra/#pro-rodice', description: 'Co děti čeká, co vzít s sebou a jak je přihlásit.' },
          { label: 'Bezpečnost dětí', href: '/bezpecnost/', description: 'Jak řešíme bezpečí mladších účastníků.' },
          { label: 'Účast mladších 18 let', href: '/organizacni-informace/', description: 'Souhlas zákonného zástupce a potřebné dokumenty.' },
        ],
      },
      {
        heading: 'Často hledané',
        items: [
          { label: 'FAQ', href: '/faq/', description: 'Odpovědi na nejčastější otázky.' },
          { label: 'Co si vzít s sebou', href: '/pro-novacky/#co-vzit', description: 'Základní výbava pro první účast.' },
          { label: 'Stravování', href: '/prakticke-info/#stravovani', description: 'Jídlo, pitná voda a hospoda U Zeleného draka.' },
          { label: 'Parkování', href: '/prakticke-info/', description: 'Parkovací karta, auta a příjezd na místo.' },
        ],
      },
    ],
    highlight: {
      info: [
        { label: 'Termín akce', value: '20. až 23. srpna 2026' },
        { label: 'Místo konání', value: 'Křtiny / Bukovina' },
      ],
      title: 'Hlavní hra je v sobotu',
      text: 'Pátek patří táborovému programu, dětské hře, jarmarku, arénám a přípravě.',
      links: [
        { label: 'Harmonogram', href: '/prakticke-info/#harmonogram' },
        { label: 'Hra v táboře', href: '/hra-v-tabore/' },
      ],
      cta: { label: 'Registruj se', href: '/registrace/' },
    },
  },
  {
    type: 'mega',
    key: 'community',
    label: 'Komunita',
    columns: [
      {
        heading: 'Dění a vzpomínky',
        items: [
          { label: 'Novinky', href: '/novinky/', description: 'Aktuality, oznámení a postupné odhalování programu.' },
          { label: 'Galerie', href: '/galerie/', description: 'Fotky z minulých ročníků.' },
          { label: 'Stánky a prodejci', href: '/stanky-a-prodejci/', description: 'Kdo bude na místě a co si budeš moct pořídit.' },
        ],
      },
      {
        heading: 'Táborový život',
        items: [
          { label: 'Hra v táboře', href: '/hra-v-tabore/', description: 'Obchodování, mince, mikro questy a život v ležení.' },
          { label: 'Fotky a video', href: '/fotky-a-video/', description: 'Pravidla focení a natáčení.' },
          { label: 'FAQ', href: '/faq/', description: 'Než napíšeš organizátorům, mrkni sem.' },
        ],
      },
    ],
  },
  {
    type: 'mega',
    key: 'collaboration',
    label: 'Spolupráce',
    columns: [
      {
        heading: 'Pro veřejnost',
        items: [
          { label: 'Stánky a prodejci', href: '/stanky-a-prodejci/', description: 'Seznam potvrzených prodejců.' },
          { label: 'Pro stánkaře', href: '/pro-stankare/', description: 'Chceš na akci prodávat nebo nabídnout služby?' },
          { label: 'Pro média', href: '/pro-media/', description: 'Mediakit, základní informace, kontakt a pravidla natáčení.' },
        ],
      },
      {
        heading: 'Pořadatel a zázemí',
        items: [
          { label: 'Pořadatel', href: '/poradatel/', description: 'Moravian LARP, z. s. a identifikační údaje.' },
          { label: 'Kontakt', href: '/kontakt/', description: 'Napiš nám, když něco nevíš nebo chceš něco domluvit.' },
          { label: 'Přístupnost', href: '/pristupnost/', description: 'Jak pracujeme s čitelností a přístupností webu.' },
        ],
      },
      {
        heading: 'Hospoda U Zeleného draka',
        items: [
          { label: 'Stravování na akci', href: '/prakticke-info/#stravovani', description: 'Domluvená hospoda na místě — jídlo a pití.' },
          { label: 'Mince v hospodě', href: '/hra-v-tabore/#mince', description: 'Herní mince jako doplněk při domluvě s hospodou.' },
          { label: 'Praktické info', href: '/prakticke-info/', description: 'Co všechno bude na místě k dispozici.' },
        ],
      },
    ],
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
  world: ['/pribeh/', '/frakce/', '/pravidla/', '/svet-stredozeme/', '/hra-v-tabore/', '/bezpecnost/', '/fotky-a-video/'],
  practical: ['/prakticke-info/', '/organizacni-informace/', '/detska-hra/', '/mapa/'],
  community: ['/novinky/', '/galerie/', '/faq/'],
  collaboration: ['/pro-media/', '/pro-stankare/', '/stanky-a-prodejci/', '/poradatel/', '/pristupnost/'],
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
