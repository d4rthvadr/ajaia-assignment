Example:

### Decision: [] approach

**Prompt:** Asked for a regex-based email validator, then asked it to
handle international domains (unicode) and disposable email detection.

**What I got:** A working regex solution, but it flagged legitimate
edge cases (plus-addressing, new TLDs) as invalid.

**What I changed:** Rejected the regex-only approach. Switched to a
library-based validator (email-validator) for RFC compliance, kept
a lightweight regex only as a pre-filter for obvious garbage input
before hitting the library — for performance on bulk imports.

**Why this matters:** AI's first answer was "correct-looking" but
would've caused real false-positive rejections in production. The
value I added was recognizing the failure mode, not the code itself.

###

### Decision: Use focused navigation and action surfaces for secondary workflows

**Prompt:** Improve the UX for sharing and file actions with navigation bars,
pop-up dialogs, and drop-down menus where those patterns fit naturally.

**What I got:** Sharing and attachment actions were presented inline beside
the editor, competing with the writing surface and making the lower area feel
busy. The product only needs a small number of secondary workflows, not a
full dashboard shell.

**What I changed:** Added compact navigation to the workspace and editor,
moved sharing into a Radix Dialog, and grouped upload/import choices in a
Radix DropdownMenu while keeping downloads visible next to each attachment.
The underlying routes and permission model stayed unchanged.

**Why this matters:** Each action now appears in the interaction pattern users
expect without adding permanent navigation chrome or expanding the product
scope. The writing canvas remains the primary surface and secondary actions
are easier to discover.

### Decision: Prefer a simple shared UI approach under the timebox

**Prompt:** Given the limited time and deliberately small product scope,
choose between building a broader feature-slice component system and using a
small, reusable UI foundation now.

**What I got:** A full shadcn setup would add configuration and component
surface area that the current app does not need. The actual recurring needs
are buttons, text inputs, labels, badges, dialogs, and menus.

**What I changed:** Kept the implementation lean: copied the small
shadcn-style primitives needed by the current screens, reused Radix only for
focus-managed overlays, and documented the choices in `ui-tokens.md`,
`ui-rules.md`, and `AGENTS.md`. Deferred broader component coverage until a
real workflow requires it.

**Why this matters:** The app gets consistent controls and accessibility
behavior without spending the remaining time on infrastructure that does not
serve the current scope. The shared layer can grow incrementally without
forcing a speculative design system.

###

### Decision: Add shared UI primitives and focused action surfaces

**Prompt:** The first visual pass still relied on scattered raw HTML controls,
so sharing, uploads, and navigation felt inconsistent. Improve the UX with
appropriate navbars, a share modal, and a file-actions menu.

**What I got:** The frontend already had Tailwind, Lucide, and class-variance
utilities, but no shared `components/ui` layer. Sharing was embedded in the
editor footer and upload/import actions were presented as unrelated buttons,
which made the lower editor area feel crowded and inconsistent.

**What I changed:** Added shared shadcn-style primitives for buttons, text
inputs, labels, and status badges, then adopted them across auth, documents,
and editor screens. Added Radix Dialog for the share flow, Radix DropdownMenu
for upload/import choices, and compact navigation in the workspace and editor
app bars. The share dialog stays open when the server rejects a grant and only
closes after success.

**Why this matters:** Shared primitives give the UI one visual and accessibility
contract, while dialogs and menus keep secondary actions out of the writing
surface. This improves discoverability without expanding the product scope or
changing the underlying document, sharing, or attachment APIs.

###

### Decision: Use a Docs-style visual direction and keep the UI pass lean

**Prompt:** Reference Google Docs screens for the product's layout, spacing,
typography, colors, and brand direction before continuing to the next phase.

**What I got:** The existing frontend was functional but visually inconsistent:
it used a green editorial palette, a starter-style shell, and UI guidance that
still described generic shadcn/Zinc defaults. The reference screens suggested a
familiar writing utility instead: a compact white app bar, pale gray workspace,
blue document identity, restrained borders, and a white paper-like editor.

**What I changed:** Extracted the direction into [docs/ui-tokens.md](docs/ui-tokens.md)
and [docs/ui-rules.md](docs/ui-rules.md), covering layout widths, spacing,
radius, typography hierarchy, brand colors, focus/hover behavior, and explicit
visual non-goals. Applied a small CSS-only refresh to the auth, documents, and
editor surfaces without changing routes, state, or API behavior. Added Phase
3.6 to [progress-tracker.md](progress-tracker.md) so the design pass is an
explicit gate before verification.

**Why this matters:** A short design contract prevents each screen from
inventing its own visual language and keeps the product recognizable under the
time constraint. Limiting the implementation to tokens, spacing, typography,
color, and existing component surfaces gives the app a coherent direction
without delaying the core document workflow.

###

### Decision: Use Multer for the initial file-upload path

**Prompt:** With limited time for setting up real blob storage, choose a lean
initial approach for handling `.txt` and `.md` uploads.

**What I got:** A local file-storage requirement, but no deployment target or
object-storage service configured for this pass. Adding blob-storage setup
would introduce credentials, provisioning, and another integration boundary
before the core upload and import flows were proven.

**What I changed:** Chose Multer with in-memory multipart handling for the
initial upload boundary. The backend validates both extension and MIME type,
writes accepted attachment bytes to a project-relative `uploads/` directory
under a server-generated filename, and stores only metadata in Postgres.
Blob-storage integration is deferred as a future storage-adapter change.

**Why this matters:** This keeps the first implementation small and testable
within the timebox while preserving the security requirements around file
types and path traversal. It also leaves the API and Prisma metadata model
stable so moving the bytes to object storage later does not require changing
the user-facing upload contract.

###

### Decision: Collaboration & permission scope for a 2-hour build

**Prompt:** Asked the assistant to grill the plan for a Google-Docs-inspired
collaborative editor before building, then answered its questions on
timebox, collaboration depth, auth, and sharing.

**What I got:** A proposal for anonymous, link-based sharing (anyone
with the URL can view, no login) paired with polling-based sync and
a single owner-editable document — reasonable defaults for speed.

**What I changed:** Rejected the anonymous-link model. The assignment
explicitly wanted a document owner, a way to grant _another user_
access, and a visible owned-vs-shared distinction — none of which an
anonymous bearer token demonstrates. Replaced it with a `DocumentAccess`
grant table keyed to real user accounts (owner grants view access by
email; recipient sees it under "Shared with me").

**Why this matters:** The AI's first pass optimized purely for build
speed and missed that the assignment was testing access-control
judgment, not just "can two browsers see the same text." Catching
that kept the deliverable aligned with what was actually being
evaluated instead of a faster but off-target build.

###

### Decision: One document per user vs. multiple owned documents

**Prompt:** Reviewed the locked scope decisions and pushed back:
"a user can create and own more than one document. Seems we are
restricting a user to one document."

**What I got:** An ADR (0003) that auto-created exactly one document
per user to avoid building a dashboard, on the reasoning that it kept
the timebox tight.

**What I changed:** Had the ADR superseded rather than edited in
place (ADR-0005), dropped the unique owner→document constraint,
and replaced the single auto-created document with a minimal
create + list flow ("My documents"), while explicitly keeping
rename/delete/search out of scope so the fix didn't balloon into a
full dashboard.

**Why this matters:** Owning multiple documents is table-stakes for
a document editor — the earlier cut traded away something core to
the product to save dashboard work that wasn't actually needed yet.
Scoping the fix to "list + create only" kept the correction from
overcorrecting into unnecessary CRUD/UI work.

###

### Decision: Confirming Tiptap has no paid dependency for our scope

**Prompt:** "what stacks are we using. Tiptap looks paid" — questioned
whether the chosen rich-text editor library introduces a licensing
cost.

**What I got:** Confirmed that Tiptap's core packages (`@tiptap/core`,
`@tiptap/react`, `@tiptap/starter-kit`) are MIT-licensed and free; the
paid "Tiptap Pro/Cloud" tier only covers extras (real-time collab
server, comments, AI toolkit, templates) that this build doesn't use,
since sync is our own polling implementation, not Tiptap's collaboration
extension.

**What I changed:** Nothing in the plan — verified the existing choice
rather than swapping libraries, and flagged the free-vs-paid boundary
explicitly so it doesn't get assumed away later (e.g. if collaboration
features are revisited).

**Why this matters:** A cost/licensing assumption slipping through
unchecked could force a late library swap under time pressure. Confirming
it early means the editor choice stays load-bearing for the rest of the
build instead of a risk to unwind later.

###

### Decision: Adopting shadcn/ui with living UI docs

**Prompt:** "lets use shadcn for UI related stuff and generate a
simple ui-tokens.md, ui-rules.md. these are progressive updated only
when needed."

**What I got:** Two new docs — [docs/ui-tokens.md](docs/ui-tokens.md)
(color/spacing/typography tokens, defaulting to shadcn's stock Zinc
theme) and [docs/ui-rules.md](docs/ui-rules.md) (component mapping,
form/validation pattern, accessibility baseline) — plus the stack
line in AGENTS.md updated to name shadcn/ui + Tailwind CSS.

**What I changed:** Kept both docs deliberately thin and marked them
as living documents updated only when a new UI need actually arises,
instead of front-loading a full design system for a 2-hour build.
Explicitly listed non-goals (no dark mode, no custom theme, no new
animation library) so scope doesn't creep in through the UI layer.

**Why this matters:** A UI-tokens/rules doc can easily balloon into
its own mini design-system project. Scoping it to "shadcn defaults +
a mapping table, extended only on demand" keeps it useful without
competing with the actual 2-hour build for time.

###

### Decision: Allowing subagents on independent tasks via git worktrees

**Prompt:** "lets include the option to use sub-agents where necessary
as long as its an independent work with clear boundaries using
worktrees. Update AGENTS.md as well" — after the progress tracker was
drafted as a strictly linear task list.

**What I got:** A progress tracker with phases and per-task blocking
edges, but no guidance on when work could be parallelized rather than
done one task at a time.

**What I changed:** Added a "Parallelizable" tag to specific sibling
tasks whose blockers are already satisfied and that don't touch the
same files (e.g. sharing routes vs. attachment routes, both gated only
on the document routes existing), with an explicit rule: a subagent
may only take a tagged task in its own `git worktree`, merged back
sequentially. Mirrored the same rule into AGENTS.md so it's enforced
for any agent, not just documented in one file.

**Why this matters:** Blanket parallelism risks two agents editing
overlapping files or racing ahead of unmet dependencies; blanket
serialism wastes time on genuinely independent work. Tagging only the
tasks that are provably independent (by blockers + file boundaries)
keeps the speed-up safe rather than assumed.

###

### Decision: Writing docs/architecture.md as the "how it fits together" view

**Prompt:** "use this to create the decided architecture for this
scoped product" (pointing at the empty docs/architecture.md), followed
by "update AGENTS.md to use this file when necessary."

**What I got:** A populated architecture doc: a component diagram,
a decisions table cross-referencing every ADR, three sequence diagrams
(edit/autosave/poll, sharing, import vs. attach), and a security-notes
section — synthesized from the PRD, ADRs, and specs rather than
introducing anything new.

**What I changed:** Added a pointer to it from AGENTS.md's Project
section, positioned right after the PRD/ADR/specs reading order, so
agents read it before touching cross-cutting concerns (auth, sync,
file handling) instead of re-deriving the component boundaries from
scattered specs each time.

**Why this matters:** The PRD/ADRs/specs each answer "why" or "what
exactly," but none show how the pieces connect end-to-end. Without a
single fit-together view, an agent implementing one route in
isolation could miss how it's supposed to interact with the others
(e.g. which middleware gates it, which flow it's part of).

###

### Decision: Insert a tracer bullet phase before feature slices

**Prompt:** "update progress-tracker.md and relevant docs to setup a
tracing bullet first before we proceed to fleshing out product/mvp
slices."

**What I got:** A tracker with Phase 1 ("Backend foundation") and
Phase 2 ("Frontend foundation") that already included sharing,
attachments, and the multi-document list as part of the first pass —
technically ordered, but not scoped to prove the architecture cheaply
before committing to the full feature set.

**What I changed:** Inserted a new Phase 1 "Tracer bullet": one user,
one document, signup/login, create/edit/save/poll — nothing else.
Pushed sharing, attachments, and the multi-document list into Phases
2–3 ("Backend/Frontend feature completion"), explicitly built on top
of what the tracer bullet proves out. Mirrored the same ordering
principle into AGENTS.md's task-tracking section.

**Why this matters:** Building the full route/UI surface before
confirming the basic wire-up (cookie auth across origins, Prisma
connection, poll timing, React↔Express integration) risks discovering
an integration problem after most of the work is already sunk. A
narrow, provable slice first de-risks the architecture cheaply.

###
