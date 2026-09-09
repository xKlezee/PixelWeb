# PixelWeb Repository Checks

- `security_scan.py` scans committed text files for common secret material.
- `validate_site.py` checks top-level HTML integrity and CSP-readiness invariants.

Both scripts are dependency-free and are executed by `.github/workflows/quality-gate.yml`.
