# PixelWeb Security Hardening Baseline

This document tracks the controls required before PixelWeb gains authenticated or persistent features.

## Current static-site guarantees

- No production credentials belong in the repository or browser bundle.
- `.env` and common private-key / credential files are ignored.
- CI scans committed text files for common secret patterns.
- CI validates top-level HTML for broken local references, duplicate IDs, unsafe `_blank` links, and inline event handlers.
- The browser remains an untrusted environment: hiding DevTools, minifying JavaScript, or making the repository private are not authorization controls.

## Required before Login / profiles / persistent Forum

1. Server-side authentication and authorization design.
2. Secure session storage strategy; privileged authorization must never rely on client-side state.
3. CSRF strategy where cookie-based state-changing requests are used.
4. Rate limits and abuse controls for authentication, posting, reporting, profile updates, and recovery flows.
5. Input validation at trust boundaries and output encoding by context.
6. Maintained sanitizer with an allowlist before any user-authored rich HTML is supported.
7. Database row-level / server-side authorization model reviewed against horizontal and vertical privilege escalation.
8. Audit logging for administrative and moderation actions.
9. Content Security Policy tested in report-only mode, then enforced.
10. Production security headers supplied by the final hosting layer.
11. Dependency and secret scanning enforced on pull requests.
12. Backup, recovery, account-recovery, and incident-response procedures documented before launch.

## GitHub Pages limitation

A private source repository does not make browser-delivered assets private. Any HTML, CSS, JavaScript, public configuration, image, or manifest needed by the website must be assumed readable by visitors.

GitHub Pages is suitable for the current static public experience. If PixelWeb later needs server-controlled headers, authenticated server rendering, private APIs, or sensitive request handling, those capabilities must live behind an appropriate application/backend hosting layer rather than being simulated in client-side JavaScript.

## Data classification

### Safe for public frontend

- player-facing product descriptions;
- intentionally public server address and links;
- published bosses, worlds, ranks, store links, guides, and changelog content;
- public media assets.

### Never ship to frontend

- database passwords or privileged connection strings;
- service-role or administrative API keys;
- Discord bot tokens / private webhooks;
- host IPs and private infrastructure topology not intentionally public;
- internal deployment credentials;
- private staff or player data;
- authorization rules that exist only in JavaScript;
- unreleased confidential roadmap data.
