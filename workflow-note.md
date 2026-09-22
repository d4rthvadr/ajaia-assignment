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
