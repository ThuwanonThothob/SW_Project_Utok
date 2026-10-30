# Accessibility & Performance Report

## Nationwide optimization completed

- Province catalog expanded from 8 to all 77 provinces across 6 operational regions.
- Leaflet province overlays use the Canvas renderer and a dedicated layer, so incident updates no longer rebuild all 77 province circles.
- Server-Sent Events update only the changed report, province or broadcast instead of refetching all four API collections.
- Authority province management includes regional filtering, province search and an internally scrolling list.
- Public province/broadcast responses use cache directives; JSON/static responses use gzip compression.
- Report queries are bounded to a validated maximum and Citizen history is capped for predictable response size.

## Local API performance baseline

Test command: `npm run perf:check` with 40 requests per endpoint and concurrency 8.

| Endpoint | Average | p95 | Maximum |
| --- | ---: | ---: | ---: |
| `/api/health` | 2.14 ms | 3.50 ms | 3.77 ms |
| `/api/provinces` (77 records) | 4.40 ms | 6.28 ms | 6.30 ms |
| `/api/reports` | 1.48 ms | 2.01 ms | 2.21 ms |

Environment: local in-memory repository. PostgreSQL and deployed-network latency must be measured separately in the target environment.

## Observed checks

- Citizen and Authority flows expose semantic buttons, forms, tables and landmarks.
- Form controls have visible/programmatic labels in the tested login, registration and report flows.
- Severity is accompanied by Thai text rather than communicated by color alone.
- `prefers-reduced-motion` is implemented in CSS.
- At 390 px, both portals report document width equal to viewport width after the table-container fix.
- Leaflet initializes with controls, markers, popups and attribution.
- Production build completes; current main bundle is 347.40 kB before gzip and 103.92 kB after gzip.

## Follow-up before public production

- Add a full focus trap and focus-return behavior for modal/drawer components.
- Provide a list/table alternative for all map-only information.
- Run automated WCAG scanning and manual screen-reader checks.
- Consider lazy-loading map code and clustering when nationwide incident volume grows.

Status: classroom MVP accepted with documented production follow-ups.
