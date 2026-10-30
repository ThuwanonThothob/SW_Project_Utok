# Security & Privacy Review

## Verified controls

- bcrypt cost 12 for newly registered Citizens.
- JWT issuer, signature, expiry, and role middleware.
- Citizen tokens rejected from Authority-only middleware tests.
- Parameterized PostgreSQL queries and allowlisted risk/status values.
- Authentication rate limit, Helmet headers, explicit CORS configuration.
- Multer 2 image MIME filter and 2 MB maximum size.
- Password hashes omitted from API responses.
- Dependency audit reported zero known vulnerabilities at the recorded QA run.

## Privacy observations

Home coordinates and incident coordinates can identify a person. Production must add a retention schedule, user notice/consent, access logging, encrypted backups, and a process for deletion/correction requests.

## Residual production risks

1. Replace demo credentials and rotate `JWT_SECRET`.
2. Store uploads in private object storage with malware scanning.
3. Add HTTPS, upstream rate limiting, monitoring and security-event alerts.
4. Add token revocation/rotation for high-privilege Authority accounts.
5. Validate official data-provider trust and availability before public safety use.

Release recommendation: acceptable for classroom MVP; conditional for production until residual items are addressed.
