# PixelWeb Repository Checks

- `security_scan.py` scans committed text files for common secret material without requiring external dependencies.
- `validate_site.py` checks top-level HTML integrity, CSP/transport policy, canonical-data publication guards, ordinary local references and the sitemap/index publication contract. It also prevents the repository-level `robots.txt` from regressing to a blanket `Disallow: /`, while documentation separately records that this file is not authoritative on the current `/PixelWeb/` project-site URL.
- `validate_runtime_contracts.py` validates deferred media references (`data-src`, `data-poster`, `data-srcset`) and rejects direct `element.style = ...` assignments that would weaken the strict style/CSP model.
- `validate_accessibility.py` checks baseline document structure: language, viewport, non-empty titles, exactly one `<main>`, descriptions on indexable pages and explicit `alt` attributes on images.
- `validate_media_integrity.py` verifies the approved Raphael, Azazel, Abyss and Astral PNGs by byte size, 1448×1086 dimensions and exact Git blob SHA. Those four source files must remain byte-identical.

All checks are dependency-free and are executed by `.github/workflows/quality-gate.yml` together with `node --check` for repository JavaScript.

Manual workflow dispatch requires an explicit branch, tag or commit SHA. This lets the workflow definition installed on `main` validate the actual candidate ref rather than accidentally validating a different tree.

A red GitHub Actions badge is not interpreted as a validator failure unless the runner actually starts and the relevant step executes. The current account-level billing lock prevents that execution and is tracked separately from code quality.
