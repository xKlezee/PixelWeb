# PixelWeb Repository Checks

- `security_scan.py` scans committed text files for common secret material without requiring external dependencies.
- `validate_site.py` checks top-level HTML integrity, CSP/transport policy, canonical-data publication guards, local references and the robots/sitemap/404 crawl contract.
- `validate_accessibility.py` checks baseline document structure: language, viewport, non-empty titles, exactly one `<main>`, descriptions on indexable pages and explicit `alt` attributes on images.

All checks are dependency-free and are executed by `.github/workflows/quality-gate.yml` together with `node --check` for repository JavaScript.

A red GitHub Actions badge is not interpreted as a validator failure unless the runner actually starts and the relevant step executes. The current account-level billing lock prevents that execution and is tracked separately from code quality.
