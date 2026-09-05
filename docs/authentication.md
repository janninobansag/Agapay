# Authentication and authorization

## Overview

Agapay uses Auth.js with its Credentials provider. Passwords are hashed with
bcrypt using a work factor of 12 and are never stored or logged as plain text.
Sessions use encrypted, HTTP-only Auth.js JWT cookies with a seven-day lifetime.
The optional **Remember me** sign-in control issues a 30-day session instead;
it is intended only for a trusted personal device.

## Google and Facebook sign-in

Google and Facebook are optional OAuth sign-in providers. When enabled, a
resident can create an Agapay account or return to one with either provider;
the same flow is used from both the sign-in and sign-up pages. Agapay stores a
provider account ID in `OAuthAccount` and links it to the local user record, so
the user keeps one role, reports, and notification settings across sign-in
methods.

The buttons appear only after the matching environment variables are set:

```text
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_FACEBOOK_ID=...
AUTH_FACEBOOK_SECRET=...
```

Create the OAuth applications in Google Cloud Console and Meta for Developers,
then register these callback URLs (replace the origin for production):

```text
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/callback/facebook
https://your-domain.example/api/auth/callback/google
https://your-domain.example/api/auth/callback/facebook
```

After pulling this change, apply the `OAuthAccount` migration and regenerate
Prisma before starting the app:

```powershell
npm.cmd run db:deploy
npm.cmd run prisma:generate
```

Do not commit provider secrets. Use the deployed host's secret manager or its
ignored `.env.production` file. Google/Facebook can only sign in when the
provider returns an email address; accounts without one are not created.

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

## Resident account settings

The `/settings` route loads the active resident from PostgreSQL. Residents can
change their display name and enable or disable future in-app report updates.
Both actions validate input, derive the user ID from the authenticated session,
and append an immutable audit record in the same database transaction.

The email address is intentionally read-only. Changing it safely requires email
ownership verification, while password changes require a time-limited reset
flow; neither is simulated with an insecure direct database update.

## Local development seed accounts

The deterministic seed creates these accounts only for local development and
controlled test environments:

| Role | Email |
| --- | --- |
| Resident | `resident@agapay.local` |
| Staff | `staff@agapay.local` |
| Administrator | `admin@agapay.local` |

Their default seed password is `AgapayDemo123!`. Set `SEED_DEMO_PASSWORD` before
running the seed to override it. These are not public credentials and must not
be seeded into the production database.

## Guided onboarding

After a user signs in, Agapay shows a role-specific getting-started guide.
It links a resident to their dashboard, active report, and report form; staff to
the response queue and assigned report; and an administrator to operational
reports and user management. The tour can be dismissed for that role on the
current browser. Clearing site data makes it appear again.

## Registration rules

- Names contain 2–100 characters.
- Emails are trimmed, lowercased, validated, and unique.
- Passwords contain 8–128 characters, uppercase, lowercase, and a number.
- Password confirmation must match.
- Duplicate creation is handled both before insertion and at the database unique
  constraint, covering simultaneous requests.
- Suspended and deactivated users cannot sign in.

## Current limitations

Email verification, password reset, login rate limiting, and multi-factor
authentication are intentionally deferred. They are required before treating
Agapay as a full public-service system. This release is an early pilot; do not
collect real resident data until these safeguards are implemented.

## Verification performed

The milestone was verified against the connected Supabase database:

- An anonymous `/dashboard` request redirects to `/sign-in`.
- Valid resident, staff, and administrator credentials route to `/dashboard`,
  `/staff`, and `/admin`, respectively.
- Resident and staff attempts to open `/admin` return them to their authorized
  workspace.
- An invalid password creates no session and protected routes remain blocked.
- All three seeded users have non-null bcrypt password hashes.
