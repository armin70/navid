# Navid XVIII — Interactive 18th Birthday Invitation

A compact, mobile-first birthday invitation made with plain **HTML, CSS and JavaScript**. All visible text is in English.

## Features
- Black-and-red visual style, neon crown, and four photos of Navid
- Minimal scrolling on phones; party information and RSVP stay close together
- Fun RSVP: tap **YES** for a welcome message; the **NO** button runs away from taps or the mouse, then displays a playful message after four attempts
- Looping background music (`assets/gorg-2.mp3`), immediate autoplay attempt, and a one-tap sound entrance when mobile autoplay is blocked
- Countdown, directions to the venue, add-to-calendar button and sharing
- Responsive layouts, accessibility-friendly reduced-motion styling
- No framework, no backend, ready for **GitHub Pages**

**Audio on mobile:** iOS Safari, Chrome, and most mobile browsers will block autoplay **with sound** until a person interacts with the page. The site still attempts autoplay immediately. If blocked on a touch device, a full-screen English entrance appears: **ENTER WITH MUSIC**. That single tap begins the repeating MP3; **CONTINUE WITHOUT MUSIC** lets visitors skip it. The ♫ button can pause/restart it later. There is no reliable way to force audible autoplay before a tap in all mobile browsers.

**RSVP fixes:** On touchscreens, the NO button now escapes into a top-level overlay so it remains visible and tappable after every jump (rather than hiding behind the photos). The fourth NO attempt displays a playful message. Touch, pointer, mouse and click inputs are supported.

**Music rights:** Before publishing a public site that contains this recording, make sure you have permission to distribute and use the song.

**Note:** RSVP responses are playful local interactions; they are **not saved or sent anywhere**. To collect real attendance information, connect a form or database later.

## Publish with GitHub Pages
1. Create a new GitHub repository, for example `navid-18th`.
2. Upload **the contents of this folder** to the repository root (keep `index.html` at the root).
3. Open `Settings → Pages`, select `Deploy from a branch`, then choose `main` and `/(root)`.
4. Your URL will usually be `https://USERNAME.github.io/navid-18th/`.

## Customize
- Invitation wording, date, time, venue: `index.html`
- Colors, spacing and animations: `styles.css`
- RSVP behavior, number of NO attempts (`NO_LIMIT`), messages and calendar: `script.js`
- Photos: `assets/navid-*.webp`
- Background music: replace `assets/gorg-2.mp3` with an MP3 of the same name (and make sure you have the right to share it)

**Event:** Sunday, November 29, 2026 · 6:00–8:00 PM PST · Amato Pizza, 6081 Meridian Ave, Ste 60, San Jose, CA 95120.

Keep in mind that photos uploaded to a public GitHub repository can be viewed and downloaded by anyone.
