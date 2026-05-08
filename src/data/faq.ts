/**
 * FAQ data — 17 kategorií, ~100 otázek, 5 jazyků
 * Datum: 2026-05-03
 *
 * Použití ve stránce:
 *   import { getFaqGroups } from '@data/faq';
 *   const groups = getFaqGroups(lang);
 *
 * Odpovědi mohou obsahovat HTML (typicky <a href> a <strong>). URL se
 * skládají přes pomocnou funkci L(path) — předá se langu prefix.
 */

import type { Lang } from '@i18n/ui';

export interface FaqItem {
  q: string;
  a: string;
  faqSnippet?: boolean;
}

export interface FaqGroup {
  id: string;
  label: string;
  icon: string;
  items: FaqItem[];
}

type LinkFn = (path: string) => string;

export function getFaqGroups(lang: Lang): FaqGroup[] {
  const L: LinkFn = (path) => `/${lang}${path}`;
  switch (lang) {
    case 'en':
      return en(L);
    case 'de':
      return de(L);
    case 'sk':
      return sk(L);
    case 'uk':
      return uk(L);
    case 'cs':
    default:
      return cs(L);
  }
}

// ============================================================
// ČESKY (zdroj pravdy)
// ============================================================
function cs(L: LinkFn): FaqGroup[] {
  return [
    {
      id: 'obecne',
      label: 'Obecné dotazy',
      icon: 'lucide:help-circle',
      items: [
        { q: 'Co je Pán Prstenů?', a: `Pán Prstenů je velká několikadenní larpová bitva inspirovaná Tolkienovou Středozemí. Přijedeš na víkend, zařadíš se do jedné ze stran a armád, oblékneš kostým, projdeš registrací a zapojíš se do hry, táborového života a hlavní sobotní bitvy. Není to historická rekonstrukce ani sportovní turnaj — je to společná hra, kde jsou důležité atmosféra, fér-play, bezpečnost, kostýmy, příběh a komunita. Více najdeš na stránce <a href="${L('/pro-novacky/')}" class="underline">Pro nováčky</a>.` },
        { q: 'Co je LARP?', a: `LARP je hra naživo. Nehraješ postavu na počítači ani figurku na stole — na chvíli se postavou stáváš ty sám. Oblékneš si kostým, přijmeš roli, dodržuješ pravidla a společně s ostatními vytváříš živý svět. Na Pánu Prstenů to znamená kostým, armádu, pravidla boje, fér uznávání zásahů, respekt k ostatním a ochotu pomoct atmosféře Středozemě.` },
        { q: 'Je akce vhodná pro nováčky?', a: `Ano. Nováčci jsou vítaní. Nemusíš mít za sebou žádný jiný larp. Důležité je přečíst si základní informace, vybrat si armádu, připravit si kostým a nebát se zeptat. Doporučená cesta: <a href="${L('/pro-novacky/')}" class="underline">Pro nováčky</a> → <a href="${L('/frakce/')}" class="underline">Armády</a> → <a href="${L('/pravidla/')}" class="underline">Pravidla</a> → <a href="${L('/organizacni-informace/')}" class="underline">Praktické informace</a> → <a href="${L('/registrace/')}" class="underline">Registrace</a>.`, faqSnippet: true },
        { q: 'Musím znát Tolkienovy knihy nebo filmy?', a: `Nemusíš. Pomůže to s atmosférou, ale není to podmínka. Stačí chápat, že jedeme ve fantasy světě inspirovaném Středozemí a že kostým, chování a vybavení by tomu měly odpovídat. Pokud chceš svět poznat víc, mrkni na <a href="${L('/svet-stredozeme/')}" class="underline">Svět Středozemě</a>.` },
        { q: 'Kolik lidí na akci očekáváte?', a: `Očekáváme účast v řádu stovek lidí, přibližně 700+ účastníků. Proto je důležité řešit registraci, platbu, příjezd, parkování a dokumenty včas.` },
        { q: 'Můžu přijet jen na jeden den?', a: `Akce je koncipovaná jako víkendový zážitek. Hlavní bitva je v sobotu, ale důležitá část atmosféry vzniká už ve čtvrtek a v pátek: táboření, registrace, schvalování, páteční program, dětská hra, jarmark, arény a večerní život v táboře. Jednodenní účast může být možná výjimečně, ale řeš ji předem s organizátory.` },
      ],
    },
    {
      id: 'novacci',
      label: 'Nováčci a první účast',
      icon: 'lucide:sparkles',
      items: [
        { q: 'Kde mám začít, když jedu poprvé?', a: `Začni stránkou <a href="${L('/pro-novacky/')}" class="underline">Pro nováčky</a>. Tam najdeš cestu krok za krokem: co je akce, co je LARP, jak si vybrat armádu, co si vzít, jak funguje registrace a co tě čeká na místě.` },
        { q: 'Co je nejdůležitější před první účastí?', a: `Vybrat si armádu, přečíst si základní pravidla, připravit kostým, zaregistrovat se, zaplatit registrační poplatek do 10 dnů, připravit dokumenty, dorazit včas a nebát se říct, že jsi nováček.` },
        { q: 'Co když jedu sám a nikoho tam neznám?', a: `To je úplně v pořádku. Na akci běžně přijíždějí lidé sami. Vyber si armádu, doraz včas a při registraci nebo u organizátorů se zeptej, kam se zařadit. Pomůže taky napsat nám předem. Ve Středozemi se družiny tvoří rychleji, než se zdá.` },
        { q: 'Pomůže mi někdo na místě?', a: `Ano. Organizátoři, panovníci, velitelé armád i zkušenější hráči ti poradí. Když nevíš, zeptej se. Lepší je zeptat se desetkrát než něco řešit špatně až v bitvě.` },
        { q: 'Musím umět hrát roli?', a: `Nemusíš být herec. Stačí jednoduchý základ: nebourat atmosféru, neřešit všechno mimo hru, chovat se podle své armády a respektovat ostatní. I obyčejný voják, trpaslík, skřet, hobit nebo doprovod umí vytvořit skvělou atmosféru.` },
      ],
    },
    {
      id: 'termin',
      label: 'Termín, místo a program',
      icon: 'lucide:calendar-days',
      items: [
        { q: 'Kdy se akce koná?', a: `Ročník 2026 se koná od <strong>20. do 23. 8. 2026</strong>. Čtvrtek: příjezd, tábořiště, registrace, první setkání. Pátek: doprovodný program, hra v táboře, dětská hra, jarmark, arény, příprava. Sobota: hlavní hra / bitva. Neděle: balení, úklid, odjezd. Aktuální informace najdeš v <a href="${L('/organizacni-informace/')}" class="underline">Praktických informacích</a>.` },
        { q: 'Kde se akce koná?', a: `Akce se koná v oblasti jižní Moravy, v lokalitě Křtiny / Bukovina. Přesné pokyny k příjezdu a informace k místu sleduj v <a href="${L('/organizacni-informace/')}" class="underline">Praktických informacích</a> a v e-mailech pro registrované účastníky. Mapa je na stránce <a href="${L('/mapa/')}" class="underline">Mapa areálu</a>.` },
        { q: 'Kdy je hlavní bitva?', a: `Hlavní hra a hlavní bitva probíhá <strong>v sobotu</strong>. Pátek ale není jen čekání na sobotu — je to důležitá část víkendu s programem, hrou v táboře, dětskou hrou, jarmarkem a přípravou.` },
        { q: 'Co se děje v pátek?', a: `Pátek patří táborovému životu. Počítáme s doprovodným programem, jarmarkem, arénami, hrami, mikro questy, mincemi, dětskou hrou a atmosférou v táboře. Více najdeš na stránce <a href="${L('/hra-v-tabore/')}" class="underline">Hra v táboře</a>.` },
        { q: 'Musím přijet už ve čtvrtek?', a: `Nemusíš, ale doporučujeme to. Budeš mít víc času postavit tábor, projít registrací, vyřešit kostým, potkat svou armádu a naladit se na hru. Kdo přijede pozdě, často řeší všechno ve spěchu.` },
      ],
    },
    {
      id: 'registrace',
      label: 'Registrace, platba a storno',
      icon: 'lucide:credit-card',
      items: [
        { q: 'Jak funguje registrace?', a: `Registrace probíhá online přes systém Registračka.cz. Vyplníš formulář, vybereš si stranu a armádu, doplníš potřebné údaje a po registraci dostaneš e-mail s informacemi k platbě. Detail najdeš na stránce <a href="${L('/registrace/')}" class="underline">Registrace</a>.`, faqSnippet: true },
        { q: 'Kdy dostanu informace k platbě?', a: `Informace k platbě dostaneš hned po registraci. Platit můžeš QR kódem nebo převodem podle pokynů v e-mailu.` },
        { q: 'Do kdy musím zaplatit?', a: `Registrační poplatek je potřeba zaplatit <strong>do 10 dnů od registrace</strong>. Pokud platba nedorazí, může být registrace považována za neuhrazenou.` },
        { q: 'Kde najdu výši registračního poplatku?', a: `Přehled registračních poplatků, termínů a případných doplatků je na stránce <a href="${L('/registrace/')}" class="underline">Registrace</a>. Aktuální informace najdeš také v <a href="${L('/organizacni-informace/')}" class="underline">Praktických informacích</a>.` },
        { q: 'Můžu změnit armádu po registraci?', a: `Ano, ale řeš to co nejdříve. Napiš organizátorům e-mail a uveď, z jaké armády do jaké chceš přejít. Změna může být omezena kapacitou nebo vyvážením stran.` },
        { q: 'Můžu registraci převést na někoho jiného?', a: `Ano, pokud to stihneš včas a domluvíš se s organizátory. Neposílej za sebe náhradníka bez domluvy — potřebujeme mít správné údaje účastníka, věk, dokumenty a zařazení.` },
        { q: 'Co když potřebuji storno?', a: `Storno řeš co nejdříve e-mailem. Obecně platí, že čím blíže akci jsme, tím více nákladů už je zaplaceno. Podrobné storno podmínky najdeš v <a href="${L('/podminky-ucasti-a-registrace/')}" class="underline">Podmínkách registrace</a>.` },
        { q: 'Co když nemám na registrační poplatek?', a: `Ozvi se nám. V některých případech je možné domluvit pomoc, odpracování části poplatku, pomoc při přípravě nebo individuální řešení. Neumíme slíbit všechno všem, ale když víme včas, můžeme hledat cestu.` },
      ],
    },
    {
      id: 'vek',
      label: 'Věk, rodiče a děti',
      icon: 'lucide:baby',
      items: [
        { q: 'Od kolika let je možné jet do hlavní hry?', a: `Hlavní hra jako hrající účastník je určena pro účastníky od <strong>12 let</strong>. Pro mladší děti připravujeme samostatnou <a href="${L('/detska-hra/')}" class="underline">dětskou hru</a>.`, faqSnippet: true },
        { q: 'Co potřebují účastníci mladší 18 let?', a: `Účastníci mladší 18 let potřebují vytištěnou, vyplněnou a podepsanou přihlášku / souhlas zákonného zástupce. Bez ní je nemůžeme pustit do hry. Podrobnosti najdeš na stránce <a href="${L('/pro-rodice/')}" class="underline">Pro rodiče</a>.` },
        { q: 'Může jet dítě samo?', a: `Hráči od 12 let se mohou účastnit hlavní hry. Do 18 let potřebujeme podepsaný souhlas zákonného zástupce. U osob mladších 15 let je nutný doprovod osoby starší 18 let, která za ně odpovídá. Pokud dítě nejede přímo s rodičem, je potřeba mít jasně uvedeno, kdo za něj na akci odpovídá.` },
        { q: 'Může dítě jet s jiným dospělým než rodičem?', a: `Ano, ale potřebujeme písemný souhlas zákonného zástupce a jasně uvedenou osobu, která za dítě na akci odpovídá.` },
        { q: 'Může rodič zůstat na akci jako doprovod?', a: `Ano. Rodič může jet jako nehrající doprovod, jako hrající účastník, jako pomocník nebo se zapojit do dětské hry. I doprovod by měl respektovat atmosféru akce a ideálně mít jednoduchý kostým nebo alespoň nerušivé oblečení. Více v <a href="${L('/role/nebojovy-doprovod/')}" class="underline">Nebojovém doprovodu</a>.` },
        { q: 'Je akce pro děti bezpečná?', a: `Děláme maximum pro bezpečný průběh: kontrolujeme zbraně, řešíme pravidla, máme zdravotníka, organizátory v terénu a jasné pokyny pro účastníky. Zároveň ale platí, že jde o pohybovou venkovní akci v terénu. Drobný úraz, odřenina nebo modřina se stát může.` },
        { q: 'Doporučujete dětem ochranné vybavení?', a: `Ano. U mladších účastníků rozhodně doporučujeme rukavice, pevnou obuv a podle role a zapojení i vhodnou ochranu hlavy. Vybavení musí být bezpečné a mělo by zapadat do kostýmu.` },
      ],
    },
    {
      id: 'armady',
      label: 'Armády, strany a role',
      icon: 'lucide:flag',
      items: [
        { q: 'Jaký je rozdíl mezi stranou a armádou?', a: `Na akci máme dvě hlavní strany. V každé straně jsou jednotlivé armády. Účastník si tedy vybírá stranu a v jejím rámci konkrétní armádu. Přehled najdeš na stránce <a href="${L('/frakce/')}" class="underline">Armády</a>.` },
        { q: 'Jak si mám vybrat armádu?', a: `Vyber si armádu podle atmosféry, kostýmu, stylu hry a toho, co tě láká. Nevybírej jen podle toho, kdo se ti líbí v příběhu. Důležité je i to, jaký kostým zvládneš připravit a jestli se v té roli budeš cítit dobře.` },
        { q: 'Můžu jet jako nebojový doprovod?', a: `Ano. Nebojový doprovod je účastník, který je součástí atmosféry a tábora, ale nebojuje. I pro něj platí kostýmová povinnost a pravidla akce. Více na stránce <a href="${L('/role/nebojovy-doprovod/')}" class="underline">Nebojový doprovod</a>.` },
        { q: 'Můžu jet jako fotograf nebo kameraman?', a: `Ano, ale i fotografové a kameramani musí respektovat pravidla akce. Platí pro ně kostýmová povinnost jako pro ostatní. Pokud to nejde, musí mít alespoň nerušivé oblečení a domluvit se s organizátory. Základní pravidlo: <strong>pokud nevypadáš jako ze Středozemě, nelez do záběru ostatním</strong>. Více na stránce <a href="${L('/role/fotografove-a-kameramani/')}" class="underline">Fotografové a kameramani</a>.`, faqSnippet: true },
        { q: 'Můžu jet jako pomocník?', a: `Ano. Pomocníci nám mohou pomáhat podle domluvy s přípravou, registrací, zázemím, dětskou hrou, úklidem nebo dalšími úkoly. Zároveň si mohou akci užít jako běžní účastníci, pokud se tak domluvíme. Podle míry zapojení je možné řešit slevu, odpuštění registračního poplatku nebo stravu a pití. Více na stránce <a href="${L('/role/pomocnici/')}" class="underline">Pomocníci</a>.` },
      ],
    },
    {
      id: 'kostymy',
      label: 'Kostýmy a vybavení',
      icon: 'lucide:shirt',
      items: [
        { q: 'Musím mít kostým?', a: `Ano. Kostým je součástí hry i atmosféry. Nemusí být dokonalý, ale měl by odpovídat zvolené armádě, být bezpečný, použitelný v terénu a neměl by rušit ostatní.` },
        { q: 'Co potřebuji ke kostýmu?', a: `Základ je jednoduchý: tunika nebo halenice, kalhoty v nerušivé barvě, opasek, pevná obuv, pokrývka hlavy, plášť nebo doplňky podle armády. Každá armáda má jiné barvy a styl. Konkrétní doporučení najdeš v sekci <a href="${L('/frakce/')}" class="underline">Armády</a> a na stránce <a href="${L('/pro-novacky/#kostym')}" class="underline">Pro nováčky — Kostým</a>.`, faqSnippet: true },
        { q: 'Musí být kostým historicky přesný?', a: `Ne. Nejde o historickou rekonstrukci. Kostým má hlavně zapadat do fantasy světa Středozemě, nepůsobit civilně a pomáhat atmosféře.` },
        { q: 'Co když nemám žádný kostým?', a: `Začni jednoduše. Lepší je obyčejná tunika, plášť a nerušivé barvy než civilní oblečení. Pokud si nevíš rady, napiš organizátorům nebo se podívej na stránku <a href="${L('/pro-novacky/')}" class="underline">Pro nováčky</a>.` },
        { q: 'Máte půjčovnu kostýmů?', a: `Můžeme mít omezené množství základních věcí k zapůjčení, ale nespoléhej na to automaticky. Domluv se předem. Kostým je primárně odpovědnost účastníka. Pokud máš zájem, v dostatečném předstihu napiš na info@panprstenu.cz.` },
        { q: 'Můžu být přes den v civilu?', a: `Po dobu akce platí kostýmová povinnost. Civilní oblečení výrazně ruší atmosféru. Pokud se potřebuješ převléct z praktických důvodů, řeš to rozumně mimo hlavní herní prostor.` },
        { q: 'Jaká obuv je vhodná?', a: `Pevná, pohodlná, nerušivá a vhodná do lesa. Ideálně tmavá nebo přírodní. Křiklavé moderní boty ruší atmosféru a v terénu často nejsou praktické.` },
      ],
    },
    {
      id: 'zbrane',
      label: 'Zbraně, boj a pravidla',
      icon: 'lucide:swords',
      items: [
        { q: 'Můžu si vzít vlastní zbraň?', a: `Ano, ale pouze bezpečnou měkčenou larpovou zbraň, která projde kontrolou. Ostré, kovové, příliš tvrdé nebo nevhodně upravené zbraně nejsou povoleny.` },
        { q: 'Co když moje zbraň neprojde kontrolou?', a: `Nebudeš ji smět použít. Doporučujeme mít náhradní zbraň nebo se předem poradit s organizátory. Bezpečnost je důležitější než to, že se ti zbraň líbí.` },
        { q: 'Jak funguje boj?', a: `Boj je simulovaný. Nejde o skutečný boj ani sportovní zápas. Používají se měkčené zbraně, platí pravidla zásahových ploch, životů a oživení. Zásah uznává zasažený. Hrajeme férově. Detail najdeš v <a href="${L('/pravidla/')}" class="underline">Pravidlech</a>.` },
        { q: 'Co znamená „zásah uznává zasažený"?', a: `Když tě někdo platně zasáhne, ty sám zásah uznáš. Nečekáš, až ti to protivník vynutí. Fair-play je základ hry. Když si nejsi jistý, raději zásah uznej.` },
        { q: 'Kde najdu kompletní pravidla?', a: `Na stránce <a href="${L('/pravidla/')}" class="underline">Pravidla</a>. Doporučujeme si je přečíst před akcí a před bitvou si zopakovat hlavně bezpečnost, zbraně, zásahy a oživování.` },
        { q: 'Co když pravidlům nerozumím?', a: `Zeptej se. Před akcí e-mailem, na místě organizátorů nebo zkušenějších hráčů. Nejasnosti je lepší vyřešit před bitvou než během ní.` },
      ],
    },
    {
      id: 'bezpecnost',
      label: 'Bezpečnost a zdraví',
      icon: 'lucide:shield-check',
      items: [
        { q: 'Co když se zraním?', a: `Na akci je přítomen zdravotník. Pokud se zraníš, ukonči hru, upozorni okolí a vyhledej organizátora nebo zdravotníka. U vážnější situace se postupuje podle krizových pokynů. Detaily v <a href="${L('/bezpecnost/')}" class="underline">Bezpečnost a krizové situace</a>.`, faqSnippet: true },
        { q: 'Je na akci zdravotník?', a: `Ano. Po dobu akce je na místě zdravotník s vybavením pro základní ošetření.` },
        { q: 'Co když mám alergii, léky nebo zdravotní omezení?', a: `Uveď to v registraci a vezmi si potřebné léky s sebou. Pokud jde o důležitou informaci pro bezpečný průběh akce, nahlas ji při registraci také organizátorům nebo zdravotníkovi.` },
        { q: 'Můžu jít do bitvy pod vlivem alkoholu?', a: `Ne. Do bitvy nesmí nikdo pod vlivem alkoholu ani jiných omamných látek. Bezpečnost ostatních je důležitější než tvoje chuť „ještě si zahrát".` },
        { q: 'Co když se necítím bezpečně nebo mám problém s jiným účastníkem?', a: `Obrať se na organizátora. Pokud je na akci určený důvěrník nebo důvěrnice, můžeš se obrátit i na ně. Respekt, osobní hranice a bezpečí jsou součástí pravidel.` },
        { q: 'Co platí v krizové situaci?', a: `Hlavní pravidlo: zachovej klid, řiď se pokyny organizátorů a nešiř neověřené informace. V případě zranění, požáru, bouřky, ztraceného dítěte nebo jiné vážné situace kontaktuj nejbližšího organizátora.` },
      ],
    },
    {
      id: 'taboreni',
      label: 'Tábořeni, strava a zázemí',
      icon: 'lucide:tent',
      items: [
        { q: 'Kde se spí?', a: `Spí se ve vlastních stanech v tábořišti. Tábořeni je součástí atmosféry akce. Pokud máš moderní stan, snaž se ho umístit a upravit tak, aby co nejméně rušil prostředí.` },
        { q: 'Je na místě pitná voda?', a: `Ano, na místě bude zajištěná pitná voda. I tak doporučujeme mít vlastní nádobu na vodu, čutoru nebo lahev.` },
        { q: 'Je na místě jídlo?', a: `Na místě funguje hospoda U Zeleného draka, kde bude možné řešit jídlo a pití podle provozních možností. Organizátoři ale centrálně nezajišťují stravu pro každého účastníka. Za jídlo během víkendu odpovídá každý sám.` },
        { q: 'Mám si vzít vlastní nádobí?', a: `Ano, doporučujeme vlastní misku, příbor, hrnek nebo korbel. Je to praktičtější, atmosféričtější a pomáhá to omezit odpad.` },
        { q: 'Jsou na místě sprchy a elektřina?', a: `S komfortem počítej spíše jako na táboře. Nečekej hotel, zásuvku u stanu ani koupelnu za rohem. Aktuální informace o zázemí budou v <a href="${L('/organizacni-informace/')}" class="underline">Praktických informacích</a>.` },
        { q: 'Můžu rozdělávat oheň?', a: `Pouze na určených místech a podle pokynů organizátorů. Vlastní ohniště nebo zásahy do přírody bez souhlasu organizátorů nejsou povolené.` },
        { q: 'Co s odpadem?', a: `Odpadky dávej do určených pytlů nebo kontejnerů. Cílem je, aby po nás na místě zůstala jen slehlá tráva a dobré vzpomínky.` },
      ],
    },
    {
      id: 'doprava',
      label: 'Doprava a parkování',
      icon: 'lucide:car',
      items: [
        { q: 'Můžu přijet autem?', a: `Ano. Sleduj ale pokyny k příjezdu a parkování. Místo je v přírodě a příjezd může být omezený. Mapa areálu na stránce <a href="${L('/mapa/')}" class="underline">Mapa areálu</a>.` },
        { q: 'Potřebuji parkovací kartu?', a: `Ano, pokud přijedeš autem, připrav si parkovací kartu podle pokynů organizátorů. Doporučujeme ji vytisknout a dát za sklo.` },
        { q: 'Můžu autem až ke stanu?', a: `Pouze podle pokynů organizátorů. Nejezdí se volně po tábořišti ani po herním prostoru. Respektuj značení a dobrovolníky na parkovišti.` },
        { q: 'Jak rychle mám jet po příjezdové cestě?', a: `Pomalu. Prašné a lesní cesty nejsou závodní dráha. Dodržuj pokyny organizátorů a jezdi ohleduplně k lidem, autům, přírodě i místním obyvatelům.` },
        { q: 'Dá se přijet veřejnou dopravou?', a: `Možnosti veřejné dopravy budou popsané v <a href="${L('/organizacni-informace/')}" class="underline">Praktických informacích</a> nebo v pokynech před akcí. Počítej s tím, že část cesty může být potřeba dojít pěšky.` },
      ],
    },
    {
      id: 'detska-hra',
      label: 'Dětská hra',
      icon: 'lucide:sparkles',
      items: [
        { q: 'Pro koho je dětská hra?', a: `Dětská hra je určena přibližně pro děti od 5 do 10 let. Mladší děti přibližně 3–5 let se mohou zapojit jen s doprovodem rodiče nebo dospělé odpovědné osoby.`, faqSnippet: true },
        { q: 'Kdy dětská hra probíhá?', a: `Program dětské hry je plánovaný hlavně na pátek a sobotu. Počítá se s aktivitami na louce, tvořením, pohybovými hrami, lesními aktivitami, stezkou odvahy a sobotní hrou po stanovištích. Detail najdeš na stránce <a href="${L('/detska-hra/')}" class="underline">Dětská hra</a>.` },
        { q: 'Můžu jít do hlavní bitvy a dítě nechat na dětské hře?', a: `U starších dětí v rámci dětské hry ano, pokud jsou splněné podmínky organizátorů a dítě je schopné fungovat v programu bez nepřetržitého doprovodu rodiče. U mladších dětí chceme doprovod rodiče nebo odpovědné osoby. Přesné podmínky budou na stránce <a href="${L('/detska-hra/')}" class="underline">Dětská hra</a>.` },
        { q: 'Oceníte pomoc rodičů s dětskou hrou?', a: `Ano, velmi. Pokud jedeš s dětmi a chceš se zapojit, ozvi se nám. Pomoc rodičů u aktivit, dohledu nebo drobné organizace může být pro dětskou hru hodně užitečná.` },
        { q: 'Jak dítě přihlásím do dětské hry?', a: `Přes Registračka.cz. Přihlas alespoň jednoho rodiče a v osobní kartě přidej děti jako přidružené osoby. Poté je přihlas do části / strany „dětská hra", pokud je tak v registraci uvedena. Více na stránce <a href="${L('/pro-rodice/#prihlasit')}" class="underline">Pro rodiče — Jak dítě přihlásit</a>.` },
        { q: 'Máte rodinný strop registračního poplatku?', a: `Ano, pro rodiny počítáme s maximálním stropem registračního poplatku. Přesné částky a podmínky najdeš na stránce <a href="${L('/registrace/')}" class="underline">Registrace</a>.` },
      ],
    },
    {
      id: 'fotky',
      label: 'Fotky, video a média',
      icon: 'lucide:camera',
      items: [
        { q: 'Můžu na akci fotit?', a: `Ano, ale s respektem k ostatním, pravidlům a atmosféře. Pokud chceš fotit výrazněji, pohybovat se v herním prostoru nebo pořizovat materiál pro publikaci, domluv se s organizátory.` },
        { q: 'Musím mít jako fotograf kostým?', a: `Ano, kostýmová povinnost platí i pro fotografy a kameramany. Pokud to nejde, měj alespoň tmavé, nerušivé oblečení a domluv se s organizátory. Můžeme zkusit pomoci se zapůjčením nebo úpravou vzhledu.` },
        { q: 'Můžu natáčet video?', a: `Ano, ale platí stejná pravidla jako u focení. Neruš hru, nelez do cizích záběrů, respektuj pokyny organizátorů a účastníky, kteří si nepřejí být výrazně zabíráni.` },
        { q: 'Budou z akce oficiální fotky?', a: `Ano, pokud budeme mít domluvené fotografy. Fotky a videa z akce najdeš následně v sekci <a href="${L('/fotky-a-video/')}" class="underline">Fotky a video</a>.` },
        { q: 'Kde najdu mediakit?', a: `Informace pro média jsou na stránce <a href="${L('/pro-media/')}" class="underline">Pro média</a>.` },
      ],
    },
    {
      id: 'stankari',
      label: 'Stánkaři a prodejci',
      icon: 'lucide:store',
      items: [
        { q: 'Můžu mít na akci stánek?', a: `Ano, po domluvě s organizátory. Hodí se zejména tematické výrobky, řemeslo, kostýmové doplňky, kožené věci, šperky, larpové vybavení, fantasy tematika a podobně.` },
        { q: 'Můžu přijet s gastro stánkem?', a: `Gastro provozy je potřeba řešit individuálně předem. Na místě máme výhradní domluvu s hospodou U Zeleného draka, takže účast dalších gastro stánků vždy konzultujeme i s nimi.` },
        { q: 'Může se stánkař účastnit hry?', a: `Ano. Stánkaři se mohou účastnit hry a aktivit podle vlastního uvážení. Organizátoři ale neposkytují dohled nad stánkem během jejich nepřítomnosti.` },
        { q: 'Jak se má stánkař registrovat?', a: `Buď jako nehrající účastník, nebo jako hrající účastník, pokud se chce zapojit do hry. Detaily je vhodné domluvit předem s organizátory.` },
        { q: 'Budete stánkaře propagovat?', a: `Ano. Máme stránku <a href="${L('/stanky-a-prodejci/')}" class="underline">Stánky a prodejci</a>, kde zveřejňujeme informace o potvrzených stánkařích. Rádi tam doplníme i informace o tobě, pokud se domluvíme na účasti.` },
      ],
    },
    {
      id: 'pomocnici',
      label: 'Pomocníci a dobrovolníci',
      icon: 'lucide:hand-helping',
      items: [
        { q: 'Jak můžu pomoct s akcí?', a: `Pomoci můžeš s přípravou, registrací, zázemím, vodou, dřevem, dětskou hrou, úklidem, logistikou, drobnými opravami nebo nedělním balením.` },
        { q: 'Znamená pomoc, že si akci neužiju?', a: `Ne nutně. Pomocníci pomáhají podle domluvy a mohou si akci užít i jako běžní účastníci. Záleží na míře zapojení a konkrétní domluvě.` },
        { q: 'Dostanu za pomoc slevu?', a: `Podle rozsahu pomoci je možné řešit slevu, odpuštění registračního poplatku nebo zajištění stravy a pití. Domlouvá se to individuálně.` },
        { q: 'Jak se přihlásím jako pomocník?', a: `Napiš organizátorům, co umíš, kdy můžeš pomoct a jestli chceš zároveň hrát. Více na stránce <a href="${L('/role/pomocnici/')}" class="underline">Pomocníci</a>.` },
      ],
    },
    {
      id: 'zmeny',
      label: 'Změny, počasí a mimořádné situace',
      icon: 'lucide:cloud-rain',
      items: [
        { q: 'Koná se akce za každého počasí?', a: `Běžný déšť, chlad nebo zatažená obloha nejsou důvodem akci rušit. Připrav se na venkovní víkend a vezmi si vybavení do deště i do chladu.` },
        { q: 'Co když přijde bouřka, vichřice nebo nebezpečné počasí?', a: `Pokud by počasí ohrožovalo bezpečnost účastníků, rozhodují organizátoři. Může dojít k úpravě programu, přesunu, pozastavení hry nebo v krajním případě ke zrušení akce.` },
        { q: 'Co když organizátoři musí akci zrušit krátce před konáním?', a: `Pokud by muselo dojít ke zrušení z důvodu vyšší moci, například vichřice, popadaných stromů nebo problémů v tábořišti, budeme se snažit vrátit účastníkům maximum prostředků, které ještě nebyly utraceny a které lze rozumně vrátit. Část nákladů už ale může být v tu dobu zaplacená a nevratná. Podrobnosti v <a href="${L('/podminky-ucasti-a-registrace/')}" class="underline">Podmínkách registrace</a>.` },
        { q: 'Co když se změní místo konání?', a: `Změna místa je možná. Nemění cenu ani platnost registrace. Budeme o ní informovat e-mailem a na webu.` },
        { q: 'Co když se změní termín?', a: `Při změně termínu převedeme registraci na nový termín. Chápeme ale, že se ti může změnit dostupnost, proto v takovém případě umožníme řešit vrácení registračního poplatku.` },
        { q: 'Jak se dozvím důležité změny?', a: `E-mailem, přes web a případně přes sociální sítě. U registrovaných účastníků je hlavní komunikační kanál e-mail uvedený v registraci.` },
      ],
    },
    {
      id: 'registracka',
      label: 'Registračka, údaje a technika',
      icon: 'lucide:database',
      items: [
        { q: 'Přes jaký systém probíhá registrace?', a: `Registrace probíhá přes Registračka.cz. Systém provozuje Moravian LARP a používáme ho pro přihlášky na naše akce.` },
        { q: 'Komu předáváte údaje z registrace?', a: `Údaje předáváme pouze organizátorům konkrétní události, pro kterou jsou potřeba. Více najdeš v <a href="${L('/gdpr/')}" class="underline">GDPR / Ochrana osobních údajů</a>.` },
        { q: 'Co když mi nepřišel potvrzovací e-mail?', a: `Zkontroluj spam, hromadnou poštu a správnost zadaného e-mailu. Pokud nic nenajdeš, napiš nám a uveď jméno, pod kterým ses registroval.` },
        { q: 'Co když jsem udělal chybu v registraci?', a: `Napiš organizátorům na <a href="mailto:info@panprstenu.cz" class="underline">info@panprstenu.cz</a>. Uveď jméno, e-mail použitý v registraci a co je potřeba opravit.` },
        { q: 'Kde najdu seznam přihlášených účastníků?', a: `Seznam přihlášených najdeš na stránce <a href="${L('/kdo-jede/')}" class="underline">Kdo jede</a>. Účastníci tam uvidí, kdo jede a jak jsou obsazené strany a armády.` },
      ],
    },
  ];
}

// ============================================================
// ENGLISH
// ============================================================
function en(L: LinkFn): FaqGroup[] {
  return [
    {
      id: 'obecne',
      label: 'General questions',
      icon: 'lucide:help-circle',
      items: [
        { q: 'What is The Lord of the Rings — Battle for Middle-earth?', a: `It is a large multi-day larp battle inspired by Tolkien’s Middle-earth. You arrive for a weekend, join one of the sides and armies, put on a costume, register on site and take part in the game, camp life and the main Saturday battle. It is not a historical re-enactment or a sports tournament — it is a shared game where atmosphere, fair play, safety, costumes, story and community matter most. More on <a href="${L('/pro-novacky/')}" class="underline">First time here</a>.` },
        { q: 'What is LARP?', a: `LARP stands for live-action role-playing. You don’t play a character on a screen or a figurine on a table — you become the character yourself for a while. You put on a costume, take on a role, follow the rules and create a living world together with others. At Battle for Middle-earth this means costume, an army, combat rules, fair acknowledgement of hits, respect for others and willingness to support the atmosphere of Middle-earth.` },
        { q: 'Is the event suitable for newcomers?', a: `Yes. Newcomers are welcome. You do not need any prior larp experience. The important thing is to read the basics, choose an army, prepare a costume and not be afraid to ask. Recommended path: <a href="${L('/pro-novacky/')}" class="underline">First time here</a> → <a href="${L('/frakce/')}" class="underline">Armies</a> → <a href="${L('/pravidla/')}" class="underline">Rules</a> → <a href="${L('/organizacni-informace/')}" class="underline">Practical info</a> → <a href="${L('/registrace/')}" class="underline">Registration</a>.`, faqSnippet: true },
        { q: 'Do I need to know Tolkien’s books or films?', a: `No. It helps with the atmosphere but it is not a requirement. It is enough to understand we are playing in a fantasy world inspired by Middle-earth, and that costume, behaviour and gear should fit. If you want to dive deeper, see <a href="${L('/svet-stredozeme/')}" class="underline">World of Middle-earth</a>.` },
        { q: 'How many people do you expect?', a: `We expect attendance in the hundreds — roughly 700+ participants. That is why it matters to handle registration, payment, arrival, parking and documents in good time.` },
        { q: 'Can I come for just one day?', a: `The event is designed as a weekend experience. The main battle is on Saturday, but a major part of the atmosphere starts already on Thursday and Friday: camping, registration, gear approval, the Friday programme, the children’s game, the market, arenas and evening camp life. A one-day visit may be possible in exceptional cases — discuss it with the organisers in advance.` },
      ],
    },
    {
      id: 'novacci',
      label: 'Newcomers and first time',
      icon: 'lucide:sparkles',
      items: [
        { q: 'Where should I start if I’m coming for the first time?', a: `Start with <a href="${L('/pro-novacky/')}" class="underline">First time here</a>. There you’ll find a step-by-step path: what the event is, what LARP is, how to choose an army, what to bring, how registration works and what to expect on site.` },
        { q: 'What matters most before my first time?', a: `Choose an army, read the basic rules, prepare a costume, register, pay the registration fee within 10 days, prepare your documents, arrive in time and don’t be shy to say you’re a newcomer.` },
        { q: 'What if I come alone and don’t know anyone?', a: `That is completely fine. People often arrive alone. Pick an army, arrive in good time and ask at registration or with the organisers where to fit in. Writing us in advance helps too. In Middle-earth, fellowships form faster than you’d think.` },
        { q: 'Will someone help me on site?', a: `Yes. Organisers, rulers, army commanders and more experienced players will help. If you don’t know, ask. Better to ask ten times than do something wrong in the middle of a battle.` },
        { q: 'Do I need to know how to roleplay?', a: `You don’t need to be an actor. A simple foundation is enough: don’t break the atmosphere, don’t solve everything out of game, behave according to your army, respect others. Even an ordinary soldier, dwarf, orc, hobbit or non-combatant can create great atmosphere.` },
      ],
    },
    {
      id: 'termin',
      label: 'Date, place and programme',
      icon: 'lucide:calendar-days',
      items: [
        { q: 'When is the event?', a: `The 2026 edition runs from <strong>20 to 23 August 2026</strong>. Thursday: arrival, camp, registration, first meet-ups. Friday: side programme, camp game, children’s game, market, arenas, preparation. Saturday: main game / battle. Sunday: packing, clean-up, departure. Up-to-date info at <a href="${L('/organizacni-informace/')}" class="underline">Practical info</a>.` },
        { q: 'Where is it held?', a: `The event takes place in the south of Moravia, in the Křtiny / Bukovina area. Detailed arrival instructions and venue info are at <a href="${L('/organizacni-informace/')}" class="underline">Practical info</a> and in e-mails for registered participants. Map at <a href="${L('/mapa/')}" class="underline">Site map</a>.` },
        { q: 'When is the main battle?', a: `The main game and main battle take place <strong>on Saturday</strong>. Friday is not just waiting for Saturday — it is an important part of the weekend with programme, camp game, children’s game, market and preparation.` },
        { q: 'What happens on Friday?', a: `Friday belongs to camp life. Expect a side programme, market, arenas, games, micro-quests, coins, the children’s game and the in-camp atmosphere. More at <a href="${L('/hra-v-tabore/')}" class="underline">Camp game</a>.` },
        { q: 'Do I need to arrive on Thursday?', a: `You don’t have to, but we recommend it. You will have more time to set up camp, register, sort your costume, meet your army and tune in. People who arrive late often have to handle everything in a rush.` },
      ],
    },
    {
      id: 'registrace',
      label: 'Registration, payment and cancellation',
      icon: 'lucide:credit-card',
      items: [
        { q: 'How does registration work?', a: `Registration is online via Registračka.cz. Fill in the form, pick a side and army, add the required information and you’ll receive an e-mail with payment instructions afterwards. Details on <a href="${L('/registrace/')}" class="underline">Registration</a>.`, faqSnippet: true },
        { q: 'When will I get the payment information?', a: `Right after registration. You can pay by QR code or bank transfer following the instructions in the e-mail.` },
        { q: 'By when must I pay?', a: `The registration fee is due <strong>within 10 days of registering</strong>. If the payment doesn’t arrive, the registration may be considered unpaid.` },
        { q: 'Where can I find the registration fee?', a: `An overview of fees, deadlines and possible surcharges is on <a href="${L('/registrace/')}" class="underline">Registration</a>. Up-to-date info also at <a href="${L('/organizacni-informace/')}" class="underline">Practical info</a>.` },
        { q: 'Can I change my army after registering?', a: `Yes, but as soon as possible. Write the organisers and tell them which army you’re moving from and to. Changes can be limited by capacity or side balance.` },
        { q: 'Can I transfer my registration to someone else?', a: `Yes, if you do it in time and arrange it with the organisers. Don’t simply send a substitute without prior agreement — we need correct participant data, age, documents and side allocation.` },
        { q: 'What if I need to cancel?', a: `Handle cancellation by e-mail as soon as possible. The closer to the event, the more costs are already paid. Detailed cancellation terms are in <a href="${L('/podminky-ucasti-a-registrace/')}" class="underline">Terms of registration</a>.` },
        { q: 'What if I can’t afford the fee?', a: `Contact us. In some cases we can arrange help, partial work-off, help with preparations or an individual solution. We can’t promise everything to everyone, but if we know in time we can look for a way.` },
      ],
    },
    {
      id: 'vek',
      label: 'Age, parents and children',
      icon: 'lucide:baby',
      items: [
        { q: 'From what age can I join the main game?', a: `Playing the main game is open from <strong>age 12</strong>. For younger children we run a separate <a href="${L('/detska-hra/')}" class="underline">children’s game</a>.`, faqSnippet: true },
        { q: 'What do participants under 18 need?', a: `Participants under 18 need a printed, filled in and signed application / consent of a legal guardian. Without it we cannot let them play. Details at <a href="${L('/pro-rodice/')}" class="underline">For parents</a>.` },
        { q: 'Can a child come on their own?', a: `Players from age 12 may take part in the main game. Up to age 18 we need signed legal-guardian consent. For under 15s we require an accompanying adult (18+) who is responsible for them. If a child does not come with a parent, we need a clear note of who is responsible at the event.` },
        { q: 'Can a child come with another adult than a parent?', a: `Yes, but we need written consent from the legal guardian and a clearly named person responsible for the child during the event.` },
        { q: 'Can a parent stay at the event as accompaniment?', a: `Yes. A parent can come as a non-playing companion, as a player, as a helper or join the children’s game. Companions should also respect the atmosphere and ideally have a simple costume or at least non-disruptive clothing. More at <a href="${L('/role/nebojovy-doprovod/')}" class="underline">Non-combat companions</a>.` },
        { q: 'Is the event safe for children?', a: `We do our best for a safe run: we check weapons, enforce rules, have a medic, organisers in the field and clear instructions. That said, it is an outdoor physical event in terrain. A small bruise or scratch can happen.` },
        { q: 'Do you recommend protective gear for kids?', a: `Yes. For younger participants we strongly recommend gloves, sturdy footwear and, depending on role and involvement, suitable head protection. Gear must be safe and should fit the costume.` },
      ],
    },
    {
      id: 'armady',
      label: 'Armies, sides and roles',
      icon: 'lucide:flag',
      items: [
        { q: 'What is the difference between a side and an army?', a: `We have two main sides at the event. Each side contains individual armies. So a participant picks a side and within it a specific army. Overview at <a href="${L('/frakce/')}" class="underline">Armies</a>.` },
        { q: 'How should I pick an army?', a: `Choose by atmosphere, costume, play style and what appeals to you. Don’t pick only by who you like in the books or films. The costume you can prepare and how comfortable you’ll feel in the role matter a lot.` },
        { q: 'Can I come as a non-combat companion?', a: `Yes. Non-combat companions are participants who are part of the atmosphere and camp but don’t fight. The costume requirement and event rules still apply. More at <a href="${L('/role/nebojovy-doprovod/')}" class="underline">Non-combat companions</a>.` },
        { q: 'Can I come as a photographer or videographer?', a: `Yes, but photographers and videographers also have to respect the rules. The costume requirement applies. If that is not possible, you must at least wear non-disruptive clothing and arrange it with the organisers. Basic rule: <strong>if you don’t look like you’re from Middle-earth, stay out of other people’s shots</strong>. More at <a href="${L('/role/fotografove-a-kameramani/')}" class="underline">Photographers and videographers</a>.`, faqSnippet: true },
        { q: 'Can I come as a helper?', a: `Yes. Helpers can support us as agreed with preparation, registration, infrastructure, the children’s game, clean-up or other tasks. They can also enjoy the event as participants when arranged. Depending on the level of involvement we may offer a discount, fee waiver or food and drink. More at <a href="${L('/role/pomocnici/')}" class="underline">Helpers</a>.` },
      ],
    },
    {
      id: 'kostymy',
      label: 'Costumes and gear',
      icon: 'lucide:shirt',
      items: [
        { q: 'Do I need a costume?', a: `Yes. The costume is part of the game and the atmosphere. It does not have to be perfect, but should fit the chosen army, be safe, usable in terrain and not disturb others.` },
        { q: 'What do I need for a costume?', a: `The basics are simple: a tunic or shirt, trousers in non-disruptive colour, a belt, sturdy footwear, head covering, cloak or accessories according to the army. Each army has different colours and style. Specific recommendations at <a href="${L('/frakce/')}" class="underline">Armies</a> and on <a href="${L('/pro-novacky/#kostym')}" class="underline">First time here — Costume</a>.`, faqSnippet: true },
        { q: 'Does the costume need to be historically accurate?', a: `No. This is not a historical re-enactment. The costume mainly needs to fit the fantasy world of Middle-earth, not look civilian and support the atmosphere.` },
        { q: 'What if I have no costume at all?', a: `Start simply. A plain tunic, cloak and non-disruptive colours are better than civilian clothes. If you’re unsure, write the organisers or check <a href="${L('/pro-novacky/')}" class="underline">First time here</a>.` },
        { q: 'Do you have a costume rental?', a: `We may have a limited amount of basics to lend, but don’t count on it automatically. Arrange in advance. The costume is primarily the participant’s responsibility.` },
        { q: 'Can I be in civilian clothes during the day?', a: `The costume requirement applies throughout the event. Civilian clothing strongly disrupts the atmosphere. If you need to change for practical reasons, do it sensibly outside the main game area.` },
        { q: 'What footwear is suitable?', a: `Sturdy, comfortable, non-disruptive and forest-friendly. Ideally dark or natural. Loud modern shoes break the atmosphere and are often impractical in terrain.` },
      ],
    },
    {
      id: 'zbrane',
      label: 'Weapons, combat and rules',
      icon: 'lucide:swords',
      items: [
        { q: 'Can I bring my own weapon?', a: `Yes, but only a safe foam-padded larp weapon that passes inspection. Sharp, metal, overly hard or improperly modified weapons are not allowed.` },
        { q: 'What if my weapon doesn’t pass inspection?', a: `You won’t be allowed to use it. We recommend bringing a backup or consulting the organisers in advance. Safety beats personal preference.` },
        { q: 'How does combat work?', a: `Combat is simulated. It is not real combat or a sports match. We use padded weapons and rules for hit areas, lives and revival. Hits are acknowledged by the person hit. We play fair. Details at <a href="${L('/pravidla/')}" class="underline">Rules</a>.` },
        { q: 'What does „hit acknowledged by the hit"mean?', a: `When someone scores a valid hit on you, you acknowledge it yourself. You don’t wait for the opponent to force it. Fair play is the foundation. If unsure, take the hit.` },
        { q: 'Where do I find the full rules?', a: `On <a href="${L('/pravidla/')}" class="underline">Rules</a>. We recommend reading them before the event and revisiting safety, weapons, hits and revival before the battle.` },
        { q: 'What if I don’t understand a rule?', a: `Ask. By e-mail before the event, on site with organisers or with experienced players. Better to clear up confusion before a battle than during one.` },
      ],
    },
    {
      id: 'bezpecnost',
      label: 'Safety and health',
      icon: 'lucide:shield-check',
      items: [
        { q: 'What if I get injured?', a: `A medic is on site. If you get hurt, end the game, alert those around you and find an organiser or medic. For more serious situations follow the crisis instructions. Details at <a href="${L('/bezpecnost/')}" class="underline">Safety and crisis situations</a>.`, faqSnippet: true },
        { q: 'Is there a medic on site?', a: `Yes. A medic with basic equipment is on site for the duration of the event.` },
        { q: 'What about allergies, medication or health limitations?', a: `Mention them in registration and bring the medication you need. If it’s important for safe participation, also report it on site to the organisers or the medic.` },
        { q: 'Can I fight under the influence of alcohol?', a: `No. No one may join combat under the influence of alcohol or other intoxicants. Others’ safety beats your urge to „play one more round".` },
        { q: 'What if I don’t feel safe or have a problem with another participant?', a: `Reach out to an organiser. If a confidant is appointed at the event, you can contact them. Respect, personal boundaries and safety are part of the rules.` },
        { q: 'What applies in a crisis?', a: `Main rule: stay calm, follow organisers’ instructions and don’t spread unverified information. In case of injury, fire, storm, lost child or other serious situation, contact the nearest organiser.` },
      ],
    },
    {
      id: 'taboreni',
      label: 'Camping, food and facilities',
      icon: 'lucide:tent',
      items: [
        { q: 'Where do we sleep?', a: `In your own tents in the camp. Camping is part of the atmosphere. If you have a modern tent, place and adapt it so it disrupts the surroundings as little as possible.` },
        { q: 'Is drinking water available?', a: `Yes, drinking water will be provided on site. Even so, we recommend bringing your own bottle, canteen or flask.` },
        { q: 'Is food available on site?', a: `The pub U Zeleného draka operates on site, where you can get food and drink subject to their capacity. Organisers do not centrally provide meals to every participant. Each participant is responsible for their own food during the weekend.` },
        { q: 'Should I bring my own dishes?', a: `Yes, we recommend your own bowl, cutlery, mug or tankard. It is more practical, more atmospheric and helps cut waste.` },
        { q: 'Are there showers and electricity on site?', a: `Plan for camp-level comfort. Don’t expect a hotel, an outlet next to your tent or a bathroom around the corner. Up-to-date facility info will be on <a href="${L('/organizacni-informace/')}" class="underline">Practical info</a>.` },
        { q: 'Can I light a fire?', a: `Only at designated places and following organisers’ instructions. Private fire pits or interventions in nature without organiser approval are not allowed.` },
        { q: 'What about waste?', a: `Put rubbish into the designated bags or containers. The goal is to leave only flattened grass and good memories on site.` },
      ],
    },
    {
      id: 'doprava',
      label: 'Transport and parking',
      icon: 'lucide:car',
      items: [
        { q: 'Can I come by car?', a: `Yes. Follow the arrival and parking instructions. The site is in the countryside and access may be restricted. Site map at <a href="${L('/mapa/')}" class="underline">Site map</a>.` },
        { q: 'Do I need a parking pass?', a: `Yes — if you arrive by car, prepare a parking pass following the organisers’ instructions. We recommend printing it and putting it behind the windscreen.` },
        { q: 'Can I drive up to my tent?', a: `Only as instructed by the organisers. There is no free driving in the camp or game area. Respect signage and parking volunteers.` },
        { q: 'How fast should I drive on the access road?', a: `Slowly. Dirt and forest roads are not a racetrack. Follow the organisers’ instructions and drive considerately for people, cars, nature and locals.` },
        { q: 'Can I get there by public transport?', a: `Public transport options will be described on <a href="${L('/organizacni-informace/')}" class="underline">Practical info</a> or in pre-event briefings. Expect that part of the journey may need to be walked.` },
      ],
    },
    {
      id: 'detska-hra',
      label: 'Children’s game',
      icon: 'lucide:sparkles',
      items: [
        { q: 'Who is the children’s game for?', a: `The children’s game is aimed at children roughly aged 5 to 10. Younger children, around 3–5 years, may take part only with an accompanying parent or responsible adult.`, faqSnippet: true },
        { q: 'When does the children’s game run?', a: `The children’s game programme is mostly planned for Friday and Saturday. Expect meadow activities, crafts, movement games, forest activities, a courage trail and Saturday station-based play. Details on <a href="${L('/detska-hra/')}" class="underline">Children’s game</a>.` },
        { q: 'Can I go to the main battle and leave my child at the children’s game?', a: `For older children within the children’s game yes, if the organisers’ conditions are met and the child is able to function in the programme without continuous parental presence. For younger children we want a parent or responsible adult on hand. Exact conditions will be on <a href="${L('/detska-hra/')}" class="underline">Children’s game</a>.` },
        { q: 'Do you welcome help from parents with the children’s game?', a: `Yes, very much. If you’re coming with kids and want to help, get in touch. Parental help with activities, supervision or small organisation can be very useful.` },
        { q: 'How do I sign my child up for the children’s game?', a: `Via Registračka.cz. Register at least one parent and add children as related persons in the personal card. Then enrol them in the „children’s game" section if listed in registration. More at <a href="${L('/pro-rodice/#prihlasit')}" class="underline">For parents — How to sign a child up</a>.` },
        { q: 'Do you have a family cap on the registration fee?', a: `Yes, we plan a maximum family cap on the registration fee. Exact amounts and conditions at <a href="${L('/registrace/')}" class="underline">Registration</a>.` },
      ],
    },
    {
      id: 'fotky',
      label: 'Photos, video and media',
      icon: 'lucide:camera',
      items: [
        { q: 'Can I take photos at the event?', a: `Yes, but with respect for others, the rules and the atmosphere. If you want to shoot more visibly, move within the game area or capture material for publication, arrange it with the organisers.` },
        { q: 'Do I need a costume as a photographer?', a: `Yes — the costume requirement applies to photographers and videographers too. If that’s not possible, at least wear dark, non-disruptive clothing and arrange it with the organisers. We can try to help with a loan or look adjustment.` },
        { q: 'Can I shoot video?', a: `Yes, but the same rules apply as for photography. Don’t disrupt play, don’t intrude into others’ shots, respect the organisers’ instructions and participants who don’t want to be prominently featured.` },
        { q: 'Will there be official event photos?', a: `Yes, if we have photographers on board. Photos and videos from the event will then appear at <a href="${L('/fotky-a-video/')}" class="underline">Photos and video</a>.` },
        { q: 'Where can I find the media kit?', a: `Information for media is on <a href="${L('/pro-media/')}" class="underline">For media</a>.` },
      ],
    },
    {
      id: 'stankari',
      label: 'Vendors and stalls',
      icon: 'lucide:store',
      items: [
        { q: 'Can I have a stall at the event?', a: `Yes, by agreement with the organisers. Themed products, crafts, costume accessories, leather goods, jewellery, larp gear and fantasy themes fit best.` },
        { q: 'Can I come with a food stall?', a: `Food/beverage operators must be arranged individually in advance. We have an exclusive arrangement with the pub U Zeleného draka on site, so any additional food stalls are always discussed with them too.` },
        { q: 'Can a vendor take part in the game?', a: `Yes. Vendors can take part in the game and activities at their discretion. Organisers do not provide stall supervision while you’re away.` },
        { q: 'How does a vendor register?', a: `Either as a non-playing participant, or as a playing participant if they want to join the game. Details should be arranged with the organisers in advance.` },
        { q: 'Will you promote vendors?', a: `Yes. We have a <a href="${L('/stanky-a-prodejci/')}" class="underline">Vendors and stalls</a> page where we publish information about confirmed vendors. Happy to add yours if we agree on participation.` },
      ],
    },
    {
      id: 'pomocnici',
      label: 'Helpers and volunteers',
      icon: 'lucide:hand-helping',
      items: [
        { q: 'How can I help with the event?', a: `You can help with preparation, registration, infrastructure, water, firewood, the children’s game, clean-up, logistics, small repairs or Sunday packing.` },
        { q: 'Does helping mean I won’t enjoy the event?', a: `Not necessarily. Helpers help as agreed and can also enjoy the event as regular participants. It depends on the scope of involvement and the specific arrangement.` },
        { q: 'Will I get a discount for helping?', a: `Depending on scope, we may arrange a discount, fee waiver or food and drink. It’s arranged individually.` },
        { q: 'How do I sign up as a helper?', a: `Write the organisers what you can do, when you’re available and whether you also want to play. More on <a href="${L('/role/pomocnici/')}" class="underline">Helpers</a>.` },
      ],
    },
    {
      id: 'zmeny',
      label: 'Changes, weather and emergencies',
      icon: 'lucide:cloud-rain',
      items: [
        { q: 'Does the event run in any weather?', a: `Regular rain, cold or overcast skies are no reason to cancel. Prepare for an outdoor weekend and bring rain and cold gear.` },
        { q: 'What if a storm, gale or dangerous weather hits?', a: `If the weather threatens participants’ safety, organisers decide. The programme may be adjusted, relocated, paused or, in extreme cases, cancelled.` },
        { q: 'What if organisers have to cancel shortly before the event?', a: `If we have to cancel due to force majeure such as gale, fallen trees or camp problems, we will try to refund participants the maximum of funds not yet spent and that can reasonably be returned. By that point part of the costs may already be paid and non-refundable. Details at <a href="${L('/podminky-ucasti-a-registrace/')}" class="underline">Terms of registration</a>.` },
        { q: 'What if the venue changes?', a: `A venue change is possible. It does not affect the price or registration validity. We will announce it by e-mail and on the website.` },
        { q: 'What if the date changes?', a: `If the date changes, registrations carry over to the new date. We understand your availability may change — in that case we will allow refund of the registration fee.` },
        { q: 'How will I learn about important changes?', a: `By e-mail, the website and possibly social media. For registered participants, the e-mail address from registration is the main channel.` },
      ],
    },
    {
      id: 'registracka',
      label: 'Registračka, data and tech',
      icon: 'lucide:database',
      items: [
        { q: 'What system runs registration?', a: `Registration runs through Registračka.cz. The system is operated by Moravian LARP and we use it for sign-ups to our events.` },
        { q: 'Who do you share registration data with?', a: `We share data only with the organisers of the specific event for which it’s needed. More at <a href="${L('/gdpr/')}" class="underline">GDPR / Privacy</a>.` },
        { q: 'What if I didn’t get the confirmation e-mail?', a: `Check spam, bulk mail and that the e-mail is correct. If you find nothing, write us and include the name you used to register.` },
        { q: 'What if I made a mistake in registration?', a: `Write the organisers at <a href="mailto:info@panprstenu.cz" class="underline">info@panprstenu.cz</a>. Include the name, the e-mail used and what needs fixing.` },
        { q: 'Where can I find the list of registered participants?', a: `The list is at <a href="${L('/kdo-jede/')}" class="underline">Who’s coming</a>. Participants will see who is coming and how the sides and armies fill up.` },
      ],
    },
  ];
}
// ============================================================
// DEUTSCH
// ============================================================
function de(L: LinkFn): FaqGroup[] {
  return [
    {
      id: 'obecne',
      label: 'Allgemeine Fragen',
      icon: 'lucide:help-circle',
      items: [
        { q: 'Was ist Der Herr der Ringe — Schlacht um Mittelerde?', a: `Es ist eine große mehrtägige Larp-Schlacht inspiriert von Tolkiens Mittelerde. Du kommst übers Wochenende, schließt dich einer der Seiten und Armeen an, ziehst ein Kostüm an, registrierst dich vor Ort und nimmst am Spiel, am Lagerleben und an der Hauptschlacht am Samstag teil. Es ist keine historische Re-Enactment-Veranstaltung und kein Sportturnier — es ist ein gemeinsames Spiel, bei dem Atmosphäre, Fairness, Sicherheit, Kostüme, Geschichte und Gemeinschaft zählen. Mehr auf <a href="${L('/pro-novacky/')}" class="underline">Erstes Mal hier</a>.` },
        { q: 'Was ist LARP?', a: `LARP ist Live-Rollenspiel. Du spielst keine Figur am Bildschirm und keinen Spielstein auf dem Tisch — du wirst für eine Weile selbst zur Figur. Du ziehst ein Kostüm an, übernimmst eine Rolle, hältst dich an die Regeln und gestaltest gemeinsam mit anderen eine lebendige Welt. Bei der Schlacht um Mittelerde heißt das: Kostüm, Armee, Kampfregeln, faires Annehmen von Treffern, Respekt für andere und die Bereitschaft, die Atmosphäre Mittelerdes mitzutragen.` },
        { q: 'Ist die Veranstaltung für Einsteiger geeignet?', a: `Ja. Einsteiger sind willkommen. Du musst keinerlei Larp-Erfahrung haben. Wichtig ist, die Grundlagen zu lesen, eine Armee zu wählen, ein Kostüm vorzubereiten und keine Scheu zu haben, zu fragen. Empfohlener Weg: <a href="${L('/pro-novacky/')}" class="underline">Erstes Mal hier</a> → <a href="${L('/frakce/')}" class="underline">Armeen</a> → <a href="${L('/pravidla/')}" class="underline">Regeln</a> → <a href="${L('/organizacni-informace/')}" class="underline">Praktische Infos</a> → <a href="${L('/registrace/')}" class="underline">Anmeldung</a>.`, faqSnippet: true },
        { q: 'Muss ich Tolkiens Bücher oder Filme kennen?', a: `Nein. Es hilft mit der Atmosphäre, ist aber keine Voraussetzung. Es genügt, zu verstehen, dass wir in einer von Mittelerde inspirierten Fantasywelt spielen und dass Kostüm, Verhalten und Ausrüstung dazu passen sollen. Wenn du tiefer eintauchen willst, schau auf <a href="${L('/svet-stredozeme/')}" class="underline">Welt Mittelerdes</a>.` },
        { q: 'Wie viele Leute erwartet ihr?', a: `Wir rechnen mit Teilnehmern in der Größenordnung von Hunderten — etwa 700+. Deshalb ist es wichtig, Anmeldung, Zahlung, Anreise, Parken und Dokumente rechtzeitig zu erledigen.` },
        { q: 'Kann ich nur für einen Tag kommen?', a: `Die Veranstaltung ist als Wochenenderlebnis konzipiert. Die Hauptschlacht ist am Samstag, doch ein wichtiger Teil der Atmosphäre entsteht schon am Donnerstag und Freitag: Lager, Anmeldung, Kontrollen, Freitagsprogramm, Kinderspiel, Markt, Arenen und das Lagerleben am Abend. Eine Eintagesteilnahme kann ausnahmsweise möglich sein — sprich es vorher mit den Organisatoren ab.` },
      ],
    },
    {
      id: 'novacci',
      label: 'Einsteiger und erste Teilnahme',
      icon: 'lucide:sparkles',
      items: [
        { q: 'Wo soll ich anfangen, wenn ich zum ersten Mal komme?', a: `Beginne mit <a href="${L('/pro-novacky/')}" class="underline">Erstes Mal hier</a>. Dort findest du den Weg Schritt für Schritt: was die Veranstaltung ist, was LARP ist, wie du eine Armee wählst, was du mitnehmen sollst, wie die Anmeldung funktioniert und was vor Ort auf dich wartet.` },
        { q: 'Was ist vor der ersten Teilnahme am wichtigsten?', a: `Eine Armee wählen, die Grundregeln lesen, ein Kostüm vorbereiten, sich anmelden, die Anmeldegebühr binnen 10 Tagen zahlen, Dokumente bereithalten, rechtzeitig kommen und keine Scheu haben zu sagen, dass du Einsteiger bist.` },
        { q: 'Was, wenn ich allein komme und niemanden kenne?', a: `Das ist völlig in Ordnung. Es kommen oft Leute allein. Wähl eine Armee, komm rechtzeitig und frag bei der Anmeldung oder den Organisatoren, wo du dich einreihen kannst. Es hilft auch, uns vorher zu schreiben. In Mittelerde bilden sich Gefährten schneller, als man denkt.` },
        { q: 'Hilft mir vor Ort jemand?', a: `Ja. Organisatoren, Herrscher, Armee-Kommandeure und erfahrenere Spieler helfen dir. Wenn du etwas nicht weißt, frag. Lieber zehnmal fragen, als in der Schlacht etwas falsch zu machen.` },
        { q: 'Muss ich Rollenspiel können?', a: `Du musst kein Schauspieler sein. Eine einfache Grundlage genügt: die Atmosphäre nicht zerstören, nicht alles außerhalb des Spiels lösen, sich entsprechend der Armee verhalten, andere respektieren. Auch ein einfacher Soldat, Zwerg, Ork, Hobbit oder Begleiter kann tolle Atmosphäre schaffen.` },
      ],
    },
    {
      id: 'termin',
      label: 'Termin, Ort und Programm',
      icon: 'lucide:calendar-days',
      items: [
        { q: 'Wann findet die Veranstaltung statt?', a: `Der Jahrgang 2026 läuft vom <strong>20. bis 23. August 2026</strong>. Donnerstag: Anreise, Lager, Anmeldung, erste Treffen. Freitag: Begleitprogramm, Lagerspiel, Kinderspiel, Markt, Arenen, Vorbereitung. Samstag: Hauptspiel / Schlacht. Sonntag: Packen, Aufräumen, Abreise. Aktuelle Infos auf <a href="${L('/organizacni-informace/')}" class="underline">Praktische Infos</a>.` },
        { q: 'Wo findet sie statt?', a: `Die Veranstaltung findet im Süden Mährens statt, in der Region Křtiny / Bukovina. Genaue Anreisehinweise und Veranstaltungsinfos auf <a href="${L('/organizacni-informace/')}" class="underline">Praktische Infos</a> und in E-Mails an angemeldete Teilnehmer. Lageplan auf <a href="${L('/mapa/')}" class="underline">Lageplan</a>.` },
        { q: 'Wann ist die Hauptschlacht?', a: `Hauptspiel und Hauptschlacht finden <strong>am Samstag</strong> statt. Freitag ist aber kein bloßes Warten auf Samstag — er ist ein wichtiger Teil des Wochenendes mit Programm, Lagerspiel, Kinderspiel, Markt und Vorbereitung.` },
        { q: 'Was passiert am Freitag?', a: `Freitag gehört dem Lagerleben. Wir planen Begleitprogramm, Markt, Arenen, Spiele, Mikro-Quests, Münzen, Kinderspiel und Lageratmosphäre. Mehr auf <a href="${L('/hra-v-tabore/')}" class="underline">Lagerspiel</a>.` },
        { q: 'Muss ich schon am Donnerstag anreisen?', a: `Du musst nicht, wir empfehlen es aber. Du hast mehr Zeit, das Lager aufzubauen, dich anzumelden, das Kostüm zu klären, deine Armee zu treffen und einzustimmen. Wer spät kommt, regelt vieles in Eile.` },
      ],
    },
    {
      id: 'registrace',
      label: 'Anmeldung, Zahlung und Storno',
      icon: 'lucide:credit-card',
      items: [
        { q: 'Wie funktioniert die Anmeldung?', a: `Die Anmeldung läuft online über Registračka.cz. Du füllst das Formular aus, wählst Seite und Armee, gibst die nötigen Daten an und erhältst danach eine E-Mail mit Zahlungsinformationen. Details auf <a href="${L('/registrace/')}" class="underline">Anmeldung</a>.`, faqSnippet: true },
        { q: 'Wann bekomme ich die Zahlungsinfos?', a: `Direkt nach der Anmeldung. Du kannst per QR-Code oder Banküberweisung gemäß Anweisungen in der E-Mail bezahlen.` },
        { q: 'Bis wann muss ich zahlen?', a: `Die Anmeldegebühr ist <strong>binnen 10 Tagen nach der Anmeldung</strong> fällig. Geht die Zahlung nicht ein, kann die Anmeldung als unbezahlt gelten.` },
        { q: 'Wo finde ich die Höhe der Anmeldegebühr?', a: `Eine Übersicht der Gebühren, Fristen und etwaiger Aufschläge findest du auf <a href="${L('/registrace/')}" class="underline">Anmeldung</a>. Aktuelles auch auf <a href="${L('/organizacni-informace/')}" class="underline">Praktische Infos</a>.` },
        { q: 'Kann ich nach der Anmeldung die Armee wechseln?', a: `Ja, aber so früh wie möglich. Schreib die Organisatoren und nenne, von welcher Armee zu welcher du wechseln willst. Wechsel kann durch Kapazität oder Seitenausgleich begrenzt sein.` },
        { q: 'Kann ich meine Anmeldung an jemand anderen übertragen?', a: `Ja, wenn du es rechtzeitig schaffst und mit den Organisatoren abklärst. Schick keinen Ersatz ohne Absprache — wir brauchen korrekte Teilnehmerdaten, Alter, Dokumente und Zuordnung.` },
        { q: 'Was, wenn ich stornieren muss?', a: `Storno bitte so früh wie möglich per E-Mail. Allgemein gilt: je näher die Veranstaltung, desto mehr Kosten sind bereits gezahlt. Detaillierte Storno-Bedingungen in <a href="${L('/podminky-ucasti-a-registrace/')}" class="underline">Anmeldebedingungen</a>.` },
        { q: 'Was, wenn ich die Anmeldegebühr nicht aufbringen kann?', a: `Melde dich. In manchen Fällen können wir Hilfe, teilweises Abarbeiten der Gebühr, Hilfe bei Vorbereitungen oder eine individuelle Lösung vereinbaren. Wir können nicht jedem alles versprechen — wenn wir es rechtzeitig wissen, suchen wir einen Weg.` },
      ],
    },
    {
      id: 'vek',
      label: 'Alter, Eltern und Kinder',
      icon: 'lucide:baby',
      items: [
        { q: 'Ab welchem Alter kann man am Hauptspiel teilnehmen?', a: `Das Hauptspiel als spielender Teilnehmer ist ab <strong>12 Jahren</strong> offen. Für jüngere Kinder bereiten wir ein eigenes <a href="${L('/detska-hra/')}" class="underline">Kinderspiel</a> vor.`, faqSnippet: true },
        { q: 'Was brauchen Teilnehmer unter 18?', a: `Teilnehmer unter 18 brauchen einen ausgedruckten, ausgefüllten und unterschriebenen Antrag / Einwilligung der Erziehungsberechtigten. Ohne dürfen wir sie nicht ins Spiel lassen. Details auf <a href="${L('/pro-rodice/')}" class="underline">Für Eltern</a>.` },
        { q: 'Darf ein Kind allein kommen?', a: `Spieler ab 12 Jahren dürfen am Hauptspiel teilnehmen. Bis 18 brauchen wir die unterschriebene Einwilligung der Erziehungsberechtigten. Bei unter 15-Jährigen ist eine begleitende volljährige Person (18+) erforderlich, die für sie verantwortlich ist. Kommt das Kind nicht direkt mit den Eltern, brauchen wir eine klare Angabe, wer auf der Veranstaltung verantwortlich ist.` },
        { q: 'Darf ein Kind mit einem anderen Erwachsenen als den Eltern kommen?', a: `Ja, aber wir brauchen schriftliche Einwilligung der Erziehungsberechtigten und eine klar benannte Person, die während der Veranstaltung für das Kind verantwortlich ist.` },
        { q: 'Dürfen Eltern als Begleitung bleiben?', a: `Ja. Eltern können als nicht spielende Begleitung, als Spieler, als Helfer oder beim Kinderspiel mitmachen. Auch Begleitungen sollten die Atmosphäre respektieren und idealerweise ein einfaches Kostüm oder zumindest unauffällige Kleidung tragen. Mehr unter <a href="${L('/role/nebojovy-doprovod/')}" class="underline">Nicht-kämpfende Begleitung</a>.` },
        { q: 'Ist die Veranstaltung für Kinder sicher?', a: `Wir tun unser Möglichstes für einen sicheren Ablauf: Waffen werden geprüft, Regeln durchgesetzt, ein Sanitäter ist vor Ort, Organisatoren im Gelände und klare Hinweise. Trotzdem ist es eine bewegungsreiche Outdoor-Veranstaltung im Gelände. Eine kleine Beule oder Schramme kann passieren.` },
        { q: 'Empfehlt ihr Schutzausrüstung für Kinder?', a: `Ja. Bei jüngeren Teilnehmern empfehlen wir dringend Handschuhe, festes Schuhwerk und je nach Rolle und Einsatz auch geeigneten Kopfschutz. Die Ausrüstung muss sicher sein und sollte ins Kostüm passen.` },
      ],
    },
    {
      id: 'armady',
      label: 'Armeen, Seiten und Rollen',
      icon: 'lucide:flag',
      items: [
        { q: 'Was ist der Unterschied zwischen Seite und Armee?', a: `Es gibt zwei Hauptseiten. Jede Seite umfasst einzelne Armeen. Ein Teilnehmer wählt also eine Seite und darin eine bestimmte Armee. Übersicht auf <a href="${L('/frakce/')}" class="underline">Armeen</a>.` },
        { q: 'Wie wähle ich eine Armee?', a: `Wähle nach Atmosphäre, Kostüm, Spielstil und dem, was dich anspricht. Wähle nicht nur danach, wer dir in Buch oder Film gefällt. Wichtig ist auch, welches Kostüm du vorbereiten kannst und ob du dich in der Rolle wohlfühlst.` },
        { q: 'Kann ich als nicht-kämpfende Begleitung kommen?', a: `Ja. Nicht-kämpfende Begleitungen sind Teilnehmer, die zur Atmosphäre und zum Lager gehören, aber nicht kämpfen. Auch für sie gelten Kostümpflicht und Veranstaltungsregeln. Mehr auf <a href="${L('/role/nebojovy-doprovod/')}" class="underline">Nicht-kämpfende Begleitung</a>.` },
        { q: 'Kann ich als Fotograf oder Kameramann kommen?', a: `Ja, aber auch Fotografen und Kameraleute müssen die Regeln respektieren. Die Kostümpflicht gilt für sie wie für andere. Geht das nicht, müssen sie zumindest unauffällige Kleidung tragen und es mit den Organisatoren absprechen. Grundregel: <strong>siehst du nicht aus wie aus Mittelerde, halte dich aus den Aufnahmen anderer raus</strong>. Mehr auf <a href="${L('/role/fotografove-a-kameramani/')}" class="underline">Fotografen und Kameraleute</a>.`, faqSnippet: true },
        { q: 'Kann ich als Helfer kommen?', a: `Ja. Helfer können nach Absprache bei Vorbereitung, Anmeldung, Infrastruktur, Kinderspiel, Aufräumen oder anderen Aufgaben helfen. Sie können die Veranstaltung zugleich als reguläre Teilnehmer genießen, wenn das so vereinbart ist. Je nach Einsatz sind Rabatt, Gebührenerlass oder Verpflegung möglich. Mehr auf <a href="${L('/role/pomocnici/')}" class="underline">Helfer</a>.` },
      ],
    },
    {
      id: 'kostymy',
      label: 'Kostüme und Ausrüstung',
      icon: 'lucide:shirt',
      items: [
        { q: 'Brauche ich ein Kostüm?', a: `Ja. Das Kostüm gehört zum Spiel und zur Atmosphäre. Es muss nicht perfekt sein, sollte aber zur gewählten Armee passen, sicher sein, im Gelände nutzbar und andere nicht stören.` },
        { q: 'Was brauche ich für ein Kostüm?', a: `Die Basis ist einfach: Tunika oder Hemd, Hose in unauffälliger Farbe, Gürtel, festes Schuhwerk, Kopfbedeckung, Umhang oder Accessoires je nach Armee. Jede Armee hat andere Farben und Stile. Konkrete Empfehlungen unter <a href="${L('/frakce/')}" class="underline">Armeen</a> und auf <a href="${L('/pro-novacky/#kostym')}" class="underline">Erstes Mal hier — Kostüm</a>.`, faqSnippet: true },
        { q: 'Muss das Kostüm historisch korrekt sein?', a: `Nein. Es ist keine historische Re-Enactment-Veranstaltung. Das Kostüm soll vor allem in die Fantasywelt Mittelerdes passen, nicht zivil wirken und der Atmosphäre dienen.` },
        { q: 'Was, wenn ich gar kein Kostüm habe?', a: `Fang einfach an. Eine schlichte Tunika, ein Umhang und unauffällige Farben sind besser als Zivilkleidung. Wenn du nicht weiterweißt, schreib den Organisatoren oder schau auf <a href="${L('/pro-novacky/')}" class="underline">Erstes Mal hier</a>.` },
        { q: 'Habt ihr einen Kostümverleih?', a: `Wir haben eventuell eine begrenzte Auswahl an Basics zum Ausleihen, verlasse dich aber nicht automatisch darauf. Sprich vorher mit uns. Das Kostüm liegt primär in der Verantwortung des Teilnehmers.` },
        { q: 'Darf ich tagsüber in Zivilkleidung sein?', a: `Während der Veranstaltung gilt Kostümpflicht. Zivilkleidung stört die Atmosphäre stark. Musst du dich aus praktischen Gründen umziehen, mach das vernünftig außerhalb des Hauptspielbereichs.` },
        { q: 'Welches Schuhwerk passt?', a: `Fest, bequem, unauffällig und waldgeeignet. Idealerweise dunkel oder naturfarben. Knallige moderne Schuhe stören die Atmosphäre und sind im Gelände oft unpraktisch.` },
      ],
    },
    {
      id: 'zbrane',
      label: 'Waffen, Kampf und Regeln',
      icon: 'lucide:swords',
      items: [
        { q: 'Darf ich eigene Waffen mitbringen?', a: `Ja, aber nur sichere, gepolsterte Larp-Waffen, die die Kontrolle bestehen. Scharfe, metallene, zu harte oder unsachgemäß umgebaute Waffen sind nicht erlaubt.` },
        { q: 'Was, wenn meine Waffe die Kontrolle nicht besteht?', a: `Du darfst sie nicht benutzen. Wir empfehlen eine Ersatzwaffe oder vorab Rücksprache mit den Organisatoren. Sicherheit geht vor persönlicher Vorliebe.` },
        { q: 'Wie funktioniert der Kampf?', a: `Der Kampf ist simuliert. Es ist kein echter Kampf und kein Sportwettkampf. Wir nutzen gepolsterte Waffen und Regeln zu Trefferzonen, Leben und Wiederbelebung. Treffer akzeptiert der Getroffene. Wir spielen fair. Details unter <a href="${L('/pravidla/')}" class="underline">Regeln</a>.` },
        { q: 'Was bedeutet „Treffer akzeptiert der Getroffene"?', a: `Wenn dich jemand gültig trifft, akzeptierst du den Treffer selbst. Du wartest nicht, bis es der Gegner erzwingt. Fairness ist die Grundlage. Im Zweifel lieber den Treffer annehmen.` },
        { q: 'Wo finde ich die vollständigen Regeln?', a: `Auf <a href="${L('/pravidla/')}" class="underline">Regeln</a>. Wir empfehlen, sie vor der Veranstaltung zu lesen und vor der Schlacht vor allem Sicherheit, Waffen, Treffer und Wiederbelebung zu wiederholen.` },
        { q: 'Was, wenn ich eine Regel nicht verstehe?', a: `Frag nach. Vor der Veranstaltung per E-Mail, vor Ort bei den Organisatoren oder erfahreneren Spielern. Lieber vor der Schlacht klären als währenddessen.` },
      ],
    },
    {
      id: 'bezpecnost',
      label: 'Sicherheit und Gesundheit',
      icon: 'lucide:shield-check',
      items: [
        { q: 'Was, wenn ich mich verletze?', a: `Vor Ort ist ein Sanitäter. Wenn du dich verletzt, beende das Spiel, mach die Umgebung aufmerksam und such einen Organisator oder Sanitäter. Bei ernsteren Lagen folge den Krisenanweisungen. Details unter <a href="${L('/bezpecnost/')}" class="underline">Sicherheit und Krisensituationen</a>.`, faqSnippet: true },
        { q: 'Ist ein Sanitäter vor Ort?', a: `Ja. Während der Veranstaltung ist ein Sanitäter mit Grundausstattung vor Ort.` },
        { q: 'Was bei Allergien, Medikamenten oder gesundheitlichen Einschränkungen?', a: `Trage es in der Anmeldung ein und nimm die nötigen Medikamente mit. Ist es wichtig für einen sicheren Ablauf, melde es vor Ort auch den Organisatoren oder dem Sanitäter.` },
        { q: 'Darf ich unter Alkoholeinfluss in die Schlacht?', a: `Nein. In die Schlacht darf niemand unter Alkohol- oder anderem Rauschmitteleinfluss. Die Sicherheit anderer geht vor dem Wunsch, „noch eine Runde zu spielen".` },
        { q: 'Was, wenn ich mich nicht sicher fühle oder ein Problem mit einem anderen Teilnehmer habe?', a: `Wende dich an einen Organisator. Falls es eine Vertrauensperson auf der Veranstaltung gibt, kannst du auch sie ansprechen. Respekt, persönliche Grenzen und Sicherheit sind Teil der Regeln.` },
        { q: 'Was gilt im Krisenfall?', a: `Hauptregel: Ruhe bewahren, den Anweisungen der Organisatoren folgen und keine ungeprüften Infos verbreiten. Bei Verletzung, Brand, Sturm, vermisstem Kind oder anderer ernster Lage den nächsten Organisator kontaktieren.` },
      ],
    },
    {
      id: 'taboreni',
      label: 'Lager, Verpflegung und Infrastruktur',
      icon: 'lucide:tent',
      items: [
        { q: 'Wo wird geschlafen?', a: `In eigenen Zelten im Lager. Lagerleben ist Teil der Atmosphäre. Hast du ein modernes Zelt, stelle und gestalte es so, dass es die Umgebung möglichst wenig stört.` },
        { q: 'Gibt es Trinkwasser vor Ort?', a: `Ja, Trinkwasser wird vor Ort bereitgestellt. Trotzdem empfehlen wir, eine eigene Trinkflasche oder Feldflasche mitzubringen.` },
        { q: 'Gibt es Essen vor Ort?', a: `Vor Ort betreibt das Wirtshaus U Zeleného draka, dort kannst du Essen und Getränke je nach deren Kapazität bekommen. Die Organisatoren stellen aber keine zentrale Verpflegung für jeden Teilnehmer. Für das Essen am Wochenende ist jeder selbst verantwortlich.` },
        { q: 'Soll ich eigenes Geschirr mitnehmen?', a: `Ja, wir empfehlen eigene Schüssel, Besteck, Becher oder Krug. Das ist praktischer, atmosphärischer und reduziert Müll.` },
        { q: 'Gibt es Duschen und Strom vor Ort?', a: `Plane mit Lager-Komfort. Erwarte kein Hotel, keine Steckdose am Zelt und kein Bad um die Ecke. Aktuelles zur Infrastruktur kommt auf <a href="${L('/organizacni-informace/')}" class="underline">Praktische Infos</a>.` },
        { q: 'Darf ich Feuer machen?', a: `Nur an ausgewiesenen Stellen und nach Anweisung der Organisatoren. Eigene Feuerstellen oder Eingriffe in die Natur ohne Erlaubnis sind nicht gestattet.` },
        { q: 'Was mit Müll?', a: `Müll in die dafür vorgesehenen Säcke oder Container. Ziel: Nur niedergedrücktes Gras und gute Erinnerungen sollen bleiben.` },
      ],
    },
    {
      id: 'doprava',
      label: 'Anreise und Parken',
      icon: 'lucide:car',
      items: [
        { q: 'Kann ich mit dem Auto kommen?', a: `Ja. Beachte aber die Anreise- und Parkanweisungen. Der Ort liegt in der Natur, die Zufahrt kann eingeschränkt sein. Lageplan auf <a href="${L('/mapa/')}" class="underline">Lageplan</a>.` },
        { q: 'Brauche ich einen Parkschein?', a: `Ja — wenn du mit dem Auto kommst, bereite einen Parkschein laut Anweisungen vor. Wir empfehlen, ihn auszudrucken und hinter die Windschutzscheibe zu legen.` },
        { q: 'Darf ich mit dem Auto bis zum Zelt fahren?', a: `Nur nach Anweisung der Organisatoren. Freie Fahrt durchs Lager oder Spielgebiet gibt es nicht. Beschilderung und Parkhelfer respektieren.` },
        { q: 'Wie schnell darf ich auf der Zufahrtsstraße fahren?', a: `Langsam. Schotter- und Waldwege sind keine Rennstrecke. Anweisungen der Organisatoren befolgen und rücksichtsvoll gegenüber Menschen, Autos, Natur und Anwohnern fahren.` },
        { q: 'Komme ich mit dem ÖPNV hin?', a: `ÖPNV-Optionen werden auf <a href="${L('/organizacni-informace/')}" class="underline">Praktische Infos</a> oder in den Pre-Event-Briefings beschrieben. Rechne damit, dass ein Teil zu Fuß zu bewältigen ist.` },
      ],
    },
    {
      id: 'detska-hra',
      label: 'Kinderspiel',
      icon: 'lucide:sparkles',
      items: [
        { q: 'Für wen ist das Kinderspiel?', a: `Das Kinderspiel ist für Kinder etwa von 5 bis 10 Jahren gedacht. Jüngere Kinder, etwa 3–5 Jahre, können nur in Begleitung eines Elternteils oder verantwortlichen Erwachsenen teilnehmen.`, faqSnippet: true },
        { q: 'Wann findet das Kinderspiel statt?', a: `Das Programm des Kinderspiels ist vor allem für Freitag und Samstag geplant. Geplant sind Aktivitäten auf der Wiese, Basteln, Bewegungsspiele, Waldaktivitäten, ein Mutpfad und ein Stationenspiel am Samstag. Details unter <a href="${L('/detska-hra/')}" class="underline">Kinderspiel</a>.` },
        { q: 'Kann ich in die Hauptschlacht und das Kind beim Kinderspiel lassen?', a: `Bei älteren Kindern im Kinderspiel ja, wenn die Bedingungen der Organisatoren erfüllt sind und das Kind ohne kontinuierliche Elternpräsenz im Programm zurechtkommt. Bei jüngeren Kindern wollen wir Eltern oder eine verantwortliche Person vor Ort. Genaue Bedingungen kommen auf <a href="${L('/detska-hra/')}" class="underline">Kinderspiel</a>.` },
        { q: 'Begrüßt ihr Hilfe der Eltern beim Kinderspiel?', a: `Ja, sehr. Wenn du mit Kindern kommst und mitmachen willst, melde dich. Hilfe von Eltern bei Aktivitäten, Aufsicht oder kleiner Organisation kann sehr nützlich sein.` },
        { q: 'Wie melde ich mein Kind zum Kinderspiel an?', a: `Über Registračka.cz. Melde mindestens einen Elternteil an und füge in der Personenkarte die Kinder als verbundene Personen hinzu. Dann melde sie in der „Kinderspiel"-Sektion an, falls so in der Anmeldung gelistet. Mehr unter <a href="${L('/pro-rodice/#prihlasit')}" class="underline">Für Eltern — Wie melde ich ein Kind an</a>.` },
        { q: 'Habt ihr eine Familienobergrenze für die Anmeldegebühr?', a: `Ja, für Familien planen wir eine Höchstgrenze der Anmeldegebühr. Genaue Beträge und Bedingungen auf <a href="${L('/registrace/')}" class="underline">Anmeldung</a>.` },
      ],
    },
    {
      id: 'fotky',
      label: 'Fotos, Video und Medien',
      icon: 'lucide:camera',
      items: [
        { q: 'Darf ich auf der Veranstaltung fotografieren?', a: `Ja, mit Respekt für andere, die Regeln und die Atmosphäre. Willst du auffälliger fotografieren, dich im Spielbereich bewegen oder Material zur Veröffentlichung machen, sprich es mit den Organisatoren ab.` },
        { q: 'Brauche ich als Fotograf ein Kostüm?', a: `Ja — die Kostümpflicht gilt auch für Fotografen und Kameraleute. Geht das nicht, trag wenigstens dunkle, unauffällige Kleidung und sprich es mit den Organisatoren ab. Wir können beim Verleih oder einer Anpassung helfen.` },
        { q: 'Darf ich Video drehen?', a: `Ja, aber es gelten dieselben Regeln wie beim Fotografieren. Stör das Spiel nicht, dräng dich nicht in fremde Aufnahmen, respektiere die Anweisungen der Organisatoren und Teilnehmer, die nicht prominent gefilmt werden wollen.` },
        { q: 'Wird es offizielle Eventfotos geben?', a: `Ja, falls wir Fotografen vereinbart haben. Fotos und Videos der Veranstaltung erscheinen anschließend auf <a href="${L('/fotky-a-video/')}" class="underline">Fotos und Video</a>.` },
        { q: 'Wo finde ich das Mediakit?', a: `Infos für Medien auf <a href="${L('/pro-media/')}" class="underline">Für Medien</a>.` },
      ],
    },
    {
      id: 'stankari',
      label: 'Standbetreiber und Verkäufer',
      icon: 'lucide:store',
      items: [
        { q: 'Kann ich auf der Veranstaltung einen Stand haben?', a: `Ja, in Absprache mit den Organisatoren. Besonders passend sind thematische Produkte, Handwerk, Kostümzubehör, Lederwaren, Schmuck, Larp-Ausrüstung und Fantasy-Themen.` },
        { q: 'Kann ich mit einem Foodstand kommen?', a: `Gastrobetriebe sind individuell vorab zu klären. Vor Ort haben wir eine exklusive Vereinbarung mit dem Wirtshaus U Zeleného draka, daher konsultieren wir weitere Foodstände immer auch mit ihnen.` },
        { q: 'Darf ein Standbetreiber am Spiel teilnehmen?', a: `Ja. Standbetreiber können nach eigenem Ermessen am Spiel und an Aktivitäten teilnehmen. Die Organisatoren übernehmen aber keine Aufsicht über den Stand bei Abwesenheit.` },
        { q: 'Wie meldet sich ein Standbetreiber an?', a: `Entweder als nicht spielender Teilnehmer oder als Spieler, wenn er ins Spiel einsteigen will. Details vorab mit den Organisatoren absprechen.` },
        { q: 'Werdet ihr Standbetreiber bewerben?', a: `Ja. Wir haben die Seite <a href="${L('/stanky-a-prodejci/')}" class="underline">Stände und Verkäufer</a>, wo wir bestätigte Standbetreiber veröffentlichen. Gerne nehmen wir auch dich auf, wenn wir uns auf die Teilnahme einigen.` },
      ],
    },
    {
      id: 'pomocnici',
      label: 'Helfer und Freiwillige',
      icon: 'lucide:hand-helping',
      items: [
        { q: 'Wie kann ich beim Event helfen?', a: `Du kannst bei Vorbereitung, Anmeldung, Infrastruktur, Wasser, Holz, Kinderspiel, Aufräumen, Logistik, kleinen Reparaturen oder beim Sonntagspacken helfen.` },
        { q: 'Heißt helfen, dass ich die Veranstaltung nicht genießen kann?', a: `Nicht zwangsläufig. Helfer helfen nach Absprache und können das Event auch als reguläre Teilnehmer genießen. Es hängt vom Einsatz und der konkreten Vereinbarung ab.` },
        { q: 'Bekomme ich für die Hilfe einen Rabatt?', a: `Je nach Umfang sind Rabatt, Gebührenerlass oder Verpflegung möglich. Das wird individuell vereinbart.` },
        { q: 'Wie melde ich mich als Helfer an?', a: `Schreib den Organisatoren, was du kannst, wann du verfügbar bist und ob du auch spielen willst. Mehr auf <a href="${L('/role/pomocnici/')}" class="underline">Helfer</a>.` },
      ],
    },
    {
      id: 'zmeny',
      label: 'Änderungen, Wetter und Ausnahmesituationen',
      icon: 'lucide:cloud-rain',
      items: [
        { q: 'Findet die Veranstaltung bei jedem Wetter statt?', a: `Üblicher Regen, Kälte oder bedeckter Himmel sind kein Grund abzusagen. Stell dich auf ein Wochenende draußen ein und nimm Regen- und Kälteausrüstung mit.` },
        { q: 'Was bei Gewitter, Sturm oder gefährlichem Wetter?', a: `Gefährdet das Wetter die Sicherheit der Teilnehmer, entscheiden die Organisatoren. Programm kann angepasst, verlegt, pausiert oder im Extremfall abgesagt werden.` },
        { q: 'Was, wenn die Organisatoren kurzfristig absagen müssen?', a: `Müssen wir aus höherer Gewalt absagen — etwa Sturm, umgestürzte Bäume oder Lagerprobleme — versuchen wir, den Teilnehmern das Maximum noch nicht ausgegebener und vernünftig erstattbarer Mittel zurückzugeben. Ein Teil der Kosten kann zu dem Zeitpunkt schon gezahlt und nicht erstattbar sein. Details unter <a href="${L('/podminky-ucasti-a-registrace/')}" class="underline">Anmeldebedingungen</a>.` },
        { q: 'Was, wenn sich der Veranstaltungsort ändert?', a: `Eine Ortsänderung ist möglich. Sie ändert weder Preis noch Gültigkeit der Anmeldung. Wir informieren per E-Mail und Website.` },
        { q: 'Was, wenn sich der Termin ändert?', a: `Bei Terminänderung übertragen wir die Anmeldung auf den neuen Termin. Wir verstehen, dass deine Verfügbarkeit anders sein kann — in dem Fall ermöglichen wir die Rückerstattung der Anmeldegebühr.` },
        { q: 'Wie erfahre ich von wichtigen Änderungen?', a: `Per E-Mail, Website und ggf. Social Media. Bei angemeldeten Teilnehmern ist die in der Anmeldung angegebene E-Mail der Hauptkanal.` },
      ],
    },
    {
      id: 'registracka',
      label: 'Registračka, Daten und Technik',
      icon: 'lucide:database',
      items: [
        { q: 'Über welches System läuft die Anmeldung?', a: `Die Anmeldung läuft über Registračka.cz. Das System wird von Moravian LARP betrieben und für Anmeldungen zu unseren Veranstaltungen genutzt.` },
        { q: 'An wen gebt ihr Anmeldedaten weiter?', a: `Daten geben wir nur an die Organisatoren der konkreten Veranstaltung weiter, für die sie nötig sind. Mehr unter <a href="${L('/gdpr/')}" class="underline">DSGVO / Datenschutz</a>.` },
        { q: 'Was, wenn die Bestätigungs-E-Mail nicht kam?', a: `Prüfe Spam, Massen-Mail und die Korrektheit der E-Mail-Adresse. Findest du nichts, schreib uns mit dem Namen, mit dem du dich registriert hast.` },
        { q: 'Was, wenn ich in der Anmeldung einen Fehler gemacht habe?', a: `Schreib den Organisatoren an <a href="mailto:info@panprstenu.cz" class="underline">info@panprstenu.cz</a>. Gib Namen, die in der Anmeldung verwendete E-Mail und an, was korrigiert werden soll.` },
        { q: 'Wo finde ich die Liste angemeldeter Teilnehmer?', a: `Die Liste ist auf <a href="${L('/kdo-jede/')}" class="underline">Wer fährt mit</a>. Teilnehmer sehen, wer kommt und wie Seiten und Armeen gefüllt sind.` },
      ],
    },
  ];
}
// ============================================================
// SLOVENSKY
// ============================================================
function sk(L: LinkFn): FaqGroup[] {
  return [
    {
      id: 'obecne',
      label: 'Všeobecné otázky',
      icon: 'lucide:help-circle',
      items: [
        { q: 'Čo je Pán Prsteňov?', a: `Pán Prsteňov je veľká niekoľkodňová larpová bitka inšpirovaná Tolkienovou Stredozemou. Prídeš na víkend, zaradíš sa do jednej zo strán a armád, oblečieš si kostým, prejdeš registráciou a zapojíš sa do hry, táborového života a hlavnej sobotnej bitky. Nie je to historická rekonštrukcia ani športový turnaj — je to spoločná hra, kde sú dôležité atmosféra, fair-play, bezpečnosť, kostýmy, príbeh a komunita. Viac na stránke <a href="${L('/pro-novacky/')}" class="underline">Pre nováčikov</a>.` },
        { q: 'Čo je LARP?', a: `LARP je hra naživo. Nehráš postavu na počítači ani figúrku na stole — na chvíľu sa postavou stávaš ty sám. Oblečieš si kostým, prijmeš rolu, dodržiavaš pravidlá a spolu s ostatnými vytváraš živý svet. Na Pánovi Prsteňov to znamená kostým, armádu, pravidlá boja, fér uznávanie zásahov, rešpekt voči ostatným a ochotu pomôcť atmosfére Stredozeme.` },
        { q: 'Je akcia vhodná pre nováčikov?', a: `Áno. Nováčikovia sú vítaní. Nemusíš mať za sebou žiadny iný larp. Dôležité je prečítať si základné informácie, vybrať si armádu, pripraviť kostým a nebáť sa opýtať. Odporúčaná cesta: <a href="${L('/pro-novacky/')}" class="underline">Pre nováčikov</a> → <a href="${L('/frakce/')}" class="underline">Armády</a> → <a href="${L('/pravidla/')}" class="underline">Pravidlá</a> → <a href="${L('/organizacni-informace/')}" class="underline">Praktické informácie</a> → <a href="${L('/registrace/')}" class="underline">Registrácia</a>.`, faqSnippet: true },
        { q: 'Musím poznať Tolkienove knihy alebo filmy?', a: `Nemusíš. Pomôže to s atmosférou, ale nie je to podmienka. Stačí chápať, že ideme vo fantasy svete inšpirovanom Stredozemou a že kostým, správanie a vybavenie by tomu mali zodpovedať. Ak chceš svet spoznať viac, mrkni na <a href="${L('/svet-stredozeme/')}" class="underline">Svet Stredozeme</a>.` },
        { q: 'Koľko ľudí na akcii očakávate?', a: `Očakávame účasť v rádoch stoviek ľudí, približne 700+ účastníkov. Preto je dôležité riešiť registráciu, platbu, príchod, parkovanie a dokumenty včas.` },
        { q: 'Môžem prísť len na jeden deň?', a: `Akcia je koncipovaná ako víkendový zážitok. Hlavná bitka je v sobotu, ale dôležitá časť atmosféry vzniká už vo štvrtok a v piatok: tábor, registrácia, schvaľovanie, piatkový program, detská hra, jarmok, arény a večerný život v tábore. Jednodňová účasť môže byť možná výnimočne — rieš ju vopred s organizátormi.` },
      ],
    },
    {
      id: 'novacci',
      label: 'Nováčikovia a prvá účasť',
      icon: 'lucide:sparkles',
      items: [
        { q: 'Kde mám začať, keď idem prvýkrát?', a: `Začni stránkou <a href="${L('/pro-novacky/')}" class="underline">Pre nováčikov</a>. Tam nájdeš cestu krok za krokom: čo je akcia, čo je LARP, ako si vybrať armádu, čo si vziať, ako funguje registrácia a čo ťa čaká na mieste.` },
        { q: 'Čo je najdôležitejšie pred prvou účasťou?', a: `Vybrať si armádu, prečítať si základné pravidlá, pripraviť kostým, zaregistrovať sa, zaplatiť registračný poplatok do 10 dní, pripraviť dokumenty, doraziť včas a nebáť sa povedať, že si nováčik.` },
        { q: 'Čo keď idem sám a nikoho tam nepoznám?', a: `To je úplne v poriadku. Na akciu bežne prichádzajú ľudia sami. Vyber si armádu, doraz včas a pri registrácii alebo u organizátorov sa opýtaj, kam sa zaradiť. Pomôže aj napísať nám vopred. V Stredozemi sa družiny tvoria rýchlejšie, než sa zdá.` },
        { q: 'Pomôže mi niekto na mieste?', a: `Áno. Organizátori, panovníci, velitelia armád aj skúsenejší hráči ti poradia. Keď nevieš, opýtaj sa. Lepšie je opýtať sa desaťkrát, než niečo riešiť zle až v bitke.` },
        { q: 'Musím vedieť hrať rolu?', a: `Nemusíš byť herec. Stačí jednoduchý základ: nelámať atmosféru, neriešiť všetko mimo hru, správať sa podľa svojej armády a rešpektovať ostatných. Aj obyčajný vojak, trpaslík, ork, hobit alebo doprovod vie vytvoriť skvelú atmosféru.` },
      ],
    },
    {
      id: 'termin',
      label: 'Termín, miesto a program',
      icon: 'lucide:calendar-days',
      items: [
        { q: 'Kedy sa akcia koná?', a: `Ročník 2026 sa koná od <strong>20. do 23. 8. 2026</strong>. Štvrtok: príchod, tábor, registrácia, prvé stretnutia. Piatok: doprovodný program, hra v tábore, detská hra, jarmok, arény, príprava. Sobota: hlavná hra / bitka. Nedeľa: balenie, upratovanie, odchod. Aktuálne informácie na <a href="${L('/organizacni-informace/')}" class="underline">Praktických informáciách</a>.` },
        { q: 'Kde sa akcia koná?', a: `Akcia sa koná v oblasti južnej Moravy, v lokalite Křtiny / Bukovina. Presné pokyny k príchodu a informácie k miestu sleduj na <a href="${L('/organizacni-informace/')}" class="underline">Praktických informáciách</a> a v e-mailoch pre registrovaných účastníkov. Mapa na stránke <a href="${L('/mapa/')}" class="underline">Mapa areálu</a>.` },
        { q: 'Kedy je hlavná bitka?', a: `Hlavná hra a hlavná bitka prebieha <strong>v sobotu</strong>. Piatok ale nie je len čakanie na sobotu — je to dôležitá časť víkendu s programom, hrou v tábore, detskou hrou, jarmokom a prípravou.` },
        { q: 'Čo sa deje v piatok?', a: `Piatok patrí táborovému životu. Počítame s doprovodným programom, jarmokom, arénami, hrami, mikro questami, mincami, detskou hrou a atmosférou v tábore. Viac na stránke <a href="${L('/hra-v-tabore/')}" class="underline">Hra v tábore</a>.` },
        { q: 'Musím prísť už vo štvrtok?', a: `Nemusíš, ale odporúčame to. Budeš mať viac času postaviť tábor, prejsť registráciou, vyriešiť kostým, stretnúť svoju armádu a naladiť sa na hru. Kto príde neskoro, často rieši všetko v zhone.` },
      ],
    },
    {
      id: 'registrace',
      label: 'Registrácia, platba a storno',
      icon: 'lucide:credit-card',
      items: [
        { q: 'Ako funguje registrácia?', a: `Registrácia prebieha online cez systém Registračka.cz. Vyplníš formulár, vyberieš si stranu a armádu, doplníš potrebné údaje a po registrácii dostaneš e-mail s informáciami k platbe. Detail nájdeš na stránke <a href="${L('/registrace/')}" class="underline">Registrácia</a>.`, faqSnippet: true },
        { q: 'Kedy dostanem informácie k platbe?', a: `Informácie k platbe dostaneš hneď po registrácii. Platiť môžeš QR kódom alebo prevodom podľa pokynov v e-maile.` },
        { q: 'Dokedy musím zaplatiť?', a: `Registračný poplatok treba zaplatiť <strong>do 10 dní od registrácie</strong>. Ak platba nedorazí, registrácia môže byť považovaná za neuhradenú.` },
        { q: 'Kde nájdem výšku registračného poplatku?', a: `Prehľad registračných poplatkov, termínov a prípadných doplatkov je na stránke <a href="${L('/registrace/')}" class="underline">Registrácia</a>. Aktuálne informácie aj na <a href="${L('/organizacni-informace/')}" class="underline">Praktických informáciách</a>.` },
        { q: 'Môžem zmeniť armádu po registrácii?', a: `Áno, ale rieš to čo najskôr. Napíš organizátorom a uveď, z akej armády do akej chceš prejsť. Zmena môže byť obmedzená kapacitou alebo vyvážením strán.` },
        { q: 'Môžem registráciu previesť na niekoho iného?', a: `Áno, ak to stihneš včas a dohodneš sa s organizátormi. Neposielaj za seba náhradníka bez dohody — potrebujeme správne údaje účastníka, vek, dokumenty a zaradenie.` },
        { q: 'Čo ak potrebujem storno?', a: `Storno rieš čo najskôr e-mailom. Vo všeobecnosti platí, že čím bližšie k akcii, tým viac nákladov je už zaplatených. Podrobné storno podmienky nájdeš v <a href="${L('/podminky-ucasti-a-registrace/')}" class="underline">Podmienkach registrácie</a>.` },
        { q: 'Čo keď nemám na registračný poplatok?', a: `Ozvi sa nám. V niektorých prípadoch je možné dohodnúť pomoc, odpracovanie časti poplatku, pomoc pri príprave alebo individuálne riešenie. Nevieme sľúbiť všetko všetkým, ale keď vieme včas, môžeme hľadať cestu.` },
      ],
    },
    {
      id: 'vek',
      label: 'Vek, rodičia a deti',
      icon: 'lucide:baby',
      items: [
        { q: 'Od koľkých rokov sa dá ísť do hlavnej hry?', a: `Hlavná hra ako hrajúci účastník je určená pre účastníkov od <strong>12 rokov</strong>. Pre mladšie deti pripravujeme samostatnú <a href="${L('/detska-hra/')}" class="underline">detskú hru</a>.`, faqSnippet: true },
        { q: 'Čo potrebujú účastníci mladší ako 18 rokov?', a: `Účastníci mladší ako 18 rokov potrebujú vytlačenú, vyplnenú a podpísanú prihlášku / súhlas zákonného zástupcu. Bez nej ich nemôžeme pustiť do hry. Podrobnosti na stránke <a href="${L('/pro-rodice/')}" class="underline">Pre rodičov</a>.` },
        { q: 'Môže ísť dieťa samé?', a: `Hráči od 12 rokov sa môžu zúčastniť hlavnej hry. Do 18 rokov potrebujeme podpísaný súhlas zákonného zástupcu. U osôb mladších ako 15 rokov je nutný doprovod osoby staršej ako 18 rokov, ktorá za nich zodpovedá. Ak dieťa nejde priamo s rodičom, treba mať jasne uvedené, kto za neho na akcii zodpovedá.` },
        { q: 'Môže dieťa ísť s iným dospelým než rodičom?', a: `Áno, ale potrebujeme písomný súhlas zákonného zástupcu a jasne uvedenú osobu, ktorá za dieťa na akcii zodpovedá.` },
        { q: 'Môže rodič zostať na akcii ako doprovod?', a: `Áno. Rodič môže ísť ako nehrajúci doprovod, ako hrajúci účastník, ako pomocník alebo sa zapojiť do detskej hry. Aj doprovod by mal rešpektovať atmosféru akcie a ideálne mať jednoduchý kostým alebo aspoň nerušivé oblečenie. Viac v <a href="${L('/role/nebojovy-doprovod/')}" class="underline">Nebojovom doprovode</a>.` },
        { q: 'Je akcia pre deti bezpečná?', a: `Robíme maximum pre bezpečný priebeh: kontrolujeme zbrane, riešime pravidlá, máme zdravotníka, organizátorov v teréne a jasné pokyny. Zároveň však platí, že ide o pohybovú vonkajšiu akciu v teréne. Drobný úraz, odrenina alebo modrina sa stať môže.` },
        { q: 'Odporúčate deťom ochranné vybavenie?', a: `Áno. U mladších účastníkov rozhodne odporúčame rukavice, pevnú obuv a podľa role aj vhodnú ochranu hlavy. Vybavenie musí byť bezpečné a malo by zapadať do kostýmu.` },
      ],
    },
    {
      id: 'armady',
      label: 'Armády, strany a roly',
      icon: 'lucide:flag',
      items: [
        { q: 'Aký je rozdiel medzi stranou a armádou?', a: `Na akcii máme dve hlavné strany. V každej strane sú jednotlivé armády. Účastník si teda vyberá stranu a v jej rámci konkrétnu armádu. Prehľad nájdeš na stránke <a href="${L('/frakce/')}" class="underline">Armády</a>.` },
        { q: 'Ako si mám vybrať armádu?', a: `Vyber si armádu podľa atmosféry, kostýmu, štýlu hry a toho, čo ťa láka. Nevyberaj len podľa toho, kto sa ti páči v príbehu. Dôležité je aj to, aký kostým zvládneš pripraviť a či sa v tej role budeš cítiť dobre.` },
        { q: 'Môžem ísť ako nebojový doprovod?', a: `Áno. Nebojový doprovod je účastník, ktorý je súčasťou atmosféry a tábora, ale nebojuje. Aj pre neho platí kostýmová povinnosť a pravidlá akcie. Viac na stránke <a href="${L('/role/nebojovy-doprovod/')}" class="underline">Nebojový doprovod</a>.` },
        { q: 'Môžem ísť ako fotograf alebo kameraman?', a: `Áno, ale aj fotografi a kameramani musia rešpektovať pravidlá akcie. Platí pre nich kostýmová povinnosť ako pre ostatných. Ak to nejde, musia mať aspoň nerušivé oblečenie a dohodnúť sa s organizátormi. Základné pravidlo: <strong>ak nevyzeráš ako zo Stredozeme, nelez do záberu ostatným</strong>. Viac na stránke <a href="${L('/role/fotografove-a-kameramani/')}" class="underline">Fotografi a kameramani</a>.`, faqSnippet: true },
        { q: 'Môžem ísť ako pomocník?', a: `Áno. Pomocníci nám môžu pomáhať podľa dohody s prípravou, registráciou, zázemím, detskou hrou, upratovaním alebo ďalšími úlohami. Zároveň si môžu akciu užiť ako bežní účastníci, ak sa tak dohodneme. Podľa miery zapojenia je možné riešiť zľavu, odpustenie poplatku alebo stravu a pitie. Viac na stránke <a href="${L('/role/pomocnici/')}" class="underline">Pomocníci</a>.` },
      ],
    },
    {
      id: 'kostymy',
      label: 'Kostýmy a vybavenie',
      icon: 'lucide:shirt',
      items: [
        { q: 'Musím mať kostým?', a: `Áno. Kostým je súčasťou hry aj atmosféry. Nemusí byť dokonalý, ale mal by zodpovedať zvolenej armáde, byť bezpečný, použiteľný v teréne a nemal by rušiť ostatných.` },
        { q: 'Čo potrebujem ku kostýmu?', a: `Základ je jednoduchý: tunika alebo košeľa, nohavice v nerušivej farbe, opasok, pevná obuv, pokrývka hlavy, plášť alebo doplnky podľa armády. Každá armáda má iné farby a štýl. Konkrétne odporúčania nájdeš v sekcii <a href="${L('/frakce/')}" class="underline">Armády</a> a na stránke <a href="${L('/pro-novacky/#kostym')}" class="underline">Pre nováčikov — Kostým</a>.`, faqSnippet: true },
        { q: 'Musí byť kostým historicky presný?', a: `Nie. Nejde o historickú rekonštrukciu. Kostým má hlavne zapadať do fantasy sveta Stredozeme, nepôsobiť civilne a pomáhať atmosfére.` },
        { q: 'Čo keď nemám žiadny kostým?', a: `Začni jednoducho. Lepšia je obyčajná tunika, plášť a nerušivé farby ako civilné oblečenie. Ak si nevieš rady, napíš organizátorom alebo sa pozri na stránku <a href="${L('/pro-novacky/')}" class="underline">Pre nováčikov</a>.` },
        { q: 'Máte požičovňu kostýmov?', a: `Môžeme mať obmedzené množstvo základných vecí na zapožičanie, ale nespoliehaj sa na to automaticky. Dohodni sa vopred. Kostým je primárne zodpovednosť účastníka.` },
        { q: 'Môžem byť cez deň v civile?', a: `Počas akcie platí kostýmová povinnosť. Civilné oblečenie výrazne ruší atmosféru. Ak sa potrebuješ prezliecť z praktických dôvodov, rieš to rozumne mimo hlavného herného priestoru.` },
        { q: 'Aká obuv je vhodná?', a: `Pevná, pohodlná, nerušivá a vhodná do lesa. Ideálne tmavá alebo prírodná. Krikľavé moderné topánky rušia atmosféru a v teréne často nie sú praktické.` },
      ],
    },
    {
      id: 'zbrane',
      label: 'Zbrane, boj a pravidlá',
      icon: 'lucide:swords',
      items: [
        { q: 'Môžem si vziať vlastnú zbraň?', a: `Áno, ale len bezpečnú mäkčenú larpovú zbraň, ktorá prejde kontrolou. Ostré, kovové, príliš tvrdé alebo nevhodne upravené zbrane nie sú povolené.` },
        { q: 'Čo keď moja zbraň neprejde kontrolou?', a: `Nebudeš ju smieť použiť. Odporúčame mať náhradnú zbraň alebo sa vopred poradiť s organizátormi. Bezpečnosť je dôležitejšia než to, že sa ti zbraň páči.` },
        { q: 'Ako funguje boj?', a: `Boj je simulovaný. Nejde o skutočný boj ani športový zápas. Používajú sa mäkčené zbrane, platia pravidlá zásahových plôch, životov a oživenia. Zásah uznáva zasiahnutý. Hráme férovo. Detail nájdeš v <a href="${L('/pravidla/')}" class="underline">Pravidlách</a>.` },
        { q: 'Čo znamená „zásah uznáva zasiahnutý"?', a: `Keď ťa niekto platne zasiahne, ty sám zásah uznáš. Nečakáš, kým ti to súper vynúti. Fair-play je základ hry. Keď si nie si istý, radšej zásah uznaj.` },
        { q: 'Kde nájdem kompletné pravidlá?', a: `Na stránke <a href="${L('/pravidla/')}" class="underline">Pravidlá</a>. Odporúčame si ich prečítať pred akciou a pred bitkou si zopakovať najmä bezpečnosť, zbrane, zásahy a oživovanie.` },
        { q: 'Čo keď pravidlám nerozumiem?', a: `Opýtaj sa. Pred akciou e-mailom, na mieste organizátorov alebo skúsenejších hráčov. Nejasnosti je lepšie vyriešiť pred bitkou než počas nej.` },
      ],
    },
    {
      id: 'bezpecnost',
      label: 'Bezpečnosť a zdravie',
      icon: 'lucide:shield-check',
      items: [
        { q: 'Čo keď sa zraním?', a: `Na akcii je prítomný zdravotník. Ak sa zraníš, ukonči hru, upozorni okolie a vyhľadaj organizátora alebo zdravotníka. Pri vážnejšej situácii sa postupuje podľa krízových pokynov. Detaily v <a href="${L('/bezpecnost/')}" class="underline">Bezpečnosť a krízové situácie</a>.`, faqSnippet: true },
        { q: 'Je na akcii zdravotník?', a: `Áno. Počas akcie je na mieste zdravotník s vybavením pre základné ošetrenie.` },
        { q: 'Čo keď mám alergiu, lieky alebo zdravotné obmedzenie?', a: `Uveď to v registrácii a vezmi si potrebné lieky so sebou. Ak ide o dôležitú informáciu pre bezpečný priebeh akcie, nahlás ju pri registrácii aj organizátorom alebo zdravotníkovi.` },
        { q: 'Môžem ísť do bitky pod vplyvom alkoholu?', a: `Nie. Do bitky nesmie nikto pod vplyvom alkoholu ani iných omamných látok. Bezpečnosť ostatných je dôležitejšia než tvoja chuť „ešte si zahrať".` },
        { q: 'Čo keď sa necítim bezpečne alebo mám problém s iným účastníkom?', a: `Obráť sa na organizátora. Ak je na akcii určený dôverník alebo dôverníčka, môžeš sa obrátiť aj na nich. Rešpekt, osobné hranice a bezpečie sú súčasťou pravidiel.` },
        { q: 'Čo platí v krízovej situácii?', a: `Hlavné pravidlo: zachovaj pokoj, riaď sa pokynmi organizátorov a nešír neoverené informácie. V prípade zranenia, požiaru, búrky, strateného dieťaťa alebo inej vážnej situácie kontaktuj najbližšieho organizátora.` },
      ],
    },
    {
      id: 'taboreni',
      label: 'Tábor, strava a zázemie',
      icon: 'lucide:tent',
      items: [
        { q: 'Kde sa spí?', a: `Spí sa vo vlastných stanoch v tábore. Tábor je súčasťou atmosféry akcie. Ak máš moderný stan, snaž sa ho umiestniť tak, aby čo najmenej rušil prostredie.` },
        { q: 'Je na mieste pitná voda?', a: `Áno, na mieste bude zabezpečená pitná voda. Aj tak odporúčame mať vlastnú nádobu na vodu, čutoru alebo fľašu.` },
        { q: 'Je na mieste jedlo?', a: `Na mieste funguje krčma U Zeleného draka, kde bude možné riešiť jedlo a pitie podľa prevádzkových možností. Organizátori ale centrálne nezabezpečujú stravu pre každého účastníka. Za jedlo počas víkendu zodpovedá každý sám.` },
        { q: 'Mám si vziať vlastný riad?', a: `Áno, odporúčame vlastnú misku, príbor, hrnček alebo korbeľ. Je to praktickejšie, atmosférickejšie a pomáha to obmedziť odpad.` },
        { q: 'Sú na mieste sprchy a elektrina?', a: `S komfortom rátaj skôr ako na tábore. Nečakaj hotel, zásuvku pri stane ani kúpeľňu za rohom. Aktuálne informácie o zázemí budú na <a href="${L('/organizacni-informace/')}" class="underline">Praktických informáciách</a>.` },
        { q: 'Môžem rozkladať oheň?', a: `Iba na určených miestach a podľa pokynov organizátorov. Vlastné ohniská alebo zásahy do prírody bez súhlasu organizátorov nie sú povolené.` },
        { q: 'Čo s odpadom?', a: `Odpadky daj do určených vriec alebo kontajnerov. Cieľom je, aby po nás na mieste zostala len pošliapaná tráva a dobré spomienky.` },
      ],
    },
    {
      id: 'doprava',
      label: 'Doprava a parkovanie',
      icon: 'lucide:car',
      items: [
        { q: 'Môžem prísť autom?', a: `Áno. Sleduj pokyny k príchodu a parkovaniu. Miesto je v prírode a príchod môže byť obmedzený. Mapa areálu na stránke <a href="${L('/mapa/')}" class="underline">Mapa areálu</a>.` },
        { q: 'Potrebujem parkovaciu kartu?', a: `Áno, ak prídeš autom, priprav si parkovaciu kartu podľa pokynov organizátorov. Odporúčame ju vytlačiť a dať za sklo.` },
        { q: 'Môžem ísť autom až k stanu?', a: `Iba podľa pokynov organizátorov. Nejazdí sa voľne po tábore ani po hernom priestore. Rešpektuj značenie a dobrovoľníkov na parkovisku.` },
        { q: 'Ako rýchlo mám ísť po príjazdovej ceste?', a: `Pomaly. Prašné a lesné cesty nie sú pretekárska dráha. Dodržuj pokyny organizátorov a jazdi ohľaduplne k ľuďom, autám, prírode aj miestnym obyvateľom.` },
        { q: 'Dá sa prísť verejnou dopravou?', a: `Možnosti verejnej dopravy budú popísané na <a href="${L('/organizacni-informace/')}" class="underline">Praktických informáciách</a> alebo v pokynoch pred akciou. Rátaj s tým, že časť cesty môže byť potrebné prejsť pešo.` },
      ],
    },
    {
      id: 'detska-hra',
      label: 'Detská hra',
      icon: 'lucide:sparkles',
      items: [
        { q: 'Pre koho je detská hra?', a: `Detská hra je určená približne pre deti od 5 do 10 rokov. Mladšie deti približne 3–5 rokov sa môžu zapojiť len s doprovodom rodiča alebo dospelej zodpovednej osoby.`, faqSnippet: true },
        { q: 'Kedy detská hra prebieha?', a: `Program detskej hry je plánovaný hlavne na piatok a sobotu. Počíta sa s aktivitami na lúke, tvorením, pohybovými hrami, lesnými aktivitami, chodníkom odvahy a sobotnou hrou po stanovištiach. Detail nájdeš na stránke <a href="${L('/detska-hra/')}" class="underline">Detská hra</a>.` },
        { q: 'Môžem ísť do hlavnej bitky a dieťa nechať na detskej hre?', a: `Pri starších deťoch v rámci detskej hry áno, ak sú splnené podmienky organizátorov a dieťa je schopné fungovať v programe bez nepretržitého doprovodu rodiča. Pri mladších deťoch chceme doprovod rodiča alebo zodpovednej osoby. Presné podmienky budú na stránke <a href="${L('/detska-hra/')}" class="underline">Detská hra</a>.` },
        { q: 'Oceníte pomoc rodičov s detskou hrou?', a: `Áno, veľmi. Ak ideš s deťmi a chceš sa zapojiť, ozvi sa nám. Pomoc rodičov pri aktivitách, dohľade alebo drobnej organizácii môže byť pre detskú hru veľmi užitočná.` },
        { q: 'Ako dieťa prihlásim do detskej hry?', a: `Cez Registračka.cz. Prihlás aspoň jedného rodiča a v osobnej karte pridaj deti ako pridružené osoby. Potom ich prihlás do časti / strany „detská hra", ak je tak v registrácii uvedená. Viac na stránke <a href="${L('/pro-rodice/#prihlasit')}" class="underline">Pre rodičov — Ako dieťa prihlásiť</a>.` },
        { q: 'Máte rodinný strop registračného poplatku?', a: `Áno, pre rodiny počítame s maximálnym stropom registračného poplatku. Presné sumy a podmienky nájdeš na stránke <a href="${L('/registrace/')}" class="underline">Registrácia</a>.` },
      ],
    },
    {
      id: 'fotky',
      label: 'Fotky, video a médiá',
      icon: 'lucide:camera',
      items: [
        { q: 'Môžem na akcii fotiť?', a: `Áno, ale s rešpektom k ostatným, pravidlám a atmosfére. Ak chceš fotiť výraznejšie, pohybovať sa v hernom priestore alebo robiť materiál na publikovanie, dohodni sa s organizátormi.` },
        { q: 'Musím mať ako fotograf kostým?', a: `Áno, kostýmová povinnosť platí aj pre fotografov a kameramanov. Ak to nejde, maj aspoň tmavé, nerušivé oblečenie a dohodni sa s organizátormi. Môžeme skúsiť pomôcť so zapožičaním alebo úpravou výzoru.` },
        { q: 'Môžem natáčať video?', a: `Áno, ale platia rovnaké pravidlá ako pri fotení. Neruš hru, nelez do cudzích záberov, rešpektuj pokyny organizátorov a účastníkov, ktorí si neželajú byť výrazne zaberaní.` },
        { q: 'Budú z akcie oficiálne fotky?', a: `Áno, ak budeme mať dohodnutých fotografov. Fotky a videá z akcie nájdeš následne v sekcii <a href="${L('/fotky-a-video/')}" class="underline">Fotky a video</a>.` },
        { q: 'Kde nájdem mediakit?', a: `Informácie pre médiá sú na stránke <a href="${L('/pro-media/')}" class="underline">Pre médiá</a>.` },
      ],
    },
    {
      id: 'stankari',
      label: 'Stánkari a predajcovia',
      icon: 'lucide:store',
      items: [
        { q: 'Môžem mať na akcii stánok?', a: `Áno, po dohode s organizátormi. Hodia sa najmä tematické výrobky, remeslo, kostýmové doplnky, kožené veci, šperky, larpové vybavenie, fantasy tematika a podobne.` },
        { q: 'Môžem prísť s gastro stánkom?', a: `Gastro prevádzky treba riešiť individuálne vopred. Na mieste máme výhradnú dohodu s krčmou U Zeleného draka, takže účasť ďalších gastro stánkov vždy konzultujeme aj s nimi.` },
        { q: 'Môže sa stánkár zúčastniť hry?', a: `Áno. Stánkari sa môžu zúčastniť hry a aktivít podľa vlastného uváženia. Organizátori ale neposkytujú dohľad nad stánkom počas ich neprítomnosti.` },
        { q: 'Ako sa má stánkár registrovať?', a: `Buď ako nehrajúci účastník, alebo ako hrajúci účastník, ak sa chce zapojiť do hry. Detaily je vhodné dohodnúť vopred s organizátormi.` },
        { q: 'Budete stánkarov propagovať?', a: `Áno. Máme stránku <a href="${L('/stanky-a-prodejci/')}" class="underline">Stánky a predajcovia</a>, kde zverejňujeme informácie o potvrdených stánkaroch. Radi tam doplníme aj informácie o tebe, ak sa dohodneme na účasti.` },
      ],
    },
    {
      id: 'pomocnici',
      label: 'Pomocníci a dobrovoľníci',
      icon: 'lucide:hand-helping',
      items: [
        { q: 'Ako môžem pomôcť s akciou?', a: `Pomôcť môžeš s prípravou, registráciou, zázemím, vodou, drevom, detskou hrou, upratovaním, logistikou, drobnými opravami alebo nedeľným balením.` },
        { q: 'Znamená pomoc, že si akciu neužijem?', a: `Nie nutne. Pomocníci pomáhajú podľa dohody a môžu si akciu užiť aj ako bežní účastníci. Záleží od miery zapojenia a konkrétnej dohody.` },
        { q: 'Dostanem za pomoc zľavu?', a: `Podľa rozsahu pomoci je možné riešiť zľavu, odpustenie poplatku alebo zabezpečenie stravy a pitia. Dohaduje sa to individuálne.` },
        { q: 'Ako sa prihlásim ako pomocník?', a: `Napíš organizátorom, čo vieš, kedy môžeš pomôcť a či chceš zároveň hrať. Viac na stránke <a href="${L('/role/pomocnici/')}" class="underline">Pomocníci</a>.` },
      ],
    },
    {
      id: 'zmeny',
      label: 'Zmeny, počasie a mimoriadne situácie',
      icon: 'lucide:cloud-rain',
      items: [
        { q: 'Koná sa akcia za každého počasia?', a: `Bežný dážď, chlad alebo zatiahnutá obloha nie sú dôvodom akciu rušiť. Priprav sa na vonkajší víkend a zober si vybavenie do dažďa aj do chladu.` },
        { q: 'Čo ak príde búrka, víchrica alebo nebezpečné počasie?', a: `Ak by počasie ohrozovalo bezpečnosť účastníkov, rozhodujú organizátori. Môže dôjsť k úprave programu, presunu, pozastaveniu hry alebo v krajnom prípade k zrušeniu akcie.` },
        { q: 'Čo ak organizátori musia akciu zrušiť tesne pred konaním?', a: `Ak by sa muselo zrušiť z dôvodu vyššej moci, napríklad víchrice, popadaných stromov alebo problémov v tábore, budeme sa snažiť vrátiť účastníkom maximum prostriedkov, ktoré ešte neboli minuté a ktoré sa rozumne dajú vrátiť. Časť nákladov ale už môže byť v tom čase zaplatená a nevratná. Podrobnosti v <a href="${L('/podminky-ucasti-a-registrace/')}" class="underline">Podmienkach registrácie</a>.` },
        { q: 'Čo ak sa zmení miesto konania?', a: `Zmena miesta je možná. Nemení cenu ani platnosť registrácie. Budeme o nej informovať e-mailom a na webe.` },
        { q: 'Čo ak sa zmení termín?', a: `Pri zmene termínu prevedieme registráciu na nový termín. Chápeme však, že sa ti môže zmeniť dostupnosť, preto v takom prípade umožníme riešiť vrátenie registračného poplatku.` },
        { q: 'Ako sa dozviem dôležité zmeny?', a: `E-mailom, cez web a prípadne sociálne siete. Pri registrovaných účastníkoch je hlavný komunikačný kanál e-mail uvedený v registrácii.` },
      ],
    },
    {
      id: 'registracka',
      label: 'Registračka, údaje a technika',
      icon: 'lucide:database',
      items: [
        { q: 'Cez aký systém prebieha registrácia?', a: `Registrácia prebieha cez Registračka.cz. Systém prevádzkuje Moravian LARP a používame ho na prihlášky na naše akcie.` },
        { q: 'Komu odovzdávate údaje z registrácie?', a: `Údaje odovzdávame iba organizátorom konkrétnej udalosti, pre ktorú sú potrebné. Viac nájdeš v <a href="${L('/gdpr/')}" class="underline">GDPR / Ochrana osobných údajov</a>.` },
        { q: 'Čo keď mi neprišiel potvrdzovací e-mail?', a: `Skontroluj spam, hromadnú poštu a správnosť zadaného e-mailu. Ak nič nenájdeš, napíš nám a uveď meno, pod ktorým si sa registroval.` },
        { q: 'Čo keď som urobil chybu v registrácii?', a: `Napíš organizátorom na <a href="mailto:info@panprstenu.cz" class="underline">info@panprstenu.cz</a>. Uveď meno, e-mail použitý v registrácii a čo treba opraviť.` },
        { q: 'Kde nájdem zoznam prihlásených účastníkov?', a: `Zoznam prihlásených nájdeš na stránke <a href="${L('/kdo-jede/')}" class="underline">Kto ide</a>. Účastníci tam uvidia, kto ide a ako sú obsadené strany a armády.` },
      ],
    },
  ];
}
// ============================================================
// УКРАЇНСЬКОЮ
// ============================================================
function uk(L: LinkFn): FaqGroup[] {
  return [
    {
      id: 'obecne',
      label: 'Загальні запитання',
      icon: 'lucide:help-circle',
      items: [
        { q: 'Що таке Володар Перснів — Битва за Середзем\'я?', a: `Це велика багатоденна ларп-битва, натхнена Середзем\'ям Толкіна. Ти приїжджаєш на вихідні, приєднуєшся до однієї зі сторін та армій, одягаєш костюм, реєструєшся на місці й береш участь у грі, табірному житті та головній суботній битві. Це не історична реконструкція й не спортивний турнір — це спільна гра, де важливі атмосфера, чесна гра, безпека, костюми, сюжет і спільнота. Більше на сторінці <a href="${L('/pro-novacky/')}" class="underline">Для новачків</a>.` },
        { q: 'Що таке LARP?', a: `LARP — це гра наживо. Ти не граєш персонажа на екрані чи фігурку на столі — на час сам стаєш персонажем. Одягаєш костюм, береш роль, дотримуєшся правил і разом з іншими творите живий світ. На Володарі Перснів це означає костюм, армію, правила бою, чесне визнання влучань, повагу до інших і готовність допомагати атмосфері Середзем\'я.` },
        { q: 'Чи захід підходить новачкам?', a: `Так. Новачки бажані. Ти не мусиш мати жодного попереднього ларп-досвіду. Важливо прочитати основну інформацію, обрати армію, підготувати костюм і не боятися запитати. Рекомендований шлях: <a href="${L('/pro-novacky/')}" class="underline">Для новачків</a> → <a href="${L('/frakce/')}" class="underline">Армії</a> → <a href="${L('/pravidla/')}" class="underline">Правила</a> → <a href="${L('/organizacni-informace/')}" class="underline">Практична інформація</a> → <a href="${L('/registrace/')}" class="underline">Реєстрація</a>.`, faqSnippet: true },
        { q: 'Чи треба знати книги або фільми Толкіна?', a: `Ні. Це допоможе атмосфері, але не є обов\'язковим. Достатньо розуміти, що ми граємо у фентезі-світі, натхненному Середзем\'ям, і що костюм, поведінка та спорядження мають цьому відповідати. Якщо хочеш зануритися глибше, поглянь на <a href="${L('/svet-stredozeme/')}" class="underline">Світ Середзем\'я</a>.` },
        { q: 'Скільки людей очікуєте на заході?', a: `Очікуємо учасників у кількості сотень — приблизно 700+. Тому важливо вчасно вирішити реєстрацію, оплату, приїзд, паркування та документи.` },
        { q: 'Чи можна приїхати лише на один день?', a: `Захід задумано як вихідний досвід. Головна битва — у суботу, але важлива частина атмосфери виникає вже у четвер і п\'ятницю: табір, реєстрація, перевірки, п\'ятнична програма, дитяча гра, ярмарок, арени і вечірнє життя в таборі. Одноденна участь може бути можлива у виняткових випадках — обговори її з організаторами заздалегідь.` },
      ],
    },
    {
      id: 'novacci',
      label: 'Новачки і перша участь',
      icon: 'lucide:sparkles',
      items: [
        { q: 'З чого почати, якщо їду вперше?', a: `Почни зі сторінки <a href="${L('/pro-novacky/')}" class="underline">Для новачків</a>. Там знайдеш шлях крок за кроком: що це за захід, що таке LARP, як обрати армію, що взяти, як працює реєстрація і що чекає на місці.` },
        { q: 'Що найважливіше перед першою участю?', a: `Обрати армію, прочитати основні правила, підготувати костюм, зареєструватися, сплатити реєстраційний внесок протягом 10 днів, підготувати документи, прибути вчасно і не соромитися сказати, що ти новачок.` },
        { q: 'Що, якщо я їду сам і нікого там не знаю?', a: `Це абсолютно нормально. На захід часто приїжджають самі. Обери армію, прибудь вчасно і запитай під час реєстрації або в організаторів, куди приєднатися. Допоможе також написати нам заздалегідь. У Середзем\'ї дружини формуються швидше, ніж здається.` },
        { q: 'Чи допоможе мені хтось на місці?', a: `Так. Організатори, правителі, командири армій і досвідченіші гравці допоможуть. Якщо не знаєш, запитай. Краще запитати десять разів, ніж зробити щось погано в бою.` },
        { q: 'Чи треба вміти грати роль?', a: `Не мусиш бути актором. Достатньо простої основи: не ламати атмосферу, не вирішувати все поза грою, поводитися відповідно до своєї армії, поважати інших. Навіть звичайний воїн, гном, орк, гобіт чи супровід може створити чудову атмосферу.` },
      ],
    },
    {
      id: 'termin',
      label: 'Термін, місце та програма',
      icon: 'lucide:calendar-days',
      items: [
        { q: 'Коли проходить захід?', a: `Випуск 2026 проходить з <strong>20 до 23 серпня 2026</strong>. Четвер: приїзд, табір, реєстрація, перші зустрічі. П\'ятниця: супровідна програма, гра в таборі, дитяча гра, ярмарок, арени, підготовка. Субота: головна гра / битва. Неділя: збори, прибирання, від\'їзд. Актуальна інформація на <a href="${L('/organizacni-informace/')}" class="underline">Практична інформація</a>.` },
        { q: 'Де проходить захід?', a: `Захід проходить на півдні Моравії, в районі Křtiny / Bukovina. Точні інструкції щодо приїзду та інформація про місце на <a href="${L('/organizacni-informace/')}" class="underline">Практичній інформації</a> та в електронних листах для зареєстрованих учасників. Карта на сторінці <a href="${L('/mapa/')}" class="underline">Карта території</a>.` },
        { q: 'Коли головна битва?', a: `Головна гра і головна битва проходять <strong>у суботу</strong>. Але п\'ятниця — це не лише очікування суботи: це важлива частина вихідних з програмою, грою в таборі, дитячою грою, ярмарком і підготовкою.` },
        { q: 'Що відбувається у п\'ятницю?', a: `П\'ятниця належить табірному життю. Плануємо супровідну програму, ярмарок, арени, ігри, мікроквести, монети, дитячу гру і атмосферу в таборі. Більше на сторінці <a href="${L('/hra-v-tabore/')}" class="underline">Гра в таборі</a>.` },
        { q: 'Чи треба приїжджати вже у четвер?', a: `Не мусиш, але радимо. Матимеш більше часу поставити табір, пройти реєстрацію, владнати костюм, познайомитися зі своєю армією і налаштуватися. Хто приїжджає пізно, часто все вирішує поспіхом.` },
      ],
    },
    {
      id: 'registrace',
      label: 'Реєстрація, оплата та скасування',
      icon: 'lucide:credit-card',
      items: [
        { q: 'Як працює реєстрація?', a: `Реєстрація онлайн через систему Registračka.cz. Заповнюєш форму, обираєш сторону та армію, додаєш потрібні дані і після реєстрації отримуєш листа з інформацією про оплату. Деталі на сторінці <a href="${L('/registrace/')}" class="underline">Реєстрація</a>.`, faqSnippet: true },
        { q: 'Коли отримаю інформацію про оплату?', a: `Інформацію про оплату отримаєш одразу після реєстрації. Платити можна QR-кодом або переказом за інструкціями в листі.` },
        { q: 'До коли треба сплатити?', a: `Реєстраційний внесок треба сплатити <strong>протягом 10 днів від реєстрації</strong>. Якщо платіж не надійде, реєстрація може вважатися несплаченою.` },
        { q: 'Де знайти суму реєстраційного внеску?', a: `Огляд внесків, термінів та можливих доплат на сторінці <a href="${L('/registrace/')}" class="underline">Реєстрація</a>. Актуальна інформація також на <a href="${L('/organizacni-informace/')}" class="underline">Практичній інформації</a>.` },
        { q: 'Чи можу змінити армію після реєстрації?', a: `Так, але вирішуй це якнайшвидше. Напиши організаторам і вкажи, з якої армії в яку хочеш перейти. Зміна може бути обмежена ємністю або балансом сторін.` },
        { q: 'Чи можу передати реєстрацію іншому?', a: `Так, якщо встигнеш вчасно і домовишся з організаторами. Не надсилай заміну без домовленості — нам потрібні правильні дані учасника, вік, документи і призначення.` },
        { q: 'Що, якщо мені потрібне скасування?', a: `Скасування вирішуй якнайшвидше електронною поштою. Загалом діє: чим ближче до заходу, тим більше витрат уже сплачено. Детальні умови скасування в <a href="${L('/podminky-ucasti-a-registrace/')}" class="underline">Умовах реєстрації</a>.` },
        { q: 'Що, якщо не можу сплатити внесок?', a: `Зв\'яжись з нами. У деяких випадках ми можемо домовитися про допомогу, часткове відпрацювання внеску, допомогу в підготовці чи індивідуальне рішення. Ми не можемо обіцяти все всім, але якщо знатимемо вчасно, шукатимемо вихід.` },
      ],
    },
    {
      id: 'vek',
      label: 'Вік, батьки та діти',
      icon: 'lucide:baby',
      items: [
        { q: 'З якого віку можна брати участь у головній грі?', a: `Брати участь у головній грі як гравець можна з <strong>12 років</strong>. Для молодших дітей готуємо окрему <a href="${L('/detska-hra/')}" class="underline">дитячу гру</a>.`, faqSnippet: true },
        { q: 'Що потрібно учасникам до 18 років?', a: `Учасникам до 18 років потрібна роздрукована, заповнена і підписана заява / згода законного представника. Без неї ми не можемо допустити їх до гри. Деталі на сторінці <a href="${L('/pro-rodice/')}" class="underline">Для батьків</a>.` },
        { q: 'Чи може дитина приїхати сама?', a: `Гравці від 12 років можуть брати участь у головній грі. До 18 років нам потрібна підписана згода законного представника. Для осіб молодше 15 років обов\'язковий супровід дорослої особи (18+), яка за неї відповідає. Якщо дитина не їде безпосередньо з батьками, треба чітко вказати, хто за неї на заході відповідає.` },
        { q: 'Чи може дитина їхати з іншим дорослим, а не батьками?', a: `Так, але потрібна письмова згода законного представника і чітко вказана особа, відповідальна за дитину під час заходу.` },
        { q: 'Чи може батько/мати залишитися як супровід?', a: `Так. Батько/мати може приїхати як неграючий супровід, як гравець, як помічник або долучитися до дитячої гри. Супровід також має поважати атмосферу і ідеально мати простий костюм або принаймні нерізкий одяг. Більше в <a href="${L('/role/nebojovy-doprovod/')}" class="underline">Небойовому супроводі</a>.` },
        { q: 'Чи захід безпечний для дітей?', a: `Робимо максимум для безпечного перебігу: перевіряємо зброю, дотримуємося правил, маємо медика, організаторів у полі і чіткі інструкції. Водночас це активний захід просто неба в природі. Дрібний синяк чи подряпина можуть статися.` },
        { q: 'Чи рекомендуєте дітям захисне спорядження?', a: `Так. Молодшим учасникам однозначно рекомендуємо рукавиці, міцне взуття і відповідно до ролі — належний захист голови. Спорядження має бути безпечним і пасувати до костюма.` },
      ],
    },
    {
      id: 'armady',
      label: 'Армії, сторони та ролі',
      icon: 'lucide:flag',
      items: [
        { q: 'У чому різниця між стороною і армією?', a: `На заході дві головні сторони. У кожній стороні — окремі армії. Учасник обирає сторону і в її межах конкретну армію. Огляд на сторінці <a href="${L('/frakce/')}" class="underline">Армії</a>.` },
        { q: 'Як обрати армію?', a: `Обирай за атмосферою, костюмом, стилем гри і тим, що тебе приваблює. Не обирай лише за тим, хто подобається тобі в книзі чи фільмі. Важливо також, який костюм зможеш підготувати і чи буде комфортно в ролі.` },
        { q: 'Чи можу їхати як небойовий супровід?', a: `Так. Небойовий супровід — учасник, який є частиною атмосфери і табору, але не б\'ється. Для нього також діють вимога костюма та правила заходу. Більше на сторінці <a href="${L('/role/nebojovy-doprovod/')}" class="underline">Небойовий супровід</a>.` },
        { q: 'Чи можу їхати як фотограф або оператор?', a: `Так, але фотографи й оператори також мають дотримуватися правил. Вимога костюма поширюється на них. Якщо це неможливо, треба мати принаймні нерізкий одяг і домовитися з організаторами. Основне правило: <strong>якщо не схожий на мешканця Середзем\'я, не лізь у чужі кадри</strong>. Більше на сторінці <a href="${L('/role/fotografove-a-kameramani/')}" class="underline">Фотографи та оператори</a>.`, faqSnippet: true },
        { q: 'Чи можу їхати як помічник?', a: `Так. Помічники можуть допомагати за домовленістю з підготовкою, реєстрацією, інфраструктурою, дитячою грою, прибиранням чи іншими завданнями. Водночас можуть насолоджуватися заходом як звичайні учасники, якщо так домовимося. Залежно від обсягу можна обговорити знижку, відмову від внеску або харчування. Більше на сторінці <a href="${L('/role/pomocnici/')}" class="underline">Помічники</a>.` },
      ],
    },
    {
      id: 'kostymy',
      label: 'Костюми та спорядження',
      icon: 'lucide:shirt',
      items: [
        { q: 'Чи мушу мати костюм?', a: `Так. Костюм — частина гри й атмосфери. Він не мусить бути ідеальним, але має відповідати обраній армії, бути безпечним, придатним для природи і не заважати іншим.` },
        { q: 'Що потрібно для костюма?', a: `Основа проста: туніка чи сорочка, штани в нерізких кольорах, пояс, міцне взуття, головний убір, плащ або аксесуари відповідно до армії. У кожної армії свої кольори і стиль. Конкретні рекомендації в розділі <a href="${L('/frakce/')}" class="underline">Армії</a> та на сторінці <a href="${L('/pro-novacky/#kostym')}" class="underline">Для новачків — Костюм</a>.`, faqSnippet: true },
        { q: 'Чи має костюм бути історично точним?', a: `Ні. Це не історична реконструкція. Костюм має передусім вписуватися у фентезі-світ Середзем\'я, не виглядати цивільно і допомагати атмосфері.` },
        { q: 'Що, якщо я не маю жодного костюма?', a: `Почни просто. Звичайна туніка, плащ і нерізкі кольори краще цивільного одягу. Якщо не знаєш, напиши організаторам або поглянь на сторінку <a href="${L('/pro-novacky/')}" class="underline">Для новачків</a>.` },
        { q: 'Чи маєте прокат костюмів?', a: `Можемо мати обмежену кількість базових речей у позику, але не розраховуй на це автоматично. Домовся заздалегідь. Костюм передусім — відповідальність учасника.` },
        { q: 'Чи можу бути вдень у цивільному?', a: `Протягом заходу діє вимога костюма. Цивільний одяг суттєво заважає атмосфері. Якщо потрібно перевдягтися з практичних причин, роби це розумно поза основною ігровою зоною.` },
        { q: 'Яке взуття підходить?', a: `Міцне, зручне, нерізке і придатне для лісу. Ідеально темне або природне. Яскраве сучасне взуття псує атмосферу і часто непрактичне в природі.` },
      ],
    },
    {
      id: 'zbrane',
      label: 'Зброя, бій і правила',
      icon: 'lucide:swords',
      items: [
        { q: 'Чи можу взяти власну зброю?', a: `Так, але лише безпечну м\'якушовану ларпову зброю, яка пройде перевірку. Гостра, металева, надто жорстка чи неналежно змінена зброя не дозволена.` },
        { q: 'Що, якщо моя зброя не пройде перевірку?', a: `Не зможеш її використовувати. Радимо мати запасну зброю або заздалегідь порадитися з організаторами. Безпека важливіша за особисті вподобання.` },
        { q: 'Як працює бій?', a: `Бій імітований. Це не справжній бій і не спортивний поєдинок. Використовуються м\'якушовані зброя, діють правила зон влучань, життів і відродження. Влучання визнає той, кого вдарили. Граємо чесно. Деталі в <a href="${L('/pravidla/')}" class="underline">Правилах</a>.` },
        { q: 'Що означає „влучання визнає той, кого вдарили"?', a: `Коли тебе хтось правомірно вдаряє, ти сам визнаєш влучання. Не чекаєш, щоб тебе суперник змусив. Чесна гра — основа. Якщо не впевнений, краще визнай влучання.` },
        { q: 'Де знайти повні правила?', a: `На сторінці <a href="${L('/pravidla/')}" class="underline">Правила</a>. Радимо прочитати їх перед заходом і перед битвою повторити особливо безпеку, зброю, влучання та відродження.` },
        { q: 'Що, якщо не розумію правила?', a: `Запитай. Перед заходом електронною поштою, на місці в організаторів або досвідченіших гравців. Краще з\'ясувати неясності перед битвою, ніж під час неї.` },
      ],
    },
    {
      id: 'bezpecnost',
      label: 'Безпека і здоров\'я',
      icon: 'lucide:shield-check',
      items: [
        { q: 'Що, якщо я отримаю травму?', a: `На заході присутній медик. Якщо отримаєш травму, припини гру, попередь оточення і знайди організатора або медика. У серйознішій ситуації — діяй за кризовими інструкціями. Деталі в <a href="${L('/bezpecnost/')}" class="underline">Безпека і кризові ситуації</a>.`, faqSnippet: true },
        { q: 'Чи на заході є медик?', a: `Так. Протягом заходу на місці медик з обладнанням для базової допомоги.` },
        { q: 'Що з алергією, ліками чи обмеженнями здоров\'я?', a: `Вкажи це в реєстрації і візьми потрібні ліки з собою. Якщо це важливо для безпечного перебігу, повідом на місці організаторів або медика.` },
        { q: 'Чи можу йти в битву під впливом алкоголю?', a: `Ні. Ніхто не може йти в битву під впливом алкоголю чи інших засобів. Безпека інших важливіша за бажання „зіграти ще".` },
        { q: 'Що, якщо не почуваюся безпечно або маю проблему з іншим учасником?', a: `Звернися до організатора. Якщо на заході є довірена особа, можеш звернутися й до неї. Повага, особисті межі і безпека — частина правил.` },
        { q: 'Що діє в кризовій ситуації?', a: `Головне правило: зберігай спокій, дотримуйся вказівок організаторів і не поширюй неперевірену інформацію. У разі травми, пожежі, бурі, втраченої дитини чи іншої серйозної ситуації звернися до найближчого організатора.` },
      ],
    },
    {
      id: 'taboreni',
      label: 'Табір, харчування та інфраструктура',
      icon: 'lucide:tent',
      items: [
        { q: 'Де спимо?', a: `У власних наметах у таборі. Табір — частина атмосфери. Якщо маєш сучасний намет, постав і налаштуй його так, щоб якомога менше псував довкілля.` },
        { q: 'Чи є на місці питна вода?', a: `Так, на місці буде забезпечена питна вода. Усе ж радимо мати власну ємність на воду, флягу або пляшку.` },
        { q: 'Чи є на місці їжа?', a: `На місці працює корчма U Zeleného draka, де можна замовити їжу та напої за їхніми можливостями. Організатори централізовано не забезпечують харчування для кожного учасника. За їжу під час вихідних відповідає кожен сам.` },
        { q: 'Чи брати власний посуд?', a: `Так, рекомендуємо власну миску, столові прибори, кухоль або корбель. Це практичніше, атмосферніше і допомагає зменшити сміття.` },
        { q: 'Чи є на місці душові й електрика?', a: `Розраховуй на табірний рівень комфорту. Не очікуй готелю, розетки біля намету чи ванної за рогом. Актуальна інформація про інфраструктуру буде на <a href="${L('/organizacni-informace/')}" class="underline">Практичній інформації</a>.` },
        { q: 'Чи можу розкладати вогонь?', a: `Лише в визначених місцях і за вказівками організаторів. Власні вогнища чи втручання в природу без згоди організаторів не дозволені.` },
        { q: 'Що зі сміттям?', a: `Сміття — у визначені мішки чи контейнери. Мета: щоб після нас на місці залишилися лише прим\'ята трава й гарні спогади.` },
      ],
    },
    {
      id: 'doprava',
      label: 'Транспорт і паркування',
      icon: 'lucide:car',
      items: [
        { q: 'Чи можу приїхати автомобілем?', a: `Так. Дотримуйся вказівок щодо приїзду і паркування. Місце в природі, доступ може бути обмежений. Карта території на сторінці <a href="${L('/mapa/')}" class="underline">Карта території</a>.` },
        { q: 'Чи потрібна паркувальна картка?', a: `Так — якщо приїжджаєш авто, підготуй паркувальну картку за вказівками організаторів. Радимо роздрукувати і покласти за скло.` },
        { q: 'Чи можу їхати авто аж до намету?', a: `Лише за вказівками організаторів. У таборі чи ігровій зоні вільної їзди немає. Поважай розмітку і волонтерів на парковці.` },
        { q: 'Як швидко їхати під\'їзною дорогою?', a: `Повільно. Ґрунтові й лісові дороги — не гоночна траса. Дотримуйся вказівок організаторів і їдь дбайливо щодо людей, авто, природи та місцевих мешканців.` },
        { q: 'Чи можна дістатися громадським транспортом?', a: `Опції громадського транспорту опишемо на <a href="${L('/organizacni-informace/')}" class="underline">Практичній інформації</a> або в брифінгах перед заходом. Зважай, що частину шляху, можливо, доведеться пройти пішки.` },
      ],
    },
    {
      id: 'detska-hra',
      label: 'Дитяча гра',
      icon: 'lucide:sparkles',
      items: [
        { q: 'Для кого дитяча гра?', a: `Дитяча гра орієнтована приблизно на дітей від 5 до 10 років. Молодші діти, приблизно 3–5 років, можуть брати участь лише у супроводі батька/матері або відповідальної дорослої особи.`, faqSnippet: true },
        { q: 'Коли дитяча гра проходить?', a: `Програма дитячої гри запланована переважно на п\'ятницю та суботу. Передбачені активності на луці, творчість, рухливі ігри, лісові активності, стежка відваги і суботня гра по станціях. Деталі на сторінці <a href="${L('/detska-hra/')}" class="underline">Дитяча гра</a>.` },
        { q: 'Чи можу йти в головну битву і залишити дитину на дитячій грі?', a: `Для старших дітей у межах дитячої гри — так, якщо виконано умови організаторів і дитина здатна функціонувати в програмі без постійної присутності батьків. Для молодших дітей хочемо супроводу батьків або відповідальної особи. Точні умови будуть на сторінці <a href="${L('/detska-hra/')}" class="underline">Дитяча гра</a>.` },
        { q: 'Чи цінуєте допомогу батьків з дитячою грою?', a: `Так, дуже. Якщо їдеш з дітьми і хочеш долучитися, напиши нам. Допомога батьків з активностями, наглядом чи дрібною організацією дуже корисна.` },
        { q: 'Як зареєструвати дитину на дитячу гру?', a: `Через Registračka.cz. Зареєструй принаймні одного з батьків і додай дітей як пов\'язаних осіб у особистій картці. Потім запиши їх до секції „дитяча гра", якщо так указано в реєстрації. Більше на сторінці <a href="${L('/pro-rodice/#prihlasit')}" class="underline">Для батьків — Як зареєструвати дитину</a>.` },
        { q: 'Чи маєте сімейний максимум реєстраційного внеску?', a: `Так, для родин плануємо максимальну межу реєстраційного внеску. Точні суми та умови на сторінці <a href="${L('/registrace/')}" class="underline">Реєстрація</a>.` },
      ],
    },
    {
      id: 'fotky',
      label: 'Фото, відео та медіа',
      icon: 'lucide:camera',
      items: [
        { q: 'Чи можу фотографувати на заході?', a: `Так, але з повагою до інших, правил і атмосфери. Якщо хочеш фотографувати помітніше, рухатися ігровою зоною чи знімати матеріали для публікації, домовся з організаторами.` },
        { q: 'Чи мушу як фотограф мати костюм?', a: `Так — вимога костюма поширюється і на фотографів та операторів. Якщо це неможливо, май принаймні темний нерізкий одяг і домовся з організаторами. Спробуємо допомогти з позикою або зміною вигляду.` },
        { q: 'Чи можу знімати відео?', a: `Так, але діють ті самі правила, що для фото. Не заважай грі, не лізь у чужі кадри, поважай вказівки організаторів і учасників, які не хочуть бути помітно знятими.` },
        { q: 'Чи будуть з заходу офіційні фото?', a: `Так, якщо матимемо домовлених фотографів. Фото та відео з заходу з\'являться згодом у розділі <a href="${L('/fotky-a-video/')}" class="underline">Фото і відео</a>.` },
        { q: 'Де знайти медіакіт?', a: `Інформація для медіа на сторінці <a href="${L('/pro-media/')}" class="underline">Для медіа</a>.` },
      ],
    },
    {
      id: 'stankari',
      label: 'Стендисти і продавці',
      icon: 'lucide:store',
      items: [
        { q: 'Чи можу мати стенд на заході?', a: `Так, за домовленістю з організаторами. Особливо підходять тематичні товари, ремесла, костюмні аксесуари, шкіряні вироби, прикраси, ларпове спорядження, фентезі-тематика тощо.` },
        { q: 'Чи можу приїхати з гастро-стендом?', a: `Гастро-операторів треба узгоджувати індивідуально заздалегідь. На місці маємо ексклюзивну домовленість з корчмою U Zeleného draka, тому участь додаткових гастро-стендів завжди обговорюємо і з ними.` },
        { q: 'Чи може стендист брати участь у грі?', a: `Так. Стендисти можуть брати участь у грі та активностях на власний розсуд. Організатори, однак, не забезпечують нагляд над стендом за відсутності власника.` },
        { q: 'Як стендистові реєструватися?', a: `Або як неграючий учасник, або як гравець, якщо хоче долучитися до гри. Деталі варто домовляти з організаторами заздалегідь.` },
        { q: 'Чи будете рекламувати стендистів?', a: `Так. Маємо сторінку <a href="${L('/stanky-a-prodejci/')}" class="underline">Стенди та продавці</a>, де публікуємо інформацію про підтверджених стендистів. Радо додамо й тебе, якщо домовимося про участь.` },
      ],
    },
    {
      id: 'pomocnici',
      label: 'Помічники та волонтери',
      icon: 'lucide:hand-helping',
      items: [
        { q: 'Як можу допомогти із заходом?', a: `Допомогти можеш з підготовкою, реєстрацією, інфраструктурою, водою, дровами, дитячою грою, прибиранням, логістикою, дрібним ремонтом або недільним пакуванням.` },
        { q: 'Чи означає допомога, що не насолоджуся заходом?', a: `Не обов\'язково. Помічники допомагають за домовленістю і можуть насолоджуватися заходом і як звичайні учасники. Залежить від обсягу залучення і конкретної домовленості.` },
        { q: 'Чи отримаю знижку за допомогу?', a: `Залежно від обсягу можливі знижка, відмова від внеску або забезпечення харчуванням. Узгоджується індивідуально.` },
        { q: 'Як зареєструватися як помічник?', a: `Напиши організаторам, що вмієш, коли можеш допомогти і чи хочеш водночас грати. Більше на сторінці <a href="${L('/role/pomocnici/')}" class="underline">Помічники</a>.` },
      ],
    },
    {
      id: 'zmeny',
      label: 'Зміни, погода та надзвичайні ситуації',
      icon: 'lucide:cloud-rain',
      items: [
        { q: 'Чи захід проходить за будь-якої погоди?', a: `Звичайний дощ, холод чи хмарне небо — не привід скасовувати. Готуйся до вихідних просто неба і візьми спорядження для дощу й холоду.` },
        { q: 'Що, якщо буде гроза, шквал чи небезпечна погода?', a: `Якщо погода загрожуватиме безпеці учасників, рішення приймають організатори. Може бути коригування програми, перенос, призупинення гри або в крайньому випадку — скасування.` },
        { q: 'Що, якщо організатори мають скасувати незадовго до заходу?', a: `Якщо доведеться скасувати з причин форс-мажору — наприклад, шквалу, повалених дерев чи проблем у таборі — намагатимемося повернути учасникам максимум коштів, які ще не витрачено і які розумно повертаються. Частина витрат на той час може бути вже сплачена і неповоротна. Подробиці в <a href="${L('/podminky-ucasti-a-registrace/')}" class="underline">Умовах реєстрації</a>.` },
        { q: 'Що, якщо зміниться місце проведення?', a: `Зміна місця можлива. Не змінює ціни чи дійсності реєстрації. Повідомимо електронною поштою і на сайті.` },
        { q: 'Що, якщо зміниться дата?', a: `При зміні дати переносимо реєстрацію на новий термін. Розуміємо, що твоя доступність може змінитися — у такому випадку дозволимо повернути реєстраційний внесок.` },
        { q: 'Як дізнаюся про важливі зміни?', a: `Електронною поштою, через сайт і, можливо, соціальні мережі. Для зареєстрованих учасників основний канал — електронна адреса з реєстрації.` },
      ],
    },
    {
      id: 'registracka',
      label: 'Registračka, дані та техніка',
      icon: 'lucide:database',
      items: [
        { q: 'Через яку систему проходить реєстрація?', a: `Реєстрація через Registračka.cz. Систему обслуговує Moravian LARP, ми використовуємо її для заявок на наші заходи.` },
        { q: 'Кому передаєте дані з реєстрації?', a: `Дані передаємо лише організаторам конкретного заходу, для якого вони потрібні. Більше в <a href="${L('/gdpr/')}" class="underline">GDPR / Захист персональних даних</a>.` },
        { q: 'Що, якщо не отримав підтверджувального листа?', a: `Перевір спам, масову пошту і правильність електронної адреси. Якщо нічого не знайшов, напиши нам і вкажи ім\'я, яке використовував для реєстрації.` },
        { q: 'Що, якщо я зробив помилку в реєстрації?', a: `Напиши організаторам на <a href="mailto:info@panprstenu.cz" class="underline">info@panprstenu.cz</a>. Вкажи ім\'я, електронну адресу з реєстрації і що треба виправити.` },
        { q: 'Де знайти список зареєстрованих учасників?', a: `Список зареєстрованих на сторінці <a href="${L('/kdo-jede/')}" class="underline">Хто їде</a>. Учасники там бачитимуть, хто їде і як заповнюються сторони та армії.` },
      ],
    },
  ];
}
