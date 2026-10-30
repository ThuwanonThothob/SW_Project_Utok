# Database & GIS Design

## Entity ownership

| Entity | Key fields | Owner |
| --- | --- | --- |
| users | role, email, password hash, home area/location | Identity & Access |
| provinces | 77 province centroids, region, risk level/score, rainfall, elevation, freshness | Risk & Data Engineering |
| flood_reports | reporter, point, level, status, urgency, media | Incident Backend |
| broadcasts | severity, target province, advisory, publisher | Incident Backend |

## Spatial design

- Locations use PostGIS `geography(Point, 4326)`.
- GIST indexes support proximity queries.
- B-tree indexes support regional filtering and descending risk-score queries.
- Longitude/latitude are exposed to the frontend only where the API contract permits.
- The repository maps PostgreSQL snake_case fields to stable camelCase API objects.

## Integrity and lifecycle

- Email is unique and normalized before lookup.
- Role values are constrained to `citizen` and `authority`.
- Incident and broadcast authors reference `users`.
- Deletes should be restricted or soft-deleted in a production retention policy.
- Development memory mode mirrors API behavior but intentionally resets at restart.
