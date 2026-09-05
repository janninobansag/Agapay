# ADR 001: PostgreSQL and Prisma data layer

- Status: Accepted
- Date: 2026-09-02

## Context

Agapay needs relational integrity across residents, reports, categories, teams,
assignments, notifications, and status history. The product should also show
explicit migrations and type-safe server queries.

## Decision

Use PostgreSQL as the source of truth and Prisma ORM for schema definition,
migration history, generated query types, and development seeding.

The current development database is hosted by Supabase in its Southeast Asia
region and is accessed only through the private `DATABASE_URL` in `.env`. The
repository remains provider-portable because application code uses standard
PostgreSQL rather than Supabase-specific client APIs.

Prisma packages are pinned together at version 6.12.0. During implementation,
the published Prisma 7 CLI dependency tree produced a high-severity npm advisory
through its configuration parser. npm identified 6.12.0 as the compatible fixed
version, and the final dependency audit reports zero known vulnerabilities.

The PostgreSQL driver adapter is enabled through Prisma's `driverAdapters`
preview feature. `prisma.config.ts` also requires the `earlyAccess` marker in this
Prisma release. These flags are isolated to database configuration and should be
reviewed as part of any future Prisma upgrade.

## Consequences

- The application gets compile-time query types and reviewable SQL migrations.
- Production and local development can use any compatible PostgreSQL provider.
- Prisma package versions must be upgraded together and followed by schema,
  migration, test, and audit verification.
- A reachable PostgreSQL database is required to run report pages with data.
- Geographic coordinates initially use ordinary columns; PostGIS is deferred.
