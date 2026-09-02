# Agapay

A community issue reporting and resolution platform where residents can report
local problems and authorized staff can verify, assign, track, and resolve them.

## Technology stack

- Next.js with TypeScript and the App Router
- PostgreSQL with Prisma
- Auth.js for authentication (next milestone)
- Tailwind CSS and shadcn/ui
- Zod for validation
- Vitest and Playwright for testing.

The frontend foundation and PostgreSQL data layer are implemented. Authentication
and report-submission persistence remain part of the next milestones.

## Quick start

```powershell
npm.cmd install
Copy-Item .env.example .env.local
npm.cmd run dev
```

Then open `http://localhost:3000`.

## Available routes

| Route | Purpose | Current state |
| --- | --- | --- |
| `/` | Public introduction and product value | Implemented |
| `/sign-in` | Resident sign-in | Visual prototype |
| `/sign-up` | Resident registration | Visual prototype |
| `/dashboard` | Resident overview | Database-backed |
| `/reports` | Resident report history | Database-backed |
| `/reports/new` | Report submission | Visual prototype |
| `/reports/[reportId]` | Report details and progress | Database-backed |
| `/map` | Geographic report discovery | Placeholder |
| `/notifications` | Resident updates | Placeholder |
| `/settings` | Profile preferences | Placeholder |

## Project layout

```text
.
|-- .github/workflows/       # Continuous integration workflows
|-- docs/                    # Architecture and product documentation
|-- prisma/
|   `-- migrations/          # Database schema migrations
|-- public/
|   `-- images/              # Static public images
|-- src/
|   |-- app/                 # Next.js routes, layouts, and API handlers
|   |-- components/          # Reusable application-wide UI
|   |-- features/            # Domain modules
|   |-- lib/                 # Integrations and shared infrastructure
|   |-- server/              # Server actions and database queries
|   `-- types/               # Shared TypeScript types
`-- tests/
    |-- unit/
    |-- integration/
    `-- e2e/
```

## Documentation

- [Product specification](docs/product.md)
- [Architecture and ownership rules](docs/architecture.md)
- [Database model](docs/data-model.md)
- [Data-layer decision record](docs/decisions/001-postgresql-and-prisma.md)
- [Local development guide](docs/development.md)
- [Delivery roadmap](docs/roadmap.md)
