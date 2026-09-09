# PixelWeb Data Classification

PixelWeb must classify information before it is added to browser-delivered code or assets.

## PUBLIC

Information intentionally visible to any visitor. Examples: published Pixel Network branding, public server address, public Discord/Store/Docs links, released worlds/bosses/systems/ranks, public changelog, approved media.

May be stored in browser-delivered files such as `data/network.js`.

## INTERNAL

Non-secret operational/product information that is not intended for public disclosure. Examples: detailed unreleased roadmap, internal implementation notes, non-public feature status, staging identifiers.

Must not be placed in browser-delivered data merely because the source repository is private.

## CONFIDENTIAL

Private business/staff/player information whose disclosure would be harmful. Examples: private user records, staff contact information, internal moderation records, unreleased agreements, private analytics tied to individuals.

Must be stored and served only through authenticated, authorized systems when required.

## SECRET

Credentials or cryptographic material that grants access. Examples: passwords, database credentials, service-role keys, private API keys, Discord bot tokens, private webhooks, signing keys, OAuth client secrets.

Must never be committed to the repository or shipped to the browser.

## Rule for `data/network.js`

Anything added to `data/network.js` is PUBLIC by definition. If there is uncertainty about whether a field should be public, do not add it until the classification is resolved.
