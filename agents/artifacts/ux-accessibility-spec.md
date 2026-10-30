# UX & Accessibility Specification

## Citizen journey

`Open map → inspect local risk → register/login when an authenticated action begins → select coordinates → submit incident → see pending status`

## Authority journey

`Authority login → inspect metrics → filter queue → verify/resolve/reject → publish broadcast or update risk zone`

## Required states

- Loading: communicate data connection state without blocking static navigation.
- Empty: explain that no reports match the current filter.
- Error: show actionable Thai-language feedback; preserve user-entered data where safe.
- Success: confirm the object ID and next status.
- Unauthorized: return to the correct role-specific login, never silently switch permissions.

## Accessibility contract

- All icon actions require accessible names or titles.
- Severity must use text and shape in addition to color.
- Forms require programmatic labels and keyboard-operable controls.
- Focus must move into modals/drawers and return to the triggering control in a production hardening pass.
- Minimum mobile width is 320 px; tables scroll inside their card rather than the page.
- Motion respects `prefers-reduced-motion`.
