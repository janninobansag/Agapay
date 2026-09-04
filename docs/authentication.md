# Authentication and authorization

## Overview

Agapay uses Auth.js with its Credentials provider. Passwords are hashed with
bcrypt using a work factor of 12 and are never stored or logged as plain text.
Sessions use encrypted, HTTP-only Auth.js JWT cookies with a seven-day lifetime.

Auth.js v5 beta is pinned because its `auth`, `handlers`, `signIn`, and `signOut`
APIs match the current official Next.js integration. Any future upgrade must be
tested as an authentication change rather than accepted automatically.

## Authentication flow

```text
Sign-in form
  -> server-side Zod validation
  -> active user lookup by normalized email
  -> bcrypt password comparison
  -> encrypted session cookie
  -> /post-login role router
       |-- RESIDENT -> /dashboard
       |-- STAFF    -> /staff
       `-- ADMIN    -> /admin
```

Registration always creates an active `RESIDENT`. A public registration request
cannot choose its role. Staff and administrator promotion will require an
authorized administrative workflow in a later milestone.

## Authorization layers

1. `src/proxy.ts` performs an optimistic session and role check before protected
   routes render.
2. Protected layouts call `requireRole` for a server-side guard.
3. The data-access layer reloads the active user from PostgreSQL, so suspensions
   and role changes take effect even when an older JWT still exists.
4. Resident report queries include `reporterId`, preventing one resident from
   retrieving another resident's report by guessing its public ID.

Proxy is not treated as the only security boundary. Future mutation actions must
call `requireUser` or `requireRole` next to the database operation.

## Protected routes

| Route group | Allowed roles |
| --- | --- |
| `/dashboard`, `/reports`, `/map`, `/notifications`, `/settings` | Resident |
| `/staff` | Staff and administrator |
| `/admin`, `/admin/reports`, `/admin/users` | Administrator |
| `/sign-in`, `/sign-up`, `/`, Auth.js handlers | Public |

Authenticated users visiting an area outside their role are returned to their
own workspace through `/post-login`.

## Demonstration identities

The deterministic seed enables these local portfolio accounts:

| Role | Email |
| --- | --- |
| Resident | `resident@agapay.local` |
| Staff | `staff@agapay.local` |
| Administrator | `admin@agapay.local` |

Their default seed password is `AgapayDemo123!`. Set `SEED_DEMO_PASSWORD` before
running the seed to override it. These identities are demonstrations, not real
people, and the default password must not protect a real production system.

## Registration rules

- Names contain 2–100 characters.
- Emails are trimmed, lowercased, validated, and unique.
- Passwords contain 12–128 characters, uppercase, lowercase, and a number.
- Password confirmation must match.
- Duplicate creation is handled both before insertion and at the database unique
  constraint, covering simultaneous requests.
- Suspended and deactivated users cannot sign in.

## Current limitations

Email verification, password reset, login rate limiting, and multi-factor
authentication are intentionally deferred. They are required before treating
Agapay as a production public-service system. Portfolio/demo deployment should
clearly retain that boundary.

## Verification performed

The milestone was verified against the connected Supabase database:

- An anonymous `/dashboard` request redirects to `/sign-in`.
- Valid resident, staff, and administrator credentials route to `/dashboard`,
  `/staff`, and `/admin`, respectively.
- Resident and staff attempts to open `/admin` return them to their authorized
  workspace.
- An invalid password creates no session and protected routes remain blocked.
- All three seeded users have non-null bcrypt password hashes.
