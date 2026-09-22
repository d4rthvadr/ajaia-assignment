# ADR-0003: One owned document per user, no dashboard

## Status

Superseded by [ADR-0005](0005-multiple-owned-documents.md) — users can now own more than one
document. Kept for history; do not implement against this decision.

## Context

A full product would let a user create, list, rename, and delete many owned documents. That
requires a dashboard UI, document list endpoints, and empty/error states — extra surface area
that doesn't change the core demonstration of editing, sharing, uploads, and persistence.
Separately, ADR-0002 requires a user to see which documents have been shared with them, distinct
from their own document.

## Decision

Each user account **owns** exactly one document, auto-created on first login. There is no
document list, rename, or delete flow for owned documents in this pass. The only additional list
surface is a minimal, read-only **"Shared with me"** list — documents other users have granted
this account access to (per ADR-0002) — shown separately from the user's own document, not as a
general-purpose multi-document workspace.

## Consequences

- Removes the bulk of a dashboard (create/rename/delete/browse own documents) from the timebox.
- Adds one small, necessary list endpoint/view (`GET /documents/shared-with-me`) to satisfy the
  "visible distinction between owned and shared documents" requirement — this is scoped narrowly
  to shared documents, not a general document browser.
- The product story reads as "your one document, plus what others have shared with you," not
  "your workspace of many documents."
- Extending to multiple owned documents later is additive: add a `documents` list endpoint and a
  dashboard route for owned documents; the sharing/access-grant logic already works per-document
  and does not need to change.
