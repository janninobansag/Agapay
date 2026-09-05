# Container and production deployment

Agapay ships as a small Next.js standalone container. PostgreSQL and Supabase
Storage are external managed services; the production Compose file does not run
a disposable database beside the application.

## Production requirements

- Docker Engine with Docker Compose v2
- A managed PostgreSQL database reachable from the deployment host
- A configured private Supabase Storage bucket for report evidence
- A public HTTPS domain, including its final `https://` origin

Copy `.env.production.example` to a local `.env.production` file and set every
value. Do not commit that file. `NEXT_PUBLIC_APP_URL` and
`NEXT_PUBLIC_OSM_TILE_URL` are build arguments because Next.js embeds public
variables into browser assets at build time. Runtime containers cannot safely
change them without rebuilding the image.

`.env`, `.env.production`, and other non-example environment files are ignored
by Git and excluded from the Docker build context. Set secrets in the deployment
host's secret manager or provide the ignored `.env.production` file only on the
server. Values whose names begin with `NEXT_PUBLIC_` are intentionally included
in the browser bundle, so use that prefix only for public values. Never prefix
`DATABASE_URL`, `AUTH_SECRET`, Supabase service-role credentials, or
Google/Facebook client secrets with `NEXT_PUBLIC_`.

Generate the production Auth.js secret with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

## Build and deploy

From the project root, load the deployment values into your shell or use your
hosting platform's secret manager, then run:

```powershell
docker compose --env-file .env.production -f compose.production.yml build
docker compose --env-file .env.production -f compose.production.yml run --rm migrate
docker compose --env-file .env.production -f compose.production.yml up -d app
```

The migration command is deliberately separate from the web container. Run it
once per release before scaling or replacing app containers. The Compose `app`
service also waits for a successful migration when started from a clean stack.

Verify readiness without exposing private configuration:

```powershell
Invoke-WebRequest https://agapay.example.com/api/health
```

The endpoint returns `200 { "status": "ok" }` only when PostgreSQL is
reachable; it returns `503` for unconfigured or unreachable database access.

## Platform deployment checklist

1. Set all values from `.env.production.example` in the platform secret store.
2. Build the image with the final HTTPS domain as `NEXT_PUBLIC_APP_URL`.
3. Run the `migrate` target once.
4. Deploy the `production` image behind HTTPS and route traffic to port 3000.
5. Confirm `/api/health`, sign-in, a protected route redirect, and evidence
   upload in the deployed environment.
6. Configure backups, log retention, and alerting in the PostgreSQL provider.

Do not run `db:seed` against production. Seeded accounts and sample reports are
for local development and controlled staging only.

## Local container verification

Docker is not installed on this workstation, so image build and Compose runtime
verification must be run after Docker Desktop is installed. The app's standalone
Next.js build remains covered by the browser production test suite in CI.
