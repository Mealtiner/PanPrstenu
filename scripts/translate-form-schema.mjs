#!/usr/bin/env node
/**
 * translate-form-schema.mjs — vytvoří src/i18n/form-schema/{en,de,sk,uk}.json
 * Datum: 2026-05-12
 *
 * Vstup: src/i18n/form-schema/cs.json (zdroj pravdy, ručně extrahováno z API)
 * Výstup: 4 lang souborů s ručně přeloženými fields/options/agreements/info_html.
 *
 * Spuštění: node scripts/translate-form-schema.mjs
 *
 * Strategie překladů (LARP / Tolkien kontext):
 * - Národy (Gondor, Rohan, ...): obecně Tolkien-canonical názvy per jazyk
 * - Strany: "Svobodné národy" = Free Peoples / Freie Völker / ...
 * - Agreementy (GDPR, požáry, parkování): formální tón typu právního textu
 * - Info HTML: vlažně-přátelský tón ladící s českým originálem
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FORM_DIR = join(__dirname, '..', 'src', 'i18n', 'form-schema');

const cs = JSON.parse(readFileSync(join(FORM_DIR, 'cs.json'), 'utf8'));

// === EN ===
const en = {
  fields: {
    side: {
      label: "I want to register for the side",
      options: {
        "1": "Free Peoples of Middle-earth",
        "2": "Forces of the Dark Lord",
        "3": "Mercenaries — Highlanders of the Wold",
        "4": "Non-playing / Support",
        "5": "Children's game",
      },
    },
    nar: {
      label: "I will play for the nation",
      options: {
        "1": "Gondor",
        "2": "Rohan",
        "3": "Elves",
        "4": "Dwarves",
        "5": "Orcs",
        "6": "Uruk-hai (orcs, goblins)",
        "7": "Harad",
        "8": "Umbar",
      },
    },
    kids_age: {
      label: "Child's age",
      options: {
        "1": "Children aged 2 to 4/5 — the children's group is still being arranged. Please bear this in mind.",
        "2": "Children aged 4/5 to 6 — for younger children we require one parent to be available during play.",
        "3": "Children aged 6 to 8",
        "4": "Children aged 8 to 11",
      },
    },
    supporter_category: {
      label: "Specific non-playing participant role",
      options: {
        "1": "Hobbits (moving around the campsite)",
        "2": "Non-combat companions",
        "3": "Photographers and camera operators",
        "4": "Vendors (if you don't enter play)",
        "5": "Child accompaniment in the children's game",
        "6": "Helpers",
        "7": "Organizers",
      },
    },
    supporter_cp_general: { label: "I'd be happy to join as an NPC in the game", options: {} },
    supporter_cp_kids: { label: "I'd be happy to be part of the children's game as an NPC", options: {} },
    prijezd: { label: "I will arrive at the event", options: {} },
    weapon: { label: "I have my preferred weapon", options: {} },
    children: { label: "I'm coming with children", options: {} },
    children_0_6: { label: "Number of children aged 0 to 5 inclusive" },
    health: { label: "I have a health condition", options: {} },
    health_info: { label: "Please specify your health condition" },
    car: { label: "I'll come by car and will park", options: {} },
    car_info: { label: "Car licence plate" },
    pet: { label: "I want to bring an animal companion", options: {} },
    pet_info: { label: "What kind" },
    helper: {
      label: "I want to help with setting up and/or tearing down the facilities and arrange an appropriate discount on the registration or food fees",
      options: {},
    },
    medic: { label: "I am able and willing to serve as a medic", options: {} },
    donor: { label: "I want to become a donor and pay for someone's game", options: {} },
    mol: { label: "I'm a member of Moravian LARP, o.s.", options: {} },
    note_for_orgs: { label: "Message for the organizers" },
    stravovani: { label: "Food", options: {} },
  },
  agreements: {
    rules: "I confirm that I have read the event rules and acknowledge them.",
    a_fire:
      "I acknowledge that digging fire pits is prohibited. All fireplace sites will be approved by the organizers and only approved fire pits will receive the corresponding marking. No fires may be lit outside approved fire pits. You can prepare a fire pit by gathering stones and removing turf. Before leaving, you will return ALL stones to where you took them and cover the area back with the removed turf.",
    a_cars:
      "I acknowledge that cars will be parked in the usual parking area. Access to the camping meadow is permitted only along the marked road. No car parks on the campsite. After unloading your equipment, please re-park as soon as possible.",
    system: "I agree to the processing of my personal data under the General Data Protection Regulation.",
  },
  info_html:
    "Hello, welcome to the registration form for the Lord of the Rings [2026] LARP!<br/>\r\nIf you need to arrange or discuss anything, write to us at: <a href=\"info@panprstenu.cz\" target=\"_blank\">info@panprstenu.cz</a><br/>\r\n<br>\r\nHow the registration works:<br/>\r\n1) You fill in this form</br>\r\n2) You'll receive an email confirming your registration, including the payment details.<br/>\r\n3) Once paid, we'll record your payment in the system. It is not automatic — give us a day or two.<br/>\r\n4) Confirmation of your payment will arrive in another automatic email.<br />\r\nIf you have any questions, or if nothing happens for a long time, write to us at: <a href=\"info@panprstenu.cz\" target=\"_blank\">info@panprstenu.cz</a><br/>",
};

// === DE ===
const de = {
  fields: {
    side: {
      label: "Ich möchte mich für die Seite anmelden",
      options: {
        "1": "Freie Völker Mittelerdes",
        "2": "Streitkräfte des Dunklen Herrschers",
        "3": "Söldner — Hochländer aus Wold",
        "4": "Nicht-Spielende / Begleitung",
        "5": "Kinderspiel",
      },
    },
    nar: {
      label: "Ich werde für das Volk spielen",
      options: {
        "1": "Gondor",
        "2": "Rohan",
        "3": "Elben",
        "4": "Zwerge",
        "5": "Orks",
        "6": "Uruk-hai (Orks, Goblins)",
        "7": "Harad",
        "8": "Umbar",
      },
    },
    kids_age: {
      label: "Alter des Kindes",
      options: {
        "1": "Kinder von 2 bis 4/5 Jahren — die Kindergruppe wird noch organisiert. Bitte berücksichtige dies.",
        "2": "Kinder von 4/5 bis 6 Jahren — bei jüngeren Kindern verlangen wir, dass ein Elternteil während des Spiels verfügbar ist.",
        "3": "Kinder von 6 bis 8 Jahren",
        "4": "Kinder von 8 bis 11 Jahren",
      },
    },
    supporter_category: {
      label: "Konkrete Rolle der nicht-spielenden Teilnehmer:in",
      options: {
        "1": "Hobbits (bewege mich im Lager)",
        "2": "Nicht-Kampf-Begleitung",
        "3": "Fotograf:innen und Kameraleute",
        "4": "Standbetreiber:innen (wenn du nicht ins Spiel gehst)",
        "5": "Kinderbegleitung im Rahmen des Kinderspiels",
        "6": "Helfer:innen",
        "7": "Organisator:innen",
      },
    },
    supporter_cp_general: { label: "Ich beteilige mich gerne als NPC im Spiel", options: {} },
    supporter_cp_kids: { label: "Ich beteilige mich gerne als NPC im Kinderspiel", options: {} },
    prijezd: { label: "Ich werde zur Veranstaltung anreisen", options: {} },
    weapon: { label: "Ich habe meine bevorzugte Waffe", options: {} },
    children: { label: "Ich komme mit Kindern", options: {} },
    children_0_6: { label: "Anzahl Kinder zwischen 0 und einschließlich 5 Jahren" },
    health: { label: "Ich habe gesundheitliche Einschränkungen", options: {} },
    health_info: { label: "Bitte präzisiere deine gesundheitlichen Einschränkungen" },
    car: { label: "Ich komme mit dem Auto und werde parken", options: {} },
    car_info: { label: "Kfz-Kennzeichen" },
    pet: { label: "Ich möchte ein Haustier mitbringen", options: {} },
    pet_info: { label: "Welches" },
    helper: {
      label:
        "Ich möchte beim Aufbau und/oder Abbau der Infrastruktur helfen und mir dadurch eine entsprechende Ermäßigung der Anmelde- oder Verpflegungsgebühren sichern",
      options: {},
    },
    medic: { label: "Ich bin fähig und bereit, als Sanitäter:in zu dienen", options: {} },
    donor: { label: "Ich möchte Spender:in werden und jemand anderem die Teilnahme bezahlen", options: {} },
    mol: { label: "Ich bin Mitglied von Moravian LARP, o.s.", options: {} },
    note_for_orgs: { label: "Nachricht an die Organisator:innen" },
    stravovani: { label: "Essen", options: {} },
  },
  agreements: {
    rules: "Ich bestätige, dass ich die Veranstaltungsregeln gelesen und zur Kenntnis genommen habe.",
    a_fire:
      "Ich nehme zur Kenntnis, dass das Graben von Feuerstellen verboten ist. Alle Feuerstellen werden von den Organisator:innen genehmigt und nur genehmigte Feuerstellen erhalten die entsprechende Kennzeichnung. Außerhalb genehmigter Feuerstellen darf kein Feuer entfacht werden. Feuerstellen kannst du vorbereiten, indem du Steine sammelst und Grasnarbe abträgst. Vor der Abreise legst du ALLE Steine an ihre ursprüngliche Stelle zurück und deckst den Boden wieder mit der abgetragenen Grasnarbe ab.",
    a_cars:
      "Ich nehme zur Kenntnis, dass Autos auf dem üblichen Parkplatz geparkt werden. Die Fahrt zur Lagerwiese ist nur entlang des markierten Weges erlaubt. Auf dem Lagerplatz parkt kein Auto. Nach dem Entladen der Ausrüstung bitte so schnell wie möglich umparken.",
    system: "Ich stimme der Verarbeitung meiner personenbezogenen Daten gemäß der Datenschutz-Grundverordnung zu.",
  },
  info_html:
    "Hallo, willkommen im Anmeldeformular für das LARP <strong>Herr der Ringe [2026]</strong>!<br/>\r\nWenn du etwas absprechen oder dich beraten lassen möchtest, schreibe uns an: <a href=\"info@panprstenu.cz\" target=\"_blank\">info@panprstenu.cz</a><br/>\r\n<br>\r\nSo läuft die Anmeldung ab:<br/>\r\n1) Du füllst dieses Formular aus</br>\r\n2) Du erhältst eine Bestätigungs-E-Mail mit den Zahlungsinformationen.<br/>\r\n3) Nach der Zahlung tragen wir deine Zahlung im System ein. Das passiert nicht automatisch — gib uns einen oder zwei Tage.<br/>\r\n4) Die Bestätigung deiner Zahlung erhältst du erneut per automatischer E-Mail.<br />\r\nWenn du Fragen hast oder lange nichts passiert, schreibe uns an: <a href=\"info@panprstenu.cz\" target=\"_blank\">info@panprstenu.cz</a><br/>",
};

// === SK ===
const sk = {
  fields: {
    side: {
      label: "Chcem sa zaregistrovať za stranu",
      options: {
        "1": "Slobodné národy Stredozeme",
        "2": "Sily Temného pána",
        "3": "Žoldnieri — Horali z Vrchoviny",
        "4": "Nehrajúci / Nebojový sprievod",
        "5": "Detská hra",
      },
    },
    nar: {
      label: "Pôjdem za národ",
      options: {
        "1": "Gondor",
        "2": "Rohan",
        "3": "Elfovia",
        "4": "Trpaslíci",
        "5": "Škreti",
        "6": "Škuruti (orkovia, goblini)",
        "7": "Harad",
        "8": "Umbar",
      },
    },
    kids_age: {
      label: "Vek dieťaťa",
      options: {
        "1": "deti od 2 do 4/5 rokov - detskú skupinu ešte riešime. Prosím, berte to do úvahy.",
        "2": "deti od 4/5 do 6 rokov - u menších detí požadujeme, aby bol jeden z rodičov k dispozícii počas hry.",
        "3": "deti od 6 do 8 rokov",
        "4": "deti od 8 do 11 rokov",
      },
    },
    supporter_category: {
      label: "Konkrétna rola nehrajúceho účastníka",
      options: {
        "1": "Hobiti (pohybujem sa v tábore)",
        "2": "Nebojový sprievod",
        "3": "Fotografi a kameramani",
        "4": "Stánkari (ak nejdete do hry)",
        "5": "Sprievod dieťaťa v rámci detskej hry",
        "6": "Pomocníci",
        "7": "Organizátori",
      },
    },
    supporter_cp_general: { label: "Rád sa zapojím ako CP do hry", options: {} },
    supporter_cp_kids: { label: "Rád sa zapojím ako súčasť detskej hry ako CP", options: {} },
    prijezd: { label: "Na akciu prídem", options: {} },
    weapon: { label: "Mám svoju preferovanú zbraň", options: {} },
    children: { label: "Prídem s deťmi", options: {} },
    children_0_6: { label: "Počet detí medzi 0 a 5 rokmi vrátane" },
    health: { label: "Mám zdravotné obmedzenie", options: {} },
    health_info: { label: "Prosím upresni svoje zdravotné obmedzenie" },
    car: { label: "Prídem autom a budem parkovať", options: {} },
    car_info: { label: "ŠPZ auta" },
    pet: { label: "Chcem si so sebou priviezť zvieracieho miláčika", options: {} },
    pet_info: { label: "Akého" },
    helper: {
      label:
        "Chcem pomáhať s vybudovaním a/alebo so zbúraním zázemia a dohodnúť si tak primeranú úľavu z poplatkov registračných alebo poplatkov za jedlo",
      options: {},
    },
    medic: { label: "Som schopný/á a ochotný/á robiť zdravotníka", options: {} },
    donor: { label: "Chcem sa stať donátorom a zaplatiť niekomu hru", options: {} },
    mol: { label: "Som člen Moravian LARP, o.s", options: {} },
    note_for_orgs: { label: "Odkaz pre organizátorov" },
    stravovani: { label: "Jedlo", options: {} },
  },
  agreements: {
    rules: "Potvrdzujem, že som si prečítal pravidlá akcie a beriem ich na vedomie.",
    a_fire:
      "Beriem na vedomie, že sa zakazuje kopanie ohnísk. Všetky miesta pre ohniská budú schvaľované organizátormi a iba schválené ohniská obdržia príslušné označenie. Mimo schválené ohnisko sa nesmie zakladať oheň. Ohnisko si môžete pripraviť nanosením kameňov a odkrytím trávnika. Pred odjazdom vrátite VŠETKY kamene tam, kde ste ich vzali a zároveň spätne zakryjete odkrytým trávnikom.",
    a_cars:
      "Beriem na vedomie, že autá sa budú parkovať na obvyklom parkovisku. Cesta na táborovú lúku je povolená iba po vytýčenej ceste. Na tábore neparkuje žiadne auto. Po vyložení vybavenia prosím čo najskôr preparkovať na parkovisko.",
    system: "Súhlasím so spracovaním svojich osobných údajov podľa všeobecného nariadenia o ochrane osobných údajov.",
  },
  info_html:
    "Ahoj, vitaj v registračnom formulári na larp <strong>Pán Prsteňov [2026]</strong>!<br/>\r\nAk sa potrebuješ na niečom dohodnúť alebo poradiť, napíš nám na: <a href=\"info@panprstenu.cz\" target=\"_blank\">info@panprstenu.cz</a><br/>\r\n<br>\r\nAko registrácia prebieha:<br/>\r\n1) Vyplníš tento formulár</br>\r\n2) Príde ti e-mail s potvrdením, že si zaregistrovaný. Jeho súčasťou sú platobné informácie.<br/>\r\n3) Po zaplatení zanesieme tvoju platbu do systému. Nie je to automatické obratom. Daj nám deň, dva.<br/>\r\n4) To, že sme prijali tvoju platbu, ti opäť príde potvrdené automatickým e-mailom.<br />\r\nAk máš otázku alebo sa dlho nič nedeje, napíš nám na: <a href=\"info@panprstenu.cz\" target=\"_blank\">info@panprstenu.cz</a><br/>",
};

// === UK ===
const uk = {
  fields: {
    side: {
      label: "Хочу зареєструватися за сторону",
      options: {
        "1": "Вільні народи Середзем'я",
        "2": "Сили Темного володаря",
        "3": "Найманці — Горяни з Волду",
        "4": "Неграючі / Небойовий супровід",
        "5": "Дитяча гра",
      },
    },
    nar: {
      label: "Гратиму за народ",
      options: {
        "1": "Гондор",
        "2": "Рохан",
        "3": "Ельфи",
        "4": "Ґноми",
        "5": "Орки",
        "6": "Урук-хай (орки, гобліни)",
        "7": "Гарад",
        "8": "Умбар",
      },
    },
    kids_age: {
      label: "Вік дитини",
      options: {
        "1": "Діти від 2 до 4/5 років — дитячу групу ще організовуємо. Будь ласка, врахуйте це.",
        "2": "Діти від 4/5 до 6 років — для менших дітей вимагаємо, щоб один із батьків був доступний під час гри.",
        "3": "Діти від 6 до 8 років",
        "4": "Діти від 8 до 11 років",
      },
    },
    supporter_category: {
      label: "Конкретна роль неграючого учасника",
      options: {
        "1": "Гобіти (рухаюсь по табору)",
        "2": "Небойовий супровід",
        "3": "Фотографи та оператори",
        "4": "Торговці (якщо не йдете в гру)",
        "5": "Супровід дитини в межах дитячої гри",
        "6": "Помічники",
        "7": "Організатори",
      },
    },
    supporter_cp_general: { label: "Із задоволенням долучусь як НПС до гри", options: {} },
    supporter_cp_kids: { label: "Із задоволенням долучусь як частина дитячої гри як НПС", options: {} },
    prijezd: { label: "Прибуду на захід", options: {} },
    weapon: { label: "Маю свою улюблену зброю", options: {} },
    children: { label: "Приїду з дітьми", options: {} },
    children_0_6: { label: "Кількість дітей від 0 до 5 років включно" },
    health: { label: "Маю обмеження здоров'я", options: {} },
    health_info: { label: "Будь ласка, уточніть свої обмеження здоров'я" },
    car: { label: "Приїду автомобілем і паркуватимусь", options: {} },
    car_info: { label: "Номер автомобіля" },
    pet: { label: "Хочу взяти з собою тварину-улюбленця", options: {} },
    pet_info: { label: "Яку" },
    helper: {
      label:
        "Хочу допомогти зі встановленням і/або згортанням інфраструктури та домовитись про відповідну знижку на реєстраційні чи харчові внески",
      options: {},
    },
    medic: { label: "Здатний/а та готовий/а виконувати функцію медика", options: {} },
    donor: { label: "Хочу стати донатором і оплатити комусь гру", options: {} },
    mol: { label: "Я член Moravian LARP, o.s", options: {} },
    note_for_orgs: { label: "Повідомлення для організаторів" },
    stravovani: { label: "Харчування", options: {} },
  },
  agreements: {
    rules: "Підтверджую, що прочитав правила заходу та беру їх до відома.",
    a_fire:
      "Беру до відома, що копати багаття заборонено. Всі місця для багать схвалюються організаторами і лише схвалені багаття отримують відповідне позначення. Поза схваленими багаттями розпалювати вогонь заборонено. Багаття можна підготувати, наносивши каменів і знявши дерн. Перед від'їздом ви повернете ВСІ камені туди, де їх взяли, і одночасно покриєте місце знятим дерном.",
    a_cars:
      "Беру до відома, що автомобілі паркуватимуться на звичайному паркувальному майданчику. Шлях до табірної луки дозволено лише позначеною дорогою. На території табору жоден автомобіль не паркується. Після розвантаження обладнання будь ласка перепаркуйтеся якомога швидше.",
    system: "Погоджуюсь на обробку моїх персональних даних згідно з Загальним регламентом про захист персональних даних.",
  },
  info_html:
    "Привіт, ласкаво просимо до реєстраційної форми ларпу <strong>Володар перснів [2026]</strong>!<br/>\r\nЯкщо потрібно щось узгодити чи порадитись, напиши нам на: <a href=\"info@panprstenu.cz\" target=\"_blank\">info@panprstenu.cz</a><br/>\r\n<br>\r\nЯк відбувається реєстрація:<br/>\r\n1) Заповнюєш цю форму</br>\r\n2) Прийде лист із підтвердженням реєстрації. У ньому будуть платіжні дані.<br/>\r\n3) Після оплати внесемо твій платіж у систему. Це не автоматично — дай нам день-два.<br/>\r\n4) Підтвердження прийому твого платежу прийде ще одним автоматичним листом.<br />\r\nЯкщо маєш питання або довго нічого не відбувається, напиши нам на: <a href=\"info@panprstenu.cz\" target=\"_blank\">info@panprstenu.cz</a><br/>",
};

// Zápis
const langs = { en, de, sk, uk };
for (const [lang, data] of Object.entries(langs)) {
  const path = join(FORM_DIR, `${lang}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  const fields = Object.keys(data.fields).length;
  const options = Object.values(data.fields).reduce(
    (sum, f) => sum + Object.keys(f.options || {}).length,
    0,
  );
  const agreements = Object.keys(data.agreements).length;
  console.log(`${lang}.json: ${fields} fields, ${options} options, ${agreements} agreements`);
}

console.log(`\n✓ Vstup cs.json: ${Object.keys(cs.fields).length} fields, ${Object.values(cs.fields).reduce((s, f) => s + Object.keys(f.options || {}).length, 0)} options, ${Object.keys(cs.agreements).length} agreements`);
