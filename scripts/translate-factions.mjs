/**
 * Překlad i18n bloků v YAML souborech frakcí (en/de/sk/uk).
 * Datum: 2026-05-04
 *
 * Použití: node scripts/translate-factions.mjs
 *
 * Skript načte CS hodnoty (jako pravdu), zachová existující name/tagline v cílových
 * jazycích a doplní/přepíše ostatní pole překlady z níže uvedených tabulek.
 *
 * Pozn.: Tolkienovské vlastní jména držíme v lokalizovaných formách:
 *   en: Gondor, Rohan, Mordor, Rivendell, Lothlórien, Mirkwood, Erebor, Dale,
 *       Misty Mountains, Iron Hills, Grey Havens, Helm's Deep, Edoras, …
 *   de: Gondor, Rohan, Mordor, Bruchtal, Lothlórien, Düsterwald, Erebor, Esgaroth,
 *       Nebelgebirge, Eisengebirge, Graue Anfurten, Helms Klamm, …
 *   sk: Gondor, Rohan, Mordor, Roklinka, Lothlórien, Temný hvozd, Erebor, …
 *   uk: Ґондор, Роган, Мордор, Рівенділл, Лотлоріен, Морок-ліс, Еребор, …
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FACTIONS_DIR = path.resolve(__dirname, '..', 'src', 'content', 'factions');

// Pomocná funkce: replikuje strukturu i18n.cs do cílového jazyka pomocí překladu T.
// T je objekt s klíči: name?, tagline?, combat_style[], recommended_for[],
// not_recommended_for[], tags[], newbie_costume_hint, camp_hook,
// costume_colors_text, heraldry_text, ruler{name,title,description}?, lore_sections[].
function buildLang(cs, T, existing = {}) {
  const out = {
    name: T.name ?? existing.name ?? cs.name,
    tagline: T.tagline ?? existing.tagline ?? cs.tagline,
  };
  if (cs.combat_style) out.combat_style = T.combat_style ?? cs.combat_style;
  if (cs.recommended_for) out.recommended_for = T.recommended_for ?? cs.recommended_for;
  if (cs.not_recommended_for) out.not_recommended_for = T.not_recommended_for ?? cs.not_recommended_for;
  if (cs.tags) out.tags = T.tags ?? cs.tags;
  if (cs.newbie_costume_hint !== undefined) out.newbie_costume_hint = T.newbie_costume_hint ?? cs.newbie_costume_hint;
  if (cs.camp_hook !== undefined) out.camp_hook = T.camp_hook ?? cs.camp_hook;
  if (cs.costume_colors_text !== undefined) out.costume_colors_text = T.costume_colors_text ?? cs.costume_colors_text;
  if (cs.heraldry_text !== undefined) out.heraldry_text = T.heraldry_text ?? cs.heraldry_text;
  if (cs.ruler) {
    out.ruler = {
      name: T.ruler?.name ?? cs.ruler.name,
      title: T.ruler?.title ?? cs.ruler.title,
      description: T.ruler?.description ?? cs.ruler.description,
    };
  }
  if (cs.lore_sections) {
    out.lore_sections = cs.lore_sections.map((sec, i) => ({
      title: T.lore_sections?.[i]?.title ?? sec.title,
      paragraphs: sec.paragraphs.map((p, j) => T.lore_sections?.[i]?.paragraphs?.[j] ?? p),
    }));
  }
  return out;
}

// ============================================================================
// PŘEKLADOVÉ TABULKY
// Klíčování: TRANSLATIONS[filename][lang] = T objekt.
// Pro každý soubor uvádíme všechny 4 cílové jazyky.
// ============================================================================

const TRANSLATIONS = {};

// ---------- ELVES ----------
TRANSLATIONS['elves.yml'] = {
  en: {
    name: 'Elves',
    tagline: 'The Firstborn, memory of ages',
    combat_style: ['light infantry', 'archers', 'fencers with light weapons'],
    recommended_for: [
      'players seeking an aesthetic and poetic style',
      'players who want strong roleplay',
      'more experienced participants',
    ],
    not_recommended_for: [
      'players who only want fast combat',
      'players without time for a more detailed costume',
    ],
    tags: ['free people', 'higher costume difficulty', 'strong roleplay'],
    newbie_costume_hint:
      'Layered tunics in earthy or pale tones, a cloak, a belt, optionally elf ears. Detail and aesthetics make a real difference.',
    camp_hook:
      'The Elven camp sings in two tongues, plays on lyres and keeps a quiet space for contemplation by the river of time.',
    costume_colors_text: 'green, brown',
    heraldry_text: 'according to the kings and lords under whom they serve',
    ruler: {
      name: 'Elrond',
      title: 'Lord of Rivendell, Half-elven of the House of Eärendil',
      description:
        'Sage, host of the Council, leader of the Elven companies. Quiet of bearing, weighty in word, in battle as practised as any. An Elf player recognises his command by slow yet unstoppable manoeuvres — an Elven company does not flee and does not break its oath.',
    },
    lore_sections: [
      {
        title: 'About the company of Elves of the Golden Wood',
        paragraphs: [
          'Each warrior equips himself with gear and arms according to his means and station, and his place in battle follows accordingly. Owing to the recent war in the deep forests, the host is rather lightly armoured. Common warriors usually wear only leather or light gambesons with leather accessories. Better-armoured fighters are rare. Their garments are of strong, sturdy cloth in natural colours, only mildly adorned, but the ornamentation is full of elegance. The dominant colours are green, brown and grey, with golden or silver accents. Whoever has no helmet (Elven variants of human kettle hats or barbutes) covers his head with an arming cap and a leather coif. For uncovered heads, prominent pointed ears are essential.',
          'Most Elven forces serve as scouts and skirmishers armed with bows, long knives and curved Elven swords. There are also spearmen, armed with a long spear or its shorter variant, complemented by an elongated or small round shield. As side-arms, again, swords and long knives. Maces and other crushing weapons are foreign to the Elves.',
        ],
      },
      {
        title: 'About the company of Elves of Mirkwood',
        paragraphs: [
          'The Elves of Mirkwood are not as exalted as their kin from the fading Realms. They too are tall, slender, beardless, with long hair and markedly pointed ears. Their garments are of strong, sturdy cloth in natural colours. The dominant colours are dark green and brown. The garments are only mildly adorned. Each warrior equips himself with gear and arms according to his means and station, and his place in battle follows accordingly.',
          'Owing to the recent war in the deep forests, the host is rather lightly armoured. Common warriors usually wear only leather or light gambesons with leather accessories. Better-armoured fighters are rare. Mail and scale armour are the standard of nobles and the royal guard.',
          'Armour includes tall helmets with cheek-guards — Elven variants of human kettle hats or barbutes. Whoever has no helmet covers his head with an arming cap and a leather coif. Even the poorest do not go bare-headed. The remaining Elven forces serve as scouts and skirmishers armed with bows, long knives and curved Elven swords. There are also spearmen, armed with a long spear or its shorter variant, complemented by an elongated or small round shield. As side-arms, again, swords and long knives. The spearmen are flanked by a shield-line of fencers with swords or axes. Maces and other crushing weapons are foreign to the Elves.',
        ],
      },
      {
        title: 'Elves in Middle-earth',
        paragraphs: [
          'The Elves, the elder folk, are the first thinking beings to walk Middle-earth, and they practically do not age and do not die from old age or bodily wear. From Men they are at first sight distinguished by their pointed, tapering ears, and unlike Men they typically have a slim build of average height and an essentially beardless face.',
          'Despite their longevity, only few Elves remain in Middle-earth, and their number ever dwindles — they die in fights against evil or sail in their slender ships to the Undying Lands beyond the sea in the West. There are four notable Elven settlements in Middle-earth, each inhabited by a different kindred of Elves, of very different histories. One lies in the Grey Havens on the western coast of Middle-earth, where Círdan, the shipwright, rules his people. He is probably the oldest Elf still remaining in Middle-earth. Another kindred is settled in Rivendell beneath the Misty Mountains and is ruled by Elrond Half-elven. Elrond was a member of the White Council and is the father of Arwen Undómiel, the present Queen of Gondor. Beyond the Misty Mountains lies the forest kingdom of Lothlórien, ruled by Celeborn and Galadriel. In the former Mirkwood, now the Wood of Greenleaves, rules the king of the Wood-elves, Thranduil, father of Prince Legolas, member of the Fellowship of the Ring.',
          'Recently there has been talk of the Court of Autumn in the region of Ered Luin, where supposedly resides the last distant branch of the House of Fëanor. The reports are still unclear.',
          'Elven kindreds are quite strictly bound by hierarchy throughout the whole community. At the top of the pyramid stands the ruler of the kindred, usually a king, whose word is law, sword and judgment for all his people. By opposing the will of a higher-placed person one earns the disfavour of the whole community, in worse cases even banishment and exclusion from the kindred. The same enmity is meted out to anyone who would help such outcasts. On the other hand, loyal members of the community are rewarded with protection and aid among all Elves, and a helping hand is also offered to anyone who has ever supported the Elves.',
        ],
      },
    ],
  },
  de: {
    name: 'Elben',
    tagline: 'Die Erstgeborenen, Gedächtnis der Zeitalter',
    combat_style: ['leichte Infanterie', 'Bogenschützen', 'Fechter mit leichten Waffen'],
    recommended_for: [
      'Spieler, die einen ästhetischen und poetischen Stil suchen',
      'Spieler, die ein ausgeprägtes Rollenspiel wollen',
      'erfahrenere Teilnehmer',
    ],
    not_recommended_for: [
      'Spieler, die nur schnell kämpfen wollen',
      'Spieler ohne Zeit für ein detaillierteres Kostüm',
    ],
    tags: ['Freies Volk', 'höhere Kostümanforderung', 'starkes Rollenspiel'],
    newbie_costume_hint:
      'Geschichtete Tuniken in erdigen oder hellen Tönen, ein Mantel, ein Gürtel, gegebenenfalls spitze Ohren. Details und Ästhetik machen viel aus.',
    camp_hook:
      'Das Lager der Elben singt in zwei Sprachen, spielt auf Leiern und bietet Raum für stille Betrachtung am Strom der Zeit.',
    costume_colors_text: 'Grün, Braun',
    heraldry_text: 'gemäß den Königen und Hausherren, denen sie dienen',
    ruler: {
      name: 'Elrond',
      title: 'Herr von Bruchtal, Halbelb aus dem Hause Eärendils',
      description:
        'Weiser, Gastgeber des Rates, Anführer elbischer Trupps. Stiller Gestalt, schwer im Wort, im Kampf so erfahren wie kaum ein anderer. Der Spieler eines Elben erkennt seine Führung an langsamen, doch unaufhaltsamen Bewegungen — ein elbischer Trupp flieht nicht und bricht keinen Eid.',
    },
    lore_sections: [
      {
        title: 'Über die Elbentruppe aus dem Goldenen Wald',
        paragraphs: [
          'Jeder Krieger rüstet sich nach seinen Möglichkeiten und seinem Stand, und entsprechend ist auch seine Rolle im Kampf. Wegen des jüngsten Krieges tief in den Wäldern ist das Heer eher leicht gerüstet. Gewöhnliche Krieger tragen meist nur Leder- oder leichte Steppwesten mit ledernen Akzenten. Besser Gepanzerte sind selten. Ihre Gewänder sind aus festem, robustem Stoff in Naturfarben, nur leicht verziert, aber die Verzierung verliert nie ihre Eleganz. Vorherrschende Farben sind Grün, Braun und Grau mit goldenen oder silbernen Akzenten. Wer keinen Helm hat (elbische Varianten der menschlichen Eisenhüte oder Barbuten), bedeckt das Haupt mit Polsterhaube und Lederkappe. Bei unbedecktem Haupt sind ausgeprägt spitze Ohren unerlässlich.',
          'Die meisten elbischen Streitkräfte dienen als Späher und Plänkler, bewaffnet mit Bogen, langen Messern und gebogenen elbischen Schwertern. Es fehlen aber auch keine Speerträger, bewaffnet mit langem Speer oder seiner kürzeren Variante samt länglichem oder kleinem Rundschild. Als Seitenwaffen dienen wieder Schwerter und lange Messer. Streitkolben und andere wuchtende Waffen sind den Elben fremd.',
        ],
      },
      {
        title: 'Über die Elbentruppe aus dem Düsterwald',
        paragraphs: [
          'Die Elben des Düsterwalds sind nicht so erhaben wie ihre Verwandten aus den verlöschenden Reichen. Auch sie sind groß, schlank, bartlos, mit langen Haaren und ausgeprägt spitzen Ohren. Ihr Gewand ist aus festem, robustem Stoff in Naturfarben. Vorherrschende Farben sind dunkles Grün und Braun. Die Gewänder sind nur leicht verziert. Jeder Krieger rüstet sich nach Möglichkeiten und Stand, und entsprechend ist auch seine Rolle im Kampf.',
          'Wegen des jüngsten Krieges tief in den Wäldern ist das Heer eher leicht gerüstet. Gewöhnliche Krieger tragen meist nur Leder- oder leichte Steppwesten mit ledernen Akzenten. Besser Gepanzerte sind selten. Ketten- und Schuppenrüstungen sind Standard der Adligen und der königlichen Garde.',
          'Zu den Rüstungen gehören hohe Helme mit Wangenklappen, elbische Varianten der menschlichen Eisenhüte oder Barbuten. Wer keinen Helm hat, bedeckt das Haupt mit Polsterhaube und Lederkappe. Selbst die ärmsten gehen nicht barhäuptig. Die verbliebenen elbischen Kräfte dienen als Späher und Plänkler, bewaffnet mit Bogen, langen Messern und gebogenen elbischen Schwertern. Es fehlen aber auch keine Speerträger, bewaffnet mit langem Speer oder seiner kürzeren Variante samt länglichem oder kleinem Rundschild. Als Seitenwaffen dienen wieder Schwerter und lange Messer. Die Speerträger werden durch eine Schildreihe von Fechtern mit Schwertern oder Äxten ergänzt. Streitkolben und andere wuchtende Waffen sind den Elben fremd.',
        ],
      },
      {
        title: 'Die Elben in Mittelerde',
        paragraphs: [
          'Die Elben, das ältere Volk, sind die ersten denkenden Wesen, die Mittelerde durchschreiten, und sie altern praktisch nicht und sterben nicht aus hohem Alter oder Verschleiß des Körpers. Von den Menschen unterscheiden sie sich auf den ersten Blick durch ihre spitz zulaufenden Ohren, und im Gegensatz zu den Menschen haben sie meist eine schlanke, durchschnittlich große Gestalt und ein praktisch bartloses Gesicht.',
          'Trotz ihrer Langlebigkeit sind nur wenige Elben in Mittelerde geblieben, und ihre Zahl nimmt stetig ab — sie sterben in Kämpfen gegen das Böse oder fahren auf ihren schlanken Schiffen in die Unsterblichen Lande jenseits des Meeres im Westen. In Mittelerde gibt es vier bedeutende Elbensiedlungen, jede von einem anderen Geschlecht der Elben mit sehr unterschiedlicher Geschichte bewohnt. Eine liegt in den Grauen Anfurten an der Westküste Mittelerdes, wo Círdan, der Schiffsbauer, sein Volk regiert. Er ist wohl der älteste Elb, der noch in Mittelerde geblieben ist. Ein weiteres Geschlecht der Elben ist in Bruchtal unter dem Nebelgebirge ansässig und wird von Elrond Halbelb regiert. Elrond war Mitglied des Weißen Rates und ist der Vater Arwen Undómiels, der gegenwärtigen Königin von Gondor. Jenseits des Nebelgebirges liegt das Waldreich Lothlórien, das von Celeborn und Galadriel regiert wird. Im einstigen Düsterwald, nun Wald der Grünblätter, regiert der König der Waldelben, Thranduil, Vater des Prinzen Legolas, Mitglied der Gemeinschaft des Rings.',
          'Neuerdings spricht man vom Hof des Herbstes im Lande Ered Luin, wo angeblich der letzte ferne Zweig des Hauses Fëanor seinen Sitz hat. Die Berichte sind bislang unklar.',
          'Die Elbengeschlechter sind durchgehend streng durch eine Hierarchie verbunden. An der Spitze der Pyramide steht der Herrscher des Geschlechts, in der Regel ein König, dessen Wort Gesetz, Schwert und Gericht für all sein Volk ist. Wer dem Willen einer höhergestellten Person widerspricht, zieht sich die Ungnade der ganzen Gemeinschaft zu, in schlimmeren Fällen Verbannung und Ausschluss aus dem Geschlecht. Mit demselben Groll wird verfolgt, wer solchen Abtrünnigen helfen wollte. Andererseits werden treue Mitglieder der Gemeinschaft durch Schutz und Hilfe unter allen Elben belohnt, und ebenso wird jedem die Hand gereicht, der die Elben einst unterstützt hat.',
        ],
      },
    ],
  },
  sk: {
    name: 'Elfovia',
    tagline: 'Prvorodení, pamäť vekov',
    combat_style: ['ľahká pechota', 'lukostrelci', 'šermiari s ľahkými zbraňami'],
    recommended_for: [
      'hráči hľadajúci estetický a poetický štýl',
      'hráči, ktorí chcú výrazný roleplay',
      'skúsenejší účastníci',
    ],
    not_recommended_for: [
      'hráči, ktorí chcú len rýchlo bojovať',
      'hráči bez času na detailnejší kostým',
    ],
    tags: ['slobodný národ', 'vyššia kostýmová náročnosť', 'výrazný roleplay'],
    newbie_costume_hint:
      'Vrstvené tuniky v zemitých alebo svetlých tónoch, plášť, opasok, prípadne uši. Detaily a estetika robia veľa.',
    camp_hook:
      'Tábor elfov spieva v dvoch jazykoch, hrá na lýrach a má priestor na tichú kontempláciu pri rieke času.',
    costume_colors_text: 'zelená, hnedá',
    heraldry_text: 'podľa kráľov a domácich pánov, ktorým slúžia',
    ruler: {
      name: 'Elrond',
      title: 'Pán Roklinky, polelf z domu Eärendilovho',
      description:
        'Mudrc, hostiteľ Rady, predák elfských oddielov. Postavou tichý, slovom vážený, v boji skúsený ako málokto. Hráč elfov spoznáva jeho vedenie podľa pomalých, no nezadržateľných manévrov — elfí oddiel neuteká a nezrieka sa prísahy.',
    },
    lore_sections: [
      {
        title: 'O jednotke elfov zo Zlatého lesa',
        paragraphs: [
          'Výstroj a výzbroj si každý bojovník zaobstaráva sám podľa svojich možností a postavenia. Tomu zodpovedá aj jeho bojové zaradenie. Vzhľadom na poslednú vojnu v hĺbke lesov je armáda skôr ľahkoodená. Bežní bojovníci majú väčšinou len kožené alebo ľahké prešívané zbroje s koženými doplnkami. Lepšie obrnení sú vzácni. Ich odev je zo silnej pevnej látky prírodných farieb. Odevy sú zdobené iba mierne, no zdobenie nepostráda eleganciu. Prevažujúcimi farbami sú zelená, hnedá a sivá so zlatými alebo striebornými doplnkami. Kto nemá prilbu (elfské variácie na ľudský šľap alebo barbuty), prikryje hlavu batvatom s koženou čiapkou. Pri hlavách nezakrytých prilbou sú nutné výrazné špicaté uši.',
          'Väčšina elfských síl plní úlohu zvedov a záškodníkov vyzbrojených lukmi, dlhými nožmi a elfskými prehnutými mečmi. Nechýbajú ani kopijníci vyzbrojení dlhým kopijou alebo jeho kratšou variantou, doplnenou o podlhovastý či malý kruhový štít. Ako pobočné zbrane opäť slúžia meče a dlhé nože. Palice a iné drvivé zbrane sú elfom cudzie.',
        ],
      },
      {
        title: 'O jednotke elfov z Temného hvozdu',
        paragraphs: [
          'Elfovia z Temného hvozdu nie sú takí vznešení ako ich príbuzní z hasnúcich Ríš. Aj oni sú vysokí, štíhli, bez fúzov, s dlhými vlasmi a výrazne zašpicatenými ušami. Ich odev je zo silnej pevnej látky prírodných farieb. Prevažujúcimi farbami sú tmavozelená a hnedá. Odevy sú zdobené iba mierne. Výstroj a výzbroj si každý bojovník zaobstaráva sám podľa svojich možností a postavenia. Tomu zodpovedá aj jeho bojové zaradenie.',
          'Vzhľadom na poslednú vojnu v hĺbke lesov je armáda skôr ľahkoodená. Bežní bojovníci majú väčšinou len kožené alebo ľahké prešívané zbroje s koženými doplnkami. Lepšie obrnení sú vzácni. Krúžkové, šupinové zbroje sú štandardom šľachticov a kráľovskej gardy.',
          'Ku zbrojiam patria vysoké prilby s lícnicami, elfské variácie na ľudský šľap alebo barbuty. Kto nemá prilbu, prikryje hlavu batvatom s koženou čiapkou. Ani najväčší chudobní nechodia prostovlasí. Zvyšky elfských síl plnia úlohu zvedov a záškodníkov vyzbrojených lukmi, dlhými nožmi a elfskými prehnutými mečmi. Nechýbajú ani kopijníci vyzbrojení dlhým kopijou alebo jeho kratšou variantou, doplnenou o podlhovastý či malý kruhový štít. Ako pobočné zbrane opäť slúžia meče a dlhé nože. Kopijníkov dopĺňa štítová rada šermiarov s mečmi alebo sekerami. Palice a iné drvivé zbrane sú elfom cudzie.',
        ],
      },
      {
        title: 'Elfovia v Stredozemi',
        paragraphs: [
          'Elfovia, starší ľud, sú prvými mysliacimi bytosťami, ktoré kráčajú Stredozemou, prakticky nestarnú a neumierajú z dôvodu vysokého veku ani opotrebovania tela. Od ľudí ich na prvý pohľad odlišujú do špica predĺžené uši a na rozdiel od ľudí majú zvyčajne štíhlu, priemerne vysokú postavu a prakticky bezfúzatú tvár.',
          'I napriek ich dlhovekosti elfov v Stredozemi zostáva málo a stále ubúdajú — umierajú v bojoch so zlom alebo odplávajú na svojich štíhlych lodiach do Krajín neumierajúcich za morom na západe. V Stredozemi existujú štyri významné sídla elfov, pričom každé je osídlené iným rodom elfov s veľmi odlišnou históriou. Jedno leží v Šedých prístavoch na západnom pobreží Stredozeme, kde svojmu ľudu vládne Círdan, staviteľ lodí. Ide pravdepodobne o najstaršieho elfa, ktorý ešte zostal v Stredozemi. Ďalší rod elfov je usadený v Roklinke pod Hmlistými horami a vládne im Elrond Polelf. Elrond bol členom Bielej rady a je otcom Arwen Undómiel, súčasnej kráľovnej Gondoru. Za Hmlistými horami leží lesné kráľovstvo Lothlórien, ktorému vládnu Celeborn a Galadriel. V bývalom Temnom hvozde, teraz Hvozde zelených listov, vládne kráľ lesných elfov Thranduil, otec princa Legolasa, člena Spoločenstva prsteňa.',
          'Nedávno sa začalo hovoriť o Dvore Jesene v kraji Ered Luin, kde vraj sídli posledná vzdialená vetva rodu Fëanorovho. Správy sú zatiaľ nejasné.',
          'Elfské rody sú vcelku prísne zviazané hierarchiou naprieč celým spoločenstvom. Na vrchole pyramídy stojí vládca rodu, zvyčajne kráľ, ktorého slovo je zákonom, mečom i súdom pre všetok jeho ľud. Odporovaním vôli vyššie postavenej osoby si dotyčný vyslúži nepriazeň celého spoločenstva, v horších prípadoch i vyhnanstvo a vylúčenie z rodu. Rovnakou nevraživosťou je potom stíhaný každý, kto by takýmto odpadlíkom chcel pomáhať. Na druhej strane verní členovia spoločenstva sú odmenení ochranou a pomocou medzi všetkými elfmi a rovnako sa pomocná ruka ponúka každému, kto elfov niekedy podporil.',
        ],
      },
    ],
  },
  uk: {
    name: 'Ельфи',
    tagline: 'Першонароджені, пам\'ять віків',
    combat_style: ['легка піхота', 'лучники', 'фехтувальники з легкою зброєю'],
    recommended_for: [
      'гравці, які шукають естетичний і поетичний стиль',
      'гравці, які прагнуть виразного роуплею',
      'досвідченіші учасники',
    ],
    not_recommended_for: [
      'гравці, які хочуть лише швидко битися',
      'гравці без часу на детальніший костюм',
    ],
    tags: ['вільний народ', 'вища складність костюма', 'виразний роуплей'],
    newbie_costume_hint:
      'Шарувата туніка в землистих або світлих тонах, плащ, пояс, за бажання вуха. Деталі й естетика мають велике значення.',
    camp_hook:
      'Табір ельфів співає двома мовами, грає на лірах і має місце для тихої споглядальності біля річки часу.',
    costume_colors_text: 'зелений, коричневий',
    heraldry_text: 'за королями та господарями, у яких служать',
    ruler: {
      name: 'Елронд',
      title: 'Володар Рівенділла, напівельф з дому Еаренділа',
      description:
        'Мудрець, господар Ради, ватажок ельфійських загонів. Постаттю тихий, словом вагомий, у бою досвідчений як мало хто. Гравець-ельф пізнає його провід за повільними, але невпинними маневрами — ельфійський загін не тікає й не зрікається присяги.',
    },
    lore_sections: [
      {
        title: 'Про загін ельфів із Золотого лісу',
        paragraphs: [
          'Спорядження й озброєння кожен боєць здобуває собі сам відповідно до своїх можливостей і становища. Цьому ж відповідає і його бойова роль. Через нещодавню війну в глибині лісів військо радше легкоозброєне. Звичайні бійці мають здебільшого лише шкіряні або легкі стьобані обладунки зі шкіряними доповненнями. Краще броньовані — рідкість. Їхній одяг із міцної твердої тканини природних кольорів. Одяг прикрашений лише помірно, але оздоблення не позбавлене елегантності. Переважними кольорами є зелений, коричневий і сірий із золотими або срібними доповненнями. Хто не має шолома (ельфійські варіації на людський «шлап» або барбути), прикриває голову підшоломником зі шкіряною шапкою. Для голів, не вкритих шоломом, конче потрібні виразні гострі вуха.',
          'Більшість ельфійських сил виконує роль розвідників і диверсантів, озброєних луками, довгими ножами та ельфійськими вигнутими мечами. Не бракує також списників, озброєних довгим списом або його коротшою версією, доповненою довгастим чи малим круглим щитом. За побічну зброю знову ж правлять мечі та довгі ножі. Булави й інші дробильні знаряддя ельфам чужі.',
        ],
      },
      {
        title: 'Про загін ельфів із Морок-лісу',
        paragraphs: [
          'Ельфи Морок-лісу не такі величні, як їхні родичі зі згасаючих Королівств. Так само вони високі, стрункі, безбороді, з довгим волоссям і виразно загостреними вухами. Їхній одяг із міцної твердої тканини природних кольорів. Переважними кольорами є темно-зелений і коричневий. Одяг прикрашений лише помірно. Спорядження й озброєння кожен боєць здобуває собі сам відповідно до своїх можливостей і становища. Цьому ж відповідає і його бойова роль.',
          'Через нещодавню війну в глибині лісів військо радше легкоозброєне. Звичайні бійці мають здебільшого лише шкіряні або легкі стьобані обладунки зі шкіряними доповненнями. Краще броньовані — рідкість. Кольчужні та лускаті обладунки — стандарт шляхтичів і королівської гвардії.',
          'До обладунків належать високі шоломи з нащічниками, ельфійські варіації на людський «шлап» або барбути. Хто не має шолома, прикриває голову підшоломником зі шкіряною шапкою. Навіть найбідніші не ходять простоволосими. Залишки ельфійських сил виконують роль розвідників і диверсантів, озброєних луками, довгими ножами та ельфійськими вигнутими мечами. Не бракує й списників, озброєних довгим списом або його коротшою версією, доповненою довгастим чи малим круглим щитом. За побічну зброю знову ж правлять мечі та довгі ножі. Списників доповнює щитова шеренга фехтувальників із мечами або сокирами. Булави й інші дробильні знаряддя ельфам чужі.',
        ],
      },
      {
        title: 'Ельфи в Середзем\'ї',
        paragraphs: [
          'Ельфи, старший народ, є першими мислячими істотами, що крокують Середзем\'ям, і практично не старіють і не вмирають через високий вік чи зношування тіла. Від людей їх на перший погляд відрізняють загострені вуха, а на відміну від людей вони зазвичай мають струнку, середнього зросту поставу та фактично безбороде обличчя.',
          'Попри свою довговічність, ельфів у Середзем\'ї залишилося небагато й кількість їхня щодалі меншає — вони гинуть у боях зі злом або відпливають своїми стрункими кораблями до Невмирущих Земель за морем на заході. У Середзем\'ї існує чотири значні поселення ельфів, кожне з яких заселене іншим родом ельфів із дуже відмінною історією. Одне лежить у Сірих Гаванях на західному узбережжі Середзем\'я, де своєму народу володарює Кірдан, корабельник. Це ймовірно найстарший ельф, який ще лишився в Середзем\'ї. Інший рід ельфів осів у Рівенділлі під Імлистими горами, ним правує Елронд Напівельф. Елронд був членом Білої Ради й батьком Арвен Ундоміель, нинішньої королеви Ґондору. За Імлистими горами лежить лісове королівство Лотлоріен, яким правлять Келеборн і Ґаладріель. У колишньому Морок-лісі, нині Лісі зеленолистих, владарює король лісових ельфів Трандуїл, батько принца Леґоласа, члена Братства Персня.',
          'Нещодавно почали говорити про Двір Осені у краю Еред Луїн, де нібито мешкає остання віддалена гілка роду Феанорового. Звістки поки що неясні.',
          'Ельфійські роди досить суворо поєднані ієрархією у всій громаді. На вершині піраміди стоїть володар роду, зазвичай король, чиє слово є законом, мечем і судом для всього його народу. Заперечуванням волі вище поставленої особи людина накликає на себе нелюбов цілої спільноти, у гірших випадках — вигнання та виключення з роду. Тією ж ворожнечею переслідують і кожного, хто такому відступнику захотів би допомогти. Натомість вірних членів спільноти винагороджують захистом і допомогою серед усіх ельфів, і так само простягають руку допомоги кожному, хто колись підтримав ельфів.',
        ],
      },
    ],
  },
};

// ---------- DWARVES ----------
TRANSLATIONS['dwarves.yml'] = {
  en: {
    name: 'Dwarves',
    tagline: 'Hard as stone, loyal as steel',
    combat_style: [
      'heavy infantry weapons',
      'axes and hammers',
      'shields',
      'short statures in tight formation',
    ],
    recommended_for: [
      'players interested in craft and brotherhood',
      'groups',
      'players who have time for beards and belts',
    ],
    not_recommended_for: [
      'players who dislike a strong costume element (the beard)',
    ],
    tags: ['free people', 'medium costume difficulty', 'strong craft roleplay'],
    newbie_costume_hint:
      'Tunic in earthy tones, leather belt and accessories, beard (even a fake one), sturdy boots, axe or hammer.',
    camp_hook:
      'A Dwarven camp smells of the forge, ale foam and a hearty quarrel about the price of a beer mug.',
    costume_colors_text: 'brown, grey, yellow, green, with accents of black and red',
    heraldry_text: 'A black hammer and anvil on a golden field',
    ruler: {
      name: 'Dáin II Ironfoot',
      title: 'Lord under the Mountain, King of Erebor',
      description:
        'A Dwarven king who stood against the Orcs at Dale. He leads heavy infantry and bands of craftsmen with short beards and long memories. A Dwarf player recognises Dáin\'s host by the deep war-cry, the closed shield-line and axes that do not yield.',
    },
    lore_sections: [
      {
        title: 'Costume styling',
        paragraphs: [
          'To play a Dwarf, get yourself what is essentially a universal medieval human costume, whose wearer is adorned with a respectable full beard in the colour of his hair. You do not have to be five feet tall — a long surcoat or tunic covering the knees will visually shorten you. Armour and a helmet, or at least a mail coif, are a must. A stout (Dwarven) build helps, otherwise compensate with the cut and layering of your garb (more layers, looser cuts, etc.).',
        ],
      },
      {
        title: 'About the Dwarves and the Kingdom under the Mountain',
        paragraphs: [
          'Dwarven dress has been strongly shaped by the relationship with Esgaroth. Cloth and finished garments along with food and timber are supplied by Esgarothian merchants in exchange for precious metals, armourer\'s wares and tools.',
          'Dwarves are not particularly showy when it comes to clothing itself. Most make do with simple linen and woollen garb. They dress similarly to Men: trousers, hose (sometimes leather) for the lower body, plain linen shirts with a woollen tunic and hood. Tunics — and in time of war battle surcoats with the family device — reach below the knee. The clothes are belted with thick leather straps. Footwear consists of high, iron-shod boots reaching to mid-calf. There is no strict rule for colour. Favoured colours are green, yellow and brown.',
          'What no Dwarf neglects is his beard. Dwarven beards span a wide range of colours, from straw-blond through ruddy to black. The beard is proof of age and dignity. Every Dwarf tends, ornaments and protects his beard from harm. The greatest disgrace for a Dwarf is to enter the halls of his ancestors with an unkempt beard. Beardless Dwarves are exiles, unworthy to remain among their kin until the full beard grows back. This stern punishment is meted out for scorning tradition and the memory of the ancestors, and for cowardice in battle.',
          'Dwarven warriors are very well equipped, and their host advances like an armoured column, raising dust with its heavy boots. They do not hide from the enemy — they seek him out. Even the poorest Dwarf has at least a proper gambeson. As standard, however, one sees mail or scale armour covering the warrior from head to knees. Particularly wealthy Dwarves wear plate. Almost without exception every Dwarf covers his head with a steel helm or at least a mail coif over a stout arming cap. Common Dwarven helms are kettle hats, closed barbutes, or nasal helms with cheek- and eye-guards (also known as "Rohan-style" helms).',
          'A Dwarven host stands as a firm bulwark against the foe. The rank-and-file Dwarf is armed with a round shield, an axe, a hammer or an iron-bound mace. As side-arms Dwarves use short swords and seaxes. The shield-line is interlaced with axemen wielding long two-handed axes and sometimes hammers. Dwarven formations are further supported by spearmen and crossbowmen.',
        ],
      },
    ],
  },
  de: {
    name: 'Zwerge',
    tagline: 'Hart wie Stein, treu wie Stahl',
    combat_style: [
      'schwere Infanteriewaffen',
      'Äxte und Hämmer',
      'Schilde',
      'kleine Gestalten in dichter Formation',
    ],
    recommended_for: [
      'Spieler mit Interesse an Handwerk und Bruderschaft',
      'Gruppen',
      'Spieler, die Zeit für Bart und Gürtel haben',
    ],
    not_recommended_for: [
      'Spieler, die kein markantes Kostümelement (den Bart) mögen',
    ],
    tags: ['Freies Volk', 'mittlere Kostümanforderung', 'starkes Handwerks-Rollenspiel'],
    newbie_costume_hint:
      'Tunika in erdigen Tönen, Ledergürtel und Zubehör, Bart (auch falsch), feste Stiefel, Axt oder Hammer.',
    camp_hook:
      'Das Lager der Zwerge duftet nach Schmiede, Bierschaum und einem hitzigen Streit um den Preis eines Bierhumpens.',
    costume_colors_text: 'Braun, Grau, Gelb, Grün, ergänzt durch Schwarz und Rot',
    heraldry_text: 'Schwarzer Hammer und Amboss auf goldenem Grund',
    ruler: {
      name: 'Dáin II. Eisenfuß',
      title: 'Herr unter dem Berg, König von Erebor',
      description:
        'Der Zwergenkönig, der den Orks bei Thal entgegentrat. Er führt schwere Infanterie und Trupps von Handwerkern mit kurzen Bärten und langem Gedächtnis. Der Spieler eines Zwerges erkennt Dáins Heer am tiefen Kriegsruf, der geschlossenen Reihe und an Äxten, die nicht weichen.',
    },
    lore_sections: [
      {
        title: 'Kostümstil',
        paragraphs: [
          'Für die Darstellung eines Zwerges genügt im Grunde ein universelles mittelalterliches Menschenkostüm, dessen Träger ein ordentlicher Vollbart in der Farbe seiner Haare schmückt. Du musst nicht eineinhalb Meter messen — ein Waffenrock oder eine Tunika, die die Knie bedeckt, verkürzt dich optisch. Rüstung und Helm oder zumindest eine Kettenhaube dürfen nicht fehlen. Eine etwas kräftige (zwergische) Statur hilft, sonst gleichst du das durch Schnitt und Schichtung deiner Kleidung aus (mehrere Lagen, weitere Schnitte usw.).',
        ],
      },
      {
        title: 'Über die Zwerge und das Königreich unter dem Berg',
        paragraphs: [
          'Die zwergische Kleidung ist und war stark vom Verhältnis zu Esgaroth geprägt. Stoffe und fertige Gewänder, dazu Lebensmittel und Holz, liefern die Kaufleute aus Esgaroth im Tausch gegen Edelmetalle, Plattnerarbeit und Werkzeuge.',
          'Was die Kleidung selbst angeht, sind Zwerge nicht übermäßig prunksüchtig. Den meisten genügen schlichte Leinen- und Wollgewänder. Sie kleiden sich ähnlich wie Menschen: Hosen, Beinlinge (manchmal aus Leder) als Beinkleid, einfache Leinenhemden mit wollener Tunika und Kapuze. Tuniken und im Kriegsfall Waffenröcke mit dem Hauszeichen reichen bis unters Knie. Die Kleidung wird mit kräftigen Ledergurten gegürtet. Als Schuhwerk dienen hohe, beschlagene Stiefel bis zur halben Wade. Eine feste Farbregel gibt es nicht. Beliebte Farben sind Grün, Gelb und Braun.',
          'Was kein Zwerg vernachlässigt, ist sein Bart. Zwergenbärte zeigen eine breite Palette von Farben — von strohblond über rötlich bis schwarz. Der Bart ist Beweis für Alter und Würde. Jeder Zwerg pflegt, schmückt und schützt seinen Bart vor Schaden. Die größte Schande für einen Zwerg ist es, mit ungepflegtem Bart in die Hallen seiner Ahnen einzuziehen. Bartlose Zwerge sind Verbannte, ihrer Sippe unwürdig, bis der Bart wieder gewachsen ist. Diese harte Strafe wird für Verachtung der Tradition und des Andenkens der Ahnen sowie für Feigheit im Kampf verhängt.',
          'Zwergische Krieger sind sehr gut bewaffnet, und ihr Heer rückt vor wie eine gepanzerte Säule, die mit ihren schweren Stiefeln Staub aufwirbelt. Sie verstecken sich nicht vor dem Feind, sie suchen ihn. Selbst der ärmste Zwerg hat zumindest einen ordentlichen Gambeson. Üblich sind jedoch Ketten- oder Schuppenrüstungen, die den Krieger von Kopf bis Knie bedecken. Besonders wohlhabende Zwerge tragen Plattenrüstungen. Fast ausnahmslos schützt jeder Zwerg seinen Kopf mit einem stählernen Helm oder zumindest mit einer Kettenhaube über einer ordentlichen Polsterhaube. Übliche Zwergenhelme sind Eisenhüte, geschlossene Barbuten oder Nasalhelme mit Wangen- und Augenklappen (auch als „Rohan-Helme" bekannt).',
          'Ein Zwergenheer steht als feste Mauer gegen den Feind. Der einfache Zwerg ist mit einem Rundschild, einer Axt, einem Hammer oder einem eisenbeschlagenen Streitkolben bewaffnet. Als Seitenwaffen dienen kurze Schwerter und Saxe. In die Schildreihe sind Axtkämpfer mit langen Zweihandäxten und manchmal Hämmern eingestreut. Zwergenformationen werden zudem von Speerträgern und Armbrustschützen ergänzt.',
        ],
      },
    ],
  },
  sk: {
    name: 'Trpaslíci',
    tagline: 'Tvrdí ako skala, verní ako oceľ',
    combat_style: [
      'ťažké pešie zbrane',
      'sekery a kladivá',
      'štíty',
      'krátke postavy v zomknutom šíku',
    ],
    recommended_for: [
      'hráči so záujmom o remeslo a družnosť',
      'skupiny',
      'hráči, ktorí majú čas na fúzy a opasky',
    ],
    not_recommended_for: [
      'hráči, ktorí nemajú radi výrazný kostýmový prvok (fúzy)',
    ],
    tags: ['slobodný národ', 'stredná kostýmová náročnosť', 'silný roleplay remesiel'],
    newbie_costume_hint:
      'Tunika v zemitých tónoch, kožený opasok a doplnky, fúzy (i nepravé), pevné topánky, sekera alebo kladivo.',
    camp_hook:
      'Tábor trpaslíkov vonia kováčňou, penou piva a družnou hádkou o cenu pivového korbeľa.',
    costume_colors_text: 'hnedá, sivá, žltá, zelená a ako doplnková čierna a červená',
    heraldry_text: 'Čierne kladivo a nákova na zlatom podklade',
    ruler: {
      name: 'Dáin II. Železná noha',
      title: 'Pán pod Horou, kráľ Ereboru',
      description:
        'Trpasličí kráľ, ktorý sa postavil orkom pri Dale. Vedie ťažkú pechotu a družiny remeselníkov s krátkymi fúzmi a dlhou pamäťou. Hráč trpaslíkov spozná Dáinovu armádu podľa hlbokého kriku, zomknutého šíku a sekier, ktoré neuhýbajú.',
    },
    lore_sections: [
      {
        title: 'Štylizácia kostýmu',
        paragraphs: [
          'Na stvárnenie trpaslíka si zaobstarajte de facto univerzálny stredoveký ľudský kostým, ktorého majiteľa zdobí poriadny plnofúz vo farbe jeho vlasov. Nemusíte merať meter a pol. Stačí varkočom alebo tunikou prekryť kolená — opticky vás to zmenší. Nesmie chýbať zbroj a prilba alebo aspoň krúžková kapucňa. Vhodné je mať trochu chlapskú (trpasličiu) postavu, prípadne to dohnať strihom a skladbou vášho odevu (viac vrstiev, voľnejšie strihy atď.).',
        ],
      },
      {
        title: 'O trpaslíkoch a Kráľovstve pod Horou',
        paragraphs: [
          'Trpasličie odievanie bolo a je silne ovplyvnené vzťahom s Esgarothom. Látky aj hotové odevy spolu s potravinami a drevom dodávajú esgarothskí kupci výmenou za drahé kovy, platnerské výrobky a náradie.',
          'Trpaslíci nie sú príliš parádni, čo sa samotného odevu týka. Väčšine stačí prostý ľanový a vlnený odev. Bývajú oblečení podobne ako ľudia: nohavice, brachy (niekedy kožené) ako spodok, prosté ľanové haleny s vlnenou tunikou a kapucňou. Tuniky a v prípade vojny bojové varkoče so znakom rodu siahajú až pod kolená. Odev majú stiahnutý silnými koženými pásmi. Ako obuv slúžia vysoké okované topánky siahajúce do polovice lýtok. Farba odevu nie je presne určená. Obľúbenou farbou je zelená, žltá a hnedá.',
          'To, čo žiaden trpaslík nezanedbá, sú jeho fúzy. Trpasličie fúzy majú pestrú škálu sfarbenia od slamovo svetlých cez ryšavé až po čierne. Fúzy sú dôkazom veku a vážnosti. Každý trpaslík si svoje fúzy opatruje, zdobí a chráni pred ujmou. Najväčšou hanbou pre trpaslíka je vstúpiť do siení predkov s neupravenými fúzmi. Trpaslíci bez fúzov sú vyhnanci nehodní ďalšieho pobytu medzi svojimi, a to do času, kým im plnofúz znova narastie. Tento prísny trest sa udeľuje za pohŕdanie tradíciami a pamiatkou predkov a za zbabelosť v boji.',
          'Trpasličí bojovníci sú veľmi dobre vyzbrojení a ich vojsko postupuje ako obrnená kolóna, víriaca prach svojimi ťažkými topánkami. Pred nepriateľom sa neskrývajú, vyhľadávajú ho. Aj najchudobnejší trpaslík má aspoň poriadnu prešívanicu. Štandardne však možno vidieť krúžkové či šupinové zbroje kryjúce bojovníka od hlavy až po kolená. Zvlášť bohatí trpaslíci nosia plátové zbroje. Snáď všetkým trpaslíkom bez výnimky kryje hlavu oceľová prilba alebo aspoň krúžková kapucňa na poriadnom batvate. Bežnými trpasličími prilbami sú železné klobúky, uzavreté barbuty alebo nánosníkové prilby s lícnicami a očnicami (známe aj ako „rohanky").',
          'Trpasličie vojsko je pevne stojacou hrádzou proti nepriateľovi. Radový trpaslík je vyzbrojený kruhovým štítom, sekerou, kladivom či okovaným obuchom. Ako pobočné zbrane používajú trpaslíci krátke meče a tesáky. Štítová rada je preložená sekerníkmi s dlhými dvojručnými sekerami a niekedy aj kladivami. Trpasličie formácie sú ďalej doplnené o kopijníkov a strelcov z kuší.',
        ],
      },
    ],
  },
  uk: {
    name: 'Гноми',
    tagline: 'Тверді як камінь, вірні як сталь',
    combat_style: [
      'важка піхотна зброя',
      'сокири й молоти',
      'щити',
      'низькі постаті у зімкнутому строю',
    ],
    recommended_for: [
      'гравці, яких цікавить ремесло та побратимство',
      'групи',
      'гравці, які мають час на бороди й паски',
    ],
    not_recommended_for: [
      'гравці, які не люблять виразного костюмного елемента (бороди)',
    ],
    tags: ['вільний народ', 'середня складність костюма', 'сильний роуплей ремесла'],
    newbie_costume_hint:
      'Туніка в землистих тонах, шкіряний пасок і доповнення, борода (хай і несправжня), міцні чоботи, сокира або молот.',
    camp_hook:
      'Табір гномів пахне кузнею, пивною піною й завзятою суперечкою про ціну пивного кухля.',
    costume_colors_text: 'коричневий, сірий, жовтий, зелений, з доповненням чорного й червоного',
    heraldry_text: 'Чорний молот і ковадло на золотому полі',
    ruler: {
      name: 'Даїн II Залізностопий',
      title: 'Володар під Горою, король Еребору',
      description:
        'Гномський король, який став проти орків біля Дейла. Веде важку піхоту й дружини ремісників із короткими бородами та довгою пам\'яттю. Гравець-гном пізнає Даїнове військо за глибоким бойовим криком, зімкнутим строєм і сокирами, що не відступають.',
    },
    lore_sections: [
      {
        title: 'Стилізація костюма',
        paragraphs: [
          'Для зображення гнома потрібен фактично універсальний середньовічний людський костюм, чий власник прикрашений добрячою повною бородою кольору його волосся. Не обов\'язково мати півтора метра. Достатньо варкочем чи тунікою закрити коліна — оптично це вас укоротить. Не повинні бракувати обладунок і шолом або принаймні кольчужний каптур. Бажано мати дещо кремезну (гномську) поставу, інакше це можна надолужити кроєм і нашаруванням одягу (більше шарів, вільніші крої тощо).',
        ],
      },
      {
        title: 'Про гномів і Королівство під Горою',
        paragraphs: [
          'Гномський одяг сильно зумовлений стосунками з Есґаротом. Тканини й готовий одяг разом з продуктами й деревом постачають есґаротські купці в обмін на дорогоцінні метали, ковальські вироби й знаряддя.',
          'Гноми не надто пишні в самому одязі. Більшості вистачає простих лляних і вовняних шат. Одягаються подібно до людей: штани, ногавиці (іноді шкіряні) як низ, прості лляні сорочки з вовняною тунікою та каптуром. Туніки, а в час війни бойові варкочі з родовим знаком, сягають аж під коліна. Одяг стягують сильні шкіряні пояси. Взуттям служать високі ковані чоботи до середини литок. Точне правило кольору не існує. Улюблені кольори — зелений, жовтий і коричневий.',
          'Чого жоден гном не занедбає — це його борода. Гномські бороди мають широкий спектр забарвлення: від солом\'яно-світлих через рудуваті до чорних. Борода є доказом віку й гідності. Кожен гном свою бороду доглядає, прикрашає й береже від ушкодження. Найбільшою ганьбою для гнома є увійти до залів предків із неохайною бородою. Безбороді гноми — вигнанці, не гідні далі бути серед своїх, поки повна борода не виросте знову. Це суворе покарання накладають за зневагу до традицій і пам\'яті предків та за боягузтво в бою.',
          'Гномські воїни дуже добре озброєні, а їхнє військо просувається як броньована колона, здіймаючи пил важкими чоботами. Від ворога не ховаються — шукають його. Навіть найбідніший гном має принаймні пристойну стьобанку. Стандартно ж можна бачити кольчужні або лускаті обладунки, що криють бійця від голови до колін. Особливо заможні гноми носять пластинчасті обладунки. Майже всім гномам без винятку голову криє сталевий шолом або принаймні кольчужний каптур на доброму підшоломнику. Звичайні гномські шоломи — залізні капелюхи, закриті барбути або наносникові шоломи з нащічниками й очницями (відомі також як «роганки»).',
          'Гномське військо — це непохитна стіна супроти ворога. Рядовий гном озброєний круглим щитом, сокирою, молотом або кутим обухом. Як побічну зброю гноми використовують короткі мечі й тесаки. Щитова шеренга чергується із сокирниками з довгими дворучними сокирами, а іноді й молотами. Гномські формації доповнюють списники та арбалетники.',
        ],
      },
    ],
  },
};

// ---------- GONDOR ----------
TRANSLATIONS['gondor.yml'] = {
  en: {
    name: 'Gondor',
    tagline: 'Guardians of the West, blood of Númenor',
    combat_style: ['heavier infantry', 'shields and swords', 'spearmen', 'guards'],
    recommended_for: [
      'players seeking a noble, heraldic style',
      'groups',
      'more experienced fighters',
    ],
    not_recommended_for: [
      'players who do not have time to prepare a heraldic costume',
    ],
    tags: ['free people', 'higher costume difficulty', 'heraldic style'],
    newbie_costume_hint:
      'Tunic in dark blue or black, silver elements, the device of the White Tree or the seven stars. A cloak, belt and straight swords.',
    camp_hook:
      'The camp of Gondor breathes the strict discipline of the guards, prayer for the West and faithful service to the liege lord.',
    costume_colors_text: 'blue, white, grey, with accents of brown and silver',
    heraldry_text: 'A silver tree with seven stars on a dark field',
    ruler: {
      name: 'Aragorn',
      title: 'King of Gondor, heir of Isildur',
      description:
        'Warden of the North, the returning King of the West. He leads riders of the White Tree and companies of rangers — uniting what was long divided. A Gondor player recognises a captain by the white tree on the shield, by short orders and a calm bearing in crisis.',
    },
    lore_sections: [
      {
        title: 'Costume styling',
        paragraphs: [
          'The basic styling of Gondorian troops corresponds to medieval society in Western Europe of the 13th–15th centuries. The focus is military — a classic human fantasy soldier with a Gothic touch. This is supplemented by film-inspired styling, with emphasis on heraldic devices (the White Tree) and, where possible, a uniform-like costume style. This is in effect a regular conscript army. The core consists of auxiliary corps of light spearmen, axemen, sword-and-shield fighters and ranger archers.',
        ],
      },
      {
        title: 'About the Gondorian army',
        paragraphs: [
          'Southern and Northern Gondor are quite different regions.',
          'After the loss of the royal line, the southern lands gradually became more independent, and their princes — whose realms were only lightly touched by war — raised them to wealth and power. The southern nobility gradually formed an autonomous conglomerate of principalities, joined economically and militarily. The chief authority became the princes of Dol Amroth.',
          'The lands of Northern Gondor, administered directly by the Steward of the realm, suffered from war and plague and consequent shortage. The north became a supported, weakening, poor neighbour, who in the hardest moments had to be propped up against collapse, by either military or economic aid.',
          'This left a strong mark on the differing military traditions of the two parts of the realm.',
          'The southern part of Gondor is classically feudal: princes lean on hereditary feudal nobility, from whose ranks the armoured knighthood — the core of southern Gondorian contingents — is drawn. These contingents are augmented by retinues and arms-bearing servants of the knights and reinforced by princely companies with foot and mounted men-at-arms. A knight equips himself and his retinue at his own expense, and accordingly has a claim to a share of the war booty and a voice in command.',
          'Northern Gondor abandoned this model entirely. War decimated the nobility, and there was a need to call up ever more men to replace the losses, rather than rely solely on the retinues of individual lords. War here was a question of survival, and effectively every able-bodied man was drawn into it. The Stewards assigned the nobles offices for the administration and defence of the land, and as supreme rulers they ruled all the dwindling principalities. The army is built on the basis of regular conscription. Military service can be avoided only by payment or by other service to the office of the Steward. The host was unified under one banner. Nobles were assigned officer ranks, but gradually the officer corps was supplemented from the common folk too.',
          'Dress in the Gondorian realm is fairly uniform despite the differences between classes mentioned above. Lebennin is not only a source of cloth but also of fashion, which spreads from there throughout the realm. This does not, however, apply to the common folk, whose dress changes little. They wear loose linen breeches or loose tied hose, complemented by smocks and tunics of linen and woollen cloth. A fairly fashionable colour is shades of blue, complemented by white, grey and brown. The style of dress corresponds to 13th–15th century Western Europe.',
          'Gondorian soldiers are clothed according to their origin. The royal host from the north is dressed in simple uniforms. The soldiers wear surcoats with the distinguishing devices of the white tree and stars. The uniform tends to black; for the wealthier it is of velvet. The soldiers are armed according to the unit\'s role. Infantry is fairly widespread, being more suitable for defensive fighting and combat in wooded and sloping terrain. The basic equipment of a foot-soldier is an oval or heater shield with a sword or mace. Shield units are augmented by units with long footman\'s spears and side-arms of long knives and seaxes. This infantry typically wears kettle-hat helms, barbutes or foot-soldier sallets. Standard armour is gambeson and padded armour, in some units complemented by mail or half-plate harness. As supporting units, archers serve, who are rather sparingly armoured.',
          'The units of Southern Gondor are essentially composed of several noble retinues, one of whom holds the decisive word of commander. The dress is far less uniform than in the northern corps. Retainers are usually without insignia or carry the device of their lord, on shield or surcoat. The southern nobility has many devices, coats of arms and banners, but a partly unifying element is the banner of the Prince of Dol Amroth with a white swan and a four-pointed star. The nobles are armed with a knight\'s lance and a shield serving for the first impact, after which they draw swords, axes and maces. They are clothed in mail or plate armour of high quality, helmed. The auxiliary infantry of retainers, servants and conscripts is armed rather with spears, shields, axes and complemented by crossbowmen and archers. This auxiliary infantry is protected at best by light gambesons or padded armour or leather coats. Their heads are covered with caps, arming caps and occasionally helmets.',
          'The current Gondorian forces are divided into so-called banners. The North-Gondorian ones bear devices of the white tree with stars; the southern knightly banners and supporting foot banners take the device of the white swan as their unifying standard. Knights and their attendant servants, however, bear their own family devices on shields or surcoats.',
        ],
      },
      {
        title: 'About the kingdom of Gondor',
        paragraphs: [
          'Gondor is the oldest kingdom of Men in Middle-earth. Although its original power long declined, now that the King has returned, the strength of Gondor is rising again, ready to win back its ancient glory.',
          'The borders of the realm of Gondor can be viewed in two ways. The first is the one used by the lords of Gondor: a view that includes the original historical territories of Gondor, much of which is today desolate or held by the Enemy. This view kindles the desire to recapture the lands of Ithilien, push the southern border back beyond the river Poros, take Harondor and rebuild the fortresses on the Harnen. Yet more optimistic plans toy with rebuilding the fortresses along Ered Lithui and seizing Umbar and the surrounding regions.',
          'A somewhat more sober view perceives the borders of Gondor where they actually lie. Anfalas is taken as the western border. This grassy, sparsely settled upland is a kind of distant fringe of Gondorian power in the west. Lords and nobles are blood-kin of the Númenoreans, but the old blood is, even more so among the common folk, mixed with that of the original inhabitants. The great distance of these lands from the heart of the realm causes the war with the enemy in the East to seem like a kind of legend-shrouded phantom that swallows the conscripts demanded by the lords of the Great City. Loyalty to the realm has cooled considerably, and few lords have heeded the call of the new King.',
          'East of Anfalas rises the foothill country of Lamedon. Fortified, flourishing Morthond is the chief seat of the prince who rules a land of mining settlements. From here comes the ore-wealth of Gondor. Not only iron ore, but also veins of silver and copper deposits are hidden in the depths of Ered Nimrais.',
          'South of Lamedon lies Belfalas. In its more southern part, which juts out into the sea like a horn, the mountain-furrowed Dor-en-Ernil and Anfalas enclose the bay of Nen Belfalas.',
          'The main settlements, however, lie along the watercourses and in the deltas of the rivers Ciril and Ringló, near the harbour of Edhellond. A rich agricultural region, woven through with groves and forests of cedar wood for building the finest sea-going and river ships. Here is the seat of Prince Imrahil — the castle of Dol Amroth, a flourishing city and another fortified war-harbour, which protects the coast from raids by the corsairs of Umbar.',
          'The westernmost part of southern Gondor is Lebennin. A fertile land studded with pastures, fields and forests. A land of great flocks of sheep, herds of horses and other cattle, a land of weavers and glassmakers. And not least a land of merchants.',
          'The largest commercial port, Pelargir, lying in the delta of the great river Anduin and sheltered by the isle of Tolfalas, together with the city of Linhir — set further east on the Gilrain on the border with Belfalas — is the source of the wealth of the princes of Lebennin.',
          'And there ends the list of southern Gondorian lands. The northern region is somewhat worse off. Stricken by war and fire stand Minas Tirith and her white tower, surrounded by the cramped Lossarnach and Anórien, the land bordering the kingdom of the Lords of Horses.',
        ],
      },
    ],
  },
  de: {
    name: 'Gondor',
    tagline: 'Hüter des Westens, Blut Númenors',
    combat_style: ['schwerere Infanterie', 'Schilde und Schwerter', 'Speerträger', 'Wachen'],
    recommended_for: [
      'Spieler, die einen erhabenen, heraldischen Stil suchen',
      'Gruppen',
      'erfahrenere Kämpfer',
    ],
    not_recommended_for: [
      'Spieler, die keine Zeit haben, ein heraldisches Kostüm vorzubereiten',
    ],
    tags: ['Freies Volk', 'höhere Kostümanforderung', 'heraldischer Stil'],
    newbie_costume_hint:
      'Tunika in Dunkelblau oder Schwarz, silberne Elemente, das Zeichen des Weißen Baumes oder der sieben Sterne. Mantel, Gürtel, gerade Schwerter.',
    camp_hook:
      'Das Lager Gondors strahlt die strenge Disziplin der Wache aus, das Gebet für den Westen und treuen Dienst am Lehnsherrn.',
    costume_colors_text: 'Blau, Weiß, Grau, ergänzt durch Braun und Silber',
    heraldry_text: 'Ein silberner Baum mit sieben Sternen auf dunklem Feld',
    ruler: {
      name: 'Aragorn',
      title: 'König von Gondor, Erbe Isildurs',
      description:
        'Hüter des Nordens, der zurückgekehrte König des Westens. Er führt die Reiter des Weißen Baumes und die Gefährten der Waldläufer — er eint, was lange getrennt war. Der Spieler Gondors erkennt seinen Befehlshaber am weißen Baum auf dem Schild, an knappen Befehlen und ruhiger Haltung in der Krise.',
    },
    lore_sections: [
      {
        title: 'Kostümstil',
        paragraphs: [
          'Die Grundstilisierung der gondorischen Truppen entspricht der mittelalterlichen Gesellschaft Westeuropas des 13.–15. Jahrhunderts. Schwerpunkt ist das Militärische — ein klassischer menschlicher Fantasy-Soldat mit gotischem Einschlag. Dies wird durch eine an die Filmvorlage angelehnte Stilisierung ergänzt, mit Betonung der Hoheitszeichen (Weißer Baum) und nach Möglichkeit einem uniformähnlichen Kostümstil. Es handelt sich faktisch um ein reguläres Heer aus Konskribierten. Den Kern bilden Hilfskorps leichter Speerträger, Axtkämpfer, Schwertkämpfer mit Schilden und Waldläufer-Bogenschützen.',
        ],
      },
      {
        title: 'Über das gondorische Heer',
        paragraphs: [
          'Süd- und Nordgondor sind recht unterschiedliche Gebiete.',
          'Nach dem Verlust der königlichen Linie begannen die südlichen Länder sich allmählich zu verselbständigen, und ihre Fürsten konnten ihre vom Krieg nur wenig berührten Lande zu Reichtum und Macht erheben. Der südliche Adel bildete nach und nach ein eigenes Konglomerat von Fürstentümern, wirtschaftlich und militärisch verbunden. Die Hauptautorität wurden die Fürsten von Dol Amroth.',
          'Die Länder Nordgondors, die direkt vom Truchsess des Königreichs verwaltet wurden, litten unter Krieg, Pest und damit unter Mangel. Der Norden wurde zum unterstützten, schwächer werdenden, armen Nachbarn, den man in den schlimmsten Augenblicken vor dem Zusammenbruch bewahren musste — sei es militärisch oder wirtschaftlich.',
          'Dies hat sich erheblich auf die unterschiedliche militärische Tradition beider Reichsteile ausgewirkt.',
          'Der südliche Teil Gondors ist klassisch feudal: Die Fürsten stützen sich auf erblichen Lehensadel, aus dessen Reihen die gepanzerte Ritterschaft rekrutiert wird, der Kern der südgondorischen Kontingente. Diese Kontingente werden durch Gefolgsleute und waffentragende Knechte der Ritter ergänzt und durch fürstliche Trupps mit Fuß- und Reiterkriegern verstärkt. Ein Ritter rüstet sich und sein Aufgebot auf eigene Kosten, dafür hat er Anspruch auf einen Anteil an Beute und Mitspracherecht im Befehl.',
          'Nordgondor hat dieses Modell ganz aufgegeben. Der Krieg dezimierte den Adel, und es mussten immer mehr Männer eingezogen werden, um die Verluste zu ersetzen, statt nur die Trupps einzelner Herren zu rufen. Der Krieg war hier eine Existenzfrage, und faktisch war jeder gesunde Mann darin verwickelt. Die Truchsessen wiesen den Adligen Ämter zur Verwaltung und Verteidigung des Landes zu und herrschten als Oberherren über alle schrumpfenden Fürstentümer. Das Heer wird auf der Grundlage regelmäßiger Aushebungen aufgestellt. Der Wehrdienst kann nur durch Zahlung oder anderen Dienst am Truchsessenamt umgangen werden. Das Heer wurde unter einem Banner vereint. Den Adligen wurden Offiziersrangstufen zugewiesen, doch nach und nach wurde das Offizierskorps auch durch das gemeine Volk ergänzt.',
          'Die Kleidung im gondorischen Reich ist trotz der oben erwähnten Standesunterschiede ziemlich einheitlich. Lebennin ist nicht nur eine Quelle von Stoffen, sondern auch der Mode, die sich von dort allmählich im ganzen Reich ausbreitet. Das gilt jedoch nicht für das gemeine Volk, dessen Kleidungsstil sich kaum ändert. Man trägt weite Leinenhosen oder lockere Beinlinge, ergänzt durch Hemden und Tuniken aus Leinen und Wolle. Eine recht modische Farbe sind Blautöne, ergänzt durch Weiß, Grau und Braun. Der Stil entspricht dem 13.–15. Jahrhundert in Westeuropa.',
          'Die Soldaten Gondors sind je nach Herkunft gekleidet. Das königliche Heer aus dem Norden trägt einfache Uniformen. Die Soldaten haben Waffenröcke und die Erkennungszeichen des weißen Baumes und der Sterne. Die Uniform ist auf Schwarz gestimmt; bei Wohlhabenderen aus Samt. Die Soldaten sind je nach Einsatz der Einheit bewaffnet. Recht verbreitet ist die Infanterie, die für Verteidigungs- und Waldgefechte sowie für hügeliges Gelände besser geeignet ist. Die Grundausrüstung des Fußsoldaten ist ein ovaler oder heraldisch geformter Schild mit Schwert oder Streitkolben. Schildtruppen werden durch Einheiten mit langen Fußmannsspeeren und langen Messern und Saxen als Seitenwaffen ergänzt. Diese Infanterie trägt überwiegend Eisenhüte, Barbuten oder Fußschaller. Als Rüstung sind gepolsterte und Steppwesten üblich, bei einigen Einheiten ergänzt durch Ketten- oder Halbplattenkomplette. Als Unterstützungseinheit dienen Bogenschützen, die eher spärlich gerüstet sind.',
          'Die Einheiten Südgondors bestehen tatsächlich aus mehreren adligen Trupps, von denen einer das entscheidende Wort als Befehlshaber führt. Die Kleidung ist bei weitem nicht so einheitlich wie bei den nördlichen Korps. Die Gefolgsleute tragen meist keine Abzeichen oder das Zeichen ihres Herrn — auf Schild oder Waffenrock. Der südliche Adel hat viele Zeichen, Wappen und Banner, doch ein teilweise vereinendes Element ist das Banner des Fürsten von Dol Amroth mit einem weißen Schwan und einem vierzackigen Stern. Die Adligen sind mit Reiterlanze und Schild bewaffnet, der dem ersten Stoß dient; danach ziehen sie Schwerter, Äxte und Streitkolben. Sie tragen Ketten- oder Plattenrüstung hoher Qualität, behelmt. Die Hilfsinfanterie aus Gefolgsleuten, Knechten und Konskribierten ist eher mit Speeren, Schilden, Äxten bewaffnet und durch Armbrust- und Bogenschützen ergänzt. Diese Hilfsinfanterie ist bestenfalls durch leichte Stepp- oder Polsterrüstung sowie Lederwämser geschützt. Die Köpfe stecken in Hauben, Polsterkappen und gelegentlich auch Helmen.',
          'Die heutigen gondorischen Streitkräfte sind in sogenannte Banner gegliedert. Die nordgondorischen tragen Zeichen des weißen Baumes mit Sternen; die südlichen ritterlichen Banner und Fußhilfsbanner anerkennen das Zeichen des weißen Schwanes als verbindende Standarte. Ritter und ihre dazugehörigen Knechte tragen jedoch auf Schilden oder Übergewändern die Zeichen ihrer eigenen Häuser.',
        ],
      },
      {
        title: 'Über das Königreich Gondor',
        paragraphs: [
          'Gondor ist das älteste Königreich der Menschen in Mittelerde. Auch wenn seine ursprüngliche Macht lange im Niedergang war, steigt jetzt, nachdem der König zurückgekehrt ist, die Stärke Gondors wieder auf, bereit, seinen einstigen Ruhm zurückzugewinnen.',
          'Die Grenzen des gondorischen Reiches lassen sich auf zweierlei Weise betrachten. Die erste ist diejenige, die die Herren Gondors verwenden: eine Sicht, die die ursprünglichen historischen Gebiete Gondors einschließt, die heute zum großen Teil verlassen oder vom Feind besetzt sind. Diese Sicht weckt den Wunsch, die Lande Ithiliens zurückzugewinnen, die südliche Grenze hinter den Fluss Poros zurückzuführen, Harondor zu besetzen und die Festungen am Lauf des Harnen wiederzuerrichten. Noch optimistischere Pläne befassen sich mit dem Wiederaufbau der Festungen entlang des Ered Lithui und der Einnahme Umbars und der angrenzenden Gebiete.',
          'Eine etwas nüchternere Sicht nimmt die Grenzen Gondors dort wahr, wo sie tatsächlich liegen. Als Westgrenze gilt Anfalas. Diese grasige, dünn besiedelte Hochebene ist eine Art ferner Zipfel gondorischer Macht im Westen. Die Herren und der Adel sind zwar Blutsverwandte der Númenorer, doch das alte Blut ist nicht nur unter dem einfachen Volk mit dem der ursprünglichen Bewohner vermischt. Die große Entfernung dieser Lande vom Herzen des Reiches führt dazu, dass der Krieg mit dem Feind im Osten wie eine in Aberglauben gehüllte Erscheinung wirkt, die die von den Herren der großen Stadt geforderten Konskribierten verschlingt. Die Loyalität gegenüber dem Reich ist deutlich erkaltet, und nur wenige Herren haben dem Ruf des neuen Königs Folge geleistet.',
          'Östlich von Anfalas erhebt sich das hügelige Lamedon. Das befestigte, blühende Morthond ist der Hauptsitz des Fürsten, der ein Land von Bergbausiedlungen regiert. Von hier kommt der Erzreichtum Gondors. Nicht nur Eisenerz, sondern auch Silberadern und Kupferlagerstätten birgt das Innere des Ered Nimrais.',
          'Südlich von Lamedon liegt Belfalas. In seinem südlicheren Teil, der wie eine Spitze ins Meer ragt, schließt das von Bergen durchzogene Dor-en-Ernil zusammen mit Anfalas die Bucht Nen Belfalas ein.',
          'Die Hauptbesiedlung jedoch liegt entlang der Wasserläufe und im Delta der Flüsse Ciril und Ringló in der Nähe des Hafens Edhellond. Eine reiche Agrarlandschaft, durchzogen von Hainen und Wäldern mit Zedernholz für den Bau der besten Hochsee- und Flussschiffe. Hier liegt der Sitz Fürst Imrahils — die Burg Dol Amroth, eine blühende Stadt und ein weiterer befestigter Kriegshafen, der die Küste vor den Überfällen der Korsaren von Umbar schützt.',
          'Der westlichste Teil Südgondors ist Lebennin. Fruchtbar, mit Weiden, Feldern und Wäldern bedeckt. Ein Land großer Schaf- und Pferdeherden und anderer Viehbestände, ein Land der Weber und Glaser. Und nicht zuletzt ein Land der Händler.',
          'Der größte Handelshafen Pelargir, im Delta des Großstroms Anduin gelegen und durch die Insel Tolfalas geschützt, ist gemeinsam mit der weiter östlich am Bach Gilrain an der Grenze zu Belfalas gelegenen Stadt Linhir die Quelle des Reichtums der Fürsten von Lebennin.',
          'Damit endet die Aufzählung der Lande Südgondors. Im Norden steht es etwas trübseliger. Vom Krieg und Feuer gezeichnet stehen Minas Tirith und ihr weißer Turm, umgeben vom beengten Lossarnach und Anórien, dem Land an der Grenze zum Königreich der Pferdeherren.',
        ],
      },
    ],
  },
  sk: {
    name: 'Gondor',
    tagline: 'Strážcovia západu, krv Númenoru',
    combat_style: ['ťažšia pechota', 'štíty a meče', 'kopijníci', 'stráže'],
    recommended_for: [
      'hráči hľadajúci vznešený a heraldický štýl',
      'skupiny',
      'skúsenejší bojovníci',
    ],
    not_recommended_for: [
      'hráči, ktorí nemajú čas pripraviť kostým s heraldikou',
    ],
    tags: ['slobodný národ', 'vyššia kostýmová náročnosť', 'heraldický štýl'],
    newbie_costume_hint:
      'Tunika v tmavomodrej alebo čiernej, strieborné prvky, znak Bieleho stromu alebo siedmich hviezd. Plášť, opasok, rovné meče.',
    camp_hook:
      'Tábor Gondoru pôsobí strohou disciplínou stráží, modlitbou za západ a vernou službou lennému pánovi.',
    costume_colors_text: 'modrá, biela, sivá, ako doplnková hnedá a strieborná',
    heraldry_text: 'Strieborný strom so siedmimi hviezdami na tmavom poli',
    ruler: {
      name: 'Aragorn',
      title: 'Kráľ Gondoru, dedič Isildurov',
      description:
        'Strážca severu, navrátivší sa kráľ Západu. Vedie jazdcov Bieleho stromu a družiny strážcov — zjednocuje to, čo bolo dlho rozdelené. Hráč Gondoru spozná veliteľa podľa bieleho stromu na štíte, krátkych rozkazov a pokojného držania v kríze.',
    },
    lore_sections: [
      {
        title: 'Štylizácia kostýmu',
        paragraphs: [
          'Základná štylizácia príslušníkov gondorských vojsk zodpovedá stredovekej spoločnosti v západnej Európe 13. – 15. storočia. Zameraná na vojenstvo, t. j. klasický ľudský fantasy vojak ladený do gotiky. Doplnené o štylizáciu podľa filmovej predlohy, s dôrazom na zobrazenie výsostných znakov (Biely strom) a podľa možností uniformovaný štýl kostýmu. Ide de facto o pravidelnú armádu z odvedencov. Základ tvoria pomocné zbory ľahkých kopijníkov, sekerníkov, šermiarov so štítmi a hraničiarskych lukostrelcov.',
        ],
      },
      {
        title: 'O gondorskej armáde',
        paragraphs: [
          'Južný a severný Gondor sú dosť odlišné oblasti.',
          'Po strate kráľovskej línie sa južné krajiny začali postupne osamostatňovať a ich kniežatá dokázali svoje zeme, vojnami len málo dotknuté, povzniesť k bohatstvu a sile. Južanská šľachta si postupne vytvorila samostatný konglomerát kniežatstiev, navzájom prepojených ekonomicky aj vojensky. Hlavnou autoritou sa stali kniežatá z Dol Amrothu.',
          'Krajiny severného Gondoru, spravované priamo správcom kráľovstva, trpeli vojnou, morom a nedostatkom. Severné krajiny sa stali podporovaným, slabnúcim, chudobným susedom, ktorého bolo v najťažších chvíľach nutné zachytiť pred zrútením, či už pomocou vojenskou alebo ekonomickou.',
          'To sa značne podpísalo na odlišnej vojenskej tradícii oboch častí krajiny.',
          'Južná časť Gondoru je klasicky feudálna, kniežatá sa opierajú o rodovú lennú šľachtu, z radov ktorej sa rekrutuje obrnená rytierska jazda, základ juhogondorských kontingentov. Tieto kontingenty dopĺňajú družiníci a zbrojní paholci rytierov a posilňujú ich kniežacie družiny s pešími aj jazdnými oďencami. Výzbroj svoju a svojej hotovosti si rytier zaobstaráva na vlastné náklady, podľa toho má potom nárok na časť vojnovej koristi a podiel na velení.',
          'Severný Gondor tento model úplne opustil. Vojna zdecimovala šľachtu a navyše bolo potrebné povolávať stále viac mužov na nahradenie strát, než len družiny jednotlivých pánov. Vojna tu bola otázkou existencie a bol do nej zapojený de facto každý zdravý muž. Správcovia určili šľachticom úrady na správu a obranu krajiny a ako vrchní vládcovia vládli všetkým redšajúcim sa kniežatstvám. Armáda sa stavia na základe pravidelných odvodov. Vojenskej službe sa možno vyhnúť iba vyplatením alebo inou službou úradu správcu. Vojsko bolo zjednotené pod jednou zástavou. Šľachticom boli pridelené dôstojnícke hodnosti, no postupne bol dôstojnícky zbor dopĺňaný aj o prostý ľud.',
          'Odievanie v gondorskej ríši je pomerne jednotné napriek vyššie spomenutým rozdielom medzi vrstvami. Lebennin je ako krajina nielen zdrojom látok, ale aj módy, ktorá sa odtiaľ postupne šíri po celej ríši. To však neplatí pre prostý ľud, ktorého štýl obliekania sa príliš nemení. Nosia sa plátenné voľné nohavice či voľné priväzovacie nohavičky (brachy), doplnené o haleny a tuniky z ľanových a vlnených látok. Pomerne módnou farbou sú odtiene modrej, doplnené o bielu, sivú a hnedú. Štýl obliekania zodpovedá 13. – 15. storočiu v Západnej Európe.',
          'Gondorskí vojaci sú odetí v závislosti od pôvodu. Kráľovské vojsko zo severu je odeté v jednoduchých uniformách. Vojaci majú varkoče a rozlišovacie znaky bieleho stromu a hviezd. Uniforma je ladená do čierna, u bohatších je zo zamatovej látky. Vojaci sú vyzbrojení podľa zaradenia jednotky. Pomerne rozšírená je pechota, ktorá je vhodnejšia na obranné boje a boje v lesnatých a svahovitých terénoch. Základnú výzbroj pešiaka tvorí štít oválneho či erbového tvaru s mečom prípadne palcátom. Oddiely štítarov dopĺňajú jednotky s dlhými pešiackými kopijami a pobočnými dlhými nožmi a tesákmi. Táto pechota je odetá pomerne štandardne do prilieb tvaru železných klobúkov, barbutov či peších šalierov. Ako zbroj sú bežné prešívané a vypchávané zbroje, u niektorých oddielov doplnené krúžkovými či pol-plátovými kompletmi. Ako podporné jednotky slúžia lukostrelci, ktorí sú obrnení skôr striedmo.',
          'Jednotky južného Gondoru sú vlastne zložené z niekoľkých družín šľachticov, z ktorých jeden má rozhodujúce slovo veliteľa. Odenie nie je ani zďaleka tak uniformné ako pri severných zboroch. Družiníci sú väčšinou bez insígnií alebo nesú znak svojho pána, či už na štíte, alebo na varkoči. Južanská šľachta má veľa znakov, erbov a zástav, ale za čiastočne zjednocujúci prvok platí zástava knižaťa Dol Amrothu s bielou labuťou a štvorcípou hviezdou. Šľachtici sú vyzbrojení jazdeckou kopijou a štítom, ktorý slúži pri prvom náraze, následne tasia meče, sekery a palcáty. Sú odetí do krúžkovej či plátovej zbroje vysokej kvality, oprilbení. Pomocná pechota z družiníkov, paholkov a odvedencov je vyzbrojená skôr kopijami, štítmi, sekerami a doplnená kušami a lukmi. Táto pomocná pechota je chránená v lepšom prípade ľahkou prešívanou či vypchávanou zbrojou, kabátmi z kože. Hlavu majú schovanú v čiapkach, batvatoch a príležitostne aj v helmiciach.',
          'Súčasné gondorské sily sa delia na takzvané praporce. Severogondorské nesú znaky bieleho stromu s hviezdami; južanské rytierske korúhvy a pešie podporné praporce uznávajú za zjednocujúcu zástavu znak bielej labute. Rytieri a prípadne k nim prislúchajúci paholci však na štítoch či vrchných varkočoch nesú znaky svojich rodov.',
        ],
      },
      {
        title: 'O gondorskom kráľovstve',
        paragraphs: [
          'Gondor je najstarším kráľovstvom ľudí v Stredozemi. Aj napriek tomu, že jeho pôvodná moc dlho upadala, teraz, keď sa vrátil kráľ, je sila Gondoru opäť na vzostupe a pripravená získať si späť svoju dávnu slávu.',
          'Hranice gondorskej ríše možno nahliadať dvoma spôsobmi. Prvý je ten, ktorý používajú gondorskí páni — pohľad zahŕňajúci pôvodné historické územia Gondoru, ktoré sú dnes z veľkej časti pusté alebo obsadené Nepriateľom. Tento pohľad podnecuje túžbu znovu obsadiť krajiny Ithilienu, vrátiť južnú hranicu za rieku Poros, obsadiť Harondor a obnoviť pevnosti na toku Harnenu. Ešte optimistickejšie plány sa zaoberajú myšlienkami na znovuvybudovanie pevností pozdĺž Ered Lithui a obsadením Umbaru a priľahlých oblastí.',
          'Trochu triezvejší pohľad vníma hranice Gondoru tam, kde de facto ležia. Za západnú hranicu sa považuje Anfalas. Trávnatá, riedko osídlená vrchovina je akýmsi vzdialeným cípom gondorskej moci na západe. Páni a šľachta sú síce pokrvnými príbuznými Númenorejcov, no stará krv je nielen medzi prostým ľudom zmiešaná s pôvodnými obyvateľmi. Veľká vzdialenosť týchto krajín od srdca kráľovstva spôsobuje, že vojna s nepriateľom na východe sa zdá ako akýsi poverou opradený prízrak, ktorý pohlcuje odvedencov, ktorých si žiadajú páni z veľkého mesta. Lojalita voči ríši značne ochladla a len málo pánov vyslyšalo volanie nového kráľa.',
          'Z Anfalasu smerom na východ sa zdvíha podhorská krajina Lamedon. Opevnený, kvitnúci Morthond je hlavným sídlom kniežaťa, ktoré vládne krajine baníckych osád. Práve odtiaľ pochádza rudné bohatstvo Gondoru. Nielen železná ruda, ale aj strieborné žily a medené ložiská ukrýva vnútro Ered Nimrais.',
          'Južne od Lamedonu leží Belfalas. Vo svojej južnejšej časti, ktorá ako cíp vbieha do mora, zviera Dor-en-Ernil pretkané pohorím spolu s Anfalasom zátoku Nen Belfalas.',
          'Hlavné osídlenie však leží pozdĺž tokov a v delte riek Ciril a Ringló, neďaleko prístavu Edhellond. Bohatá poľnohospodárska krajina pretkaná hájmi a lesmi s cédrovým drevom na stavbu tých najlepších námorných a riečnych lodí. Tu sídli knieža Imrahil — hrad Dol Amroth, kvitnúce mesto a ďalší opevnený vojnový prístav, ktorý chráni pobrežie pred nájazdmi korzárov z Umbaru.',
          'Najzápadnejšou časťou južného Gondoru je Lebennin. Úrodná, popretkávaná pasienkami, poľami a lesmi. Krajina veľkých stád oviec, koní a iného dobytka, krajina tkáčov a sklárov. A v neposlednom rade krajina obchodníkov.',
          'Najväčší obchodný prístav Pelargir, ležiaci v delte veľtoku Anduiny, chránený ostrovom Tolfalas, je spolu s mestom Linhir, položeným viac na východe pri riečke Gilrain na hranici s Belfalasom, zdrojom bohatstva lebenninských kniežat.',
          'Tým výpočet krajín južného Gondoru končí. Severná oblasť je na tom o niečo biednejšie. Vojnou a ohňom postihnuté stoja Minas Tirith a jej biela veža, obklopené stiesneným Lossarnachom a Anórienom, krajinou hraničiacou s kráľovstvom Pánov koní.',
        ],
      },
    ],
  },
  uk: {
    name: 'Ґондор',
    tagline: 'Стражі заходу, кров Нуменору',
    combat_style: ['важча піхота', 'щити й мечі', 'списники', 'варта'],
    recommended_for: [
      'гравці, які шукають величний і геральдичний стиль',
      'групи',
      'досвідченіші бійці',
    ],
    not_recommended_for: [
      'гравці, які не мають часу підготувати костюм з геральдикою',
    ],
    tags: ['вільний народ', 'вища складність костюма', 'геральдичний стиль'],
    newbie_costume_hint:
      'Туніка в темно-синьому або чорному, срібні елементи, знак Білого Древа або семи зірок. Плащ, пояс, рівні мечі.',
    camp_hook:
      'Табір Ґондору справляє враження суворою дисципліною варти, молитвою за захід і вірною службою сюзерену.',
    costume_colors_text: 'синій, білий, сірий, з доповненням коричневого й срібного',
    heraldry_text: 'Срібне Древо із сімома зірками на темному полі',
    ruler: {
      name: 'Араґорн',
      title: 'Король Ґондору, спадкоємець Ісілдура',
      description:
        'Страж півночі, повернений король Заходу. Веде вершників Білого Древа та дружини стражів — об\'єднує те, що довго було розділене. Гравець Ґондору пізнає командира за білим древом на щиті, короткими наказами й спокійною витримкою у кризі.',
    },
    lore_sections: [
      {
        title: 'Стилізація костюма',
        paragraphs: [
          'Базова стилізація бійців ґондорських військ відповідає середньовічному суспільству Західної Європи 13–15 ст. Орієнтація на військовий стан, тобто класичний людський фентезійний воїн із готичним відтінком. Це доповнено стилізацією за фільмовою основою з акцентом на зображення геральдичних знаків (Біле Древо) і, по змозі, уніформоподібний стиль костюма. Йдеться фактично про регулярну армію з призваних. Основу складають допоміжні підрозділи легких списників, сокирників, мечників зі щитами та слідопитів-лучників.',
        ],
      },
      {
        title: 'Про ґондорську армію',
        paragraphs: [
          'Південний і північний Ґондор — це досить різні області.',
          'Південні землі після втрати королівської лінії поступово почали відокремлюватися, і їхні князі змогли свої краї, мало зачеплені війною, піднести до багатства й сили. Південна шляхта поступово створила окремий конгломерат князівств, поєднаних економічно й військово. Головною владою стали князі з Дол Амроту.',
          'Землі північного Ґондору, керовані безпосередньо намісником королівства, страждали від війни, мору й, відповідно, нестачі. Північні краї стали підтримуваним, слабнучим, бідним сусідом, якого в найважчі хвилини доводилося рятувати від колапсу — чи то військовою, чи економічною допомогою.',
          'Це значно позначилося на відмінних військових традиціях обох частин країни.',
          'Південна частина Ґондору є класично феодальною: князі спираються на родову ленну шляхту, з рядів якої рекрутується броньоване лицарство — основа південноґондорських контингентів. Ці контингенти доповнюються дружинниками й озброєними слугами лицарів і підкріплюються князівськими дружинами з пішим і кінним вояцтвом. Озброєння своє й своєї дружини лицар здобуває власним коштом, за що має право на частину воєнної здобичі та частку у владі.',
          'Північний Ґондор від цієї моделі повністю відмовився. Війна виснажила шляхту, і доводилося призивати дедалі більше людей на заміну втрат, а не лише дружини окремих панів. Тут війна була питанням виживання, і фактично кожен здоровий чоловік був до неї залучений. Намісники призначили шляхтичам уряди для управління й оборони краю і як верховні правителі панували над усіма виснажуваними князівствами. Армія постає на основі регулярних призовів. Військової служби можна уникнути лише викупом або іншою службою уряду намісника. Військо було об\'єднане під одним прапором. Шляхтичам надали офіцерські звання, але поступово офіцерський корпус доповнювали і простолюдинами.',
          'Одяг у ґондорській державі є відносно однаковим, попри згадані вище відмінності між верствами. Леббенін як край є не лише джерелом тканин, а й моди, що звідти поступово поширюється всією державою. Це, однак, не стосується простого люду, чий стиль одягу мало змінюється. Носять полотняні вільні штани або вільні зав\'язувані ногавиці (брахи), доповнені сорочками й туніками з лляних і вовняних тканин. Доволі модним кольором є відтінки синього з білим, сірим і коричневим. Стиль одягу відповідає 13–15 ст. Західної Європи.',
          'Воїни Ґондору одягнені залежно від походження. Королівське військо з півночі вбране в прості однострої. Воїни мають варкочі та розпізнавальні знаки білого древа й зірок. Однострій налаштований на чорний колір, у заможніших — із оксамитової тканини. Воїни озброєні відповідно до призначення підрозділу. Доволі поширена піхота, що краще придатна для оборонних боїв і бою в лісистих та схилистих місцинах. Базове озброєння пішака — щит овальної або гербової форми з мечем чи булавою. Підрозділи щитоносців доповнено підрозділами з довгими піхотними списами та побічними довгими ножами й тесаками. Ця піхота вбрана здебільшого у шоломи у формі залізних капелюхів, барбутів чи піших салетів. Як обладунок звичайні стьобані й набивні обладунки, у деяких підрозділах доповнені кольчужними чи напівпластинчастими комплектами. Як підтримку служать лучники, броньовані радше скромно.',
          'Підрозділи південного Ґондору фактично складено з кількох дружин шляхтичів, з яких один має вирішальне слово командира. Одяг далеко не такий уніфікований, як у північних загонах. Дружинники переважно без знаків розрізнення або носять знак свого пана — на щиті чи на варкочі. Південна шляхта має багато знаків, гербів і прапорів, але часткове об\'єднавче значення має прапор князя Дол Амроту з білим лебедем і чотирипроменевою зіркою. Шляхтичі озброєні кінним списом і щитом, що служить при першому ударі, після чого виймають мечі, сокири та булави. Вбрані в кольчужні або пластинчасті обладунки високої якості, ошоломлені. Допоміжна піхота з дружинників, слуг і призваних озброєна радше списами, щитами, сокирами й доповнена арбалетниками й лучниками. Цю допоміжну піхоту захищає в кращому разі легка стьобана або набивна обладунка, шкіряні каптани. Голову мають сховану в шапках, підшоломниках і подеколи у шоломах.',
          'Сьогоднішні ґондорські сили поділяються на так звані прапорці. Північноґондорські несуть знаки білого древа із зірками; південні лицарські хоругви та пішо-допоміжні прапорці визнають за об\'єднавчий стандарт знак білого лебедя. Лицарі ж і відповідні їм слуги несуть на щитах чи верхніх варкочах знаки своїх родів.',
        ],
      },
      {
        title: 'Про королівство Ґондор',
        paragraphs: [
          'Ґондор — найдавніше людське королівство в Середзем\'ї. Хоч його початкова сила довго згасала, нині, коли повернувся король, потуга Ґондору знову зростає, готова відвоювати свою давню славу.',
          'Кордони ґондорської держави можна сприймати двояко. Перше — те, як їх бачать ґондорські пани: погляд, що включає первісні історичні території Ґондору, нині значною мірою спустошені або зайняті Ворогом. Цей погляд розпалює бажання знову зайняти землі Ітіліену, відсунути південний кордон за річку Порос, опанувати Гарондор і відбудувати фортеці на течії Гарнену. Ще оптимістичніші плани мріють про відбудову фортець уздовж Еред Літуй і опанування Умбару й прилеглих областей.',
          'Дещо тверезіший погляд бачить кордони Ґондору там, де вони фактично пролягають. За західну межу вважають Анфалас. Трав\'яниста, рідко заселена височина — мовби далекий край ґондорської влади на заході. Пани й шляхта є кровними родичами нуменорців, але стара кров не лише серед простолюду змішана з первісними мешканцями. Велика віддаль цих земель від серця королівства призводить до того, що війна з ворогом на сході здається примарою, оповитою забобонами, що поглинає призваних, яких вимагають пани з великого міста. Вірність державі значно охолола, і мало хто з панів послухав поклику нового короля.',
          'З Анфаласу на схід піднімається передгірний край Ламедон. Укріплений, квітучий Мортонд — головна резиденція князя, що володарює над краєм гірницьких поселень. Саме звідти походить рудне багатство Ґондору. Не лише залізна руда, а й срібні жили й мідні поклади ховає надра Еред Німрайс.',
          'На південь від Ламедону лежить Бельфалас. У південнішій частині, що, мов мис, врізається у море, прорізаний горами Дор-ен-Ерніль разом з Анфаласом стискає затоку Нен Бельфалас.',
          'Однак головне населення живе вздовж річок і в дельті річок Кіріл та Рінґло, поблизу гавані Едгеллонду. Багатий сільськогосподарський край, переплетений гаями й лісами з кедровою деревиною для будівництва найкращих морських і річкових кораблів. Тут — резиденція князя Імрагіла — замок Дол Амрот, квітуче місто й ще одна укріплена воєнна гавань, яка обороняє узбережжя від набігів корсарів з Умбару.',
          'Найзахіднішою частиною південного Ґондору є Леббенін. Родюча, всипана пасовищами, полями й лісами. Край великих отар овець, табунів коней та іншої худоби, край ткачів і скляроробів. І, не в останню чергу, край купців.',
          'Найбільший торговий порт Пеларґір, що лежить у дельті потужного Андуїну й захищений островом Толфалас, разом із містом Лінгір, розташованим далі на схід при річечці Ґілрайн на межі з Бельфаласом, є джерелом багатства леббеннінських князів.',
          'Цим перелік країв південного Ґондору закінчується. Північна область — у дещо гіршому стані. Зруйновані війною та вогнем стоять Мінас Тіріт і її біла башта, оточені стиснутими Лоссарнахом і Анорієном, краєм, що межує з королівством Панів Коней.',
        ],
      },
    ],
  },
};

// ============================================================================
// RUNNER
// ============================================================================

const FILES = [
  'dwarves.yml',
  'elves.yml',
  'gondor.yml',
  'harad.yml',
  'rohan.yml',
  'skreti.yml',
  'skuruti.yml',
  'umbar.yml',
  'vrchovina.yml',
];

let written = 0;
let skipped = 0;

for (const file of FILES) {
  const filePath = path.join(FACTIONS_DIR, file);
  const raw = readFileSync(filePath, 'utf8');
  const data = yaml.load(raw);

  const cs = data.i18n?.cs;
  if (!cs) {
    console.warn(`  ${file}: missing i18n.cs — skipped`);
    skipped++;
    continue;
  }

  const langTable = TRANSLATIONS[file];
  if (!langTable) {
    console.warn(`  ${file}: no translation table — skipped`);
    skipped++;
    continue;
  }

  const newI18n = { cs };
  for (const lang of ['en', 'de', 'sk', 'uk']) {
    const T = langTable[lang] ?? {};
    const existing = data.i18n?.[lang] ?? {};
    newI18n[lang] = buildLang(cs, T, existing);
  }

  data.i18n = newI18n;

  const out = yaml.dump(data, {
    lineWidth: -1,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
  });
  writeFileSync(filePath, out, 'utf8');
  console.log(`  ${file}: translated (en/de/sk/uk)`);
  written++;
}

console.log(`\nDone. ${written} written, ${skipped} skipped.`);
