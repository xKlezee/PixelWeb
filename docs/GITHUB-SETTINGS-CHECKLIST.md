# GitHub Repository Settings Checklist

This checklist covers release gates that cannot be completed from repository source inspection alone. It contains no credentials and is safe to keep with the project.

## 1. Repository identity

The repository metadata still carries the historical description `This is the website for PixelBox`.

Change it in the repository About/settings surface to:

`Official website for Pixel Network`

This is metadata only; do not rename the repository or change the Pages URL as part of this cleanup.

The current GitHub integration can read repository metadata but does not expose a safe repository-description mutation, so this item remains a manual settings cleanup rather than a code change.

## 2. GitHub Actions startup

The Quality Gate itself remains intentionally simple and targets the standard GitHub-hosted `ubuntu-latest` runner.

Observed failed jobs have ended before repository steps were exposed (`runner_id: 0` / no assigned runner in earlier inspections, and null/empty step lists in later runs). More importantly, GitHub has already reported the account-level condition:

`The job was not started because your account is locked due to a billing issue.`

Treat that billing/account state as the primary Actions blocker. Do **not** weaken repository checks, change runner labels, grant broad workflow permissions, or move frontend work to `main` as a workaround. None of those changes resolves an account-level billing lock.

The workflow declares only:

- `contents: read`;
- standard `ubuntu-latest` execution;
- commit-pinned official `actions/checkout`;
- no deployment/write token requirement.

To avoid redundant usage once Actions is healthy, the gate no longer runs separately on every push to `hardening/**`. The current automatic trigger is the pull request targeting `main`; an explicit `workflow_dispatch` remains available for candidate branch/tag/SHA validation.

## 3. Manual candidate validation after billing is restored

The workflow definition is installed on `main` so GitHub exposes **Run workflow** from the default branch, but manual dispatch requires an explicit `target_ref`.

For the current hardening candidate enter:

`hardening/security-foundation-2026-09`

A full commit SHA should be used when validating a frozen release candidate immediately before promotion.

The checkout step resolves manual dispatch to the supplied branch/tag/SHA. Pull-request runs validate the event SHA. There is intentionally no additional hardening-push trigger, avoiding duplicate runs while the PR is open.

After billing/account access is restored:

1. Open **Actions → PixelWeb Quality Gate → Run workflow**.
2. Enter the exact candidate branch or commit SHA in `target_ref`.
3. Confirm a real hosted runner is assigned and repository steps appear.
4. Confirm Python guard compilation executes.
5. Confirm the committed-secret scanner executes.
6. Confirm approved Nexus media integrity executes.
7. Confirm JavaScript `node --check` executes for repository JS files.
8. Confirm canonical public-data/origin/static-link validation executes.
9. Confirm static site/CSP/transport/sitemap validation executes.
10. Confirm deferred-media/runtime-contract validation executes.
11. Confirm structural accessibility validation executes.
12. Confirm `_site/` is built from the allowlisted/reference-driven publication graph.
13. Confirm the staged public-bundle validator executes successfully.
14. Require a green result on the exact candidate ref before treating automated validation as passed.

If an actual repository step fails after the runner starts, fix the reported code/content failure and rerun. A runner-startup failure and a validator failure are different states and must not be conflated.

## 4. Actions settings after billing is healthy

Only after the account-level lock is cleared, inspect **Repository → Settings → Actions → General** if a job still cannot start.

Expected posture:

- GitHub Actions enabled for the repository;
- GitHub-authored `actions/checkout` permitted;
- SHA-pinning policy may remain enabled because the workflow already pins checkout by full commit SHA;
- workflow permissions may remain restricted/read-only;
- no self-hosted runner is required;
- do not grant broad write permissions merely to troubleshoot execution.

This is a secondary diagnostic path, not the current primary blocker.

## 5. Branch / merge protection after CI is healthy

Once the Quality Gate executes reliably, review the ruleset/protection for `main` and prefer a pull-request flow that requires the quality check before merge.

Do not make a non-executing check permanently required while the account cannot start it. Once execution is healthy and a stable check name is confirmed, make the successful Quality Gate a merge requirement.

The hardening PR remains draft until both automated validation and browser/render QA pass. The intended promotion method is a squash merge so the official branch receives one reviewable release commit rather than the iterative hardening history.

## 6. Browser release gate

A green Actions run does not replace browser QA. Before merge, exercise the exact candidate branch at the documented viewport matrix in `docs/RESPONSIVE-QA.md`, including keyboard navigation, reduced motion, 200% zoom, console errors, loading waterfall and CSP/network failures.
