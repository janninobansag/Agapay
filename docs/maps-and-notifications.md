# Maps and notifications

Milestone 5 adds geographic selection, a community map, resident notifications,
and provider-neutral email content.

## Map architecture

MapLibre GL JS renders raster OpenStreetMap tiles directly in the browser. The
tile URL is configured through `NEXT_PUBLIC_OSM_TILE_URL`, so a production host
can move to another OSM-derived provider without rebuilding application logic.
Attribution remains visible in MapLibre's standard attribution control.

`scripts/copy-maplibre-worker.mjs` copies MapLibre 6's worker and shared module
to `public/maplibre` before `dev` and `build`. These generated files are ignored
by Git and always match the installed package version.

The community map intentionally includes only `VERIFIED`, `IN_PROGRESS`, and
`RESOLVED` reports that have coordinates. It exposes a title, public report ID,
category, status, and coordinates—but never the resident's identity.

## Location search and validation

The report form provides an explicit Search button; it does not send requests
while the resident types. `/api/geocode` is an authenticated server proxy for
Nominatim and:

- accepts 3–160 character searches;
- limits results to the Philippines;
- identifies Agapay with a stable `User-Agent`;
- schedules uncached requests at no more than one per second per server process;
- caches normalized results for 24 hours; and
- reads the provider from `NOMINATIM_BASE_URL` for easy replacement.

A resident selects a result, clicks the map, or drags its marker. Submissions
require both coordinates inside the broad Philippines bounds; drafts may remain
incomplete. The human-readable address and coordinates are validated again by
the server action and never trusted solely because they came from the picker.

The public Nominatim and OSM tile services are suitable only for modest portfolio
traffic. A larger or commercial deployment must configure a provider with an
appropriate service agreement or self-host the services.

## In-app notifications

Report submission and each staff workflow update write a `Notification` within
the same transaction as the report event and audit log. The resident layout
shows a live unread count. The inbox supports ownership-checked single-item and
mark-all-read actions; one resident cannot mark another resident's records.

The first release loads the newest 100 notifications. Realtime browser pushes
are not required for the MVP: Next.js refreshes the count and inbox after each
mutation and on navigation.

## Email templates

`src/features/notifications/email-templates.ts` generates matching plain-text
and responsive HTML for every `NotificationType`. User-controlled values are
HTML-escaped and report links are built from `NEXT_PUBLIC_APP_URL`.

The templates are provider-neutral. A future Resend delivery adapter can pass
the returned `subject`, `text`, and `html` values without moving presentation
logic into the report action. `RESEND_API_KEY` remains unused until outbound
delivery, retry, suppression, and opt-out behavior are specified.
