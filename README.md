# Raajwarasa — Heritage Collection Website

A production-quality heritage collection website for the Raajwarasa family. Cinematic public site for visitors, plus a private admin panel for managing the catalog, journal, enquiries and media — built to run free on consumer-grade infrastructure.

## Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18 + Vite + React Router (SPA, same-origin `src/lib/api.js`) |
| Backend   | Spring Boot 3.3 (Java 21), Spring Security + JWT, Spring Data JPA |
| Database  | PostgreSQL 16, schema managed by Flyway migrations |
| Web       | nginx (SPA + reverse proxy for `/api` and `/uploads`) |
| Ops       | Actuator health probes, graceful shutdown, per-IP request rate limiting, HTTP caching headers |

## Repository layout

```
backend/                  Spring Boot application
  src/main/resources/db/migration/   Flyway migrations (V1 schema, V2 demo seed)
  src/test/               Integration tests (run against a dedicated test database)
frontend/                 React SPA (public site + /admin panel)
deploy/nginx.conf         Web server config (Docker + VPS template)
scripts/backup.sh         pg_dump backup with retention
scripts/restore.sh        pg_restore from a backup
docker-compose.yml        Full stack: db + api + web
.env.example              Template for all configuration
```

## Quick start (Docker Compose)

1. `cp .env.example .env` and replace `JWT_SECRET`, `DATABASE_PASSWORD`, `ADMIN_PASSWORD`.
2. `docker compose up --build`
3. Open `http://localhost` — the demo catalog and journal are pre-seeded by `V2__seed_demo_content.sql`. No content yet? See "Demo content" below.
4. Admin panel: `http://localhost/admin` → login with `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `.env`.
5. Health checks: `http://localhost/actuator/health`, `/actuator/health/readiness`.

### Demo content

A fresh database is populated by the `V2__seed_demo_content.sql` migration (6 artifacts + 2 journal articles). The migration is fully idempotent: it uses `ON CONFLICT (slug) DO NOTHING`, so re-running it on a populated database never duplicates rows. Uploaded media lives in the `uploads` volume; before the first upload the public site gracefully falls back to built-in placeholder art. Admin uploads accept **any resolution** — photos are optimized client-side on the fly (downscaled to a web-friendly size with the aspect ratio preserved, untouched if already small), so cameras and phones need no special handling.

## Local development (no Docker)

Prerequisites: JDK 21, Maven 3.9+, Node 20+, a Postgres 16 instance.

```bash
# 1. database
docker run --name raajwarasa-pg -e POSTGRES_PASSWORD=password -e POSTGRES_DB=raajwarasa \
  -p 5433:5432 -d postgres:16-alpine

# 2. backend (http://localhost:8080)
cd backend
mvn spring-boot:run

# 3. frontend (http://localhost:5173, proxies /api and /uploads to :8080)
cd frontend
npm install
npm run dev
```

The backend reads every setting from environment variables (see `.env.example`). In development the built-in defaults point at `localhost:5433/raajwarasa` with user `postgres` / password `password` and an admin login `admin` / `rajvarsa@123` — **change these before going live.**

## Environment variables

| Variable            | Default                          | Purpose |
|---------------------|----------------------------------|---------|
| `SERVER_PORT`       | `8080`                           | Backend port |
| `DATABASE_URL`      | `jdbc:postgresql://localhost:5433/raajwarasa` | JDBC URL |
| `DATABASE_USER`     | `postgres`                       | DB user |
| `DATABASE_PASSWORD` | `password`                       | DB password |
| `JWT_SECRET`        | dev-only value                   | HS256 signing secret — **always override in prod** |
| `JWT_EXPIRATION_MS` | `604800000` (7d)                 | Admin session lifetime |
| `ADMIN_USERNAME`    | `admin`                          | First admin account (created if missing) |
| `ADMIN_PASSWORD`    | `rajvarsa@123`                   | First admin password — **change before going live** |
| `UPLOAD_DIR`        | `./uploads`                      | Media storage directory |
| `CORS_ORIGINS`      | `http://localhost:5173,http://localhost:4173` | Allowed browser origins |
| `TEST_DB_URL` / `TEST_DB_USER` / `TEST_DB_PASSWORD` | `localhost:5433/raajwarasa_test` | Integration test database |

Generate a strong secret with `openssl rand -base64 48`.

## Database & migrations

- Schema is **owned by Flyway** (`backend/src/main/resources/db/migration/`). Never edit an applied migration — add `V3__`, `V4__`, … instead. Flyway records checksums and fails loudly on drift.
- Hibernate runs with `ddl-auto=validate`, so boot fails if the JPA entities drift from the migrations.
- Startup also runs an idempotent `DataSeeder` (admin user + 5 default categories).

### Schema first-load vs. restore

Migration order on any fresh database: `V1` schema → `V2` demo seed → `DataSeeder`. Restoring a backup skips migrations for those rows (the scripts use `pg_restore --clean`), which is fine because data is authoritative after restore. If you restore a backup **and** boot with `flyway.validate-on-migrate` errors, re-validate against the restored schema with `mvn -q flyway:info` and you will see row counts; the migrations themselves are immutable.

## Testing

```bash
# one-time: create the throwaway test database
docker exec raajwarasa-pg psql -U postgres -c "CREATE DATABASE raajwarasa_test"

cd backend
mvn test        # 12 integration tests: schema, fresh-deploy seed integrity,
                # catalog, auth/security, artifact CRUD, enquiry lifecycle,
                # validation, caching, rate limiting
```

Tests run against `localhost:5433/raajwarasa_test` by default. Point `TEST_DB_URL` at any Postgres in CI (e.g. a GitHub Actions service container) — no Docker-in-JVM requirements.

GitHub Actions runs the same suite (`.github/workflows/ci.yml`): a Postgres 16 service container, then backend tests, then the frontend production build.

### Browser smoke test (frontend)

`node scripts/smoke.mjs` drives a real system Chrome/Edge (via `puppeteer-core`) through every public route, in-app navigation, and the full admin panel — including a real create→list→delete category cycle — while capturing console errors, uncaught exceptions and failed requests. Screenshots land in the temp dir. Exits non-zero on any failure. Run it against the Vite dev server (`npm run dev`) or a deployed URL via `SMOKE_BASE`.

### Responsive / design audit (frontend)

`node scripts/audit.mjs` measures every public + admin route at five viewports (320 px phone → 1920 px desktop): horizontal overflow, images missing descriptive alt text, undersized tap targets and near-empty pages. The suite is clean across all five widths. `node scripts/upload-verify.mjs` proves the "upload any resolution" path end-to-end: a real 5000×3200 photo becomes a sub-2048 px asset with the aspect ratio intact.

### Dependency notes

- `react-router-dom` is pinned to the v7 line — the v6 line has an unresolved open-redirect advisory (`GHSA-wrjc-x8rr-h8h6`). Verified green across the suite.
- The only remaining `npm audit` findings are Vite 5 / esbuild **dev-server-only** advisories (they cannot affect the built static bundle; resolving them requires the Vite 8 major). The dev server binds to localhost.

## Deployment (free, lifetime)

The whole stack is designed for $0 hosting. | Area | Free option |

| Public site (SPA) | **Vercel Hobby** (free, one-click GitHub deploy; `frontend/vercel.json` included) — Cloudflare Pages also works |
| Backend API | Oracle Cloud Always Free VM (1–4 OCPU ARM) or Render free web service running `docker-compose.yml` — or the same VPS for everything |
| Database | Neon or Supabase free Postgres (Neon: true PostgreSQL, SQL passthrough, easy `DATABASE_URL`; Supabase: Postgres + storage if you want it) |
| Media | On-VM disk via `UPLOAD_DIR` (simplest, zero cost). Upgrade path: Cloudflare R2 10GB tier — mount a browse-able object store or add a storage driver later |

Options in detail:

**Option A — everything on one VPS (simplest, recommended).** Bring up the Oracle Always Free VM, install Docker, then `docker compose up -d --build`. Back it with `scripts/backup.sh` on cron. Stick Cloudflare Tunnel (free) or Cloudflare DNS + the VPS IP in front for TLS.

**Option B — fully managed split (Vercel + Render + Neon, all free).** Frontend on Vercel, API on Render free, Postgres on Neon free. No card required at any step.

1. **Neon** (Postgres): create a free project → copy the connection string → convert it to the JDBC form Render needs:

   ```
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ⤷ jdbc:postgresql://ep-xxx.region.aws.neon.tech:5432/neondb?sslmode=require
   ```

2. **Render** (API): New Web Service → connect the GitHub repo → Root Directory `backend` → runtime "Docker" (uses `backend/Dockerfile`) → **Free** instance → set these env vars and save:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | the JDBC URL from step 1 |
   | `JWT_SECRET` | long random string (e.g. `openssl rand -hex 32`) |
   | `ADMIN_PASSWORD` | strong password |
   | `CORS_ORIGINS` | your Vercel URL (update after step 4) |

   Health check path: `/actuator/health`. If you name the service `raajwarasa-api`, its URL is `https://raajwarasa-api.onrender.com` — keep the name or edit `frontend/vercel.json` to match.

3. **Vercel** (frontend): Add New Project → import the GitHub repo → Framework Preset **Vite**, Root Directory **frontend**, Build `npm run build`, Output `dist`. Deploy.

4. Back in Render, set `CORS_ORIGINS` to the deployed Vercel URL and redeploy.

Notes:
- Render free instances sleep after ~15 min idle (first visit may take ~30–60s to wake); Neon free and Vercel Hobby stay always-on.
- Render disks are ephemeral — uploaded media can be lost on deploy/restart; the catalog lives in Neon, so uploads are re-importable. Keep rare original assets backed up.
- `frontend/vercel.json` routes `/api` and `/uploads` to the Render host and falls back to `/index.html` for SPA routes.

In both cases:
1. Set a long random `JWT_SECRET`
2. Change `ADMIN_PASSWORD` and log in once
3. Add a cron job: `0 3 * * * PGPASSWORD=... ./scripts/backup.sh /var/backups/raajwarasa >> /var/log/raajwarasa-backup.log 2>&1`

### Production checksheet (`/actuator/health/liveness` + `/readiness`)

- `readiness` UP when the DB is reachable and Flyway validated.
- The nginx health endpoint at `/actuator/health` doubles as a probe target for the host.

## Ops runbook

| Task | Command |
|------|---------|
| Logs (compose) | `docker compose logs -f api` |
| Health | `curl http://localhost/actuator/health` |
| Backup | `./scripts/backup.sh` |
| Restore | `./scripts/restore.sh backups/raajwarasa-<stamp>.sql.gz` |
| Re-apply migrations after pull | `docker compose up --build -d` (Flyway auto-runs) |
| Reset to seed | `docker compose down`, then `docker volume rm <compose>_pgdata` and `up` again |

## Security notes

- JWT is the only session mechanism; the API is stateless and CSRF is disabled deliberately (JWT bearer auth).
- Public write endpoints (`POST /api/public/contact`, `POST /api/public/inquiries`) are rate-limited per IP (30/min default, see `raajwarasa.rate-limit.per-minute`).
- Admin endpoints already enforce `ROLE_ADMIN`; they are additionally marked `no-store` for HTTP caches.
- Never commit `.env`; generate per-environment secrets.
- The data itself is family-owned. The seed copy includes no invented historical claims — uncertain fields render as “Details coming soon” on the site.