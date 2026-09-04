# Local development

## Prerequisites

- Node.js 20.9 or newer; Node.js 24 is currently used in this workspace.
- npm
- PostgreSQL 14 or newer, either hosted or local

PowerShell on some Windows machines blocks the `npm.ps1` wrapper. In that case,
use `npm.cmd` in the commands below; it invokes the same npm installation.

## Install and run

```powershell
npm.cmd install
Copy-Item .env.example .env
npm.cmd run prisma:generate
npm.cmd run dev
```

Open `http://localhost:3000` in a browser.

## Quality commands

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

All four commands should pass before a pull request is merged.

The workflow in `.github/workflows/ci.yml` runs these checks automatically on
every push and pull request using Node.js 24 and a clean `npm ci` installation.

## Current implementation status

The current application contains:

- A responsive marketing page
- Resident navigation and dashboard
- Database-backed report list and detail pages
- Persistent resident drafts, submissions, editing, and cancellation
- Staff verification, assignment, work-start, rejection, and resolution tools
- Private, optimized Supabase evidence uploads with signed display URLs
- Transactional status history, notifications, and append-only audit logs
- Interactive OpenStreetMap community and report-location maps
- Policy-compliant, cached Philippines location search
- Resident notification inbox, unread count, and email templates
- Credentials sign-in, registration, sign-out, and role-specific workspaces
- Placeholder map, notifications, and settings pages

See `reporting-workflow.md` for lifecycle rules and one-time evidence Storage
setup.

## PostgreSQL setup

Choose one database option.

### Option A: Hosted PostgreSQL

Create a PostgreSQL database with a provider such as Neon or Supabase. Replace
`DATABASE_URL` in `.env` with the provider's direct PostgreSQL connection string.
Use a development database rather than a production database while building.

### Option B: Local PostgreSQL with Docker

Install Docker Desktop, then run:

```powershell
docker compose up -d postgres
```

The committed `compose.yaml` starts PostgreSQL on port 5432 using the development
credentials already shown in `.env.example`.

Docker and PostgreSQL are not currently installed on this workstation. The
active development database is therefore the hosted Supabase PostgreSQL project
configured privately in `.env`.

## Initialize the database

After PostgreSQL is reachable:

```powershell
npm.cmd run db:deploy
npm.cmd run db:seed
npm.cmd run db:verify
```

`db:deploy` applies the committed migration without trying to redesign it.
`db:seed` explicitly creates the deterministic demo dataset. `db:verify`
performs read-only counts and lists seeded public report IDs. Use
`npm.cmd run db:migrate -- --name <migration-name>` only when intentionally
creating a new development migration.

Inspect records with:

```powershell
npm.cmd run db:studio
```

## Current database state

The initial migration was applied to Supabase and the demonstration seed was
verified on September 4, 2026. Expected verification counts are:

| Record type | Count |
| --- | ---: |
| Users | 3 |
| Issue categories | 6 |
| Response teams | 1 |
| Reports | 3 |
| Report status events | 9 |
| Notifications | 1 |

Run `npm.cmd run db:verify` at any time to perform the same read-only check.

## Demo sign-in

After running the current seed, use `AgapayDemo123!` with one of these emails:

- Resident: `resident@agapay.local`
- Staff: `staff@agapay.local`
- Administrator: `admin@agapay.local`

Override the shared development password by setting `SEED_DEMO_PASSWORD` before
rerunning `npm.cmd run db:seed`. Do not use the demonstration password for real
users or a public production administration account.

## Environment variables

`.env.example` documents every planned configuration value. Local values belong
in `.env`, which is ignored by Git. Never commit real credentials.

Generate a private Auth.js secret before deployment:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Copy the printed value into `AUTH_SECRET` in `.env`. Do not reuse the example
value or expose the generated value in screenshots and commits.

For evidence uploads, also set the three `SUPABASE_*` Storage values documented
in `.env.example`, then run `npm.cmd run storage:setup`. The database connection
string alone cannot authorize private object-storage administration.

Map development works without an API key. The default tile and Nominatim URLs
are documented in `.env.example` and can be replaced per environment. Read
`maps-and-notifications.md` before production use; the public OSM services have
strict attribution, identification, caching, and traffic rules.
