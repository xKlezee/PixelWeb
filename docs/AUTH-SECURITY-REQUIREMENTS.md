# Authentication and Persistent-Feature Security Requirements

This file is intentionally a design gate, not an implementation. Login, profiles, persistent Forum, moderation, and private APIs must not be considered production-ready until these invariants are implemented and tested.

## Identity

- One canonical server-side user identifier.
- Explicit mapping between web identity and Minecraft identity if/when linking is introduced.
- Email / Discord / Minecraft identifiers are attributes, not authorization decisions by themselves.
- Account linking and unlinking require re-authentication for sensitive changes.

## Sessions

- Prefer server-managed sessions with secure, HttpOnly, SameSite cookies when the selected backend architecture supports them.
- Never persist privileged bearer tokens in `localStorage`.
- Session rotation after login and privilege changes.
- Explicit expiry and revocation.
- Recovery and password-reset tokens are single-use, time-limited, and server-validated.

## Authorization

- Every write and every private read is authorized server-side.
- Default deny.
- Object ownership checks prevent horizontal privilege escalation.
- Role checks prevent vertical privilege escalation.
- UI visibility is convenience only; hiding a button is never an authorization control.
- Staff/moderation privileges require an auditable role source.

## Forum / user-generated content

- Plain text by default.
- Context-aware output encoding.
- If rich text is introduced, sanitize with a maintained allowlist before storage/rendering.
- Rate limits on create/edit/delete/report/search endpoints.
- Server-enforced post length, title length, attachment type/size, and pagination limits.
- Moderation actions are logged with actor, target, action, timestamp, and reason where appropriate.

## API and database

- Browser receives only public/publishable client credentials designed for exposure, never service-role secrets.
- Database permissions follow least privilege.
- Row-level/server-side policies are tested for anonymous, normal-user, owner, moderator, and administrator cases.
- Error responses do not disclose SQL, infrastructure, stack traces, secrets, or internal IDs unnecessarily.

## Abuse and operational controls

- Login/recovery/posting/reporting endpoints have rate limits.
- Security events have useful logs without storing passwords/tokens.
- Backups and restore procedures are tested.
- Dependency updates and security advisories are reviewed before production deployment.
- A credential-rotation process exists for every external integration.

## Release gate

Before enabling authenticated production features, add automated tests covering at minimum:

- anonymous access denied where required;
- user A cannot read/write user B private resources;
- ordinary users cannot perform staff/admin actions;
- revoked/expired sessions fail;
- stored and reflected XSS payloads render inert;
- CSRF defenses work for cookie-authenticated state changes;
- rate limiting returns controlled failures;
- malformed IDs and unexpected payload fields fail safely.
