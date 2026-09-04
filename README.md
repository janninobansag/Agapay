# Agapay

A community issue reporting and resolution platform where residents can report
local problems and authorized staff can verify, assign, track, and resolve them.

## Technology stack

- Next.js with TypeScript and the App Router
- PostgreSQL with Prisma
- Auth.js credentials authentication
- Tailwind CSS and shadcn/ui
- Zod for validation
- Supabase Storage and Sharp for private, optimized evidence images
- Vitest and Playwright for testing.

The frontend foundation, PostgreSQL data layer, role-based authentication, and
complete resident-to-staff reporting workflow are implemented.

## Quick start

```powershell
npm.cmd install
Copy-Item .env.example .env
npm.cmd run prisma:generate
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
| `/reports/new` | Draft and report submission | Implemented |
| `/reports/[reportId]` | Evidence, actions, and progress | Implemented |
| `/reports/[reportId]/edit` | Allowed resident report edits | Implemented |
| `/map` | Geographic report discovery | Placeholder |
| `/notifications` | Resident updates | Placeholder |
| `/settings` | Profile preferences | Placeholder |
| `/staff` | Staff verification and response queue | Implemented |
| `/staff/reports/[reportId]` | Staff workflow controls | Implemented |
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
- [Reporting workflow and evidence setup](docs/reporting-workflow.md)
- [Data-layer decision record](docs/decisions/001-postgresql-and-prisma.md)
- [Local development guide](docs/development.md)
- [Delivery roadmap](docs/roadmap.md)
