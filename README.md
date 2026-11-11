# منوی QR رستوران — Afghan restaurant QR menu (Dari / RTL)

A complete QR-code menu website with a **protected owner dashboard**.
Customers scan a QR code → read the published menu (Dari, right-to-left, prices in افغانی with Persian digits).
The owner signs in at `/owner` to edit dishes, photos, prices and categories, preview, publish, back up and download the QR code.

> **Demo content.** The seeded restaurant ("دسترخوان نمونه"), dishes, prices, descriptions and ingredients are **samples**, clearly labelled in the UI.
> Dish pictures are **illustrations I generated**, not photographs (no photo source was reachable), except "سالاد مخصوص", which reuses the salad photo from your reference file. Upload real photos from the dashboard.

## What is built and verified vs. what needs your configuration

| Area | Status |
|---|---|
| Customer menu, search (Arabic/Persian letter variants), category + label filters, dish panel, availability labels, contact info | ✅ built, tested in a real browser |
| R3F floating-spice effects, pause control, reduced-motion, WebGL fallback | ✅ built, tested (3D renders; `?fx=off` shows the fallback) |
| Owner dashboard: dishes, sizes/prices, photos, hide/unavailable, delete-with-confirm, categories (rename/reorder/add/remove, delete blocked while non-empty), restaurant info, hero photo & featured dish, mobile/tablet/desktop preview, draft → publish, discard, backup/restore, QR, password change | ✅ built, tested (API tests + browser E2E) |
| Server-side auth (scrypt, HttpOnly SameSite=Strict session cookie, CSRF token, Origin check, login rate-limit), input validation, image re-encoding, CSP | ✅ built, tested |
| Portable single-file HTML export | ✅ built (snapshot only — see below) |
| **Owner password** | ⚙️ you must create it: `npm run set-owner` (no default password exists) |
| **Hosting, HTTPS, permanent URL, `PUBLIC_URL`** | ⚙️ you must provide (see Deploy). The QR in `deliverables/` points to the placeholder `https://menu.example.com/` — regenerate it for your real URL |
| Real restaurant name/address/phone/hours/photos/prices | ⚙️ owner supplies |
| S3/cloud image storage | ❌ not implemented: photos are stored on the server's persistent disk (`DATA_DIR/uploads`), which is durable as long as that disk is persistent and backed up |

## Quick start (local)

Requires **Node ≥ 22.13** (uses the built-in `node:sqlite`).

```bash
npm install
npm run build                 # builds dist/ (site + dashboard) and dist-export/ (portable export)
npm run set-owner             # create the owner login (asks for username + password, min 10 chars)
npm start                     # http://localhost:3000  (menu)   http://localhost:3000/owner  (dashboard)
npm test                      # API tests (20+)
```
First start creates `data/` (SQLite DB, photos, safety backups) and a labelled demo menu (`SEED_DEMO=false` to skip).
Development with hot reload: `npm run dev:server` and `npm run dev:web` (Vite proxies `/api` and `/media`).

## Deploy (any Node host / VPS / Docker)

1. Use a host with a **persistent disk** and HTTPS (a small VPS + Caddy/nginx, Fly.io/Railway/Render with a volume, etc.).
2. Set env (see `.env.example`): `NODE_ENV=production`, `PUBLIC_URL=https://your-domain/`, `DATA_DIR=<persistent path>`, `TRUST_PROXY=1` when behind a proxy.
3. Run `npm ci && npm run build && npm run set-owner && npm start` — or use the included `Dockerfile` (mount a volume at `/data`).
4. Open `https://your-domain/owner`, sign in, fill **مشخصات رستوران** (set the permanent URL), replace sample content, **Publish**.
5. Go to **انتشار، پشتیبان و QR**, download the QR (PNG 2400 px or SVG) and print it.

## Daily use
* Edit anything → it saves to the **draft**. Customers see nothing until you press **انتشار**.
* **دور ریختن تغییرات** returns the draft to the last published version.
* Hide a dish (eye icon) to remove it from the public menu without deleting; mark it ناموجود to show it with a "not available" label.

## Caching (why changes appear on the same URL)
* The page and `/api/menu` are sent with `Cache-Control: no-cache`/`must-revalidate` + an `ETag`: browsers ask the server on every load/refresh (cheap `304` when unchanged), so a newly published menu appears on the **next load or refresh**. An open tab also re-checks when it returns to the foreground after 2+ minutes.
* Photos get a unique file name per upload and are cached for a year (`immutable`); a replaced photo has a new name.
* If you put a CDN in front, don't override those headers.

## QR code
Generated locally (`qrcode` library, error-correction Q, 4-module quiet zone). It encodes only your permanent URL, so dish/price/photo changes never require reprinting. If you change your domain you must print a new one. `npm run qr -- https://your-domain/` makes PNG+SVG from the command line.

## Backup / restore
* Dashboard → **دانلود پشتیبان**: one JSON with categories, dishes, prices, restaurant info and all photos.
* **بازیابی** replaces the *draft* (a safety copy is saved in `DATA_DIR/backups`, last 15 kept) and does **not** publish until you do.
* Also back up the `DATA_DIR` folder (it holds everything) on a schedule, e.g. a nightly copy.

## Portable HTML export
Dashboard → **دانلود menu.html**, or `npm run export -- menu.html`: one file with the published menu, photos, fonts and 3D effects. It works offline and can be hosted anywhere, but it is a **snapshot**: it has no backend, never updates by itself, and has no dashboard.

## Security notes
Auth, authorization and all validation run on the server. Customers can only reach `GET /api/menu`, `/media/*` and the static pages; every `/api/admin/*` route returns 401 without a valid session and 403 without the session's CSRF token. Uploads are limited to 6 MB JPEG/PNG/WebP verified by content, decoded and re-encoded to WebP (strips metadata/payloads; SVG and others rejected). Text is length-limited, control/bidi-override characters stripped, rendered by React as text (no `innerHTML`); embedded JSON in the export/HTML is escaped; a strict CSP is sent. Login: 8 failed attempts / 15 min per IP. Secrets are never sent to the browser. Remember to keep Node and dependencies updated.

## Layout
`server/` Express API, SQLite, auth, images, publish, backup, QR, export · `web/src/customer` public site · `web/src/owner` dashboard · `scripts/make-seed-art.mjs` demo illustrations · `tests/` API + browser tests · `licenses/` Vazirmatn font (OFL).
