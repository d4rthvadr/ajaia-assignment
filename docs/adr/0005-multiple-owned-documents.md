# ADR-0005: Users can own multiple documents (minimal dashboard)

## Status

Accepted (supersedes [ADR-0003](0003-single-document-per-user.md))

## Context

ADR-0003 restricted each user to exactly one auto-created document to avoid building a dashboard.
That's an overcorrection: owning multiple documents is core to how a document editor is actually
used, and the assignment's sharing requirement already implies a user needs to distinguish
between *their own* documents and documents *shared with them* — which reads oddly if "their own"
can only ever be a single item.

## Decision

A user can create and own any number of documents. Scope stays minimal:

- `POST /documents` creates a new document (title only, empty content) owned by the caller.
- `GET /documents` lists the caller's own documents (id, title, updatedAt).
- `GET /documents/shared-with-me` (ADR-0002) remains a separate list.
- No auto-created document on first login anymore — a new user sees an empty "My documents" list
  with a "New document" action.
- No rename or delete flow in this pass — a created document's title is set at creation time and
  is otherwise permanent for this build. This can be added later without changing the ownership
  model.

## Consequences

- `Document.ownerId` is no longer unique — the schema in
  [docs/specs/data-model.md](../specs/data-model.md) drops the `@unique` constraint and the
  1:1 `User.document` relation becomes a 1:many `User.documents`.
- The frontend needs a minimal document list view (owned docs + shared-with-me docs, visibly
  separated) instead of landing directly in a single editor — a small but real addition to the
  timebox.
- Sharing (ADR-0002), sync (ADR-0001), and file handling all remain unchanged: they already
  operate per-document-id, not per-user, so multiplying the number of owned documents doesn't
  touch that logic.
- Still explicitly out of scope: rename, delete, search/filter, folders — a "dashboard" in the
  full sense. This is a document *list*, not a workspace.
