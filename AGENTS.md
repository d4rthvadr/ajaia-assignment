# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project

A lightweight, Google-Docs-inspired collaborative document editor, scoped for a 2-hour build.
Read [docs/PRD.md](docs/PRD.md) first for goals/non-goals, then [docs/adr/](docs/adr/) for the
reasoning behind each scope cut, then [docs/specs/](docs/specs/) for the concrete data model,
API contract, and sync behavior to implement against. Read [docs/architecture.md](docs/architecture.md)
for how those pieces fit together (component diagram, request flows, security notes) before
touching cross-cutting concerns like auth, sync, or file handling.

## Stack

- Backend: Node.js + TypeScript + Express, Prisma ORM, Postgres.
- Frontend: Vite + React + TypeScript, Tiptap for rich text editing, shadcn/ui + Tailwind CSS
  for UI components.
- Auth: bcrypt password hashing, JWT in an httpOnly cookie (no client-side token handling).
- File storage: local filesystem (`uploads/`), not cloud object storage.

## Locked scope decisions (do not silently expand these)

- Only the document owner can edit; the owner can grant view-only access to another existing
  user by email (`DocumentAccess` row) — no anonymous/public link access, no per-user roles
  beyond owner-vs-viewer. (ADR-0002)
- A user can own any number of documents (create + simple "My documents" list), plus a minimal
  "Shared with me" list of documents granted to them. No full dashboard (no rename/delete/search).
  (ADR-0005, supersedes ADR-0003)
- Sync is polling-based (~3s interval) with a `version` counter and last-write-wins saves. No
  WebSockets, no CRDT/OT, no conflict-resolution UI. (ADR-0001)
- File import/attachment accepts only `.txt` and `.md`, validated by both extension and MIME
  type. Stored filenames are server-generated (never derived from user input) to avoid path
  traversal.
- No deployment config in this pass; the app must run locally via documented setup steps.

If a task seems to require expanding one of these (e.g. "add real-time cursors", "add multiple
documents"), flag it explicitly rather than implementing it — these are deliberate cuts, not gaps.

## Repository layout (expected)

```
backend/   Express + Prisma API (src/routes, src/middleware, prisma/schema.prisma)
frontend/  Vite + React app (src/pages, src/lib)
docs/      PRD, ADRs, specs
```

## Task tracking & parallelization

- Follow [progress-tracker.md](progress-tracker.md) for phase/task order and blocking edges.
  Only start a task once every task it's blocked by is `Done`.
- Build the tracer bullet (Phase 1 in the tracker) before fleshing out feature slices: prove one
  user can sign up, create a single document, edit/autosave/poll it end-to-end first. Don't add
  sharing, attachments, or multi-document UI into that phase — those land in Phases 2–3.
- A subagent may take a task in its own `git worktree` only when the task is tagged
  **Parallelizable** in the tracker (or is clearly independent by the same rule: blockers all
  `Done`, no file overlap with another in-flight task). Merge each worktree back sequentially and
  re-run verification before starting the next dependent task.
- Do not parallelize sequential edits to the same files, or tasks whose blockers aren't finished.

## Conventions

- Follow [docs/specs/api.md](docs/specs/api.md) for route paths, auth requirements, and error
  codes exactly — it's the contract between frontend and backend.
- Follow [docs/specs/data-model.md](docs/specs/data-model.md) for Prisma schema shape.
- Follow [docs/specs/editor-sync.md](docs/specs/editor-sync.md) for save-debounce/poll behavior.
- Follow [docs/ui-tokens.md](docs/ui-tokens.md) and [docs/ui-rules.md](docs/ui-rules.md) for UI
  component/token choices; these are living docs — extend them only when a new pattern is
  actually needed, not preemptively.
- Keep comments to a single line stating what the code can't show on its own; do not add
  multi-paragraph doc comments or restate what the next line does.
- Do not create additional markdown docs beyond what's under `docs/` unless asked.
- Whenever a scope/design decision is made or changed (e.g. an ADR added, superseded, or a
  locked decision above overridden), record it in [workflow-note.md](workflow-note.md) using the
  same `### Decision: ... / **Prompt:** / **What I got:** / **What I changed:** / **Why this
matters:** / ###` format already used there — one entry per decision.

## Verification

Before considering a change done:

- Backend: run against a local Postgres, apply Prisma migrations, hit the changed routes.
- Frontend: `npm run dev` and manually exercise the affected flow (edit/save/poll, share link,
  upload/import).
- Confirm non-`.txt`/`.md` uploads are still rejected if touching upload code.
