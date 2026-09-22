# ADR-0002: Binary owner/viewer permission via explicit user-to-user grants

## Status

Accepted (supersedes the anonymous-link-based approach originally considered)

## Context

Real sharing products (Google Docs) support per-user roles: viewer, commenter, editor, owner,
often granted by email invite. Full role-based ACLs are significant scope for a 2-hour build.
An earlier draft of this decision used an anonymous share link (anyone with the URL, no login)
for simplicity, but the assignment explicitly calls for a document owner, a way to grant another
_user_ access, and a visible distinction between owned and shared documents — which requires
sharing to be tied to real accounts, not an anonymous link.

## Decision

Permission is binary and grant-based, scoped to real user accounts:

- The document **owner** (the authenticated account that created it) can edit.
- The owner can **grant view access** to another existing user by email (`POST
/documents/:id/share { email }`). This creates a `DocumentAccess` row linking that user to the
  document.
- A user with a granted access row can view (read-only) the document once logged in; it appears
  in their **"Shared with me"** list, visibly distinct from their own owned document.

There is no anonymous/public link access, no per-user roles beyond owner-vs-viewer, and no
revoking access in this pass (dropping the `DocumentAccess` row would revoke it, but no UI is
built for it). Granting access requires the recipient to already have an account — no
invite-by-email for non-users.

## Consequences

- Sharing now requires both parties to have accounts, and viewing requires login — slightly more
  setup than a public link, but it demonstrates real user-to-user access control instead of an
  anonymous bearer token.
- The owner needs a way to know the recipient exists (looked up by email); a "no such user" error
  is a real, user-facing case to handle.
- "Owned" vs. "Shared with me" becomes a first-class distinction in the UI and API response shape,
  not just a permission check.
- Adding richer roles (editor, commenter) or revocation later is additive: extend the
  `DocumentAccess` row with a `role` column and add a revoke endpoint; the grant/list mechanism
  doesn't change.
