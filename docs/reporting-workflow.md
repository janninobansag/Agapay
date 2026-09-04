# Reporting workflow

Milestone 4 turns the report screens into an authenticated, audited workflow.

## Resident lifecycle

```text
DRAFT --submit--> SUBMITTED --staff verifies--> VERIFIED
  |                    |                           |
  +--cancel------------+-----------cancel----------+
                                                   |
                                      staff starts work
                                                   v
                                             IN_PROGRESS
                                                   |
                                      staff resolves with summary
                                                   v
                                               RESOLVED

SUBMITTED or VERIFIED --staff rejects with reason--> REJECTED
```

- Residents can create drafts or submit complete reports.
- Drafts and submitted reports can be edited by their owner.
- Residents can cancel before response work begins.
- Staff can verify or reject submissions, assign a team/member, start work, and
  resolve an in-progress report.
- The server reloads the authenticated user, validates every input, checks the
  current report state, and never accepts a client-provided owner or role.

Each state change creates a `ReportStatusEvent`. Each mutation also appends an
`AuditLog` in the same PostgreSQL transaction. The reporting-workflow migration
adds a database trigger that rejects every update or deletion of an audit row.

## Evidence images

Evidence is stored in a private Supabase Storage bucket rather than PostgreSQL.
The upload action accepts JPG, PNG, or WebP files up to 10 MB. Sharp applies EXIF
rotation, limits dimensions to 1600 by 1600, and emits an 82-quality WebP. Only
the object key and optimized-file metadata are stored in `ReportMedia`.

The application creates a 15-minute signed URL when an authorized user opens a
report. Service-role credentials stay server-only and must never use a
`NEXT_PUBLIC_` prefix.

### One-time Storage setup

In Supabase, open **Project Settings > API** and copy the project URL and the
server-only service-role key into `.env`:

```dotenv
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="report-evidence"
```

Then create the private bucket and its restrictions:

```powershell
npm.cmd run storage:setup
```

Reports without photos work when Storage is not configured. An attempted photo
upload returns a clear configuration error instead of saving an untracked file.

## Transaction and failure behavior

- Report, lifecycle event, notification, and audit writes commit together.
- If an object upload succeeds but the database write fails, the object is
  removed on a best-effort basis.
- Rejection and resolution require an explanatory note.
- Evidence is capped at three images per report.
- Assignment without a team or staff member is rejected.
