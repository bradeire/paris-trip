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
```

## 1. Push it to a private repo

From this folder:

```bash
git init
git add .
git commit -m "Paris trip PWA"
```

Create a new **private** repository on GitHub (or GitLab/Bitbucket) —
on GitHub: New repository → tick **Private** → don't initialise with a README
(you already have one). Then:

```bash
git remote add origin https://github.com/<your-username>/paris-trip.git
git branch -M main
git push -u origin main
```

Use SSH instead of HTTPS if you've got a key set up — same idea, just a
different remote URL. Do this from your own machine's terminal, not
somewhere your GitHub credentials would need to be typed into anything
other than git/GitHub itself.

## 2. Get it onto a real URL

A PWA needs to be served over HTTPS to be installable — a private repo on
its own doesn't do that. Two easy options, both free:

**Option A — GitHub Pages**
Repo → Settings → Pages → Deploy from branch → `main` / `/ (root)`.
One thing worth knowing: on a free personal GitHub account, a Pages *site*
built from a private repo is still reachable by anyone with the link (GitHub
Pages doesn't support making the *published site* private unless you're on
GitHub Enterprise/Team). The repo's source code stays private either way —
this only affects the live page itself. Fine for a link only you and your
wife will ever have, but worth knowing it's not access-controlled.

**Option B — Netlify Drop**
Drag this folder onto [app.netlify.com/drop](https://app.netlify.com/drop) —
no git needed at all, gives you an HTTPS URL in seconds. You can still keep
the private GitHub repo as your source of truth and redeploy by dragging the
folder again after changes, or connect the repo to Netlify for auto-deploys
on every push (Netlify's free tier doesn't support link-level password
protection, but the URL is unguessable and unlisted).

Either way, once it's live:

## 3. Install it on your phones

Open the URL in Safari (iPhone) or Chrome (Android) →
**Share → Add to Home Screen** (iPhone) or the **Install** banner /
**⋮ menu → Install app** (Android/Chrome). It'll then open full-screen,
with its own icon, like a normal app — and still work with no signal,
since the itinerary is baked into the page rather than fetched live.

## Live updates (checks Gmail & Calendar every ~90 min, until 5 Sep 2026)

This needs one extra piece, since a static site has nowhere to safely hold a
Google login: a tiny script that runs on **your own** Google account and
hands back a small JSON summary. Nothing is stored or shared anywhere else.

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Delete the placeholder code, paste in everything from `Code.gs`.
3. **Deploy → New deployment** → type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**, then **Authorize access**. You'll see an "unverified
   app" warning — that's Google being cautious about *any* personal script,
   not a red flag here; it's your script, running as you, only readable by
   you. Click **Advanced → Go to (project name) (unsafe) → Allow**.
5. Copy the **Web app URL** (ends in `/exec`).
6. Open `index.html`, find `LIVE_CONFIG` near the bottom, and paste the URL
   into `scriptUrl`. Commit, push, redeploy.

Once that's in place, the app checks in automatically: every 90 minutes
while it's open, and immediately on open if 90 minutes have passed since the
last check. New or changed calendar events and matching booking emails show
up as a "New since your last check" banner at the top. After 5 Sep 2026 it
stops checking on its own and says so.

**Being upfront about what this is and isn't:** this gives you a live *diff*
— what's new or changed — not an auto-rewritten itinerary. Slotting a
confirmed new booking neatly into the right day, with the address/phone/map
links styled to match, is the part I do when you ask me to regenerate
`index.html`. Think of the live feed as the early-warning system, and me as
the one who tidies it into the proper layout afterwards.

**On iPhones specifically:** Safari doesn't reliably run JavaScript timers
in the background once a PWA is closed or the phone's locked, so "every 90
minutes" really means "every 90 minutes while the app is open, plus a catch-up
check whenever you open it after a gap." That's a genuine platform limit, not
a bug in the app — Android/Chrome behaves a little better but isn't fully
guaranteed either. For a two-person family app this is a fine trade-off; a
truly always-on background check would need a real push-notification backend.

## Updating it later

Since it's just static files, updating means: edit `index.html`, commit,
push, redeploy (Pages/Netlify pick it up automatically on push once
connected). Ask Claude to regenerate `index.html` whenever a new booking
comes in and drop the replacement file in — the manifest, service worker
and icons won't need to change.
