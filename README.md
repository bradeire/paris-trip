# Paris Trip — Bradley Family PWA

A small installable web app with the full day-by-day itinerary for
28 Aug – 4 Sep 2026: Eiffel Tower base, Villages Nature Paris (Center Parcs),
and the Disneyland Paris day. Works offline once installed, and it's just
static files — no server, no build step, no account needed to run it.

## What's in here

```
index.html          the app itself (all the itinerary data lives inline)
manifest.json        makes it installable ("Add to Home Screen")
sw.js                 service worker — caches the app so it opens offline
icons/                app icons for home screen / splash
Code.gs               Apps Script backend for the live "what's new" feed
map/                   CSVs to import into Google My Maps for the trip map
```
## Updating it later

Since it's just static files, updating means: edit `index.html`, commit,
push, redeploy (Pages/Netlify pick it up automatically on push once
connected). Ask Claude to regenerate `index.html` whenever a new booking
comes in and drop the replacement file in — the manifest, service worker
and icons won't need to change.
