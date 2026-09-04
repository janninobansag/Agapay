# Project architecture

## Route structure

The application uses Next.js route groups to separate layouts without adding
those group names to public URLs.

```text
src/app/
|-- (auth)/
|   |-- sign-in/
|   `-- sign-up/
|-- (platform)/
|   |-- dashboard/
|   |-- reports/
|   |   |-- new/
|   |   `-- [reportId]/
|   |       `-- edit/
|   |-- map/
|   |-- notifications/
|   `-- settings/
|-- (admin)/
|   `-- admin/
|       |-- reports/
|       `-- users/
|-- (staff)/
|   `-- staff/reports/[reportId]/
`-- api/
```

Route files should remain thin. Pages compose feature components and call the
server layer rather than containing business rules directly.

## Source ownership

### `src/features`

Each product domain owns its components, schemas, hooks, and domain-specific
helpers. Initial domains are:

- `auth`: sign-in, registration, and session-facing UI
- `reports`: issue creation, moderation, assignment, and status history
- `map`: map markers, geographic filters, and location selection
- `notifications`: in-app and email notification behavior
- `admin`: staff dashboards, user administration, and analytics

Code used by only one domain stays in that feature. Promote code to a shared
folder only after it has a real second consumer.

### `src/components`

- `ui`: small reusable UI primitives
- `layout`: navigation, headers, sidebars, and page shells
- `feedback`: loading, empty, error, and confirmation states

These components must not contain report-specific business logic.

### `src/lib`

Infrastructure wrappers live here:

- `auth`: authentication configuration and session helpers
- `db`: the Prisma client and database utilities
- `email`: email provider integration
- `permissions`: role and resource authorization policies
- `storage`: uploaded-image storage integration

### `src/server`

- `actions`: authenticated mutations invoked by the application
- `queries`: reusable server-only reads

Server code validates input, checks authorization, and then accesses the
database. Client-provided roles or ownership identifiers are never trusted.

Database reads return both data and an availability state. This lets the UI
distinguish an empty result from missing configuration or an unreachable
database without silently substituting fake production data.

## Database

PostgreSQL is the source of truth. Prisma owns the schema, migration history,
generated client, and deterministic development seed. Runtime access goes
through `src/lib/db/prisma.ts`, which reuses one client during Next.js hot reloads
and uses the PostgreSQL driver adapter.

See [data-model.md](data-model.md) for entity and lifecycle details.

## Identity boundary

Auth.js owns session creation and cookies. `src/lib/auth/user.ts` is the data
access boundary for current-user checks, while `src/lib/permissions` contains
pure authorization policies that can be unit tested without a web request.

See [authentication.md](authentication.md) for flows, route roles, and current
security limitations.

## Reporting boundary

Report mutations live in `src/server/actions/reports.ts`. Lifecycle policies are
pure functions in `src/lib/permissions/reports.ts`, while optimized evidence is
handled by the server-only `src/lib/storage/evidence.ts` adapter. See
[reporting-workflow.md](reporting-workflow.md) for transition and failure rules.

## Testing strategy

- `tests/unit`: pure functions, schemas, and permission rules
- `tests/integration`: database queries, mutations, and route handlers
- `tests/e2e`: critical user journeys in a deployed-like browser environment

Tests may also be colocated beside a feature when tight proximity makes the
module easier to maintain.

## Naming conventions

- React components: `PascalCase.tsx`
- Hooks: `use-name.ts`
- Utilities and server modules: `kebab-case.ts`
- Route directories: lowercase kebab-case
- Database tables/models: singular `PascalCase` Prisma models
- Environment variables: uppercase `SNAKE_CASE`

## Dependency direction

```text
app routes -> features -> server/lib -> database or external services
                 |
                 `-> shared components
```

Infrastructure must not import route modules. Shared UI must not import feature
modules. This keeps domain logic testable and prevents circular dependencies.
