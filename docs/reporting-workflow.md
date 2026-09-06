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

## Transaction and failure behavior

- Report, lifecycle event, notification, and audit writes commit together.
- Rejection and resolution require an explanatory note.
- Assignment without a team or staff member is rejected.
