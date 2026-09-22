# ADR-0001: Polling-based sync instead of WebSockets/CRDT

## Status

Accepted

## Context

"Collaborative" editor evokes Google Docs-style concurrent editing with live cursors and
conflict-free merges (OT/CRDT). Building that correctly is a multi-day effort, not a 2-hour one.
The actual permission model (see ADR-0002) means only one person — the owner — can ever edit a
given document; everyone else is read-only.

## Decision

Use client polling (~3s interval) against a versioned document resource instead of WebSockets or
a CRDT/OT library. The client sends its last-seen version; if the server's version is newer, the
client refreshes its view. Saves are plain debounced `PUT` requests that overwrite content and
increment the version counter (last-write-wins).

## Consequences

- No live cursors, no sub-second updates, no true concurrent-edit conflict resolution.
- Multiple owner sessions/tabs editing simultaneously can clobber each other; this is accepted
  as an edge case, not solved.
- Viewers see near-real-time updates (bounded by poll interval) without any infrastructure beyond
  plain HTTP.
- Straightforward to later swap for WebSockets/SSE without changing the data model (version field
  already exists).
