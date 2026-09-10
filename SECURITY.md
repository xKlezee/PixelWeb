# PixelWeb Security Policy

PixelWeb is the public-facing website for Pixel Network. Security-sensitive infrastructure, credentials, administrative tooling, private operational documentation, privileged API keys, database credentials, service-account material, and Minecraft backend internals must never be committed to this repository or shipped to the browser.

## Public / private boundary

Treat every file delivered to the browser as public, even when the source repository is private. This includes HTML, CSS, JavaScript, images, manifests, public configuration objects, and any values embedded into those assets during a build.

Secrets must live only in server-side or deployment-secret storage. Client-side code must never be trusted to enforce authorization, administrative roles, purchase validation, forum moderation permissions, or access to private player data.

## Secret handling

Never commit real credentials. Local secret files are ignored by `.gitignore`; example environment files may contain variable names and non-sensitive placeholders only.

If a real credential is ever committed or published:

1. revoke or rotate it immediately;
2. assess where it was used and what it could access;
3. remove it from current code and history where appropriate;
4. do not assume history rewriting makes the original credential safe again.

## Browser security rules

- Prefer `textContent`, DOM construction, and validated attribute assignment over interpolating untrusted values into `innerHTML`.
- Never put user-controlled data into inline JavaScript event-handler attributes.
- Validate external URLs before assigning them to `href` or `src`.
- Any future user-authored rich text must pass through a maintained HTML sanitizer and a restrictive allowlist.
- Authorization must be enforced on the server for every privileged operation.
- Production authentication must use secure session handling and must not store privileged tokens in long-lived browser storage.

## Future authenticated features

Before enabling Login, persistent Forum, profiles, staff tools, or private APIs, PixelWeb must have a server-side authorization model, CSRF/session strategy where applicable, rate limiting, abuse controls, auditability for privileged actions, and a reviewed Content Security Policy.

## Reporting

Do not publish exploit details or real secrets in public issues. Contact Pixel Network ownership through a private channel for security-sensitive reports.
