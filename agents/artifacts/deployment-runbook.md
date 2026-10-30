# Deployment & Release Runbook

## Local development

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`; API health: `http://localhost:4000/api/health`.

## Container database

1. Copy `backend/.env.example` to `backend/.env`.
2. Set a unique `JWT_SECRET`, database URL, allowed origin and non-demo credentials.
3. Start PostgreSQL/PostGIS with `docker compose up -d postgres`.
4. Run build, tests, dependency audit and Agent workflow.

## Release gates

- `npm test` passes.
- `npm run build` succeeds.
- `npm audit` reports no unresolved high/critical vulnerability.
- `npm run agents:run` verifies all 15 Agent outputs.
- Human Orchestrator reviews QA, security, accessibility and deployment artifacts.
- `release` checkpoint is explicitly approved with actor, timestamp and note.

## Rollback and recovery

- Retain the previous frontend bundle and application image.
- Back up PostgreSQL before schema migration.
- Roll back application first; restore database only when the migration is not backward compatible.
- In degraded mode, disable mutations and display data freshness/outage messaging.
