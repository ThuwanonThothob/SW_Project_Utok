# Software Architecture

## System context

```mermaid
flowchart LR
  Citizen[Citizen Member] --> Web[React + Vite]
  Authority[Authority / Rescuer] --> Web
  Web -->|REST + JWT| API[Express API]
  API -->|Parameterized SQL| DB[(PostgreSQL + PostGIS)]
  API -->|SSE| Web
  API --> Uploads[(Image uploads)]
  Orchestrator[Human Orchestrator] --> Agents[SE Agent Team]
  Agents --> Artifacts[PRD / Architecture / Code / Tests]
  Orchestrator -->|Approve checkpoints| Agents
```

## Components

| Component | Responsibility |
| --- | --- |
| React frontend | Authentication UI, Citizen portal, Authority dashboard, Leaflet map |
| Express API | Validation, authentication, RBAC, reports, risk zones, broadcasts |
| Repository | Adapter ระหว่าง in-memory demo และ PostgreSQL |
| PostgreSQL/PostGIS | Users, roles, spatial risk zones, reports และ broadcasts |
| SSE event bus | แจ้ง client เมื่อ report/risk/broadcast เปลี่ยน |
| Agent orchestrator | รัน agent ตาม phase, ตรวจ artifacts และบังคับ human checkpoints |

## Performance architecture

- Province and report map layers are isolated; incident events do not redraw all 77 province overlays.
- Leaflet uses Canvas for province circles to reduce DOM/SVG overhead.
- SSE payloads update only the changed entity instead of triggering full API reloads.
- Province and broadcast reads use short public cache windows with stale revalidation.
- Express compresses JSON/static responses but explicitly excludes the SSE stream.
- Operational report queries enforce bounded result limits.

## Authentication and authorization

```mermaid
sequenceDiagram
  participant U as User
  participant W as React
  participant A as Express API
  participant D as User Repository
  U->>W: Register / Login
  W->>A: POST /api/auth/...
  A->>D: Find/Create user
  D-->>A: User + password hash
  A-->>W: JWT + public user
  W->>A: Protected request + Bearer token
  A->>A: Verify signature, expiry, role
  A-->>W: Result or 401/403
```

## Trust boundaries

- Browser input is untrusted and validated by API
- JWT secret exists only in backend environment
- Password hashes never leave repository/auth layer
- Database traffic uses parameterized SQL
- Upload middleware restricts MIME type and file size
- Static MVP data is for demonstration, not an official disaster warning

## Agentic SDLC

```mermaid
flowchart LR
  D[Discovery<br/>2 agents] --> P[Product<br/>1 agent]
  P --> G1{Requirements gate}
  G1 --> X[Experience Design<br/>2 agents]
  X --> G2{Experience gate}
  G2 --> A[Architecture<br/>3 agents]
  A --> G3{Architecture gate}
  G3 --> I[Implementation<br/>5 agents]
  I --> G4{Integration gate}
  G4 --> V[Validation<br/>3 agents]
  V --> O[Operations<br/>1 agent]
  O --> G5{Human release gate}
  G5 -->|Approved| REL[Release]
  G5 -->|Changes requested| D
```

The 17-agent dependency graph, workstream ownership and handoff matrix are defined in `agent-operating-model.md`. Runtime validation rejects unknown agents, same-phase/backward dependencies, missing outputs, and invalid handoff recipients before execution begins.
