# Stakeholder Requirements Baseline

## Stakeholders

| Stakeholder | Goal | Primary risk |
| --- | --- | --- |
| Citizen member | Understand local risk, report incidents, receive alerts | Confusing severity or exposed location data |
| Authority / rescuer | Verify incidents and communicate action quickly | Unauthorized operational actions |
| Human Orchestrator | Control scope, review evidence, approve gates | Agents progressing without accountable review |
| Project evaluator | Verify SDLC and Agentic Engineering evidence | Untraceable AI-generated deliverables |

## Functional baseline

1. Citizen and Authority accounts must have separate authorization boundaries.
2. Citizens must be able to register, sign in, save a home area, inspect risk, submit incidents, and see their own history.
3. Authorities must be able to moderate reports, manage province risk, and broadcast alerts.
4. The map must show risk zones and incident markers and support map/GPS reporting.
5. Every Software Engineering Agent must have explicit inputs, owned outputs, dependencies, and handoff recipients.
6. Human checkpoints must block progression when approval is pending.

## Non-functional baseline

- Responsive at mobile and desktop sizes.
- JWT role enforcement on the server, not only in the UI.
- Passwords stored only as bcrypt hashes.
- Traceability through timestamped logs and SHA-256 artifact evidence.
- Development mode works without external services; production mode supports PostgreSQL/PostGIS.

## Scope boundary

This MVP is a software-engineering demonstration. Mock risk values are not an official emergency warning and must not be used for real-world safety decisions without an authoritative data integration.
