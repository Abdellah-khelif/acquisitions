# Acquisitions – Docker + Neon (Local for Dev, Cloud for Prod)

This project is containerized for:
- Development: Express app + Neon Local proxy (Docker Compose). The app connects to Postgres at `postgres://user:password@neon-local:5432/dbname` inside the compose network.
- Production: Express app connecting to Neon Cloud (external) using `DATABASE_URL`. No Neon Local proxy in production.

## Prerequisites
- Docker and Docker Compose
- Node 18+ (optional, only if running outside Docker)
- A Neon account (to use Neon Local features like ephemeral branches)

## Files Added
- Dockerfile – Multi-stage image with `development` and `production` targets.
- docker-compose.dev.yml – Runs app + Neon Local proxy for development.
- docker-compose.prod.yml – Runs only the app; connects to Neon Cloud via `DATABASE_URL`.
- .env.development – Local environment variables for dev (Neon Local connection string).
- .env.production – Production environment variables (Neon Cloud `DATABASE_URL`).
- .dockerignore – Reduces Docker build context.

## Environment Variables
The app reads at least:
- `DATABASE_URL` – Postgres connection string
- `JWT_SECRET` – Secret used to sign JWTs
- `PORT` – HTTP port (default: 3000)
- `LOG_LEVEL` – winston log level (e.g., info, debug)

Switching between dev and prod is done via compose files and env files:
- Dev: `.env.development` + `docker-compose.dev.yml` (forces `DATABASE_URL` to Neon Local).
- Prod: `.env.production` + `docker-compose.prod.yml` (uses Neon Cloud `DATABASE_URL`).

## Run Locally (Development with Neon Local)
1) Configure `.env.development` as needed:
   - Set a dev-safe `JWT_SECRET`.
   - Confirm `DATABASE_URL=postgres://user:password@neon-local:5432/dbname`.
   - Optionally set `NEON_API_KEY` and `NEON_PROJECT_ID` if Neon Local requires them for ephemeral branches.

2) Start the stack:
   - Windows PowerShell:
     ```powershell
     docker compose -f docker-compose.dev.yml up --build
     ```
   - Linux/macOS:
     ```bash
     docker compose -f docker-compose.dev.yml up --build
     ```

3) Access the app:
   - API root: http://localhost:3000/
   - Health: http://localhost:3000/health

4) Apply database migrations:
   ```bash
   docker compose -f docker-compose.dev.yml exec app npm run db:migrate
   ```

5) Stop and clean up:
   ```bash
   docker compose -f docker-compose.dev.yml down -v
   ```

Notes on Neon Local:
- The `neon-local` service exposes Postgres at port 5432 and can create ephemeral branches for dev/test.
- You may need to adjust image tag or flags per Neon docs. Example flags (commented in compose): `proxy --listen 0.0.0.0:5432 --auto-branch`.

## Deploy for Production (Neon Cloud)
1) Set production environment variables securely (CI/CD or secrets manager):
   - `DATABASE_URL` – Neon Cloud URL (often includes `?sslmode=require`). Example:
     `postgres://user:password@your-project.region.neon.tech/dbname?sslmode=require`
   - `JWT_SECRET` – a strong random secret
   - Optional: `LOG_LEVEL=info`, `PORT=3000`

2) Start the app:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

3) Apply migrations:
   ```bash
   docker compose -f docker-compose.prod.yml exec app npm run db:migrate
   ```

Important:
- Production compose does NOT run Neon Local; it expects an external Neon Cloud database available at `DATABASE_URL`.

### Healthchecks
- The dev and prod compose files include an app healthcheck that hits `/health`.
- If your base image lacks `wget`, switch the healthcheck to use `curl` and add it to the image, or use `CMD-SHELL` with BusyBox `wget`.

## Troubleshooting
- Cannot connect to DB in dev:
  - Ensure `neon-local` is up (`docker ps`) and mapping port 5432.
  - Confirm `DATABASE_URL` in the app container is `postgres://user:password@neon-local:5432/dbname`.
  - If ephemeral branches are required, verify your Neon API key and project ID in `.env.development`.
- Migrations fail:
  - Check schema permissions and that the DB URL is correct.
  - For Neon Cloud, ensure `sslmode=require` if needed.
- Logs directory permissions:
  - Dockerfile creates `logs` and switches to non-root `node` user; verify container can write to `/app/logs`.

## Commands Summary
- Dev up: `docker compose -f docker-compose.dev.yml up --build`
- Dev migrate: `docker compose -f docker-compose.dev.yml exec app npm run db:migrate`
- Dev down: `docker compose -f docker-compose.dev.yml down -v`
- Prod up: `docker compose -f docker-compose.prod.yml up -d --build`
- Prod migrate: `docker compose -f docker-compose.prod.yml exec app npm run db:migrate`
- Prod down: `docker compose -f docker-compose.prod.yml down -v`


### Khelif Abdellah

## License
This project is licensed under the MIT License — feel free to use and modify it.