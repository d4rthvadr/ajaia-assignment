# Progress Tracker

Execution plan for the collaborative document editor, derived from
[docs/PRD.md](docs/PRD.md), [docs/adr/](docs/adr/), and [docs/specs/](docs/specs/). Each phase is
a vertical slice group; each task lists what blocks it. Work the frontier — any task whose
blockers are all Done can start. Review this before implementation begins.

Status legend: `Not Started` / `In Progress` / `Blocked` / `Done`

## Phase status overview

| Phase                              | Status      | Blocked by      |
| ----------------------------------- | ----------- | --------------- |
| 0. Project scaffolding              | Not Started | None            |
| 1. Backend foundation               | Not Started | Phase 0         |
| 2. Frontend foundation              | Not Started | Phase 0         |
| 3. Verification                     | Not Started | Phase 1, Phase 2|

---

## Phase 0 — Project scaffolding
**Status:** Not Started · **Blocked by:** None — can start immediately

- [ ] 0.1 Create `backend/` (Node + TypeScript + Express) and `frontend/` (Vite + React + TS)
      package skeletons per [AGENTS.md](AGENTS.md) repository layout.
      **Blocked by:** None.
- [ ] 0.2 Provision local Postgres (Docker Compose or local install) and wire `DATABASE_URL`.
      **Blocked by:** None.

---

## Phase 1 — Backend foundation
**Status:** Not Started · **Blocked by:** Phase 0

- [ ] 1.1 Prisma schema: `User`, `Document`, `DocumentAccess`, `Attachment` per
      [docs/specs/data-model.md](docs/specs/data-model.md); run initial migration.
      **Blocked by:** 0.1, 0.2.
- [ ] 1.2 Auth routes: signup, login, logout, me — bcrypt + JWT httpOnly cookie
      ([docs/specs/api.md](docs/specs/api.md) Auth table; ADR referenced: none, foundational).
      **Blocked by:** 1.1.
- [ ] 1.3 Document routes: `GET/POST /documents` (list/create, ADR-0005), `GET /documents/:id`,
      `PUT /documents/:id` (versioned save, ADR-0001).
      **Blocked by:** 1.1, 1.2.
- [ ] 1.4 Sharing routes: `POST /documents/:id/share`, `GET /documents/:id/shares`,
      `GET /documents/shared-with-me` (`DocumentAccess` grants, ADR-0002).
      **Blocked by:** 1.3.
- [ ] 1.5 Attachment routes: upload, list, download, import-as-content — `.txt`/`.md` only,
      randomized stored filenames (ADR-0004).
      **Blocked by:** 1.3.

---

## Phase 2 — Frontend foundation
**Status:** Not Started · **Blocked by:** Phase 0 (route contracts from Phase 1 needed to
integrate, but UI shell can scaffold in parallel)

- [ ] 2.1 Scaffold Vite + React + TS app; `lib/api.ts` fetch wrapper with `credentials: 'include'`.
      **Blocked by:** 0.1.
- [ ] 2.2 Auth screens (signup/login), redirect to documents list on success.
      **Blocked by:** 1.2, 2.1.
- [ ] 2.3 Documents list page: "My documents" (create + open) and "Shared with me" (ADR-0005,
      ADR-0002), visibly distinguishing the two.
      **Blocked by:** 1.3, 1.4, 2.2.
- [ ] 2.4 Editor page: Tiptap rich text, debounced autosave, ~3s poll for version changes
      ([docs/specs/editor-sync.md](docs/specs/editor-sync.md)).
      **Blocked by:** 1.3, 2.3.
- [ ] 2.5 Sharing UI: "grant access by email" action, list of current shares.
      **Blocked by:** 1.4, 2.4.
- [ ] 2.6 Attachments panel: upload, list with download links, "import as content" action.
      **Blocked by:** 1.5, 2.4.

---

## Phase 3 — Verification
**Status:** Not Started · **Blocked by:** Phase 1, Phase 2

- [ ] 3.1 End-to-end smoke test: signup → create document → edit → autosave persists across
      reload → grant access to a second account → second account sees it under "Shared with me"
      and polling reflects edits → upload `.txt`/`.md` attachment → download it → import a
      `.md` file as content → confirm non-`.txt`/`.md` upload is rejected.
      **Blocked by:** Phase 1 and Phase 2 complete.
- [ ] 3.2 Finalize `README.md` setup steps (env vars, Postgres, `prisma migrate`, `npm run dev`
      for backend + frontend).
      **Blocked by:** 3.1.

---

## Notes
- Sequence within Phase 1 and Phase 2 is mostly linear (each task blocks the next); Phase 1 and
  Phase 2 scaffolding (0.x, 1.1, 2.1) can run in parallel, but integration tasks (2.2–2.6) need
  their corresponding backend routes done first.
- No task in this tracker touches anything listed as out-of-scope in the PRD (real-time
  concurrent editing, granular roles, full dashboard, cloud storage/deployment, conflict UI).
