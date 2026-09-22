# Progress Tracker

Execution plan for the collaborative document editor, derived from
[docs/PRD.md](docs/PRD.md), [docs/adr/](docs/adr/), and [docs/specs/](docs/specs/). Each phase is
a vertical slice group; each task lists what blocks it. Work the frontier — any task whose
blockers are all Done can start. Review this before implementation begins.

**Tracer bullet first:** Phase 1 proves the full request path end-to-end (browser → Express →
Postgres → back, with auth cookie + polling) on the thinnest possible slice — one user, one
document, no sharing, no attachments, no multi-doc list. Only after that path is proven do Phases
2–3 flesh it out into the full feature set. This catches wiring/integration problems (cookie
auth, CORS, Prisma connection, poll timing) before they're buried under feature work.

Status legend: `Not Started` / `In Progress` / `Blocked` / `Done`

## Parallelization strategy

A task may be handed to a subagent working in its own `git worktree` only when it has clear,
independent boundaries: its blockers are all `Done`, and it doesn't touch files another
in-flight task is also touching. Tasks tagged **Parallelizable** below meet that bar (e.g. two
sibling route modules that both depend on the same completed prerequisite, but not each other).
Do not parallelize tasks that are sequential rewrites of the same files, or whose blocking edges
are still open. Merge each worktree branch back sequentially and re-run verification before
starting the next dependent task.

## Phase status overview

| Phase                                        | Status      | Blocked by       |
| -------------------------------------------- | ----------- | ---------------- |
| 0. Project scaffolding                       | Done        | None             |
| 1. Tracer bullet (thinnest full stack slice) | Done        | Phase 0          |
| 2. Backend feature completion                | Done        | Phase 1          |
| 3. Frontend feature completion               | Done        | Phase 1, Phase 2 |
| 4. Verification                              | In Progress | Phase 2, Phase 3 |

---

## Phase 0 — Project scaffolding

**Status:** Done · **Blocked by:** None — can start immediately

- [x] 0.1 Create `backend/` (Node + TypeScript + Express) and `frontend/` (Vite + React + TS)
      package skeletons per [AGENTS.md](AGENTS.md) repository layout.
      **Blocked by:** None. **Parallelizable** (separate directories, no shared files) —
      can run alongside 0.2 in its own worktree.
- [x] 0.2 Provision local Postgres (Docker Compose or local install) and wire `DATABASE_URL`.
      **Blocked by:** None. **Parallelizable** — independent of 0.1. (Mapped to host port 5433 —
      5432 was already in use by an unrelated project's container.)

---

## Phase 1 — Tracer bullet (thinnest full-stack slice)

**Status:** Done · **Blocked by:** Phase 0 (Done)

**Goal:** one user can sign up, log in, create a single document, edit it, have it autosave and
persist, and see it refresh via polling — nothing else. This validates the whole architecture
(auth cookie flow, Prisma/Postgres, Express routing, React + poll timing) before Phases 2–3 add
sharing, attachments, multi-document lists, and full shadcn/ui styling on top of it.

**Status:** Done — verified end-to-end in-browser and via curl.

- [x] 1.1 Prisma schema: full schema per [docs/specs/data-model.md](docs/specs/data-model.md)
      (`User`, `Document`, `DocumentAccess`, `Attachment`) and initial migration — built in full
      now since Phases 2–3 extend behavior on this schema, not its shape.
      **Blocked by:** 0.1, 0.2.
- [x] 1.2 Auth routes: signup, login, logout, me — bcrypt + JWT httpOnly cookie
      ([docs/specs/api.md](docs/specs/api.md) Auth table).
      **Blocked by:** 1.1.
- [x] 1.3 Minimal document routes: `POST /documents` (create), `GET /documents/:id`,
      `PUT /documents/:id` (versioned save, ADR-0001) — just enough for one document to round-trip.
      No list endpoint yet (that's 2.1). Verified end-to-end via curl (signup, create, save,
      version bump, unauthenticated 401).
      **Blocked by:** 1.2.
- [x] 1.4 Minimal frontend: Vite + React + TS scaffold, `lib/api.ts` fetch wrapper
      (`credentials: 'include'`), signup/login form, and a single bare-bones editor screen
      (plain `<textarea>` or unstyled Tiptap — no shadcn/ui polish yet) with debounced save and
      ~3s poll per [docs/specs/editor-sync.md](docs/specs/editor-sync.md).
      **Blocked by:** 0.1 (scaffold can start immediately); needs 1.3 to integrate end-to-end.
- [x] 1.5 Tracer verification: sign up, log in, create a document, edit it, reload and confirm
      persistence, open a second logged-in tab and confirm the poll picks up the version change.
      Verified in-browser: signup → doc auto-created → autosave persists across reload → a
      second tab's edit appears in the first (unfocused) tab within one poll cycle.
      **Blocked by:** 1.4.

---

## Phase 2 — Backend feature completion

**Status:** Not Started · **Blocked by:** Phase 1 (Done)

- [x] 2.1 Extend document routes to full list/create: `GET /documents` (list owned), `POST
    /documents` (create, ADR-0005) — generalizing 1.3's single-document create into "My
      documents."
      **Blocked by:** 1.3.
- [x] 2.2 Sharing routes: `POST /documents/:id/share`, `GET /documents/:id/shares`,
      `GET /documents/shared-with-me` (`DocumentAccess` grants, ADR-0002).
      **Blocked by:** 2.1. **Parallelizable** with 2.3 once 2.1 is `Done` — separate route
      modules, no shared files.
- [x] 2.3 Attachment routes: upload, list, download, import-as-content — `.txt`/`.md` only,
      randomized stored filenames (ADR-0004).
      **Blocked by:** 2.1. **Parallelizable** with 2.2 once 2.1 is `Done`.

---

## Phase 3 — Frontend feature completion

**Status:** Not Started · **Blocked by:** Phase 1 (tracer bullet UI shell), Phase 2 (routes)

- [x] 3.1 Install and configure shadcn/ui + Tailwind; restyle the tracer bullet's auth/editor
      screens per [docs/ui-tokens.md](docs/ui-tokens.md) and [docs/ui-rules.md](docs/ui-rules.md).
      **Blocked by:** 1.4.
- [x] 3.2 Documents list page: "My documents" (create + open) and "Shared with me" (ADR-0005,
      ADR-0002), visibly distinguishing the two.
      **Blocked by:** 2.1, 3.1.
- [x] 3.3 Editor page: replace the tracer bullet's bare editor with the full Tiptap rich text
      toolbar (bold/italic/headings/lists) per [docs/specs/editor-sync.md](docs/specs/editor-sync.md).
      **Blocked by:** 3.2.
- [x] 3.4 Sharing UI: "grant access by email" action, list of current shares.
      **Blocked by:** 2.2, 3.3. **Parallelizable** with 3.5 once 3.3 is `Done` — distinct UI
      panels, no shared files.
- [x] 3.5 Attachments panel: upload, list with download links, "import as content" action.
      **Blocked by:** 2.3, 3.3. **Parallelizable** with 3.4 once 3.3 is `Done`.

---

## Phase 4 — Verification

**Status:** Not Started · **Blocked by:** Phase 2, Phase 3

- [ ] 4.1 End-to-end smoke test: signup → create document → edit → autosave persists across
      reload → grant access to a second account → second account sees it under "Shared with me"
      and polling reflects edits → upload `.txt`/`.md` attachment → download it → import a
      `.md` file as content → confirm non-`.txt`/`.md` upload is rejected.
      **Blocked by:** Phase 2 and Phase 3 complete.
- [ ] 4.2 Finalize `README.md` setup steps (env vars, Postgres, `prisma migrate`, `npm run dev`
      for backend + frontend).
      **Blocked by:** 4.1.

---

## Notes

- Phase 1 (tracer bullet) is deliberately narrow and mostly linear — it exists to de-risk the
  architecture, not to deliver features. Don't add sharing/attachments/list-view scope into it.
- Tasks tagged **Parallelizable** (0.1/0.2, 2.2/2.3, 3.4/3.5) may be delegated to subagents in
  separate `git worktree`s per the strategy above; everything else should be done serially in
  this tracker's listed order.
- No task in this tracker touches anything listed as out-of-scope in the PRD (real-time
  concurrent editing, granular roles, full dashboard, cloud storage/deployment, conflict UI).
