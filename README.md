# BloodLink

BloodLink connects patients who need blood with blood banks that have live stock and with compatible donors nearby. Blood banks and camp organisers get a dashboard to publish stock and list donation drives.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Prisma and PostgreSQL. Maps use Leaflet with OpenStreetMap tiles, so no map API key is needed.

## Features

**Finding blood**
- **Find Blood** (`/request`): a 5-step flow. Pick the patient's blood group, then location (GPS or state/district), then hospital. You then see nearby blood banks with compatible stock (filter by stock, 25/50/100 km radius, map, call, directions). If banks can't help, you alert compatible donors.
- **Donor requests**: OTP-verified requesters add patient details, urgency and units, and can mark a request as recurring (e.g. thalassemia). Compatible, available donors within range are alerted. The radius widens automatically (10 → 25 → 50 → 100 km) until someone accepts.
- **Privacy by default**: a donor's name and number reach the requester only after the donor accepts. Likewise, the requester's contact reaches the donor only after acceptance.
- **Blood bank directory** (`/directory`): search by group (with compatible groups), location, radius, and hospital name. Includes a compatibility helper and share links.
- **Thalassemia & recurring requests** (`/thalassemia`).

**Donors**
- **Registration** (`/register`): phone OTP, personal details, blood group, a home location on a draggable map, eligibility statements, contact methods (call/SMS/WhatsApp), how far they'll travel, and explicit consent.
- **Profile** (`/profile`): availability toggle, "I donated today" (enforces a 90-day gap), edit details, incoming requests (accept/decline), your own requests, and removing the donor profile.
- **Eligibility quiz**: a 9-question self-check on the home page.

**Camps**
- `/camps`: filter by state/district, text search, and upcoming/this week/this month/all; "use my location"; call, directions, share; subscribe to camp alerts for a district.

**Organisations** (`/organisation`)
- Email-OTP login shared by the whole team.
- Register blood banks, publish stock for each blood group, edit and delete them.
- Register, edit and delete donation camps.
- Add or remove teammates (owner only).

**Admin** (`/admin`, for emails listed in `ADMIN_EMAILS`)
- Verify or hide blood banks and camps; manage blog posts and notifications; view pledges, contact messages and camp-alert subscribers.

**Content**
- Home (live stats, campaign carousel, nearest camps, how it works, eligibility, blog, pledge), About Donating, Blog, Notifications (search/sort/category, downloads), FAQs, About, Contact (form), Pledge counter, Terms, Privacy, Accessibility, Sitemap (page and `sitemap.xml`), `robots.txt`.
- English / Hindi language toggle.

## Run locally

Requires Node 20+ and Docker (for PostgreSQL).

```bash
cp .env.example .env          # then set SESSION_SECRET to a long random string
docker compose up -d db       # PostgreSQL on localhost:5433
npm install
npx prisma migrate deploy     # create tables
npm run seed                  # real blood bank directory + simulated donors, camps, stock, demo accounts
npm run dev                   # http://localhost:3000
```

### Data sources

- **Blood banks (real):** about 2,200 listings across India, with name, address, phone, coordinates, category and opening hours where known. They come from OpenStreetMap, where many entries originate from India's open government data release on licensed blood banks (those are marked verified). The data is © OpenStreetMap contributors under the [ODbL](https://www.openstreetmap.org/copyright), and the footer carries the attribution. A snapshot ships in `prisma/data/blood-banks.json`, so seeding works offline. Refresh it from live data with `npm run sync:banks` (updates the database and the snapshot; re-running never duplicates or overwrites stock).
- **Stock, donors, camps, requests (simulated):** real banks don't publish stock openly, so the seed gives about 45% of them made-up units (skip with `SEED_DEMO_STOCK=false`; banks without stock show "Stock not published"). Donors and camps use invalid `0000…` phone numbers, so nobody real is contacted.
- **Geography:** states and districts in `src/data/india-states.json`; reverse geocoding by BigDataCloud, district lookup by Nominatim, tiles by OpenStreetMap.

### Demo mode

Set `NEXT_PUBLIC_DEMO_MODE="true"` (then rebuild, since it is inlined at build time) to show a banner that some figures are simulated and one-click sign-in buttons on `/login` and `/organisation/login`: a donor with an urgent request waiting, a patient's family with a request a donor already accepted, a blood bank organiser (AIIMS Delhi and another real Delhi bank, with stock and a camp), and an admin. **Never enable it in production**, because it lets anyone sign in as those accounts.

With `DEV_SHOW_OTP="true"`, one-time codes appear on screen and in the server log, so you can sign in with any number or email. To try the admin panel, sign in at `/organisation/login` with an address listed in `ADMIN_EMAILS`.

To test the full donor flow, use two browsers: register a donor near a location in one, raise a request for a compatible group near the same place in the other, then accept it from the donor's profile.

## Deploy

### Option A: Vercel + managed Postgres (Neon, Supabase, etc.)
1. Create a Postgres database and copy its connection string.
2. Import the repo into Vercel and set the environment variables from `.env.example`. Set `DEV_SHOW_OTP="false"` and real values for `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`, `ADMIN_EMAILS` and `CRON_SECRET`.
3. Run `npx prisma migrate deploy` against the production database (locally with `DATABASE_URL` pointed at it, or as a build step).
4. `vercel.json` schedules `/api/cron/expand-requests` every 10 minutes. Vercel sends `CRON_SECRET` automatically. On the Hobby plan crons run at most daily. The request status page also widens the search whenever it's open, so this is a backstop.

### Option B: Docker (any VPS)
```bash
cp .env.example .env   # fill in production values
docker compose --profile full up -d --build
```
The app container runs migrations on start. Seed only if you want demo data: `docker compose exec app npm run seed`.

For any other host, call `GET /api/cron/expand-requests` with `Authorization: Bearer $CRON_SECRET` every few minutes (cron, GitHub Actions, etc.).

## Before going live

- **Remove the demo data.** Set `NEXT_PUBLIC_DEMO_MODE="false"` and don't run the seed in production; run `npm run sync:banks` instead to load the real directory without simulated stock. Verify listings with the blood centres, since OpenStreetMap data can be out of date. To add or replace banks from your own CSV:
  ```bash
  npm run import:banks -- banks.csv --replace-seed
  ```
  Columns: `name, category, address, state, district, lat, lng, phone` (plus optional `pincode, email, licenseNo, hasComponents`). State/district names must match `src/data/india-states.json`. Seed donors can be removed with `DELETE FROM "User" WHERE phone LIKE '0000%'`.
- **SMS**: set `SMS_PROVIDER="twilio"` and the Twilio variables, or add another provider in `src/lib/notify.ts`. Indian SMS needs DLT-registered templates with most providers.
- **Email**: set `SMTP_*` for organisation login codes.
- **Legal**: the Terms, Privacy and Accessibility pages are a starting point. Have them reviewed for your organisation, particularly for health data under India's DPDP Act.
- Set `NEXT_PUBLIC_SUPPORT_EMAIL` and optionally `NEXT_PUBLIC_PLEDGE_GOAL`.

## API

All endpoints return JSON. Errors are `{ "error": "message" }` with a matching HTTP status. Auth uses an HTTP-only session cookie set by OTP verification.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/otp/send` | – | `{channel: "phone"\|"email", target}`, sends a 6-digit code (rate limited) |
| POST | `/api/auth/otp/verify` | – | `{target, code}`, signs in (creates the account if new) |
| POST | `/api/auth/logout` | – | Sign out |
| GET | `/api/me` | – | Current user (or `null`) |
| POST | `/api/demo/login` | demo mode only | `{role: "donor"\|"requester"\|"organiser"\|"admin"}`, signs in as a sample account |
| GET | `/api/stats` | – | Donor, bank, camp and state counts |
| GET | `/api/banks` | – | `group, compatible=1, lat, lng, radius, state, district, q, stock=has\|none\|best, limit` |
| GET | `/api/banks/:id` | – | One bank with stock |
| GET | `/api/camps` | – | `state, district, q, range=upcoming\|week\|month\|all, lat, lng, sort=near, limit` |
| POST | `/api/camps/subscribe` | – | Camp alerts for a district |
| GET | `/api/donors/count` | – | Compatible donors reachable (`group, lat, lng, radius`), count only |
| POST / PATCH / DELETE | `/api/donor` | phone user | Register, update, or remove donor profile |
| GET | `/api/donor/requests` | donor | Requests you've been matched to |
| POST | `/api/matches/:id` | donor | `{action: "accept"\|"decline"}` |
| POST / GET | `/api/requests` | user | Create a request / list your requests |
| GET / PATCH | `/api/requests/:id` | owner | Status and accepted donors / `{status}` or `{expand: true}` |
| GET / POST | `/api/org` | email user | Your organisation / create one |
| POST | `/api/org/banks` | org | Register a bank (`orgName` creates the org on first use) |
| PATCH / DELETE | `/api/org/banks/:id` | org | Edit / delete a bank |
| PUT | `/api/org/banks/:id/stock` | org | `{stock: {"A+": 10, …}}` |
| POST | `/api/org/camps` | org | Register a camp |
| PATCH / DELETE | `/api/org/camps/:id` | org | Edit / delete a camp |
| POST | `/api/org/members` | org owner | Add a teammate by email |
| DELETE | `/api/org/members/:id` | org owner | Remove a teammate |
| GET / POST | `/api/pledges` | – | Pledge count / add a pledge |
| POST | `/api/contact` | – | Contact form |
| PATCH | `/api/admin/banks/:id`, `/api/admin/camps/:id` | admin | `{verified, active}` |
| POST, PATCH, DELETE | `/api/admin/blog[/:id]` | admin | Manage posts |
| POST, DELETE | `/api/admin/notices[/:id]` | admin | Manage notifications |
| GET | `/api/cron/expand-requests` | `CRON_SECRET` | Widen stale requests, expire old ones |

## Project layout

```
prisma/            schema, migrations, seed (+ seed-content for blog/notices), data/blood-banks.json
scripts/           sync-osm-banks.ts (public directory import), import-banks.ts (CSV importer)
src/app/           pages and /api route handlers
src/components/    UI (header, pickers, map, OTP form, donor form, org dashboard…)
src/lib/           db, session, OTP, matching engine, blood compatibility, geo, i18n
src/data/          Indian states and districts
```
