# Map Britannia — Status & Working Log

Last verified against live repo: 19 July 2026, by fetching raw files directly
from `github.com/u751904/cultural-map-uk` (not from chat history or memory).

**Scope of this document, vs. the Developer Reference:**
This file is a **running log of current status and working guardrails** —
what each file currently is, what's broken, what just got fixed, and the
rules that keep iterative changes safe. It updates every session.

It is **not** the architecture spec. The full build (tech stack, CSV schema,
category config, GeoJSON layer mechanics, cache-busting convention, licence
text, "how to add a new category") lives in the separate **Developer
Reference** document (currently a local `.docx`, refreshed periodically —
only when something structurally changes, not after routine fixes). That
document is what you'd hand a real developer on day one. This one is what
keeps day-to-day AI-assisted work from drifting.

Bug/backlog items belong **only here**, not in the Developer Reference.

---

## Project status — read this first

**Map Britannia is a production product, not a prototype.**

- One developer (the product owner). No planned engineering team.
- Changes must be **incremental**, not rewrites.
- Prefer simple, maintainable code over clever frameworks or dependencies.
- Preserve backwards compatibility unless explicitly instructed otherwise.
- The current architecture is intentional unless asked to change it —
  don't "improve" structure unprompted.

---

## Domain & hosting

- **Live domain:** mapbritannia.com (via `CNAME` file in repo root)
- **Host:** GitHub Pages, serving directly from the `main` branch root
  (no build step, no Jekyll, no `docs/` folder — plain static files)
- **Repo:** `github.com/u751904/cultural-map-uk` (public)

---

## Core pages (verified live, 19 July 2026)

| File | Role | Depends on |
|---|---|---|
| `index.html` | **Front door.** Hero section, search box, "browse by theme" pills, "Use my current location" link. This is what loads automatically at `mapbritannia.com` — GitHub Pages always serves whatever file is named `index.html`. All styles are inline in this file (not `styles.css`). | Links to `map.html`, `about.html` |
| `map.html` | **The interactive map application.** Leaflet map, marker clusters, layers panel, search results, place detail panels. | `styles.css`, `app.js`, Leaflet + MarkerCluster CDN, Papa Parse CDN |
| `about.html` | About page — project description, themes covered, data sources/licensing. Styles are inline in this file (not `styles.css`). | Links to `index.html`, `map.html` |
| `app.js` | All JS logic for `map.html` only — marker icons, clustering, CSV/GeoJSON loading, search (Nominatim), layer toggling, URL param handling. | Loaded only by `map.html` |
| `styles.css` | All CSS for `map.html` only. **Not used by `index.html` or `about.html`** — those have their own scoped inline `<style>` blocks by design, so they can be edited independently without affecting the map app. | Loaded only by `map.html` |
| `CNAME` | Custom domain config for GitHub Pages (`mapbritannia.com`) | — |

> ⚠️ There is **no file called `landing.html`** in the repo. Any file with
> that name floating around in a Downloads folder is a stale local copy —
> the real front-door content lives in `index.html`.

---

## Data files (loaded by `app.js`)

CSV (via Papa Parse, `csvFiles` array in `app.js`):

| File | Default category |
|---|---|
| `literarydevon.csv` | Literary |
| `horriblehistory.csv` | Horrible History |
| `militarydevon.csv` | Military |
| `historicengland.csv` | Military |
| `plague_uk_final.csv` | Horrible History |
| `ancient_trees.csv` | Ancient Landscape |

GeoJSON (via `layerConfig` array in `app.js`):

| File | Category | Notes |
|---|---|---|
| `battlefields.geojson` | Military | Rendered as polygons |
| `wrecks.geojson` | Maritime | Rendered as polygons **and** as centroid markers (wreck icon) |

---

## Other repo contents

- `assets/` — icons, images (hero photo, theme pill icons, favicons)
- `v1-backup/` — archived early Devon-only prototype. Not linked from any
  live page. Historical reference only.

---

## Versioning convention

`map.html` loads `styles.css` and `app.js` with a manual cache-busting query
string. Bump the relevant number by 1 any time that file changes, so
browsers don't serve a stale cached copy. Each file is versioned
independently — only bump the one you actually changed.

**Current live values (confirmed 19 July 2026): `styles.css?v=23`, `app.js?v=26`.**
Update this line whenever either number changes — a stale example here is
exactly the kind of drift this document exists to prevent.

---

## Resolved issues (recent)

- **DNS/domain config** (resolved ~19 July 2026): `mapbritannia.com` was
  showing blank while the GitHub Pages default URL worked. Root cause was
  domain/DNS configuration, not code — self-resolved during this work
  (`mapbritannia.com/map.html` now loads directly).
- **`app.js` corruption incident** (resolved 19 July 2026): the live
  `app.js` was found to contain ~124 lines of accidentally-pasted chat
  transcript text before the real code, which broke the entire script (JS
  parse error on line 1 = nothing in the file runs). Fixed by stripping
  the junk and validating with `node --check` before re-upload. **Lesson:
  always verify a file parses/lints before uploading, especially after
  copy-pasting from a chat interface rather than using a proper download.**
- **Post-fix blank page** (resolved 19 July 2026): after the `app.js` fix,
  navigating via a pill/search click still showed the old parse error.
  Cause was the browser serving a cached copy of the pre-fix `app.js`
  rather than a genuine regression — confirmed fixed by testing in an
  incognito window. Lesson: test fixes in a private/incognito window to
  rule out caching before assuming a fix failed.
- **Font-size inconsistency on `about.html`**: `.about-section p` (15.5px)
  and `.source-list li` (15px) — unified. (Confirmed fixed by user;
  exact resulting value not independently verified against live file.)
- **Nominatim duplicate search results**: dedupe logic in `app.js`
  (`dedupeNominatimResults()`) — confirmed working by user.
- **Dartington Hall Oak marker**: duplicate/missing marker issue in
  `ancient_trees.csv` — confirmed fixed by user.

## Known issues / open items (as of 19 July 2026)

- **URL parameter handling** (`?search=`, `?theme=`, `?locate=`): implemented
  in `app.js` via `applyUrlParams()`, except `?locate=true`, which is a
  deliberate no-op (no geolocation function exists yet — TODO comment in
  the code marks where to add it).
- **Yarmouth narrative mismatch** (migrated from Developer Reference,
  18 July 2026): a Yarmouth entry in `plague_uk_final.csv` displays East
  Anglia narrative text despite the marker sitting on the Isle of Wight
  Yarmouth, not the Norfolk one. Needs its own entry with corrected,
  geography-specific narrative. There is also an unconfirmed report of
  Scottish entries inheriting an English/London regional narrative during
  the original data build — needs re-checking against the current file;
  may already be resolved.
- **Ancient tree markers at national zoom** (migrated from Developer
  Reference, 18 July 2026): markers from `ancient_trees.csv` do not always
  appear at national zoom level in some regions, and only become visible
  after zooming in. Needs review of clustering/marker-loading behaviour
  for this layer specifically.

---

## Working with this project (process notes)

- **Verify before assuming.** File roles are confirmed by fetching the raw
  file directly from GitHub (`raw.githubusercontent.com/u751904/cultural-map-uk/main/<file>`),
  not by guessing from filename conventions or trusting project-knowledge
  snapshots, which go stale.
- **When pasting a file into chat, say whether it's live (already on
  GitHub) or local/unpushed.** This single habit prevents most confusion
  about which version is "real."
- **One change at a time, test before the next step.** Matches the
  incremental-changes principle above — this isn't just a process
  preference, it's how a solo, no-budget, production project should be run.
