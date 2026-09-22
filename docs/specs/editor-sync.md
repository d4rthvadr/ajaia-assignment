# Spec: Editor Sync Behavior

## Save path (owner only)

1. User edits in the Tiptap editor; each change resets a debounce timer (~1.5s).
2. When the timer fires, the client sends `PUT /documents/:id { content }`.
3. Server overwrites `content`, increments `version`, updates `updatedAt`, and returns the new
   document — no version-conflict check is performed (ADR-0001: pure last-write-wins).
4. The client records the returned `version` as its `lastKnownVersion`.

## Poll path (owner and shared viewers)

1. Every ~3s, the client calls `GET /documents/:id` (authenticated as either the owner or a user
   granted access via `DocumentAccess` — see ADR-0002; there is no anonymous/public access).
2. If the response `version` is greater than the client's `lastKnownVersion`:
   - **Shared viewer** (`access: "shared"`): always replace the rendered content.
   - **Owner** (`access: "owner"`): only replace editor content if the editor is not currently
     focused/mid-edit (avoid clobbering in-progress typing); otherwise skip this refresh and
     retry on the next poll tick.
3. Update `lastKnownVersion` to the response's `version` after applying (or intentionally
   skipping) the refresh.

## Import vs. attach

- **Import**: `POST /documents/:id/import` reads the uploaded `.txt`/`.md` file, sets it as
  `content` (Markdown is inserted as plain text in this pass — no Markdown-to-rich-text
  conversion), and bumps `version` like a normal save.
- **Attach**: `POST /documents/:id/attachments` stores the file and records metadata; it does not
  touch `content` or `version`. Attachments are listed in a side panel with download links,
  visible to the owner and to any user the document has been shared with (per PRD success
  criteria).

## Explicit limitation

Two owner sessions editing at the same time will silently overwrite each other on save (last
write wins, no merge, no warning). This is an accepted trade-off documented in ADR-0001, not a
bug to fix in this pass.
