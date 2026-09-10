# Credential Exposure Response

If a real credential is ever committed or shipped by PixelWeb, treat it as compromised even if the commit is quickly reverted or the repository later becomes private.

## Immediate response

1. Revoke or rotate the credential at the provider.
2. Determine its scope, permissions, lifetime, and systems it could access.
3. Inspect provider/audit logs for suspicious use where available.
4. Remove the credential from current code/configuration.
5. Rewrite repository history where appropriate to reduce accidental rediscovery, while recognizing that copies may already exist.
6. Replace the credential only through approved secret storage.
7. Add or improve automated detection so the same class of mistake fails CI in future.

## Never do

- Do not keep using the old credential because the repository was made private.
- Do not rely on deleting a file or commit as credential rotation.
- Do not place a replacement secret in browser JavaScript, source maps, HTML, or another public asset.
