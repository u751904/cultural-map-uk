# Map Britannia — Architecture Reference

Last verified against live repo: 19 July 2026, by fetching raw files directly
from `github.com/u751904/cultural-map-uk` (not from chat history or memory).

This file is the single source of truth for file roles. If a file's purpose
changes, update this doc in the same commit — not as an afterthought.

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
string, e.g. `styles.css?v=23`, `app.js?v=25`. Bump this number by 1 any time
either file changes, so browsers don't serve a stale cached copy.

---

## Known issues / open items (as of 19 July 2026)

- **DNS/domain config**: `mapbritannia.com` was showing blank while the
  GitHub Pages default URL worked — points to a DNS or custom-domain
  verification issue at the registrar/GitHub Pages settings level, not a
  code issue. Not yet resolved.
- **`app.js` corruption incident**: the live `app.js` was found to contain
  ~124 lines of accidentally-pasted chat transcript text before the real
  code, which broke the entire script (JS parse error on line 1 = nothing
  in the file runs). Fixed by stripping the junk and validating with
  `node --check`. **Lesson: always verify a file parses/lints before
  uploading, especially after copy-pasting from a chat interface rather
  than using a proper download.**
- **Font-size inconsistency on `about.html`**: `.about-section p` (15.5px)
  and `.source-list li` (15px) don't match each other. Proposed fix:
  unify to 16px. Not yet applied — pending confirmation.
- **URL parameter handling** (`?search=`, `?theme=`, `?locate=`): implemented
  in `app.js` via `applyUrlParams()`, except `?locate=true`, which is a
  deliberate no-op (no geolocation function exists yet — TODO comment in
  the code marks where to add it).

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
