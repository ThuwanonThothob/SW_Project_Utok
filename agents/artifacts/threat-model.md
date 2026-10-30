# API Threat Model

| Threat | Boundary | Control | Residual risk |
| --- | --- | --- | --- |
| Credential guessing | Public → auth API | bcrypt, generic errors, rate limiting | Distributed attempts need upstream controls |
| Citizen invokes Authority action | JWT → protected route | Signature/expiry verification and role middleware | Stolen Authority token remains sensitive |
| SQL injection | API → PostgreSQL | Parameterized queries and allowlists | Future raw queries require review |
| Malicious upload | Public report → filesystem | MIME allowlist, 2 MB limit, generated filename | Production requires malware scan/object storage |
| False incident | Citizen → operational queue | Pending-by-default moderation | Coordinated abuse requires reputation/anti-spam |
| Location privacy exposure | Member/report → API/UI | Role-aware endpoints and minimal public profile | Retention and consent policy needed for production |
| Secret disclosure | Environment → logs/client | Server-only environment variables | Deployment secret rotation is external |

Authority mutations must never rely on frontend hiding alone. The server returns `401` for missing/invalid identity and `403` for a valid identity without the required role.
