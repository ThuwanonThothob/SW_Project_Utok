# QA & Security Test Report

## Automated checks

| Check | Command | Result |
| --- | --- | --- |
| Backend unit tests | `npm test` | Passed: 9/9 tests, including 77-province completeness and PostgreSQL seed parity |
| React production build | `npm run build` | Passed: Vite production bundle created |
| Dependency audit | `npm audit` | Passed: 0 vulnerabilities across 232 dependencies |
| Agent artifact validation | `npm run agents:run` | Passed all 17 specialized Agents and 46 handoffs; new release approval pending after nationwide upgrade |
| Local performance baseline | `npm run perf:check` | Passed: 120 read-only requests; slowest endpoint p95 6.28 ms |

## Agent topology validation

- 17 unique Agent IDs across 7 ordered phases
- Every dependency resolves to an Agent in an earlier phase
- Every handoff resolves to a registered Agent or the Human Orchestrator
- Every Agent owns at least one SHA-256-traced output
- Five Human checkpoints are recorded: requirements, experience, architecture, integration and release

## Browser acceptance test

- Citizen demo login succeeds and restores the member profile
- Citizen registration creates a role-scoped account and signs the member in
- Authenticated Citizen can submit a report; it immediately appears in `my reports` and the Authority queue
- Authority demo login opens metrics, moderation controls, broadcasts, and risk-zone management
- Desktop and 390 px mobile layouts render without page-level horizontal overflow
- Leaflet map, markers, risk overlays, and report drawer initialize correctly
- Browser console: no errors or warnings during the tested flows
- Province API returns exactly 77 unique provinces in 6 regions
- Province response is gzip-compressed and cacheable for 30 seconds with stale revalidation

## Authentication scenarios

- Citizen register returns JWT with role `citizen`
- Duplicate email returns 409
- Citizen demo login: `citizen@example.com / citizen123`
- Authority demo login: `admin@flood.go.th / admin123`
- Citizen token on authority endpoint returns 403
- Missing token on report creation returns 401
- Password hash is not present in any response

## Security controls reviewed

- bcrypt cost 12 for new Citizen accounts
- JWT issuer and 8-hour expiry
- Rate limiting on authentication routes
- Helmet headers and explicit CORS origin
- Parameterized PostgreSQL queries
- Multer 2.x, image MIME filter, 2 MB limit
- Status and role allowlists

## Residual risks

- In-memory mode is for development and resets on restart
- Production should use object storage instead of local upload directory
- Production should rotate JWT secret and remove demo credentials
- Official hydrology sources and disaster-agency validation are not connected

## Human checkpoint

Release status is intentionally `pending` until the student reviews this report and runs:

```bash
npm run agents:approve -- release "Student Name" "ตรวจผลทดสอบและอนุมัติส่งงาน"
npm run agents:run
```
