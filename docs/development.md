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
- A visual report-submission form
- Authentication screen prototypes
- Placeholder map, notifications, and settings pages

Report submission does not persist data yet; that mutation belongs to the
reporting workflow milestone after identity and authorization are available.

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

## Environment variables

`.env.example` documents every planned configuration value. Local values belong
in `.env`, which is ignored by Git. Never commit real credentials.
