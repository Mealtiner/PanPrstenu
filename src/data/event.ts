/**
 * Sdílená data o akci Pán Prstenů 2026
 * Datum: 2026-05-01
 *
 * Single source of truth pro fakta o akci, která se opakují na více
 * stránkách (Praktické info, Organizační informace, Registrace, footer,
 * schema.org). Při změně termínu nebo místa stačí upravit zde.
 */

export const event = {
  title: 'Pán Prstenů — Bitva o Středozem',
  year: 2026,
  date_short: '20.–23. 8. 2026',
  date_full: 'čtvrtek 20. 8. až neděle 23. 8. 2026',
  date_chip: '20.–23. 8. 2026',
  place: 'Křtiny / Bukovina',
  region: 'jižní Morava',
  gps: '49.29895232776445, 16.759155153131733',
  participants: '700+',
  participants_note: 'očekávaný počet',
  age: '12+',
  age_note: 'pod 18 se souhlasem zástupce',
  armies: '7',
  armies_note: 'Svobodné národy a Síly Temna',
  camps: '2',
  camps_note: 'rozdělení podle stran',
  main_game_day: 'sobota',
  friday_program: 'táborový program, dětská hra, jarmark, arény a příprava',
  sunday: 'balení a odjezd',
  registration_system: 'Registračka.cz',
  registration_url: 'https://www.registracka.cz/',
  payment_due_days: 10,
  payment_methods: ['QR kód', 'bankovní převod'],
} as const;

export type EventData = typeof event;
