# Product specification

## Purpose

Agapay gives residents one transparent place to report local concerns and gives
authorized response teams a structured workflow for resolving them.

## Initial users

### Resident

- Creates an account and manages a basic profile.
- Submits an issue with category, description, location, and optional photos.
- Tracks the report status and sees a chronological activity history.
- Receives in-app and email updates.

### Staff member

- Reviews incoming reports.
- Verifies or rejects reports with an explanation.
- Assigns verified reports to a response team.
- Posts progress updates and marks work as resolved.

### Administrator

- Manages users, staff access, categories, and service areas.
- Reviews audit history and operational analytics.
- Handles reports flagged as duplicate, unsafe, or inappropriate.

## Report lifecycle

```text
Draft -> Submitted -> Verified -> In Progress -> Resolved
                   `-> Rejected
```

Reopening and duplicate-report behavior will be specified before the staff
workflow milestone.

## MVP boundaries

Included in the first usable release:

- Secure authentication and role-based authorization
- Report submission and status tracking
- Image upload
- Resident dashboard
- Staff review and assignment workflow
- In-app notifications
- Responsive and accessible UI

Deferred until the core workflow is reliable:

- AI duplicate detection
- Public API access
- Native mobile applications
- SMS notifications
- Advanced geographic analytics

## Success criteria

- A resident can submit a valid report in under three minutes.
- Staff can determine the next action without contacting the resident for basic
  missing information.
- Every meaningful staff action has an attributable audit record.
- Residents can understand the current status without knowing internal office
  terminology.

