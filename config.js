/* ==========================================================================
   config.js: EVERYTHING ABOUT THE CLIENT LIVES IN THIS FILE.
   Client: Eden Villa (Eden Tours Ltd), Belle Mare, Mauritius.
   Facts come from the old site edentourltd.com. Lines marked ESEMPIO / SAMPLE
   or CONFIRM are placeholders to check with the client before launch.

   - Text is written { it: "...", en: "..." }. "languages" decides what visitors see.
   - Leave a value empty ("") or delete a list item to hide it. Set
     enabled: false on a section to remove it.
   - Prices are in euros (currency.base) per room per night. Visitors can
     switch to rupees or dollars using the rates in "currency".
   - Photos: img("unsplash-id", alt) for Unsplash, or img("assets/photos/x.jpg", alt).
   ========================================================================== */
/* Demo only: full dates counted from today, so the calendars always show some. For real ones write the dates: ["2026-12-20", "2027-01-03"] */
function soon(inDays, nights) { const d = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10); return [d(inDays), d(inDays + nights)]; }
function img(id, alt) { return { src: id.includes('/') ? id : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=70`, alt: alt || '' }; }
const WA = "393478442855";   // used for the tour links below; keep in step with contact.whatsapp

window.SITE = {

  /* ---------- 1. The business ---------- */
  name: "Eden Villa",
  legalName: "Eden Tours Ltd",
  tagline: { it: "Piccolo hotel di famiglia ed escursioni nel centro di Belle Mare, a 70 metri dalla spiaggia.", en: "A small family hotel and day tours in the centre of Belle Mare, 70 metres from the beach." },
  logo: { image: "", mark: "E", text: "Eden Villa" },

  /* ---------- 2. Brand ---------- */
  colors: {
    primary: "#1E3F31",  // deep palm green
    accent:  "#C98A4B",  // terracotta gold
    dark:    "#0F1E18",
    light:   "#F3EEE4",
  },
  fonts: { heading: "Cormorant Garamond", headingWeights: "500;600;700", headingFallback: "Georgia, serif", body: "Jost", bodyWeights: "400;500;600" },
  darkMode: true,
  languages: ["en", "it"],   // English first (the default); Italian for Eden's Italian guests. ["en"] shows English only
  defaultLanguage: "en",
  timeZone: "Indian/Mauritius",

  currency: {
    base: "EUR",                           // prices below are in euros
    rates: { MUR: 52, USD: 1.08 },         // 1 euro in rupees and dollars. Update now and then. Remove a line to hide that currency
    default: "EUR",
    secondary: "",
  },

  /* ---------- 3. Contact (from edentourltd.com) ---------- */
  contact: {
    phone: "+39 347 844 2855",
    whatsapp: WA,   // CONFIRM: the old site lists this as a phone number only; check it has WhatsApp
    whatsappMessage: { it: "Ciao Eden Villa, vorrei informazioni per un soggiorno.", en: "Hello Eden Villa, I would like to ask about a stay." },
    email: "edentourltd@yahoo.com",
    responseTime: { it: "Ti rispondiamo in italiano, inglese, tedesco, spagnolo o francese.", en: "We reply in Italian, English, German, Spanish or French." },
    street: { it: "Centro di Belle Mare, di fronte alla stazione di polizia", en: "Belle Mare village centre, opposite the police station" },
    city: "Belle Mare",
    region: "Flacq",
    postalCode: "",
    country: { it: "Mauritius", en: "Mauritius" },
    countryCode: "MU",
    lat: -20.1905, lng: 57.7645,   // CONFIRM the exact pin
    mapEmbed: "https://www.google.com/maps?q=Belle+Mare+Police+Station+Mauritius&z=16&output=embed",
    mapsLink: "",
    // Google Business profile (Mid pack: "+ Google Business"). CONFIRM: replace both with the hotel's own profile and its "write a review" link
    googleBusiness: "https://www.google.com/maps/search/?api=1&query=Eden+Villa+Belle+Mare+Mauritius",
    googleReview: "https://www.google.com/maps/search/?api=1&query=Eden+Villa+Belle+Mare+Mauritius",
  },
  hours: null,
  social: { facebook: "https://www.facebook.com/Eden-Tours-607553109400207", instagram: "", tripadvisor: "", google: "", tiktok: "", youtube: "" },

  /* ---------- 4. Google and link previews ---------- */
  seo: {
    title: { it: "Eden Villa | Hotel ed escursioni a Belle Mare, Mauritius", en: "Eden Villa | Hotel and day tours in Belle Mare, Mauritius" },
    description: { it: "Piccolo hotel di famiglia a 70 m dalla spiaggia di Belle Mare: piscina, ristorante, B&B o mezza pensione ed escursioni. Prezzi e disponibilità in diretta.", en: "A small family hotel 70 m from Belle Mare beach: pool, restaurant, B&B or half board and day tours. Live prices and availability." },
    image: "https://images.unsplash.com/photo-1634972312739-d7237018e06a?auto=format&fit=crop&q=70",
    favicon: "assets/favicon.svg",
    schemaType: "Hotel",
    priceRange: "€60 – €130",
    siteUrl: "https://edentourltd.com/",   // CONFIRM the final address. Also in sitemap.xml and robots.txt
  },

  /* ---------- 5. Booking requests ---------- */
  form: { endpoint: "" },  // e.g. "https://formspree.io/f/abcdwxyz". Empty = the request opens the visitor's email app
  booking: {
    sendVia: "both",     // "both", "endpoint" or "whatsapp"
    depositPct: 0,       // CONFIRM the deposit policy; e.g. 30 shows "30% deposit to confirm". 0 hides it
    defaultNights: 7,
    refPrefix: "EV",
    longStay: [{ nights: 10, pct: 5 }, { nights: 14, pct: 10 }],  // ESEMPIO / SAMPLE long-stay discounts: agree them with the client or set []
  },

  /* ---------- 6. The rooms ----------
     ESEMPIO / SAMPLE: the old site does not list room types or prices. These three come from the real room photos; confirm names, sizes and prices.
     price: per room per night, bed & breakfast, in euros. seasons: other prices between two dates ("MM-DD", may cross New Year).
     capacity: most guests. minNights: shortest stay (a season can set its own).
     booked: nights already taken, crossed out in the calendars: [first night, day they leave]. Update it when a booking comes in. */
  villas: [
    {
      id: "superior", name: { it: "Camera Superior", en: "Superior Room" }, badge: { it: "Con vasca", en: "With bathtub" },
      short: { it: "La nostra camera più ampia, con vasca da bagno e posto per un bambino.", en: "Our largest room, with a bathtub and space for a child." },
      price: 85, capacity: 3, minNights: 3,
      booked: [soon(4, 6), soon(18, 5), soon(33, 8), soon(55, 7)],
      seasons: [{ name: { it: "Natale e Capodanno", en: "Christmas and New Year" }, from: "12-20", to: "01-06", price: 130, minNights: 7 }, { name: { it: "Alta stagione", en: "High season" }, from: "11-01", to: "04-30", price: 100, minNights: 4 }, { name: { it: "Inverno australe", en: "Southern winter" }, from: "06-01", to: "08-31", price: 75 }],
      images: [img("assets/photos/eden-superior-room.jpg", { it: "Camera Superior con letto matrimoniale", en: "Superior Room with a double bed" }), img("assets/photos/eden-pool.jpg", { it: "La piscina dell'hotel", en: "The hotel pool" }), img("assets/photos/eden-restaurant.jpg", { it: "Il ristorante", en: "The restaurant" }), img("assets/photos/eden-pool-terrace.jpg", { it: "Lettini a bordo piscina", en: "Loungers by the pool" })],
      features: [{ icon: "bed", label: { it: "Letto matrimoniale", en: "Double bed" } }, { icon: "users", label: { it: "Fino a 3", en: "Up to 3" } }, { icon: "home", label: { it: "Vasca da bagno", en: "Bathtub" } }, { icon: "wifi", label: { it: "Wi-Fi gratuito", en: "Free Wi-Fi" } }, { icon: "lock", label: { it: "Cassaforte", en: "Safe" } }, { icon: "leaf", label: { it: "Mobili in bambù", en: "Bamboo furniture" } }],
      description: [{ it: "Arredata con mobili etnici in bambù e tessuti decorati, ha il bagno privato con vasca e lo spazio per un lettino. A pochi passi dalla piscina e dal ristorante.", en: "Furnished with ethnic bamboo pieces and decorated fabrics, with a private bathroom with a bathtub and room for a child's bed. A few steps from the pool and the restaurant." }],
      amenities: [{ it: "Bagno privato con vasca", en: "Private bathroom with bathtub" }, { it: "Minibar", en: "Minibar" }, { it: "Cassaforte", en: "Safe" }, { it: "Asciugacapelli", en: "Hairdryer" }, { it: "Wi-Fi gratuito", en: "Free Wi-Fi" }, { it: "Frutta e acqua di benvenuto", en: "Welcome fruit and water" }],
    },
    {
      id: "double", name: { it: "Camera Doppia", en: "Double Room" }, badge: "",
      short: { it: "Luminosa e tranquilla, con letto matrimoniale e doccia.", en: "Bright and quiet, with a double bed and a shower." },
      price: 70, capacity: 2, minNights: 3,
      booked: [soon(2, 5), soon(12, 4), soon(27, 9), soon(64, 6)],
      seasons: [{ name: { it: "Natale e Capodanno", en: "Christmas and New Year" }, from: "12-20", to: "01-06", price: 110, minNights: 7 }, { name: { it: "Alta stagione", en: "High season" }, from: "11-01", to: "04-30", price: 85, minNights: 4 }, { name: { it: "Inverno australe", en: "Southern winter" }, from: "06-01", to: "08-31", price: 60 }],
      images: [img("assets/photos/eden-double-room.jpg", { it: "Camera Doppia con letto matrimoniale", en: "Double Room with a double bed" }), img("assets/photos/eden-pool.jpg", { it: "La piscina dell'hotel", en: "The hotel pool" }), img("assets/photos/eden-lobster.jpg", { it: "Aragosta dalla nostra cucina", en: "Lobster from our kitchen" })],
      features: [{ icon: "bed", label: { it: "Letto matrimoniale", en: "Double bed" } }, { icon: "users", label: { it: "2 persone", en: "2 guests" } }, { icon: "home", label: { it: "Doccia", en: "Shower" } }, { icon: "wifi", label: { it: "Wi-Fi gratuito", en: "Free Wi-Fi" } }],
      description: [{ it: "Una camera nuova e semplice, con mobili in bambù, bagno privato con box doccia e tutto quello che serve dopo una giornata al mare.", en: "A new, simple room with bamboo furniture, a private bathroom with a shower and everything you need after a day at the beach." }],
      amenities: [{ it: "Bagno privato con doccia", en: "Private bathroom with shower" }, { it: "Minibar", en: "Minibar" }, { it: "Cassaforte", en: "Safe" }, { it: "Asciugacapelli", en: "Hairdryer" }, { it: "Wi-Fi gratuito", en: "Free Wi-Fi" }],
    },
    {
      id: "twin", name: { it: "Camera Twin", en: "Twin Room" }, badge: "",
      short: { it: "Due letti singoli: ideale per amici o per chi viaggia con un ragazzo.", en: "Two single beds: right for friends, or a parent with an older child." },
      price: 70, capacity: 2, minNights: 3,
      booked: [soon(7, 4), soon(21, 6), soon(41, 5)],
      seasons: [{ name: { it: "Natale e Capodanno", en: "Christmas and New Year" }, from: "12-20", to: "01-06", price: 110, minNights: 7 }, { name: { it: "Alta stagione", en: "High season" }, from: "11-01", to: "04-30", price: 85, minNights: 4 }, { name: { it: "Inverno australe", en: "Southern winter" }, from: "06-01", to: "08-31", price: 60 }],
      images: [img("assets/photos/eden-twin-room.jpg", { it: "Camera Twin con due letti", en: "Twin Room with two beds" }), img("assets/photos/eden-pool-terrace.jpg", { it: "Lettini a bordo piscina", en: "Loungers by the pool" }), img("assets/photos/eden-restaurant.jpg", { it: "Il ristorante", en: "The restaurant" })],
      features: [{ icon: "bed", label: { it: "Due letti", en: "Two beds" } }, { icon: "users", label: { it: "2 persone", en: "2 guests" } }, { icon: "snow", label: { it: "Aria condizionata", en: "Air-con" } }, { icon: "wifi", label: { it: "Wi-Fi gratuito", en: "Free Wi-Fi" } }],
      description: [{ it: "Due letti, tende calde e un'atmosfera tranquilla. Bagno privato, minibar e cassaforte come in tutte le nostre camere.", en: "Two beds, warm curtains and a calm feel. Private bathroom, minibar and safe, as in all our rooms." }],
      amenities: [{ it: "Bagno privato", en: "Private bathroom" }, { it: "Minibar", en: "Minibar" }, { it: "Cassaforte", en: "Safe" }, { it: "Asciugacapelli", en: "Hairdryer" }, { it: "Wi-Fi gratuito", en: "Free Wi-Fi" }],
    },
  ],

  /* Extras the guest can tick (prices from the old site unless marked). per: "booking" (once), "night", "person", "personNight" */
  extras: [
    { id: "halfboard", icon: "coffee", price: 25, per: "personNight", label: { it: "Mezza pensione", en: "Half board" }, text: { it: "Cena nel nostro ristorante ogni sera (ESEMPIO: prezzo da confermare)", en: "Dinner in our restaurant every evening (SAMPLE price, to confirm)" } },
    { id: "airport", icon: "car", price: 100, per: "person", label: { it: "Transfer aeroporto andata e ritorno", en: "Airport transfer, both ways" }, text: { it: "€50 a persona per tratta", en: "€50 per person each way" } },
    { id: "cerfs", icon: "anchor", price: 40, per: "person", label: { it: "Escursione all'Île aux Cerfs", en: "Île aux Cerfs day trip" }, text: { it: "Barca privata, cascata e barbecue di pesce o carne con bevande", en: "Private boat, the waterfall and a fish or meat barbecue with drinks" } },
    { id: "lobster", icon: "fish", price: 50, per: "person", label: { it: "Aragosta all'Île aux Cerfs", en: "Lobster on Île aux Cerfs" }, text: { it: "In aggiunta al barbecue dell'escursione", en: "Added to the day trip barbecue" } },
    { id: "xmas", icon: "heart", price: 50, per: "person", label: { it: "Cenone della Vigilia", en: "Christmas Eve dinner" }, text: { it: "24 dicembre", en: "24 December" } },
    { id: "nye", icon: "sparkle", price: 50, per: "person", label: { it: "Cenone di Capodanno con aragosta", en: "New Year's Eve dinner with lobster" }, text: { it: "31 dicembre", en: "31 December" } },
  ],

  /* Shown on the rooms page */
  policies: {
    checkIn: "", checkOut: "",
    title: { it: "Buono a sapersi", en: "Good to know" },
    items: [
      { icon: "coffee", title: { it: "B&B o mezza pensione", en: "B&B or half board" }, text: { it: "La colazione è sempre inclusa. Con la mezza pensione ceni anche nel nostro ristorante.", en: "Breakfast is always included. With half board you also dine in our restaurant." } },
      { icon: "users", title: { it: "Bambini", en: "Children" }, text: { it: "Gratis fino a 2 anni, metà prezzo da 2 a 12 anni, prezzo adulto oltre i 12.", en: "Free under 2, half price from 2 to 12, adult price over 12." } },
      { icon: "heart", title: { it: "Benvenuto", en: "Welcome" }, text: { it: "Frutta fresca e mezzo litro d'acqua in camera all'arrivo.", en: "Fresh fruit and half a litre of water in your room on arrival." } },
      { icon: "calendar", title: { it: "Feste", en: "Festive season" }, text: { it: "Cenone della Vigilia e di Capodanno con aragosta: €50 a persona ciascuno.", en: "Christmas Eve and New Year's Eve dinner with lobster: €50 per person each." } },
    ],
  },

  /* ---------- 7. Pages, section by section ---------- */
  sections: {
    hero: {
      eyebrow: { it: "Belle Mare · Costa est di Mauritius", en: "Belle Mare · East coast of Mauritius" },
      title: { it: "Il tuo hotel di famiglia a Mauritius", en: "Your family hotel in Mauritius" },
      text: { it: "A 70 metri dalla spiaggia, nel centro di Belle Mare: piscina, ristorante, escursioni organizzate da noi e qualcuno che parla la tua lingua.", en: "70 metres from the beach, in the centre of Belle Mare: a pool, a restaurant, day tours we run ourselves and someone who speaks your language." },
      images: [img("1634972312739-d7237018e06a", "A beach in Mauritius with the mountains behind"), img("1513415277900-a62401e19be4", "Le Morne and its lagoon from the air"), img("1513415563383-4e580ed27a46", "The south-west coast of Mauritius from the air")],
    },
    whyDirect: {
      eyebrow: { it: "Prenota con noi, non su un portale", en: "Book with us, not a booking site" },
      title: { it: "Senza intermediari.", en: "No middlemen." },
      text: { it: "Prenotando qui parli direttamente con chi gestisce l'hotel, in italiano, e paghi il prezzo giusto.", en: "Book here and you talk directly to the people who run the hotel, and pay the right price." },
      items: [
        { icon: "tag", title: { it: "Prezzo migliore", en: "Best price" }, text: { it: "Nessuna commissione di portale.", en: "No booking-site commission." } },
        { icon: "wa", title: { it: "Parliamo italiano", en: "We speak Italian" }, text: { it: "E inglese, tedesco, spagnolo e francese.", en: "And English, German, Spanish and French." } },
        { icon: "car", title: { it: "Transfer e escursioni", en: "Transfers and tours" }, text: { it: "Organizziamo tutto noi, dall'arrivo in poi.", en: "We arrange everything from the moment you land." } },
        { icon: "heart", title: { it: "Benvenuto in camera", en: "A welcome in your room" }, text: { it: "Frutta fresca e acqua all'arrivo.", en: "Fresh fruit and water on arrival." } },
      ],
    },
    intro: {
      eyebrow: { it: "Benvenuti", en: "Welcome" },
      title: { it: "Una piccola perla nel centro di Belle Mare", en: "A small gem in the centre of Belle Mare" },
      text: [
        { it: "Eden Villa è un hotel di recente costruzione, a conduzione familiare, a 70 metri dalla spiaggia. Le camere sono nuove, con mobili etnici in bambù; ci sono la piscina, il ristorante e il bar.", en: "Eden Villa is a recently built, family-run hotel 70 metres from the beach. The rooms are new, with ethnic bamboo furniture; there is a pool, a restaurant and a bar." },
        { it: "Siamo anche un'agenzia: ogni giorno organizziamo escursioni, mercati, cene a tema, barbecue in spiaggia, spettacoli di danza locale e serate al casinò di Port Louis. Ci pensiamo noi, tu ti godi l'isola.", en: "We are also a travel agency: every day we organise tours, markets, themed dinners, beach barbecues, local dance shows and evenings at the casino in Port Louis. We take care of it; you enjoy the island." },
      ],
      signature: { it: "Eliana Maria Busetto, Front Office", en: "Eliana Maria Busetto, Front Office" },
      images: [img("assets/photos/eden-pool.jpg", { it: "La piscina di Eden Villa", en: "The Eden Villa pool" }), img("assets/photos/eden-restaurant.jpg", { it: "Il ristorante sotto il tetto in legno", en: "The restaurant under the timber roof" })],
    },
    villasIntro: { eyebrow: { it: "Soggiorna con noi", en: "Stay with us" }, title: { it: "Le camere", en: "The rooms" }, lead: { it: "Tutte nuove, con bagno privato, minibar, cassaforte e Wi-Fi. Prezzi a notte per camera, colazione inclusa.", en: "All new, with a private bathroom, minibar, safe and Wi-Fi. Prices per room per night, breakfast included." } },
    amenities: {
      eyebrow: { it: "Incluso", en: "Included" }, title: { it: "In ogni soggiorno", en: "In every stay" }, lead: "",
      items: [
        { icon: "coffee", label: { it: "Colazione", en: "Breakfast" } },
        { icon: "pool", label: { it: "Piscina", en: "Pool" } },
        { icon: "wifi", label: { it: "Wi-Fi gratuito", en: "Free Wi-Fi" } },
        { icon: "lock", label: { it: "Cassaforte", en: "Safe" } },
        { icon: "heart", label: { it: "Frutta di benvenuto", en: "Welcome fruit" } },
        { icon: "wave", label: { it: "Spiaggia a 70 m", en: "Beach 70 m away" } },
      ],
    },
    reviews: {
      eyebrow: { it: "Dicono di noi", en: "What guests say" },
      title: { it: "Ospiti felici", en: "Happy guests" },
      // From a photo on the old site (2016): Booking.com Guest Review Award 8.4 and a TripAdvisor Certificate of Excellence. CONFIRM the current score
      summary: { rating: 8.4, best: 10, source: { it: "Booking.com · Certificato di Eccellenza TripAdvisor", en: "Booking.com · TripAdvisor Certificate of Excellence" } },
      links: [{ name: "Facebook", icon: "facebook", url: "https://www.facebook.com/Eden-Tours-607553109400207" }],
      // From the old site. Add 3 to 5 real reviews copied from Booking.com or TripAdvisor (guest's first name, country and month)
      items: [
        { name: "Antonio Rossi", from: { it: "Italia", en: "Italy" }, date: "", source: "", text: { it: "Ottimi i tour, camera stupenda e situazione da sogno.", en: "Great tours, a beautiful room and a dreamy setting." } },
      ],
    },
    nearby: {
      eyebrow: { it: "Le nostre escursioni", en: "Our day tours" },
      title: { it: "Mauritius da vivere", en: "Mauritius to live" },
      lead: { it: "Quattro giornate organizzate da noi. Il prezzo dipende da quante persone siete: chiedici su WhatsApp.", en: "Four days out that we run ourselves. The price depends on your group: ask us on WhatsApp." },
      items: [
        { icon: "compass", distance: { it: "1 giorno · Nord", en: "1 day · North" }, image: img("1673659541305-9d7f5d8ff876", "Port Louis harbour with the mountains behind"), title: { it: "I colori del Nord", en: "The colours of the North" }, text: { it: "La Citadelle, la Pagoda, Port Louis e il suo mercato, il porto e il Giardino Botanico di Pamplemousses.", en: "The Citadel, the Pagoda, Port Louis and its market, the harbour and the Pamplemousses Botanical Garden." } },
        { icon: "leaf", distance: { it: "1 giorno · Sud", en: "1 day · South" }, image: img("1704759928716-7657e3ad7615", "Chamarel waterfall in the forest"), title: { it: "Il selvaggio Sud", en: "The wild South" }, text: { it: "Il vulcano Trou aux Cerfs, Grand Bassin, le cascate delle Gole del Black River, la Rhumerie e le terre colorate di Chamarel.", en: "Trou aux Cerfs volcano, Grand Bassin, the Black River Gorges falls, a rum distillery and the coloured earths of Chamarel." } },
        { icon: "anchor", distance: { it: "1 giorno · da €40", en: "1 day · from €40" }, image: img("assets/photos/tour-ile-aux-cerfs.jpg", { it: "L'Île aux Cerfs dall'alto", en: "Île aux Cerfs from the air" }), title: { it: "Île aux Cerfs", en: "Île aux Cerfs" }, text: { it: "In barca privata verso l'isola, la cascata e un barbecue in spiaggia con bevande.", en: "By private boat to the island, the waterfall and a beach barbecue with drinks." } },
        { icon: "sun", distance: { it: "1 giorno · Sud", en: "1 day · South" }, image: img("assets/photos/tour-gris-gris.jpg", { it: "Le scogliere di Gris Gris", en: "The Gris Gris cliffs" }), title: { it: "Una giornata nella natura", en: "A day in nature" }, text: { it: "Il Vanilla Crocodile Park con 2.000 coccodrilli del Nilo e tartarughe giganti, pranzo e Gris Gris, la punta sud dell'isola.", en: "Vanilla Crocodile Park with 2,000 Nile crocodiles and giant tortoises, lunch and Gris Gris, the island's southern tip." } },
      ],
    },
    location: {
      eyebrow: { it: "Dove siamo", en: "Location" },
      title: { it: "Nel centro di Belle Mare", en: "In the centre of Belle Mare" },
      text: { it: "Zona residenziale con negozi, bar, ristoranti e boutique. La stazione di polizia è di fronte e il tempio indù Ram Mandir è a pochi passi.", en: "A residential area with shops, bars, restaurants and boutiques. The police station is opposite and the Ram Mandir Hindu temple is a short walk away." },
      facts: [
        { icon: "wave", value: { it: "70 m", en: "70 m" }, label: { it: "dalla spiaggia", en: "from the beach" } },
        { icon: "plane", value: { it: "45 min", en: "45 min" }, label: { it: "dall'aeroporto", en: "from the airport" } },
        { icon: "anchor", value: { it: "15 min", en: "15 min" }, label: { it: "dalle barche per l'Île aux Cerfs", en: "to the Île aux Cerfs boats" } },
      ],
      howToGetHere: [
        { icon: "car", title: { it: "Transfer aeroporto:", en: "Airport transfer:" }, text: { it: "€50 a persona per tratta. L'autista ti aspetta agli arrivi; aggiungilo alla richiesta.", en: "€50 per person each way. The driver waits at arrivals; add it to your request." } },
        { icon: "compass", title: { it: "In auto:", en: "By car:" }, text: { it: "siamo nel centro di Belle Mare, di fronte alla stazione di polizia. Possiamo prenotarti un'auto a noleggio.", en: "we are in the centre of Belle Mare, opposite the police station. We can book you a rental car." } },
      ],
    },
    faq: {
      eyebrow: { it: "Prima di partire", en: "Before you come" }, title: { it: "Domande frequenti", en: "Questions, answered" },
      items: [
        { q: { it: "Bed & breakfast o mezza pensione?", en: "Bed & breakfast or half board?" }, a: { it: "Scegli tu. La colazione è sempre inclusa; la mezza pensione si aggiunge nella richiesta.", en: "Your choice. Breakfast is always included; add half board in your request." } },
        { q: { it: "Quanto pagano i bambini?", en: "What do children pay?" }, a: { it: "Gratis fino a 2 anni, metà prezzo da 2 a 12 anni, prezzo adulto dai 12 anni.", en: "Free under 2, half price from 2 to 12, adult price from 12." } },
        { q: { it: "Ci sono sconti per soggiorni lunghi?", en: "Are there long-stay prices?" }, a: { it: "Sì: -5% da 10 notti e -10% da 14 notti sul prezzo delle camere. La pagina di prenotazione fa il calcolo.", en: "Yes: 5% off from 10 nights and 10% off from 14 nights on the room price. The booking page works it out." } },
        { q: { it: "Organizzate altri servizi?", en: "Do you arrange anything else?" }, a: { it: "Sì: noleggio auto, prenotazione di altri hotel, cena tipica con una famiglia mauriziana, corsi di sub PADI e underwater walking.", en: "Yes: car hire, other hotel bookings, a Mauritian dinner with a local family, PADI diving courses and underwater walking." } },
        { q: { it: "Cosa succede a Natale e Capodanno?", en: "What happens at Christmas and New Year?" }, a: { it: "Cenone della Vigilia e cenone di Capodanno con aragosta, €50 a persona ciascuno. Si aggiungono come extra.", en: "Christmas Eve dinner and New Year's Eve dinner with lobster, €50 per person each. Add them as extras." } },
      ],
    },
    finalCta: {
      title: { it: "Mauritius ti aspetta", en: "Mauritius is waiting" },
      text: { it: "Scegli le date, guarda il prezzo e scrivici: rispondiamo in italiano.", en: "Pick your dates, see the price and write to us." },
      image: img("1580629844914-374f3b707fe5", "Palm trees against a golden sunset"),
    },
    gallery: {
      images: [img("assets/photos/eden-pool.jpg", { it: "La piscina di Eden Villa", en: "The Eden Villa pool" }), img("assets/photos/eden-superior-room.jpg", { it: "Camera Superior", en: "Superior Room" }), img("assets/photos/eden-restaurant.jpg", { it: "Il ristorante", en: "The restaurant" }), img("assets/photos/eden-double-room.jpg", { it: "Camera Doppia", en: "Double Room" }), img("assets/photos/eden-pool-terrace.jpg", { it: "Lettini a bordo piscina", en: "Loungers by the pool" }), img("assets/photos/eden-twin-room.jpg", { it: "Camera Twin", en: "Twin Room" }), img("assets/photos/eden-lobster.jpg", { it: "Aragosta dalla nostra cucina", en: "Lobster from our kitchen" }), img("1634972312739-d7237018e06a", { it: "Una spiaggia di Mauritius", en: "A beach in Mauritius" }), img("assets/photos/tour-ile-aux-cerfs.jpg", { it: "L'Île aux Cerfs dall'alto", en: "Île aux Cerfs from the air" }), img("1704759928716-7657e3ad7615", { it: "Le cascate di Chamarel", en: "Chamarel falls" })],
    },
    pageHeads: {
      villas: { title: { it: "Le camere", en: "The rooms" }, text: { it: "Tre tipi di camera, tutte nuove, a 70 metri dal mare.", en: "Three kinds of room, all new, 70 metres from the sea." }, image: img("1634972312739-d7237018e06a", "") },
      gallery: { title: { it: "Galleria", en: "Gallery" }, text: { it: "L'hotel, la cucina e l'isola.", en: "The hotel, the kitchen and the island." }, image: img("1513415563383-4e580ed27a46", "") },
      contact: { title: { it: "Contatti", en: "Contact" }, text: { it: "Una domanda prima di prenotare? Scrivici in italiano.", en: "A question before you book? Write to us." }, image: img("1513415277900-a62401e19be4", "") },
    },
  },

  credit: { name: "WebLuxe", url: "https://webluxe.github.io/WebLuxe/" },

  /* ---------- Admin panel (/admin/). Changes are saved to data/site.js in this GitHub repository ---------- */
  admin: { repo: "WebLuxe/MidTier_EdenVilla", branch: "main" },
  inbox: { url: "" },   // the Google Sheet inbox: paste the web-app address from admin/inbox.gs here (see README). Empty = requests go by email/WhatsApp only

  /* ---------- 8. Demo mode. Set enabled: false when the site goes live ---------- */
  demo: {
    enabled: true,
    note: { it: "Proposta di nuovo sito per Eden Villa, a cura di WebLuxe. Prezzi e disponibilità sono di esempio.", en: "New website proposal for Eden Villa by WebLuxe. Prices and availability are samples." },
    studioWhatsapp: "",
    tiers: [
      { label: { it: "Essenziale", en: "Essentials" }, url: "https://webluxe.github.io/LowTier_EdenVilla/" },
      { label: { it: "Soggiorni", en: "Stays" }, url: "https://webluxe.github.io/MidTier_EdenVilla/", current: true },
      { label: { it: "Prenotazioni", en: "Bookings" }, url: "https://webluxe.github.io/HighTier_EdenVilla/" },
    ],
  },

  /* ---------- 9. All the small words ---------- */
  text: {
    it: {
      // ----- parole usate su tutti i modelli WebLuxe (menu, pulsanti, messaggi) -----
      home: "Home", skip: "Vai al contenuto", menu: "Menu", switchLang: "Cambia lingua", toggleTheme: "Passa al tema chiaro o scuro",
      explore: "Esplora", footerNav: "Link del piè di pagina", contactTitle: "Contatti", hoursTitle: "Orari", rights: "Tutti i diritti riservati.", websiteBy: "Sito web di",
      whatsappUs: "Scrivici su WhatsApp", phone: "Telefono", email: "Email", address: "Indirizzo", chatNow: "Scrivici adesso",
      closed: "Chiuso", today: "oggi", tomorrow: "domani", openUntil: "Aperto ora, fino alle {time}", closedOpens: "Ora chiuso. Apre {day} alle {time}",
      days: ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"], daysShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
      introSkip: "Salta", close: "Chiudi", ok: "OK", prev: "Precedente", next: "Successivo", slide: "Vai alla foto {n}", showMap: "Mostra la mappa", mapTitle: "Mappa con la nostra posizione",
      formSending: "Invio in corso…", formSent: "Grazie. Il messaggio è stato inviato e ti risponderemo presto.", formError: "Spiacenti, il messaggio non è partito. Chiamaci al {phone}.",
      formMailto: "Si è aperta la tua app email con il messaggio. Premi invia per completare.", formDemoDone: "Demo: non è stato inviato nulla.",
      demoLabel: "Informazioni su questa demo", demoBadge: "Demo", demoNote: "Sito di esempio di WebLuxe. Prezzi e disponibilità sono di prova.",
      demoTitle: "Questa è una demo", demoWa: "Sul sito vero, qui si apre WhatsApp con questo messaggio pronto da inviare:", demoTel: "Sul sito vero, qui parte la chiamata:",
      demoMail: "Sul sito vero, qui si apre un'email all'attività.", demoForm: "Sul sito vero, l'attività riceve questo:",
      demoStudio: "Voglio un sito così", demoStudioMsg: "Ciao WebLuxe, ho visto la demo di {site} e vorrei un sito simile.",
      reviewOnGoogle: "Lascia una recensione su Google", seeOnGoogle: "Vedi su Google Maps", nfTitle: "Questa pagina è andata al mare", nfText: "L'indirizzo forse contiene un errore, oppure la pagina è stata spostata. Trovi tutto nella home page.", nfHome: "Vai alla home page",
      // ----- questo modello -----
      hoursTitle: "Orari di risposta",
      navVillas: "Camere", navGallery: "Galleria", navContact: "Contatti", currency: "Cambia valuta",
      bookNow: "Prenota", from: "Da", perNight: "a notte", checkAvailability: "Verifica disponibilità", seeVillas: "Vedi le camere",
      checkIn: "Arrivo", checkOut: "Partenza", guests: "Ospiti", guest: "ospite", guestsLower: "ospiti", villa: "Camera", upTo: "fino a {n}",
      ratingOf: "{n} stelle su 5", basedOn: "su {n} recensioni", seeUsOn: "Seguici su {site}", howToGetHere: "Come arrivare", directions: "Indicazioni",
      prices: "Prezzi", standardRate: "Tariffa base", allOtherDates: "Tutte le altre date", minShort: "min. {n} notti", nNights: "{n} notti", seasonalRates: "tariffe stagionali",
      viewFull: "Vedi a schermo intero", inTheVilla: "In camera", bookThis: "Prenota questa camera", askQuestion: "Fai una domanda", waAsk: "Ciao {name}, ho una domanda sulla {villa}:", policies: "Buono a sapersi",
      formTitle: "Scrivici", fName: "Nome e cognome", fEmail: "Email", fPhone: "Telefono / WhatsApp", withCode: "(con prefisso)", fCountry: "Paese",
      fMessageContact: "Il tuo messaggio", fSend: "Invia messaggio", formPrivacy: "Usiamo i tuoi dati solo per risponderti.", formSubject: "Nuovo messaggio dal sito {name}",
      bookTitle: "Richiedi il tuo soggiorno", bookLead: "Nessun pagamento adesso: verifichiamo la disponibilità e ti confermiamo il prezzo finale.",
      stepStay: "Il tuo soggiorno", stepExtras: "Extra", stepDetails: "I tuoi dati", less: "Uno in meno", more: "Uno in più", free: "Gratis",
      per_booking: "una volta", per_night: "a notte", per_person: "a persona", per_personNight: "a persona, a notte",
      fMessage: "Qualcosa da dirci?", optional: "(facoltativo)", messageHint: "Età dei bambini, orario di arrivo, numero del volo…",
      sendRequest: "Invia la richiesta", confirmWa: "Conferma su WhatsApp", noPayNow: "Nessun pagamento adesso: prima confermiamo la disponibilità.",
      yourStay: "Il tuo soggiorno", estTotal: "Totale indicativo", depositLine: "Acconto del {pct}% per confermare: {amount}", details: "Dettagli",
      pickDates: "Scegli le date per vedere il prezzo", outAfterIn: "La partenza deve essere dopo l'arrivo.", minNights: "Per queste date il soggiorno minimo è di {n} notti.", tooMany: "Questa camera ospita fino a {n} persone.",
      dates: "Date", addDate: "Scegli", availability: "Disponibilità e prezzi", whatsappUs: "Scrivici su WhatsApp",
      calTitle: "Scegli le date", calPickIn: "Tocca il giorno di arrivo", calPickOut: "Ora tocca il giorno di partenza (min. {n} notti)", calFree: "Libero", calBooked: "Completo",
      calClear: "Cancella date", calDone: "Fatto", calMin: "Da questo giorno il soggiorno minimo è di {n} notti.", calClash: "Alcune di queste notti sono al completo. Scegli altre date.", calPriceNote: "Prezzi a notte in {cur}",
      longStayLine: "Sconto soggiorno lungo ({pct}%)", longStayShort: "Da {n} notti: -{pct}%", longStayTip: "Resta {n} notti o più e risparmi il {pct}%.",
      ref: "Riferimento {ref}", doneTitle: "Grazie, richiesta ricevuta", doneSent: "Controlliamo la disponibilità e ti rispondiamo via email al più presto.", doneWa: "Premi invia su WhatsApp e ti confermiamo al più presto.",
      next1: "Ti confermiamo le date e il prezzo finale.", next2: "Confermi con un acconto, con bonifico o carta.", next3: "Ti mandiamo le indicazioni e organizziamo il transfer.", backHome: "Torna alla home",
      waIntro: "Ciao {name}, vorrei prenotare:", waFollow: "Ciao, a proposito della mia richiesta {ref}:", bookSubject: "Nuova richiesta di prenotazione dal sito {name}",
      countries: ["Italia", "Svizzera", "Francia", "Germania", "Austria", "Spagna", "Belgio", "Regno Unito", "Paesi Bassi", "Mauritius", "La Riunione", "Sudafrica", "Stati Uniti", "Altro"],
    },
    en: {
      // ----- words used on every WebLuxe template (menus, buttons, messages) -----
      home: "Home", skip: "Skip to content", menu: "Menu", switchLang: "Voir le site en français", toggleTheme: "Switch light or dark mode",
      explore: "Explore", footerNav: "Footer links", contactTitle: "Contact", hoursTitle: "Opening hours", rights: "All rights reserved.", websiteBy: "Website by",
      whatsappUs: "Chat on WhatsApp", phone: "Phone", email: "Email", address: "Address", chatNow: "Chat with us now",
      closed: "Closed", today: "today", tomorrow: "tomorrow", openUntil: "Open now, until {time}", closedOpens: "Closed now. Opens {day} at {time}",
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      introSkip: "Skip", close: "Close", ok: "OK", prev: "Previous", next: "Next", slide: "Go to slide {n}", showMap: "Show the map", mapTitle: "Map showing our location",
      formSending: "Sending…", formSent: "Thank you. Your message has been sent and we will reply soon.", formError: "Sorry, the message could not be sent. Please call us on {phone}.",
      formMailto: "Your email app has opened with your message. Press send there to finish.", formDemoDone: "Demo: nothing was sent.",
      demoLabel: "About this demo", demoBadge: "Demo", demoNote: "Example website by WebLuxe. The business, prices and reviews are samples.",
      demoTitle: "This is a demo", demoWa: "On the real website, this opens WhatsApp with this message ready to send:", demoTel: "On the real website, this calls the business:",
      demoMail: "On the real website, this opens an email to the business.", demoForm: "On the real website, the business receives this:",
      demoStudio: "Get a site like this", demoStudioMsg: "Hello WebLuxe, I saw the {site} demo and would like a website like it.",
      reviewOnGoogle: "Review us on Google", seeOnGoogle: "See us on Google Maps", nfTitle: "This page has gone for a swim", nfText: "The address may have a typo, or the page has moved. Everything is still here on the home page.", nfHome: "Go to the home page",
      // ----- this template -----
      hoursTitle: "Reply hours",
      navVillas: "Rooms", navGallery: "Gallery", navContact: "Contact", currency: "Change currency",
      bookNow: "Book now", from: "From", perNight: "per night", checkAvailability: "Check availability", seeVillas: "See the rooms",
      checkIn: "Check-in", checkOut: "Check-out", guests: "Guests", guest: "guest", guestsLower: "guests", villa: "Room", upTo: "up to {n}",
      ratingOf: "{n} out of 5 stars", basedOn: "from {n} reviews", seeUsOn: "Follow us on {site}", howToGetHere: "How to get here", directions: "Get directions",
      prices: "Prices", standardRate: "Standard rate", allOtherDates: "All other dates", minShort: "min. {n} nights", nNights: "{n} nights", seasonalRates: "seasonal rates",
      viewFull: "View full screen", inTheVilla: "In the room", bookThis: "Book this room", askQuestion: "Ask a question", waAsk: "Hello {name}, I have a question about the {villa}:", policies: "Good to know",
      formTitle: "Send us a message", fName: "Full name", fEmail: "Email", fPhone: "Phone / WhatsApp", withCode: "(with country code)", fCountry: "Country",
      fMessageContact: "Your message", fSend: "Send message", formPrivacy: "We only use your details to reply to you.", formSubject: "New message from the {name} website",
      bookTitle: "Request your stay", bookLead: "Nothing is charged now: we check availability and confirm the final price.",
      stepStay: "Your stay", stepExtras: "Extras", stepDetails: "Your details", less: "One less", more: "One more", free: "Free",
      per_booking: "once", per_night: "per night", per_person: "per guest", per_personNight: "per guest, per night",
      fMessage: "Anything we should know?", optional: "(optional)", messageHint: "Children's ages, arrival time, flight number…",
      sendRequest: "Send booking request", confirmWa: "Confirm on WhatsApp", noPayNow: "No payment now. We confirm availability first.",
      yourStay: "Your stay", estTotal: "Estimated total", depositLine: "{pct}% deposit to confirm: {amount}", details: "Details",
      pickDates: "Choose your dates to see the price", outAfterIn: "Check-out must be after check-in.", minNights: "The minimum stay for these dates is {n} nights.", tooMany: "This room sleeps up to {n} guests.",
      dates: "Dates", addDate: "Add date", availability: "Availability and prices", whatsappUs: "Chat on WhatsApp",
      calTitle: "Choose your dates", calPickIn: "Tap your check-in day", calPickOut: "Now tap your check-out day (min. {n} nights)", calFree: "Available", calBooked: "Full",
      calClear: "Clear dates", calDone: "Done", calMin: "From this day the minimum stay is {n} nights.", calClash: "Some of those nights are full. Pick other dates.", calPriceNote: "Prices per night in {cur}",
      longStayLine: "Long-stay discount ({pct}%)", longStayShort: "{n}+ nights: {pct}% off", longStayTip: "Stay {n} nights or more and save {pct}%.",
      ref: "Reference {ref}", doneTitle: "Thank you, request received", doneSent: "We are checking availability and will email you as soon as possible.", doneWa: "Press send in WhatsApp and we will confirm as soon as possible.",
      next1: "We confirm your dates and the final price.", next2: "You confirm with a deposit by bank transfer or card.", next3: "We send directions and arrange your transfer.", backHome: "Back to the home page",
      waIntro: "Hello {name}, I would like to book:", waFollow: "Hello, about my booking request {ref}:", bookSubject: "New booking request from the {name} website",
      countries: ["Italy", "Switzerland", "France", "Germany", "Austria", "Spain", "Belgium", "United Kingdom", "Netherlands", "Mauritius", "Réunion", "South Africa", "United States", "Other"],
    },
  },
};
