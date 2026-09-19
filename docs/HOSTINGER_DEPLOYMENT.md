# Deploying Fibax Pharma to Hostinger (Node.js + MySQL)

This guide deploys the full app on a Hostinger **"Unlimited"** shared plan using
hPanel's **Node.js** app tool and a **MySQL** database. The single Node server
serves both the REST API and the built React frontend.

- Frontend: React (Vite) → built into `client/dist`
- Backend: Node.js / Express (`server/index.js`)
- Database: MySQL (via the `STORAGE_DRIVER=mysql` storage layer)

---

## 0. Prerequisites

- A Hostinger plan that lists **Node.js** under "Build with" (your Unlimited plan does).
- A domain pointed at the hosting account.
- SSH access enabled (hPanel → Advanced → SSH Access). Recommended.
- Git repo: `https://github.com/sameer3028/E-fibax`.

---

## 1. Create the MySQL database

hPanel → **Databases → Management**:

1. Create a new MySQL database, e.g. `uXXXXXXXX_fibax`.
2. Create a database user with a strong password and grant it **all privileges**
   on that database.
3. Note the **host** (usually `localhost`), **database name**, **user**, and
   **password** — you'll put these in `server/.env`.

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
STORAGE_DRIVER=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=uXXXXXXXX_fibax
DB_USER=uXXXXXXXX_fibax
DB_PASSWORD=your_strong_password
```

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

## 5. Migrate existing data into MySQL

This imports the current `server/data/*.json` (products, orders, users,
enquiries, admin login, shipping config) into the MySQL `collections` table.
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
these). Keep `STORAGE_DRIVER=mysql` and the `DB_*` values.

> Set the application to run a **single instance** (default for this tool). The
> storage layer keeps an in-memory cache that writes through to MySQL, so a
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
JSON files again (normally you do **not** after go-live, since MySQL is now the
source of truth).

---

## Notes & limitations

- **Uploaded images** (admin product uploads) are saved to `server/uploads/` on
  the server disk. They are covered by Hostinger's daily backups. The images
  shipped with the repo are already committed under `server/uploads/`.
- **Sessions** (admin + customer login tokens) are held in memory and reset if
  the app restarts; users simply log in again.
- To switch back to file storage locally, set `STORAGE_DRIVER=json` (the
  default) — no database needed for development.
