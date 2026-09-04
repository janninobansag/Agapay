# Data model

## Design goals

The first schema is designed around traceability. A report stores its current
state for efficient filtering while `ReportStatusEvent` preserves the history
that explains how it reached that state.

Database identifiers use CUID values internally. Residents see the separate
`Report.publicId` value, such as `AGP-1042`; this avoids exposing database keys
and gives support staff an easy reference number.

## Main entities

| Entity | Responsibility |
| --- | --- |
| `User` | Resident, staff, and administrator identities |
| `IssueCategory` | Administrator-controlled report categories |
| `ServiceArea` | Geographic or administrative area responsible for reports |
| `ResponseTeam` | Team that can be assigned resolution work |
| `TeamMember` | Many-to-many membership between staff and teams |
| `Report` | Current issue information, location, priority, and assignment |
| `ReportMedia` | Uploaded evidence metadata; binary files live in object storage |
| `ReportStatusEvent` | Append-oriented history of report state changes |
| `Notification` | Resident-facing update delivery and read state |
| `AuditLog` | Security and administrative activity history |

## Relationships

```text
User (resident) 1 ---- * Report * ---- 1 IssueCategory
                             |
                             +---- 0..1 ServiceArea
                             +---- 0..1 ResponseTeam * ---- * User (staff)
                             +---- * ReportMedia
                             +---- * ReportStatusEvent ---- 0..1 User (actor)
                             `---- * Notification --------- 1 User (recipient)
```

## Report lifecycle

The database enum permits these states:

```text
DRAFT -> SUBMITTED -> VERIFIED -> IN_PROGRESS -> RESOLVED
  |           |          |
  `-----------+----------+-> CANCELLED
              `------------> REJECTED
```

The schema constrains valid state values, but transition authorization belongs
in the server action layer. For example, residents may submit drafts, while
only staff can verify or reject submitted reports. These rules are implemented
in the server action and pure permission-policy layers.

## Location model

Every report requires a human-readable `address`. Latitude and longitude are
optional until map selection or geocoding confirms coordinates. `ServiceArea`
can later hold a GeoJSON boundary in its `boundary` JSON column.

This initial design uses ordinary PostgreSQL numeric columns rather than PostGIS
so local setup and hosted deployment remain simple. PostGIS should be introduced
only if distance and polygon queries become a measured requirement.

## Deletion behavior

- Users and categories with reports are restricted from deletion.
- Team, service-area, and staff assignments become `NULL` when removed.
- Report media, history, and linked notifications cascade with a deleted report.
- Team memberships cascade when either the team or user is removed.

Application workflows should normally archive records instead of deleting them.
`AuditLog` is stricter: a PostgreSQL trigger makes every row append-only by
rejecting updates and deletes at the database level.

## Seed data

`prisma/seed.ts` is deterministic and safe to run repeatedly for its known demo
records. It creates:

- Six issue categories
- One demonstration service area
- One resident, one staff member, and one administrator
- One response team and membership
- Three reports across verified, in-progress, and resolved states
- Status histories and a resident notification

Demo accounts receive bcrypt password hashes from the deterministic seed. The
plain demonstration password is documented in `authentication.md` and can be
overridden through `SEED_DEMO_PASSWORD`.
