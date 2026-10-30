# Flood Domain & Data Rules

## Explainable risk factors

| Factor | Risk relationship | MVP source |
| --- | --- | --- |
| Recent rainfall | More rainfall increases surface-water and river risk | Seeded province data |
| River proximity | Shorter distance increases exposure | Seeded distance / future PostGIS calculation |
| Elevation | Lower elevation increases inundation exposure | Seeded elevation |
| Verified incidents | Recent nearby evidence raises operational priority | Citizen reports after moderation |

The score is an explainable indicator, not a forecast. `low`, `medium`, and `high` must always include a numeric score and human-readable advice.

## Data categories

- Province risk summary: name, centroid, rainfall, river distance, elevation, score and risk level.
- Incident: reporter, coordinates, water level, description, photo reference, urgency and verification status.
- Broadcast: severity, target province, advisory, publisher and time.
- Member home area: province, district and optional coordinates; treat as personal data.

## Quality and safety rules

- Show data freshness and whether a value is mock or authoritative.
- Preserve original Citizen report status until Authority verification.
- Never represent crowdsourced content as verified by default.
- Do not calculate an evacuation order from the risk score alone.
- Official deployment must connect validated hydrology sources and define outage/fallback behavior.
