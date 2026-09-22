# ADR-0004: Postgres/Prisma for persistence, local disk for attachments

## Status

Accepted

## Context

Persistence needs a real datastore surviving process restarts. File attachments need somewhere to
live. No deployment target is set up yet, ruling out managed object storage (S3, etc.) as a
pragmatic default for this pass.

## Decision

- Use **Postgres** as the system of record, accessed via **Prisma** for type-safe schema
  migrations and queries in TypeScript.
- Store uploaded `.txt`/`.md` files on the **local filesystem** (a project-relative `uploads/`
  directory), with only the file's metadata (filename, path, mime type, size) recorded in
  Postgres. Stored filenames are randomized server-side to avoid path traversal and collisions.

## Consequences

- Fast local setup: one Postgres instance (or Docker container), one `prisma migrate` command.
- Attachments are not portable across deployments/replicas as-is; moving to S3-compatible storage
  later means swapping the storage adapter behind the attachment routes, not the schema.
- Local disk storage is acceptable because deployment is explicitly out of scope for this pass
  (see PRD non-goals).
