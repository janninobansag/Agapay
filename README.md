# Agapay

A community issue reporting and resolution platform where residents can report
local problems and authorized staff can verify, assign, track, and resolve them.

## Planned stack

- Next.js with TypeScript and the App Router
- PostgreSQL with Prisma
- Auth.js for authentication
- Tailwind CSS and shadcn/ui
- Zod for validation
- Vitest and Playwright for testing.

No framework dependencies have been installed yet. The repository currently
contains the agreed project structure only.

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

See [docs/architecture.md](docs/architecture.md) for detailed ownership rules.
