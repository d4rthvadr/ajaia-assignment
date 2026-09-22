# PRD: Lightweight Collaborative Document Editor

## Problem

Damsin wants to sanity-check internal productivity tooling: a stripped-down, Google-Docs-inspired
editor that lets a team create, edit, share, and persist documents. This PRD scopes a version
buildable and demonstrable within a 2-hour timebox, prioritizing working end-to-end slices over
completeness.

## Goals

- Demonstrate sound product judgment under a hard timebox: ship a coherent, working product
  rather than a broad but broken one.
- Cover all four required pillars — Creation/Editing, File Upload, Sharing, Persistence — at a
  deliberately reduced depth for each.
- Show full-stack TypeScript/Node capability: real auth, a real database, a real (if minimal)
  rich-text editing surface, and real file handling.

## Non-goals

- True concurrent multi-editor collaboration (CRDT/OT). Only the document owner can edit.
- Granular per-user access control (viewer/editor/admin roles). Permission is binary: owner vs.
  explicitly-granted viewer (view-only). Granting requires the recipient to already have an
  account (looked up by email) — no anonymous link access, no pending/email invites.
- A full multi-document workspace (rename, delete, search, folders). Users can own several
  documents and see a simple list of them, but there's no dashboard beyond create + list.
- Production deployment. The app runs locally; deployment is a later, non-blocking step.
- Rich file type support. Only `.txt` and `.md` are accepted for import/attachment.

## Target user & core flow

A user signs up, lands on a simple list of their own documents (empty at first), and creates one
or more via a "New document" action. Opening one lands in a minimal rich text editor. The owner
grants a teammate (an existing account, identified by email) view access to a document; that
teammate then sees it appear in their "Shared with me" list, distinct from their own documents,
and watches it update live (via polling) read-only. The owner can also import a `.txt`/`.md` file
as a document's content, or attach such files to a document for anyone with access to download.

## Functional scope

1. **Document creation & editing** — a user can create any number of documents (title only,
   listed under "My documents"); Tiptap-based rich text editor (bold/italic/headings/lists);
   debounced autosave.
2. **File upload** — `.txt`/`.md` only, either (a) imported as a document's starting content,
   or (b) attached to a document and downloadable by anyone with view access.
3. **Sharing** — the owner grants view access to another existing user by email; the document
   then shows up in that user's "Shared with me" list, visibly distinct from their own documents.
   Access is view-only and requires login.
4. **Persistence** — Postgres via Prisma; document content, version, access grants, and
   attachments survive restarts.

## Success criteria

- A user can sign up, log in, and see their (initially empty) "My documents" list.
- A user can create more than one document and see them all listed under "My documents."
- Edits autosave and persist across a page reload.
- The owner can grant a second existing user access by email; that user, once logged in, sees
  the document listed under "Shared with me" (separate from their own documents) and it reflects
  edits within ~3 seconds without a manual refresh.
- A `.txt`/`.md` file can be imported as content or attached and later downloaded by anyone with
  access to the document.
- Non-`.txt`/`.md` uploads are rejected.

## Explicit trade-offs

See [docs/adr](adr/) for the reasoning behind each cut. Summary:

- Polling replaces WebSockets/CRDTs for live sync.
- Binary owner/viewer permission, granted user-to-user by email, replaces granular ACLs and
  anonymous link sharing.
- Users can own multiple documents (simple create + list), but there's no full dashboard
  (no rename/delete/search/folders).
- Local disk storage replaces cloud object storage (no deploy target yet).

## Out of scope for this pass (candidate follow-ups)

- Real-time multi-cursor concurrent editing.
- Per-user roles (editor/commenter) beyond owner vs. view-only, and email notifications for grants.
- Revoking access, and sharing with users who don't yet have an account.
- Full multi-document dashboard (create/rename/delete many documents).
- Cloud file storage and deployment.
- Conflict UI (warn-before-overwrite) instead of pure last-write-wins.
