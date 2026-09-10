# GitHub Repository Settings Checklist

This checklist covers release gates that cannot be verified or changed from the current repository-content integration. It contains no credentials and is safe to keep with the project.

## 1. Repository identity

The repository metadata still carries the historical description `This is the website for PixelBox`.

Change it in the repository About/settings surface to:

`Official website for Pixel Network`

This is metadata only; do not rename the repository or change the Pages URL as part of this cleanup.

## 2. GitHub Actions startup

The hardening workflow itself is intentionally simple and targets `ubuntu-latest`. The observed failure happens before any workflow step executes.

For the latest inspected failing job GitHub reported:

- runner label: `ubuntu-latest`;
- `runner_id: 0`;
- empty `runner_name` and runner-group fields;
- `steps: []`;
- no job logs;
- completion within seconds of job creation.

This means the secret scanner, Python syntax guard, JavaScript syntax check and static-site validator did not run. Do not weaken those checks to make the badge green.

### Repository settings to inspect

Open **Repository → Settings → Actions → General**.

Under **Actions permissions**:

1. Confirm GitHub Actions is enabled for this repository.
2. If actions are restricted, ensure GitHub-authored actions are allowed, or explicitly allow the exact pinned `actions/checkout` reference used by `.github/workflows/quality-gate.yml`.
3. Keep any policy requiring full-length commit SHA pinning enabled; the current workflow already complies.
4. If GitHub displays a message that Actions is disabled for the account rather than merely for the repository, follow GitHub's instruction to contact GitHub Support. Changing only the repository policy may not restore that account-level state.

Under **Workflow permissions**:

- restricted/read-only defaults are sufficient for this workflow;
- do not grant broad write permissions merely to troubleshoot runner startup;
- the workflow itself declares `contents: read` and should remain read-only.

If a **Runners** or standard hosted-runner policy is exposed for the account/repository, confirm standard GitHub-hosted runners have not been disabled. This workflow does not require a self-hosted runner.

## 3. Proving the fix

After changing only the necessary GitHub setting:

1. Run **PixelWeb Quality Gate** manually with `workflow_dispatch` on `hardening/security-foundation-2026-09`, or rerun the failed job.
2. Confirm a real runner is assigned (`runner_id` is non-zero / a runner name is present).
3. Confirm the Checkout, Python guard, secret scan, Node syntax and static-site validation steps actually appear.
4. Require a green result on the exact candidate HEAD. A workflow that fails before runner assignment is not a validator result.
5. If any real step fails, fix that reported failure and rerun; do not bypass the step.

## 4. Branch / merge protection after CI is healthy

Once the quality gate can execute reliably, review the protection/ruleset for `main` and prefer a pull-request flow that requires the quality check before merge. Do not make a broken or non-executing check permanently required until its runner/startup condition is fixed.

The hardening PR must remain draft until both the automated gate and browser/render QA pass.

## 5. Browser release gate

A green Actions run does not replace browser QA. Before merge, exercise the exact candidate branch at the documented viewport matrix in `docs/RESPONSIVE-QA.md`, including keyboard navigation, reduced motion, 200% zoom, console errors and network/CSP failures.
