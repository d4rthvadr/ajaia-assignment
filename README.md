# Lightweight Collaborative Document Editor

A stripped-down, Google-Docs-inspired document editor, scoped for a 2-hour build. Users create
and own documents, edit them with a minimal rich text toolbar, share view-only access with other
users by email, and attach or import `.txt`/`.md` files — built with sound, explicit trade-offs
rather than a broad but broken feature set.

## Status
Documentation (PRD, ADRs, specs) is complete; implementation has not started yet. See
[workflow-note.md](workflow-note.md) for the reasoning trail behind each scope decision.

## Docs
- [docs/PRD.md](docs/PRD.md) — problem, goals/non-goals, functional scope, success criteria.
- [docs/adr/](docs/adr/) — one decision record per scope cut (sync model, sharing model,
  document ownership, persistence/storage).
- [docs/specs/](docs/specs/) — the concrete data model, API contract, and editor sync behavior
  to implement against.
- [AGENTS.md](AGENTS.md) — guardrails for any agent (human or AI) picking up this repo.

## Scope at a glance
- **Editing** — a user can own multiple documents; minimal rich text (bold/italic/headings/lists)
  via Tiptap; debounced autosave.
- **Sharing** — owner grants view-only access to another existing user by email; shared documents
  appear in a separate "Shared with me" list. No anonymous links, no per-user roles.
- **File upload** — `.txt`/`.md` only, either imported as a document's content or attached and
  downloadable.
- **Persistence** — Postgres via Prisma; documents, access grants, and attachments survive
  restarts.
- **Sync** — polling (~3s), last-write-wins on save. No WebSockets, no CRDT/OT.

## Stack
- Backend: Node.js + TypeScript + Express, Prisma ORM, Postgres.
- Frontend: Vite + React + TypeScript, Tiptap (free/open-source packages only).
- Auth: bcrypt password hashing, JWT in an httpOnly cookie.
- File storage: local filesystem (`uploads/`).

## Setup
Not yet available — the app is documentation-only at this point. Once the backend/frontend are
scaffolded, this section will cover: Postgres connection setup, `prisma migrate`, and running
`npm run dev` for both the backend and frontend.
