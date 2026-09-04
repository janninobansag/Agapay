# Agapay

A community issue reporting and resolution platform where residents can report
local problems and authorized staff can verify, assign, track, and resolve them.

## Technology stack

- Next.js with TypeScript and the App Router
- PostgreSQL with Prisma
- Auth.js credentials authentication
- Tailwind CSS and shadcn/ui
- Zod for validation
- Vitest and Playwright for testing.

The frontend foundation, PostgreSQL data layer, and role-based authentication are
implemented. Report-submission persistence remains part of the next milestone.

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
| `/sign-in` | Credentials sign-in | Implemented |
| `/sign-up` | Resident registration | Implemented |
| `/dashboard` | Resident overview | Database-backed |
| `/reports` | Resident report history | Database-backed |
| `/reports/new` | Report submission | Visual prototype |
| `/reports/[reportId]` | Report details and progress | Database-backed |
| `/map` | Geographic report discovery | Placeholder |
| `/notifications` | Resident updates | Placeholder |
| `/settings` | Profile preferences | Placeholder |
| `/staff` | Assigned staff work queue | Implemented |
| `/admin` | Administrative overview | Implemented |
| `/admin/reports` | Cross-system report list | Implemented |
| `/admin/users` | User and role list | Implemented |

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
- [Authentication and authorization](docs/authentication.md)
- [Data-layer decision record](docs/decisions/001-postgresql-and-prisma.md)
- [Local development guide](docs/development.md)
- [Delivery roadmap](docs/roadmap.md)
