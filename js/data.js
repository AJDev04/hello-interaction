// Vragen, roastteksten en de logica die er een roast van maakt.
// Elke optie heeft een `score` (0–3): hoe "op orde" dat antwoord is.
// Vragen zonder score tellen niet mee voor de levensscore.

const QUESTIONS = [
  {
    id: "relatie",
    short: "Liefdesleven",
    question: "Wat is je relatiestatus?",
    hint: "Eerlijk zijn. We zien het toch aan je.",
    options: [
      { id: "single", label: "Single", score: 1 },
      { id: "relatie", label: "In een relatie", score: 3 },
      { id: "complex", label: "Het is ingewikkeld", score: 0 },
      { id: "situationship", label: "Situationship", score: 0 },
    ],
  },
  {
    id: "wonen",
    short: "Woonsituatie",
    question: "Waar woon je?",
    hint: "“Tijdelijk” bestaat niet als optie.",
    options: [
      { id: "alleen", label: "Alleen", score: 3 },
      { id: "ouders", label: "Bij mijn ouders", score: 0 },
      { id: "kot", label: "Op kot / met huisgenoten", score: 2 },
      { id: "partner", label: "Samen met mijn partner", score: 3 },
    ],
  },
  {
    id: "leeftijd",
    short: "Leeftijd",
    question: "Hoe oud ben je?",
    hint: "Je mentale leeftijd vragen we niet. Dat zou gemeen zijn.",
    options: [
      { id: "teen", label: "16 – 19" },
      { id: "twenty", label: "20 – 24" },
      { id: "late20", label: "25 – 29" },
      { id: "thirty", label: "30 of ouder" },
    ],
  },
  {
    id: "job",
    short: "Carrière",
    question: "Wat doe je in het leven?",
    hint: "“Mezelf vinden” telt niet.",
    options: [
      { id: "student", label: "Student", score: 2 },
      { id: "werk", label: "Ik werk (9-to-5)", score: 3 },
      { id: "werkloos", label: "Niets, eigenlijk", score: 0 },
      { id: "ondernemer", label: "Ondernemer (crypto, dropshipping, …)", score: 1 },
    ],
  },
  {
    id: "eten",
    short: "Eetgewoontes",
    question: "Wat eet je meestal?",
    options: [
      { id: "zelf", label: "Ik kook zelf", score: 3 },
      { id: "mama", label: "Wat mama kookt", score: 0 },
      { id: "diepvries", label: "Diepvriespizza & instant noodles", score: 1 },
      { id: "delivery", label: "Uber Eats / Deliveroo", score: 1 },
    ],
  },
  {
    id: "scherm",
    short: "Schermtijd",
    question: "Hoeveel schermtijd heb je per dag?",
    hint: "Kijk gerust even in je instellingen. Wij wachten.",
    options: [
      { id: "laag", label: "Minder dan 2 uur", score: 3 },
      { id: "mid", label: "2 tot 5 uur", score: 2 },
      { id: "hoog", label: "5 tot 8 uur", score: 1 },
      { id: "extreem", label: "Ik wil het niet weten", score: 0 },
    ],
  },
  {
    id: "hobby",
    short: "Hobby",
    question: "Wat is je grootste hobby?",
    options: [
      { id: "gamen", label: "Gamen", score: 1 },
      { id: "gym", label: "Naar de gym", score: 3 },
      { id: "tiktok", label: "TikTok scrollen", score: 0 },
      { id: "geen", label: "Ik heb geen hobby’s", score: 0 },
    ],
  },
  {
    id: "sport",
    short: "Sport",
    question: "Hoe vaak sport je?",
    options: [
      { id: "vaak", label: "Meerdere keren per week", score: 3 },
      { id: "abo", label: "Ik heb een abonnement, dat telt toch?", score: 1 },
      { id: "soms", label: "Soms, als ik er zin in heb", score: 1 },
      { id: "nooit", label: "Nooit", score: 0 },
    ],
  },
  {
    id: "zaterdag",
    short: "Zaterdagavond",
    question: "Wat doe je op zaterdagavond?",
    options: [
      { id: "uit", label: "Uitgaan", score: 3 },
      { id: "thuis", label: "Thuis, alleen, in pyjama", score: 1 },
      { id: "familie", label: "Tv kijken met mijn ouders", score: 0 },
      { id: "gamen", label: "Gamen tot 4 uur ’s nachts", score: 1 },
    ],
  },
  {
    id: "kamer",
    short: "Je kamer",
    question: "Hoe ziet je kamer eruit?",
    options: [
      { id: "proper", label: "Proper en opgeruimd", score: 3 },
      { id: "stoel", label: "Er staat een stoel vol kleren", score: 2 },
      { id: "chaos", label: "Totale chaos", score: 0 },
      { id: "mama", label: "Mama ruimt het op", score: 0 },
    ],
  },
  {
    id: "geld",
    short: "Financiën",
    question: "Hoe sta je ervoor, financieel?",
    options: [
      { id: "goed", label: "Ik spaar netjes", score: 3 },
      { id: "krap", label: "Het einde van de maand is spannend", score: 1 },
      { id: "ouders", label: "Mijn ouders betalen alles", score: 0 },
      { id: "crypto", label: "Alles zit in crypto", score: 1 },
    ],
  },
  {
    id: "talent",
    short: "Talent",
    question: "Wat is je grootste talent?",
    hint: "Laatste vraag. Daarna is er geen weg terug.",
    options: [
      { id: "praten", label: "Veel praten, weinig doen", score: 1 },
      { id: "slapen", label: "Slapen", score: 1 },
      { id: "uitstellen", label: "Uitstellen", score: 0 },
      { id: "niks", label: "Ik denk er morgen over na", score: 0 },
    ],
  },
];

// Eén roast per antwoord. Meerdere varianten = er wordt er willekeurig één gekozen.
const ROASTS = {
  relatie: {
    single: [
      "Single. Niet omdat je kieskeurig bent, maar omdat de markt ook kieskeurig is.",
      "Je bent single. Je Tinder-profiel heeft meer views dan een verkeersbord en ongeveer evenveel matches.",
    ],
    relatie: [
      "Je zit in een relatie. Respect voor je partner, echt. Dat is gewoon vrijwilligerswerk.",
      "Een relatie? Iemand heeft jou gezien en gedacht: “ja, daar kan ik mee leven.” Dat is geen liefde, dat is heldenmoed.",
    ],
    complex: [
      "“Het is ingewikkeld.” Nee hoor, het is heel simpel: de andere persoon wil niet echt.",
      "Ingewikkeld, zeg je. Een ingewikkelde relatie is gewoon een simpele afwijzing met extra stappen.",
    ],
    situationship: [
      "Een situationship: alle nadelen van een relatie, zonder dat iemand je ooit aan zijn of haar ouders voorstelt.",
      "Situationship. Jij noemt het “we zien wel”. De andere noemt het “niemand beters beschikbaar”.",
    ],
  },
  wonen: {
    alleen: [
      "Je woont alleen. Niemand hoort je tegen je planten praten. Behalve de buren. Die horen alles.",
      "Alleen wonen: de enige plek ter wereld waar jij nog de interessantste persoon in de kamer bent.",
    ],
    ouders: [
      "Je woont nog bij je ouders. Jij noemt het “sparen”, zij noemen het “wanneer vertrekt die nu eindelijk”.",
      "Nog bij je ouders. Je kamer heeft nog altijd hetzelfde behangpapier als toen je tien was, en jij eigenlijk ook dezelfde mentaliteit.",
    ],
    kot: [
      "Op kot. De afwas staat er al sinds de vorige blok en heeft ondertussen zijn eigen ecosysteem ontwikkeld.",
      "Met huisgenoten. Je yoghurt verdwijnt, niemand weet waarom, en toch doe jij alsof je de volwassene in huis bent.",
    ],
    partner: [
      "Je woont samen. Er is nu officieel iemand die weet hoe lang jij op het toilet zit, en die blijft toch. Voorlopig.",
      "Samenwonen. Je partner heeft je ’s ochtends gezien, zonder filter, en is niet weggelopen. Waarschijnlijk uit medelijden.",
    ],
  },
  leeftijd: {
    teen: [
      "16 tot 19. Je denkt dat je alles weet. Geniet ervan, dat gevoel komt nooit meer terug.",
      "Tiener. Je noemt alles “cringe”, maar we hebben het net over jouw antwoorden gehad.",
    ],
    twenty: [
      "Begin twintig: te oud om “ik ben nog jong” als excuus te gebruiken, te jong voor een midlifecrisis. Je zit in de wachtzaal van het leven.",
      "Twintiger. Je zegt al drie jaar “volgend jaar pak ik mijn leven echt aan”.",
    ],
    late20: [
      "Eind twintig. Je rug kraakt als je opstaat en je vindt 22-jarigen “zo jong”. Het is begonnen.",
      "25 tot 29. Je vrienden kopen huizen en krijgen kinderen. Jij kocht vorige week een nieuwe controller.",
    ],
    thirty: [
      "30+. Je zegt “vroeger was muziek beter” en je meent het. Je bent officieel je vader geworden.",
      "Dertig of ouder. Je gaat om 22u slapen en noemt dat “een wilde avond overleven”.",
    ],
  },
  job: {
    student: [
      "Student. Je kent de openingsuren van de fuif beter dan die van de bibliotheek.",
      "Je studeert. Of beter: je bent ingeschreven. Dat is niet hetzelfde, maar we snappen de verwarring.",
    ],
    werk: [
      "Een 9-to-5. Je leeft voor het weekend, en eerlijk: je weekend is ook niet zo speciaal.",
      "Je werkt voltijds. Je collega’s kennen je als “die van de koffiemachine” en dat is je hoogtepunt.",
    ],
    werkloos: [
      "Je doet “niets, eigenlijk”. Dat is tenminste eerlijk. Het is ook het enige wat je fulltime volhoudt.",
      "Werkloos. Op de vraag “en wat doe jij?” op feestjes antwoord je met een lange slok van je drankje.",
    ],
    ondernemer: [
      "“Ondernemer.” Je hebt een Instagram-bio met een raket-emoji en €14 omzet. Elon beeft.",
      "Crypto, dropshipping… Je noemt het een business. Je bankrekening noemt het een hobby die geld kost.",
    ],
  },
  eten: {
    zelf: [
      "Je kookt zelf. Pasta met pesto uit een potje telt niet als koken, maar oké, we laten het passeren.",
      "Zelf koken. Je rookalarm kent je bij naam.",
    ],
    mama: [
      "Je eet wat mama kookt. Je bent de enige vaste klant van een restaurant dat nooit een rekening stuurt.",
      "Mama kookt. Jij “helpt” door te vragen wanneer het klaar is.",
    ],
    diepvries: [
      "Diepvriespizza en instant noodles. Je bloed bestaat voor 40% uit zout.",
      "Je dieet is diepvriesvak. Je lichaam draait op E-nummers en ontkenning.",
    ],
    delivery: [
      "Uber Eats. De bezorger kent je beter dan je eigen familie, en heeft stilletjes medelijden met je.",
      "Je laat alles leveren. Je keuken is gewoon een erg duur rek voor afhaalzakjes.",
    ],
  },
  scherm: {
    laag: [
      "Minder dan 2 uur schermtijd. Leugenaar. Je telefoon stuurt je elke zondag een rapport en lacht je daarbij uit.",
      "Minder dan 2 uur per dag? Dat is schattig. Schattig en compleet gelogen.",
    ],
    mid: [
      "2 tot 5 uur schermtijd, zeg je. We geven je het voordeel van de twijfel. Nee, toch niet.",
      "Tussen 2 en 5 uur. Of zoals een normaal mens het zou noemen: “een halve werkdag naar TikTok staren”.",
    ],
    hoog: [
      "5 tot 8 uur per dag op je scherm. Dat is een voltijdse job. Jammer dat het niet betaalt.",
      "Tot 8 uur schermtijd. Je duim heeft meer kilometers gelopen dan jij dit jaar.",
    ],
    extreem: [
      "“Ik wil het niet weten.” Je telefoon wil het ook niet meer weten. Hij wordt warm van schaamte.",
      "Je wil je schermtijd niet weten. Goed zo. Sommige cijfers zijn beter voor de politie dan voor jezelf.",
    ],
  },
  hobby: {
    gamen: [
      "Gamen. Je hebt meer uren in games gestoken dan in gesprekken met mensen die je in het echt kent.",
      "Je hobby is gamen. Je K/D-ratio is beter dan je leven, en dat zegt echt niet veel.",
    ],
    gym: [
      "De gym. We weten het. Iedereen weet het. Je hebt het al drie keer gezegd voor we het vroegen.",
      "Gym als hobby. Je persoonlijkheid is een eiwitshake met een spiegel.",
    ],
    tiktok: [
      "TikTok scrollen als hobby. Je aandachtsspanne is korter dan deze zi",
      "TikTok is je hobby. Je hebt letterlijk van “niets doen” een activiteit gemaakt.",
    ],
    geen: [
      "Geen hobby’s. Je bent de menselijke versie van een laadscherm.",
      "Je hebt geen hobby’s. Als iemand vraagt wat je in je vrije tijd doet, is het eerlijke antwoord: “bestaan”.",
    ],
  },
  sport: {
    vaak: [
      "Je sport meerdere keren per week. Oké, maar je hoeft het niet elke keer in je story te zetten.",
      "Veel sporten. Je lichaam is een tempel. Je hoofd helaas een bouwwerf.",
    ],
    abo: [
      "Je hebt een abonnement. Je sponsort de gym eigenlijk gewoon. Heel nobel van je.",
      "Een abonnement telt niet als sporten. Een bibliotheekkaart maakt je ook niet slim.",
    ],
    soms: [
      "Je sport “als je er zin in hebt”. De laatste keer dat je er zin in had, was in maart. Van vorig jaar.",
      "Soms sporten, als je er zin in hebt. Je sportschoenen staan nog in de doos en hopen dat ze ooit buiten mogen.",
    ],
    nooit: [
      "Nooit sporten. De trap is jouw eindbaas.",
      "Je sport nooit. Als je “ik ben even buiten adem” zegt, heb je net je schoenen gestrikt.",
    ],
  },
  zaterdag: {
    uit: [
      "Uitgaan op zaterdag. Je staat daar met je drankje aan de rand van de dansvloer mee te knikken op het ritme. Legendarisch.",
      "Je gaat uit. Om 3u stuur je berichten waar je zondag spijt van hebt. Elke week. Traditie.",
    ],
    thuis: [
      "Zaterdagavond, alleen, in pyjama. Netflix vraagt “Kijk je nog?” en is daarmee de enige die checkt of je nog leeft.",
      "Alleen thuis in pyjama op zaterdag. Het wildste wat er gebeurt, is dat je een tweede zak chips opentrekt.",
    ],
    familie: [
      "Tv kijken met je ouders op zaterdagavond. Eerst De Slimste Mens, dan om 22u naar bed. Wild leven.",
      "Zaterdag met je ouders voor de tv. Je vader valt in slaap in de zetel en jij bent eigenlijk net hetzelfde, maar 30 jaar vroeger.",
    ],
    gamen: [
      "Gamen tot 4u ’s nachts. Je squad bestaat uit drie 12-jarigen die je elke avond uitschelden, en eerlijk: ze hebben gelijk.",
      "Gamen tot 4u. Je slaapritme is dat van een vleermuis, maar zonder de coole reputatie.",
    ],
  },
  kamer: {
    proper: [
      "Een propere kamer. Verdacht. Alles ligt waarschijnlijk onder je bed geschoven.",
      "Proper en opgeruimd, zeg je. Je hebt de kast dus nog niet opengedaan terwijl er iemand bij was.",
    ],
    stoel: [
      "De stoel vol kleren. Het is geen stoel meer, het is een kleerkast met poten. Hij heeft ondertussen een naam.",
      "Die stoel heeft al jaren niemand meer gedragen. Behalve je volledige garderobe.",
    ],
    chaos: [
      "Totale chaos. Archeologen gaan ooit de lagen in je kamer bestuderen om te begrijpen hoe dit is kunnen gebeuren.",
      "Chaos. Ergens in die kamer ligt een halve boterham die ondertussen zelfstandig kan ademen.",
    ],
    mama: [
      "Mama ruimt je kamer op. Ergens in een parallel universum bestaat er een versie van jou die volwassen is.",
      "Je moeder ruimt je kamer op. Je bent geen kind meer, je bent een project dat nooit afgeraakt.",
    ],
  },
  geld: {
    goed: [
      "Je spaart netjes. Voor wat precies? Je gaat toch nergens naartoe.",
      "Sparen. Knap. Je bent de enige die opgewonden raakt van een spaarrekening met 1,5% rente.",
    ],
    krap: [
      "Het einde van de maand is spannend. Het begin ook. En het midden eigenlijk ook.",
      "Financieel krap. Je bankapp openen is voor jou een horrorfilm.",
    ],
    ouders: [
      "Je ouders betalen alles. Je bent geen persoon, je bent een maandelijkse vaste kost.",
      "Papa en mama betalen. Je bent eigenlijk een abonnement waar ze niet meer van af raken.",
    ],
    crypto: [
      "Alles zit in crypto. “Het komt terug”, zeg je tegen jezelf. Al sinds 2021.",
      "Crypto. Je legt aan iedereen blockchain uit, maar kan zelf je eigen was niet doen.",
    ],
  },
  talent: {
    praten: [
      "Veel praten, weinig doen. Je zou een uitstekende politicus zijn.",
      "Je grootste talent is veel praten. Je vrienden hebben je in hun contacten staan als “niet opnemen”.",
    ],
    slapen: [
      "Je grootste talent is slapen. Eindelijk iets waar je in uitblinkt, en je bent er niet eens bewust bij.",
      "Slapen. Het enige waar je ooit 8 uur aan één stuk voor hebt doorgezet.",
    ],
    uitstellen: [
      "Uitstellen. Je had deze quiz eigenlijk vorige week al willen invullen.",
      "Je grootste talent is uitstellen. Deze roast lezen is waarschijnlijk ook iets wat je doet in plaats van iets nuttigs.",
    ],
    niks: [
      "“Ik denk er morgen over na.” Dat is het antwoord, en tegelijk het hele probleem.",
      "Je weet niet wat je talent is. Wij ook niet. We hebben lang gezocht.",
    ],
  },
};

// Combo's: pijnlijke combinaties van antwoorden. Een combo "gebruikt" de vragen
// in `uses`, zodat die niet nog eens apart geroast worden.
// Volgorde = prioriteit; er worden er maximaal 4 getoond.
const COMBOS = [
  {
    uses: ["relatie", "wonen", "zaterdag"],
    when: (a) => a.relatie === "single" && a.wonen === "alleen" && a.zaterdag === "thuis",
    lines: [
      "Single, alleen wonen én zaterdagavond alleen thuis in pyjama. Als je ooit verdwijnt, is Netflix de eerste die het merkt.",
    ],
  },
  {
    uses: ["relatie", "wonen"],
    when: (a) => a.relatie === "single" && a.wonen === "ouders",
    lines: [
      "Single én bij je ouders wonen. Laten we eerlijk zijn: dat hangt samen. “Wil je nog iets komen drinken bij mij?” “Ja, maar stil zijn, mama slaapt.”",
      "Het is triest dat je single bent, {naam}, maar het verbaast niemand. Je woont nog bij je ouders. Je date zou je vader moeten ontmoeten voor jij je eerste zin hebt afgemaakt.",
    ],
  },
  {
    uses: ["relatie", "wonen"],
    when: (a) => (a.relatie === "complex" || a.relatie === "situationship") && a.wonen === "ouders",
    lines: [
      "Een “ingewikkelde” relatie terwijl je bij je ouders woont. Geen wonder dat het ingewikkeld is: je date mag pas binnen als je vader slaapt.",
    ],
  },
  {
    uses: ["leeftijd", "wonen"],
    when: (a) => a.leeftijd === "thirty" && a.wonen === "ouders",
    lines: [
      "30+ en nog bij je ouders. Je bent niet meer “thuis blijven wonen”, je hoort gewoon bij de inboedel.",
    ],
  },
  {
    uses: ["job", "wonen"],
    when: (a) => a.job === "ondernemer" && a.wonen === "ouders",
    lines: [
      "“Ondernemer” die nog bij de ouders woont. Het hoofdkantoor van jouw imperium is een kinderkamer met glow-in-the-dark sterretjes op het plafond.",
    ],
  },
  {
    uses: ["job", "geld"],
    when: (a) => a.job === "ondernemer" && a.geld === "ouders",
    lines: [
      "Ondernemer, maar je ouders betalen alles. Je enige investeerders zijn papa en mama, en die zien nooit een return.",
    ],
  },
  {
    uses: ["eten", "kamer"],
    when: (a) => a.eten === "mama" && a.kamer === "mama",
    lines: [
      "Mama kookt én mama ruimt je kamer op. Dat is geen moeder meer, dat is personeel. Onbetaald personeel.",
    ],
  },
  {
    uses: ["relatie", "zaterdag"],
    when: (a) => a.relatie === "single" && (a.zaterdag === "gamen" || a.zaterdag === "thuis"),
    lines: [
      "Single en op zaterdagavond thuis. Het enige wat jij ooit “Player 2” hebt genoemd, is een controller.",
      "Je bent single en je zaterdagavond speelt zich af in pyjama of met een headset op. Het mysterie waarom je single bent, is bij deze opgelost.",
    ],
  },
  {
    uses: ["relatie", "zaterdag"],
    when: (a) => a.relatie === "relatie" && a.zaterdag === "thuis",
    lines: [
      "In een relatie, maar op zaterdag alleen thuis in pyjama. Je partner heeft “een drukke periode”. Al een half jaar.",
    ],
  },
  {
    uses: ["hobby", "sport"],
    when: (a) => a.hobby === "gym" && (a.sport === "nooit" || a.sport === "soms" || a.sport === "abo"),
    lines: [
      "Gym is je grootste hobby, maar je sport bijna nooit. Je bent dus iemand die graag in een gym rondhangt. Om te kijken. Dat is geen hobby, dat is zorgwekkend gedrag.",
    ],
  },
  {
    uses: ["job", "scherm"],
    when: (a) => a.job === "werkloos" && (a.scherm === "hoog" || a.scherm === "extreem"),
    lines: [
      "Geen job, maar wel uren schermtijd per dag. Je hebt dus wel een fulltime job: professioneel scroller. Jammer van het loon.",
    ],
  },
  {
    uses: ["hobby", "scherm"],
    when: (a) => a.hobby === "tiktok" && (a.scherm === "hoog" || a.scherm === "extreem"),
    lines: [
      "TikTok als hobby en een schermtijd waar je niet naar durft te kijken. Het algoritme kent je beter dan jij jezelf, en het is ook teleurgesteld.",
    ],
  },
  {
    uses: ["eten", "geld"],
    when: (a) => a.eten === "delivery" && a.geld === "krap",
    lines: [
      "Elke dag Uber Eats en dan klagen dat het einde van de maand spannend is. De bezorger rijdt letterlijk met jouw spaargeld weg.",
    ],
  },
  {
    uses: ["job", "zaterdag"],
    when: (a) => a.job === "student" && a.zaterdag === "familie",
    lines: [
      "Student, en toch op zaterdagavond met je ouders voor de tv. Het studentenleven, zoals niemand het ooit bedoeld heeft.",
    ],
  },
  {
    uses: ["job", "talent"],
    when: (a) => a.job === "student" && a.talent === "uitstellen",
    lines: [
      "Student met als grootste talent uitstellen. Je blok begint altijd “morgen”. Al drie academiejaren.",
    ],
  },
  {
    uses: ["kamer", "eten"],
    when: (a) => a.kamer === "chaos" && (a.eten === "diepvries" || a.eten === "delivery"),
    lines: [
      "Totale chaos en een dieet van diepvriespizza en afhaal. Onder je bed ligt een pizzadoos uit 2023 die ondertussen stemrecht heeft.",
    ],
  },
  {
    uses: ["wonen", "geld"],
    when: (a) => a.wonen === "ouders" && a.geld === "goed",
    lines: [
      "Je spaart netjes, maar je woont bij je ouders. Dat is geen sparen, {naam}, dat is gewoon niet betalen.",
    ],
  },
];

const INTROS = [
  "We hebben je antwoorden bekeken. We hebben er spijt van.",
  "We gaan eerlijk zijn, want niemand anders in je leven durft het.",
  "Bedankt om de vragen in te vullen. Maak je klaar, dit gaat pijn doen.",
  "We hebben je antwoorden gelezen. Twee keer. Het werd niet beter.",
];

const OUTROS = [
  "Maar hé, je hebt tenminste de moeite gedaan om deze quiz af te maken. Dat is meer dan je voor je toekomst doet.",
  "Dit was je roast. Je mag nu even huilen. Mama troost je wel.",
  "Neem het niet persoonlijk. Of wel. Eerlijk gezegd was het best persoonlijk.",
  "Deel dit gerust met je vrienden. Als je die hebt.",
];

const VERDICTS = [
  { max: 20, title: "Verloren zaak", text: "Wetenschappers bestuderen je als waarschuwing voor toekomstige generaties." },
  { max: 40, title: "Menselijke screensaver", text: "Je bent aanwezig, maar er gebeurt eigenlijk niets." },
  { max: 60, title: "Pijnlijk gemiddeld", text: "Niet erg genoeg om medelijden mee te hebben, niet goed genoeg om te onthouden." },
  { max: 80, title: "Verdacht functioneel", text: "Je hebt je leven redelijk op orde. Of je hebt gelogen. Waarschijnlijk dat laatste." },
  { max: 100, title: "Leugenaar", text: "Niemand is zo perfect. We hebben je antwoorden ter controle doorgestuurd naar je moeder." },
];

// Kleine seeded random, zodat een gebruiker dezelfde roast blijft zien tot er opnieuw gerold wordt.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function computeScore(answers) {
  let total = 0;
  let max = 0;
  for (const q of QUESTIONS) {
    const scores = q.options.map((o) => o.score).filter((s) => typeof s === "number");
    if (!scores.length) continue;
    max += Math.max(...scores);
    const chosen = q.options.find((o) => o.id === answers[q.id]);
    if (chosen && typeof chosen.score === "number") total += chosen.score;
  }
  return max ? Math.round((total / max) * 100) : 0;
}

function generateRoast(answers, seed, name) {
  const rand = mulberry32(seed);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const fill = (s) => s.replace(/\{naam\}/g, name);

  const used = new Set();
  const items = [];

  for (const combo of COMBOS) {
    if (items.length >= 4) break;
    if (combo.uses.some((id) => used.has(id))) continue;
    if (!combo.when(answers)) continue;
    items.push({ tag: "Combo", combo: true, text: fill(pick(combo.lines)) });
    combo.uses.forEach((id) => used.add(id));
  }

  for (const q of QUESTIONS) {
    if (used.has(q.id)) continue;
    const lines = ROASTS[q.id] && ROASTS[q.id][answers[q.id]];
    if (lines) items.push({ tag: q.short, combo: false, text: fill(pick(lines)) });
  }

  const score = computeScore(answers);
  const verdict = VERDICTS.find((v) => score <= v.max) || VERDICTS[VERDICTS.length - 1];

  return {
    intro: fill(pick(INTROS)),
    items,
    outro: fill(pick(OUTROS)),
    score,
    verdict,
  };
}
