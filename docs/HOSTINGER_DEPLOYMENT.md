# Deploying Fibax Pharma to Hostinger (Node.js + Supabase/PostgreSQL)

This guide deploys the full app on a Hostinger **"Unlimited"** shared plan using
hPanel's **Node.js** app tool and a **Supabase (PostgreSQL)** database. The
single Node server serves both the REST API and the built React frontend.

- Frontend: React (Vite) → built into `client/dist`
- Backend: Node.js / Express (`server/index.js`)
- Database: Supabase / PostgreSQL (via the `STORAGE_DRIVER=postgres` storage layer)

> The storage layer is pluggable. Set `STORAGE_DRIVER=postgres` for Supabase,
> `mysql` for a MySQL database, or `json` for local development (no DB).

> **Single-domain model.** One Node.js app serves BOTH the React frontend and
> the `/api` backend on `fibaxpharma.com`. Do **not** also run Hostinger's
> static "git deploy" on the same domain — it would take over the domain and
> the backend `/api` would not be reachable. Because frontend and API share the
> same origin, you do **not** set `VITE_API_URL` (the app calls relative `/api`).
> If you previously created a static deployment for this domain, remove/disable
> it so the Node.js app owns the domain.

---

## 0. Prerequisites

- A Hostinger plan that lists **Node.js** under "Build with" (your Unlimited plan does).
- A domain pointed at the hosting account.
- SSH access enabled (hPanel → Advanced → SSH Access). Recommended.
- A free **Supabase** account: https://supabase.com
- Git repo: `https://github.com/sameer3028/E-fibax`.

---

## 1. Create the Supabase database

1. In Supabase, create a **New project** and set a strong database password
   (save it somewhere safe).
2. Go to **Project Settings → Database → Connection string → URI**.
3. Copy the **Connection pooling** URI (Transaction mode, port `6543`). It looks
   like:
   `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres`
4. You'll paste this into `DATABASE_URL` in `server/.env`. The app creates its
   table automatically on first run — no manual SQL needed.

---

## 2. Get the code onto the server

hPanel → **Advanced → SSH Access** (copy host/port), then from your terminal:

```bash
ssh uXXXXXXXX@your-server-ip -p 65002        # port shown in hPanel
cd ~
git clone https://github.com/sameer3028/E-fibax.git
cd E-fibax
```

(You can also use hPanel's Git tool or File Manager if you prefer no SSH.)

---

## 3. Configure environment variables

```bash
cd ~/E-fibax/server
cp .env.example .env
nano .env
```

Set at least:

```env
PORT=5000
NODE_ENV=production
STORAGE_DRIVER=postgres
DATABASE_URL=
DB_POOL_LIMIT=5
```

Paste the Supabase **Connection pooling** URI from step 1 as the value of
`DATABASE_URL` (it already contains the host, user, and password).
`.env` is git-ignored and never committed.

---

## 4. Install dependencies and build the frontend

```bash
cd ~/E-fibax/server && npm install --omit=dev
cd ~/E-fibax/client && npm install && npm run build
```

`npm run build` produces `client/dist`, which the Node server serves
automatically in production.

---

## 5. Migrate existing data into Supabase

This imports the current `server/data/*.json` (products, orders, users,
enquiries, admin login, shipping config) into the Supabase `collections` table.
Safe to re-run — each collection is fully replaced.

```bash
cd ~/E-fibax/server
npm run migrate
```

You should see per-collection record counts and `🎉 Migration complete.`

---

## 6. Register the Node.js app in hPanel

hPanel → **Advanced → Node.js** → **Create application**:

- **Node.js version:** 18 or newer
- **Application mode:** Production
- **Application root:** `E-fibax` (the cloned repo folder)
- **Application URL:** your domain (e.g. `fibaxpharma.com`)
- **Application startup file:** `server/index.js`

Add the same environment variables from your `.env` in the Node.js app's
**Environment variables** section (hPanel runs the app via Passenger, which reads
these). Keep `STORAGE_DRIVER=postgres` and `DATABASE_URL`.

> Set the application to run a **single instance** (default for this tool). The
> storage layer keeps an in-memory cache that writes through to Supabase, so a
> single Passenger instance guarantees consistency.

Click **Create**, then **Restart** the application.

---

## 7. Verify

- Visit `https://yourdomain.com` → the React site loads.
- Visit `https://yourdomain.com/api/products` → JSON list of products.
- Admin panel login uses the credentials from your migrated `admin_auth`
  (default `admin` / `admin@fibax2026` if never changed — **change it after
  first login** via the admin panel).

---

## 8. Updating the site later

```bash
cd ~/E-fibax
git pull
cd client && npm install && npm run build
cd ../server && npm install --omit=dev
# then Restart the app in hPanel → Node.js
```

Only re-run `npm run migrate` if you intend to overwrite the database with the
JSON files again (normally you do **not** after go-live, since Supabase is now
the source of truth).

---

## Notes & limitations

- **Uploaded images** (admin product uploads) are saved to `server/uploads/` on
  the server disk. They are covered by Hostinger's daily backups. The images
  shipped with the repo are already committed under `server/uploads/`.
- **Sessions** (admin + customer login tokens) are held in memory and reset if
  the app restarts; users simply log in again.
- To switch back to file storage locally, set `STORAGE_DRIVER=json` (the
  default) — no database needed for development.
