// Streaming Place — curated demonstration catalogue.
// Availability varies by country, subscription and date; service links are not a live availability feed.

const tv = (id, title, provider, poster, year, genres, description, extra = {}) => ({
  id, title, provider, poster: `https://static.tvmaze.com/uploads/images/original_untouched/${poster}.jpg`,
  year, genres, description, type: 'Serie', ...extra
});
const movie = (id, title, poster, year, genres, description, extra = {}) => ({
  id, title, provider: 'Anbieter finden', poster: `https://image.tmdb.org/t/p/w500/${poster}.jpg`,
  year, genres, description, type: 'Film', ...extra
});

window.CATALOG = [
  tv('wednesday', 'Wednesday', 'Netflix', '586/1466410', 2022, ['Mystery','Fantasy','Comedy'], 'Wednesday Addams wird an die Nevermore Academy geschickt. Zwischen dunklen Geheimnissen, rätselhaften Visionen und einer Mordserie entdeckt sie, dass Anderssein ihre größte Stärke ist.', { badge:'Top-Highlight', seasons:2, age:'16+', match:'98%', backdrop:'https://static.tvmaze.com/uploads/images/original_untouched/423/1059627.jpg', trailer:'uQx8jKiIDTI', watchUrl:'https://www.netflix.com/de/title/81231974' }),
  tv('stranger-things', 'Stranger Things', 'Netflix', '595/1489169', 2016, ['Sci-Fi','Mystery','Drama'], 'Als ein Junge verschwindet, stoßen seine Freunde auf eine geheime Welt, gefährliche Experimente und ein Mädchen mit außergewöhnlichen Kräften.', { seasons:5, age:'16+', match:'97%', backdrop:'https://static.tvmaze.com/uploads/images/original_untouched/70/175852.jpg', trailer:'PssKpzB0Ah0', watchUrl:'https://www.netflix.com/de/title/80057281' }),
  tv('last-of-us', 'The Last of Us', 'Sky / WOW', '563/1409008', 2023, ['Drama','Thriller','Abenteuer'], 'In einer Welt nach dem Zusammenbruch der Zivilisation begeben sich Joel und Ellie auf eine Reise, die alles von ihnen verlangt.', { seasons:2, age:'16+', match:'96%', backdrop:'https://static.tvmaze.com/uploads/images/original_untouched/429/1072778.jpg', trailer:'_zHPsmXCjB0', watchUrl:'https://www.wowtv.de/' }),
  tv('fallout', 'Fallout', 'Prime Video', '599/1499142', 2024, ['Sci-Fi','Action','Drama'], 'Zweihundert Jahre nach der Apokalypse verlässt Lucy ihren sicheren Vault und entdeckt eine ebenso bizarre wie gnadenlose Welt an der Oberfläche.', { seasons:2, age:'16+', match:'97%', badge:'Fan-Favorit', backdrop:'https://static.tvmaze.com/uploads/images/original_untouched/514/1285808.jpg', trailer:'ECI3eCAxRGw', watchUrl:'https://www.primevideo.com/-/de/detail/0HAQAA7JM43QWX0H6GUD3IOF70' }),
  tv('the-boys', 'The Boys', 'Prime Video', '619/1547768', 2019, ['Action','Satire','Thriller'], 'Superhelden sind Stars – und längst nicht immer die Guten. Eine Gruppe Außenseiter will ihre dunklen Geheimnisse ans Licht bringen.', { seasons:5, age:'18+', match:'95%', trailer:'EzFXDvC-EwM', watchUrl:'https://www.amazon.de/gp/video/' }),
  tv('house-dragon', 'House of the Dragon', 'Sky / WOW', '627/1568449', 2022, ['Fantasy','Drama','Action'], 'Westeros vor Game of Thrones: Macht, Drachen und ein erbitterter Kampf um den Eisernen Thron.', { seasons:3, age:'16+', match:'94%', backdrop:'https://static.tvmaze.com/uploads/images/original_untouched/218/547436.jpg', watchUrl:'https://www.wowtv.de/' }),
  tv('only-murders', 'Only Murders in the Building', 'Disney+', '586/1466415', 2021, ['Comedy','Krimi','Mystery'], 'Drei True-Crime-Fans werden selbst zu Detektiven, als in ihrem New Yorker Apartmenthaus ein Mord geschieht.', { seasons:5, age:'12+', match:'91%', watchUrl:'https://www.disneyplus.com/de-de' }),
  tv('mandalorian', 'The Mandalorian', 'Disney+', '501/1253498', 2019, ['Sci-Fi','Abenteuer','Action'], 'Ein einsamer Kopfgeldjäger reist durch die entlegenen Winkel der Galaxis und findet dabei eine unerwartete Bestimmung.', { seasons:3, age:'12+', match:'98%', backdrop:'https://static.tvmaze.com/uploads/images/original_untouched/218/547389.jpg', watchUrl:'https://www.disneyplus.com/series/the-mandalorian/3jLIGMDYINqD' }),
  tv('loki', 'Loki', 'Disney+', '478/1195717', 2021, ['Marvel','Sci-Fi','Abenteuer'], 'Der Gott des Schabernacks gerät in einen Strudel aus Zeitlinien, Varianten und Entscheidungen, die das ganze Multiversum verändern.', { seasons:2, age:'12+', match:'95%', watchUrl:'https://www.disneyplus.com/series/loki/6pARMvILBGzF' }),
  tv('the-bear', 'The Bear', 'Disney+', '629/1574642', 2022, ['Drama','Comedy','Food'], 'Ein Spitzenkoch kehrt nach Chicago zurück, um den chaotischen Sandwichladen seiner Familie neu zu erfinden.', { seasons:4, age:'16+', match:'95%', watchUrl:'https://www.disneyplus.com/de-de' }),
  tv('tulsa-king', 'Tulsa King', 'Paramount+', '646/1615902', 2022, ['Crime','Drama','Comedy'], 'Nach 25 Jahren Haft soll Mafia-Capo Dwight Manfredi im fernen Tulsa ein neues kriminelles Imperium aufbauen.', { seasons:3, age:'16+', match:'92%', watchUrl:'https://www.paramountplus.com/shows/tulsa-king/' }),
  tv('yellowstone', 'Yellowstone', 'Paramount+', '545/1362616', 2018, ['Western','Drama'], 'Die Familie Dutton kämpft um ihre Ranch, ihre Macht und das Land, das sie seit Generationen verteidigt.', { seasons:5, age:'16+', match:'95%', watchUrl:'https://www.paramountplus.com/' }),
  tv('halo', 'Halo', 'Paramount+', '502/1256105', 2022, ['Sci-Fi','Action'], 'Master Chief und die Spartans stellen sich einer übermächtigen außerirdischen Bedrohung.', { seasons:2, age:'16+', match:'91%', watchUrl:'https://www.paramountplus.com/shows/halo/' }),
  tv('severance', 'Severance', 'Apple TV+', '548/1371406', 2022, ['Mystery','Sci-Fi','Thriller'], 'Bei Lumon Industries werden berufliche und private Erinnerungen voneinander getrennt. Doch ein Geheimnis bringt die perfekte Ordnung ins Wanken.', { seasons:2, age:'16+', match:'97%', backdrop:'https://static.tvmaze.com/uploads/images/original_untouched/384/960581.jpg', watchUrl:'https://tv.apple.com/de/show/severance/umc.cmc.1srk2goyh2q2zdxcx605w8vtx' }),
  tv('silo', 'Silo', 'Apple TV+', '631/1577677', 2023, ['Sci-Fi','Drama','Mystery'], 'Tausende Menschen leben unter der Erde. Niemand kennt die Wahrheit über die Außenwelt – bis eine Ingenieurin Fragen stellt.', { seasons:2, age:'16+', match:'93%', watchUrl:'https://tv.apple.com/de/show/silo/umc.cmc.3yksgc857px0k0rqe5zd4jice' }),
  tv('squid-game', 'Squid Game', 'Netflix', '576/1440521', 2021, ['Thriller','Drama','Survival'], 'Hunderte Verschuldete treten in scheinbar harmlosen Kinderspielen gegeneinander an. Der Preis ist riesig, der Einsatz tödlich.', { seasons:3, age:'16+', match:'96%', watchUrl:'https://www.netflix.com/de/title/81040344' }),
  tv('peaky', 'Peaky Blinders', 'Netflix', '48/122213', 2013, ['Crime','Drama','Historie'], 'Im Birmingham der 1920er-Jahre baut Tommy Shelby sein Familienimperium aus – koste es, was es wolle.', { seasons:6, age:'16+', match:'96%', watchUrl:'https://www.netflix.com/de/' }),
  tv('euphoria', 'Euphoria', 'Sky / WOW', '621/1552657', 2019, ['Drama','Coming of Age'], 'Ein intensiver Blick auf Liebe, Identität und Freundschaften im digitalen Zeitalter.', { seasons:3, age:'18+', match:'91%', watchUrl:'https://www.wowtv.de/' }),
  tv('andor', 'Andor', 'Disney+', '564/1411766', 2022, ['Sci-Fi','Thriller','Star Wars'], 'Die Geschichte von Cassian Andor und den ersten Funken einer Rebellion, die das Imperium herausfordern wird.', { seasons:2, age:'12+', match:'97%', watchUrl:'https://www.disneyplus.com/series/andor/3xsQKWG00GL5' }),
  tv('white-lotus', 'The White Lotus', 'Sky / WOW', '557/1393876', 2021, ['Satire','Drama','Mystery'], 'Luxusurlaub mit Abgründen: Hinter dem perfekten Resort-Leben brodeln Intrigen und Geheimnisse.', { seasons:3, age:'16+', match:'93%', watchUrl:'https://www.wowtv.de/' }),
  tv('penguin', 'The Penguin', 'Sky / WOW', '536/1340329', 2024, ['Crime','Drama','DC'], 'Nach den Ereignissen in Gotham kämpft Oz Cobb um die Macht in der Unterwelt der Stadt.', { seasons:1, age:'16+', match:'94%', watchUrl:'https://www.wowtv.de/' }),
  tv('wheel-time', 'The Wheel of Time', 'Prime Video', '564/1411765', 2021, ['Fantasy','Abenteuer','Drama'], 'In einer Welt voller Magie und uralter Prophezeiungen beginnt eine Reise, die das Schicksal aller verändern kann.', { seasons:3, age:'16+', match:'90%', watchUrl:'https://www.amazon.de/gp/video/' }),
  tv('reacher', 'Reacher', 'Prime Video', '636/1591350', 2022, ['Action','Thriller','Crime'], 'Ein ehemaliger Militärermittler reist ohne festen Wohnsitz durchs Land und gerät in gefährliche Verschwörungen.', { seasons:3, age:'16+', match:'94%', watchUrl:'https://www.amazon.de/gp/video/' }),

  movie('dune-2', 'Dune: Part Two', '1pdfLvkbY9ohJlCjQH2CZjjYVvJ', 2024, ['Sci-Fi','Abenteuer'], 'Paul Atreides verbündet sich mit den Fremen und stellt sich einer Entscheidung, von der das Schicksal des Universums abhängt.', { duration:'2 Std. 46 Min.', age:'12+', badge:'Cinema Pick', backdrop:'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg', trailer:'Way9Dexny3w' }),
  movie('oppenheimer', 'Oppenheimer', '8Gxv8gSFCU0XGDykEGv7zR1n2ua', 2023, ['Drama','Historie'], 'Christopher Nolans packendes Porträt des Physikers J. Robert Oppenheimer und der Entstehung der Atombombe.', { duration:'3 Std.', age:'12+' }),
  movie('barbie', 'Barbie', 'iuFNMS8U5cb6xfzi51Dbkovj7vM', 2023, ['Comedy','Fantasy'], 'Barbie verlässt die perfekte Welt von Barbieland und entdeckt, wie bunt und kompliziert das echte Leben sein kann.', { duration:'1 Std. 54 Min.', age:'6+' }),
  movie('interstellar', 'Interstellar', 'gEU2QniE6E77NI6lCU6MxlNBvIx', 2014, ['Sci-Fi','Drama'], 'Ein Team von Astronauten reist durch ein Wurmloch, um für die Menschheit eine neue Heimat zu finden.', { duration:'2 Std. 49 Min.', age:'12+' }),
  movie('batman', 'The Batman', '74xTEgt7R36Fpooo50r9T25onhq', 2022, ['Crime','Action'], 'Batman folgt einer Spur düsterer Rätsel durch Gotham und entdeckt die Korruption hinter der Fassade der Stadt.', { duration:'2 Std. 56 Min.', age:'12+' }),
  movie('dark-knight', 'The Dark Knight', 'qJ2tW6WMUDux911r6m7haRef0WH', 2008, ['Action','Thriller'], 'Batman stellt sich einem Gegner, der Gotham ins Chaos stürzen und alle Regeln außer Kraft setzen will.', { duration:'2 Std. 32 Min.', age:'16+' }),
  movie('spiderverse', 'Across the Spider-Verse', '8Vt6mWEReuy4Of61Lnj5Xj704m8', 2023, ['Animation','Action'], 'Miles Morales springt durch das Multiversum und trifft auf andere Spider-People – und schwere Entscheidungen.', { duration:'2 Std. 20 Min.', age:'12+' }),
  movie('top-gun', 'Top Gun: Maverick', '62HCnUTziyWcpDaBO2i1DX17ljH', 2022, ['Action','Drama'], 'Pete „Maverick“ Mitchell kehrt zurück, um eine neue Generation von Elitepiloten auf eine riskante Mission vorzubereiten.', { duration:'2 Std. 10 Min.', age:'12+' }),
  movie('avatar', 'Avatar: The Way of Water', 't6HIqrRAclMCA60NsSmeqe9RmNV', 2022, ['Sci-Fi','Abenteuer'], 'Jake Sully und seine Familie entdecken die Wunder der Ozeane Pandoras und müssen ihr Zuhause erneut beschützen.', { duration:'3 Std. 12 Min.', age:'12+' }),
  movie('poor-things', 'Poor Things', 'kQs6keheMwCxJxrzV83VUwFtHkB', 2023, ['Drama','Fantasy'], 'Bella Baxter unternimmt eine ungewöhnliche Reise voller Entdeckungen, Freiheit und Selbstbestimmung.', { duration:'2 Std. 21 Min.', age:'16+' }),
];

window.PROVIDERS = [
  { name: 'Alle', slug: 'all', glyph:'✦' },
  { name: 'Netflix', slug: 'Netflix', glyph:'N' },
  { name: 'Prime Video', slug: 'Prime Video', glyph:'prime' },
  { name: 'Disney+', slug: 'Disney+', glyph:'Disney+' },
  { name: 'Paramount+', slug: 'Paramount+', glyph:'paramount+' },
  { name: 'Sky / WOW', slug: 'Sky / WOW', glyph:'sky / wow' },
  { name: 'Apple TV+', slug: 'Apple TV+', glyph:'tv+' },
];

window.HERO_IDS = ['wednesday','fallout','last-of-us','dune-2'];
