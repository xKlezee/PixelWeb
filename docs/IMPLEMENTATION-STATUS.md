# Security Foundation Implementation Status

This file records the implementation status of the hardening branch without claiming controls that have not been verified.

## Implemented on this branch

- Defensive `.gitignore` for environment files, credentials, keys, generated output, logs, IDE files, and local reports.
- `SECURITY.md` public/private boundary and incident rule for leaked credentials.
- Dependency-free committed-secret scanner.
- Dependency-free static HTML integrity validator.
- GitHub Actions quality gate with read-only repository permissions.
- Explicit pre-auth security requirements for Login, profiles, persistent Forum, moderation, and private APIs.
- Explicit data classification for browser-delivered content.

## Still requiring code-level verification / remediation

- Remove any remaining inline JavaScript event handlers in application HTML/rendered HTML.
- Replace unsafe dynamic HTML sinks where data could become externally controlled in future.
- Validate external URL assignment at runtime where URLs come from data objects.
- Remove anti-DevTools behavior as a security mechanism while preserving normal UX.
- Establish a CSP-compatible frontend and document hosting-header limitations.
- Run the quality gate against the complete branch and remediate all failures.
- Perform responsive/accessibility regression QA after security refactors.

## Deferred by product architecture

The following controls cannot be meaningfully implemented until an authenticated backend exists: server-side authorization, session management, CSRF enforcement, API rate limiting, database policies, moderation audit logs, private profile access, and recovery flows.
