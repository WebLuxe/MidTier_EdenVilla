# Villa Stays · WebLuxe website template

**Live:** https://webluxe.github.io/MidTier_EdenVilla/ · **Admin:** https://webluxe.github.io/MidTier_EdenVilla/admin/

## Eden Villa (Eden Tours Ltd)

This build is the **Mid tier (Villa Stays)** proposal for Eden Villa, Belle Mare. English by default, Italian one tap away, prices in euros. Facts come from the old site edentourltd.com; everything marked `CONFIRM` or `ESEMPIO / SAMPLE` in `config.js` must be checked with the client before launch:

- room types and prices (the old site lists none; these are samples), the half-board price, the deposit and check-in times
- that +39 347 844 2855 has WhatsApp; the map pin; the Google Business profile and review link
- reviews: one quote is kept from the old site; copy 3 to 6 real ones from Booking.com or TripAdvisor and check the current 8.4 score
- the final address (`seo.siteUrl`, `sitemap.xml`, `robots.txt`; set to edentourltd.com)
- new photos of the pool, rooms and restaurant would lift the site more than anything else (9 photos were kept from the old site)


A multi-page booking website for a villa estate or small guesthouse with a few units (two to six villas or suites) in Mauritius. Guests see every villa with its seasonal prices, pick dates and extras, watch the price add up live, and send a booking request by form or WhatsApp, with no commission to Airbnb or Booking.com.

Plain HTML, CSS and JavaScript. No build step, no framework, nothing to install. Upload the folder to any host (GitHub Pages, Netlify, Vercel, cPanel) and it works.

## Files

| File | What it is |
|---|---|
| `index.html` | Home: photo slideshow hero with a date search (pop-up calendar), why book direct, welcome from the hosts, villa cards, amenities, reviews you can swipe, things to do nearby, location, FAQ. |
| `villas.html` | Every villa in full: photos (full screen), description, amenities, price table with seasons and minimum stays, long-stay discounts, its own availability calendar with the price of every night, policies. |
| `gallery.html` | All photos in a masonry grid that opens full screen. |
| `book.html` | The booking request on one page: villa, a calendar with that villa's booked nights and nightly prices, guests, extras, details, a live summary with long-stay discount and deposit, then form or WhatsApp, then a confirmation with a reference number. |
| `contact.html` | Contact details, reply hours, a message form, how to get here and the map. |
| `config.js` | **Everything about the client.** The only file you edit for a new client. |
| `css/style.css` | All the styles. Colours and fonts come from `config.js`. |
| `js/main.js` | Builds the pages from `config.js`. Do not edit. |
| `assets/` | Logo, favicon and the client's own photos. |

## How to rebrand for a new client (about 45 minutes)

1. **Copy the whole folder** and rename it for the client.
2. Open **`config.js`** and work down it from the top. Each block has a comment explaining it.
   - **The business:** `name`, `legalName`, `tagline`, `logo`.
   - **Brand:** `colors.primary`, `colors.accent`, `colors.dark`, `colors.light`. `fonts.heading` and `fonts.body` take any Google Fonts name.
   - **Contact:** `phone`, `whatsapp` (digits only, e.g. `23057001234`), `whatsappMessage`, `email`, `responseTime`, address, `lat`/`lng`, `mapEmbed`. `hours` are shown as reply hours.
   - **SEO:** `seo.title`, `seo.description`, `seo.image`, `seo.priceRange`, `seo.siteUrl`.
   - **Money:** prices are in rupees. `currency.rates` sets the euro and dollar rates for the currency switch, so update them now and then. `booking.depositPct` shows the deposit line; `booking.refPrefix` starts the booking reference.
   - **Booking requests:** create a free form at formspree.io and paste its link into `form.endpoint`. `booking.sendVia` is `"both"`, `"endpoint"` or `"whatsapp"`.
   - **Villas** (`villas`): each has an `id`, `price` per night, optional `seasons` (`from`/`to` as `"MM-DD"`, with their own `price` and `minNights`), `capacity`, `minNights`, photos, `features` (icons on cards), `amenities` and its text. One villa works too.
   - **Booked dates** (`villas[].booked`): each booking is `["check-in day", "check-out day"]`, e.g. `["2026-12-20", "2027-01-03"]`. Those nights are crossed out in that villa's calendars and cannot be picked. Add a line whenever a booking comes in (the demo uses `soon(...)` so it always shows some; replace those).
   - **Long stays** (`booking.longStay`): e.g. `{ nights: 7, pct: 10 }`. The best one that applies comes off the nightly total; empty list for none.
   - **Extras** (`extras`): `per` is `"booking"`, `"night"`, `"person"` or `"personNight"`.
   - **Nearby** (`sections.nearby`): up to 4 things to do, each with a photo, a distance and a short text.
   - **Policies, why book direct, intro, amenities, reviews, location, FAQ, gallery, page heads:** plain lists in `config.js`.
   - **Wording:** every piece of text has an English and a French version: `{ en: "...", fr: "..." }`. For an English-only site, set `languages: ["en"]` and the FR button disappears.
3. **Turn off demo mode:** set `demo.enabled` to `false`.
4. **Update the head of each `.html` file:** `<title>`, the description and the three `og:` lines. Also the Google Fonts link if you changed fonts, and the hero photo preload line in `index.html`.
5. **Replace `assets/favicon.svg`** with the client's icon.
6. **Check it:** open `index.html` on a phone at 360px wide, switch to French, try dark mode and the currency switch, send a booking request, and tap WhatsApp.

### Google set-up (before launch)

1. **`seo.siteUrl`** in `config.js`: the final address, e.g. `https://www.edenvilla.mu/`. This turns on the canonical link and the English/French links Google reads on every page.
2. **`sitemap.xml` and `robots.txt`**: replace `https://www.your-domain.mu/` with the same address.
3. **Google Search Console**: add the site, paste the verification tag into the marked line in `index.html` (or verify by DNS), then submit `sitemap.xml`.
4. **`contact.googleBusiness`**: the client's Google Business / Maps link. "Get directions" uses it and the schema.org data tells Google the site and the listing are the same place. **`contact.googleReview`**: the profile's "write a review" link, which shows the "Review us on Google" buttons.
5. **`404.html`** is ready: a mistyped address shows a branded page with a way home instead of the host's error page.

### Hiding things

- A whole section: add `enabled: false` to it in `config.sections`.
- One item: delete it from its list.
- One line of text: set it to `""`.

## Built in

- Phone first: designed at 360px, then tablet and desktop. 44px+ tap targets, with no sideways scrolling.
- English / French switch, light / dark mode and MUR / EUR / USD switch (all remembered).
- Availability calendars per villa with the price of every night, booked nights crossed out, minimum stays by season; a pop-up version (a sheet from the bottom on phones) for the home page search.
- Live price estimate night by night with seasonal rates, long-stay discounts, capacity checks and extras; the form keeps what the guest picked when they change currency or language.
- Booking requests go to Formspree, by email, or as a WhatsApp message with the full summary, followed by a confirmation screen with a reference number.
- Phones: a bottom bar with the price, WhatsApp and "Book now" (no floating button over the page).
- Photo slideshow hero, parallax, arched photos, swipeable reviews and nearby cards, full-screen photos.
- Floating WhatsApp button, click-to-call and email links.
- Google ("+ Google Business"): everything in Basics, plus the Google Business profile linked in the schema.org data (sameAs, hasMap), "See us on Google Maps" and "Review us on Google" buttons, directions from the profile, and English/French links (hreflang) for each page.
- No trackers and no cookies. Works over HTTPS.

---
Template by [WebLuxe](https://webluxe.github.io/WebLuxe/), Mauritius. Sample photos from [Unsplash](https://unsplash.com). The villas, people, prices and reviews in the demo are invented.

## Admin panel (`/admin/`)

Open **`/admin/`** on the website. It edits everything in Low, plus each **room** (names, photos, prices, seasons, minimum stays), **extras**, **long-stay discounts**, the tours, and **availability per room**; and the **Inbox** with every booking request and message.

- **Preview** opens the real website with the changes that are not published yet (on that device only).
- **Publish** saves them to `data/site.js` in this repository; GitHub Pages shows them about a minute later. `config.js` stays the starting point: delete `data/site.js` to go back to it.
- **Try the admin without signing in** is a demo mode for prospects: nothing is saved online.

### Signing in

Each person signs in with a GitHub key for **WebLuxe/MidTier_EdenVilla**. The key stays on their device.

1. On github.com: **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. **Repository access → Only select repositories →** this repository.
3. **Permissions → Repository → Contents: Read and write**. Set an expiry, generate, and paste the key into the sign-in.

Fine-grained keys only work on repositories owned by the person's own account (or an organisation they belong to). For a client who will manage the site themselves, **transfer the repository to their GitHub account** (Settings → Transfer) and update `admin.repo` in `config.js`. Someone added as a collaborator on another person's repository uses a **classic** token with only **public_repo** ticked.

### Inbox (booking requests and messages)

Every request from the website is also written to a Google Sheet that the owner owns: free, no server.

1. Create a Google Sheet, open **Extensions → Apps Script**, and paste [`admin/inbox.gs`](admin/inbox.gs).
2. Change `SECRET` to a long word only the owner knows (optionally put an email in `NOTIFY` to get an email per request).
3. **Deploy → New deployment → Web app**, execute as *Me*, access *Anyone*. Copy the web-app address.
4. In the admin **Inbox**: paste the address and Publish; type the SECRET as the inbox key (kept on that device).

Requests still go by email/Formspree or WhatsApp as before; the inbox keeps them all in one place with a status (new, replied, confirmed, declined).
