# GIS & Map Experience Specification

## Layers

1. OpenStreetMap base tiles.
2. Province risk circles/overlays with low, medium and high semantics.
3. Citizen incident markers differentiated by critical, moderate and resolved state.
4. Selected/current-location marker.

## Interaction ownership

- Click map: store coordinates and start the authenticated report flow.
- GPS action: request location only after direct user intent.
- Marker popup: show location, water level, verification state and urgency.
- Search: narrow or select a province without removing map keyboard access.

## Visual semantics

| State | Color | Non-color cue |
| --- | --- | --- |
| High / critical | Red | “สูง/วิกฤต” text and alert icon |
| Medium | Amber | “ปานกลาง” text |
| Low | Green/blue | “ต่ำ/ปลอดภัยกว่า” text |
| Resolved | Blue | “แก้ไขแล้ว” status |

Default center: Thailand at `13.736717, 100.523186`. The mobile layout keeps zoom, report action, legend and attribution visible without page-level horizontal scrolling.
