# Spec: API Contract

Base URL: `/api`. Session is a JWT stored in an httpOnly cookie; all authenticated routes require
it. Public routes are explicitly marked.

## Auth

| Method | Path         | Auth | Body                  | Response                     |
| ------ | ------------ | ---- | --------------------- | ---------------------------- |
| POST   | /auth/signup | none | `{ email, password }` | `201 { user }` + sets cookie |
| POST   | /auth/login  | none | `{ email, password }` | `200 { user }` + sets cookie |
| POST   | /auth/logout | user | —                     | `204` + clears cookie        |
| GET    | /auth/me     | user | —                     | `200 { user }` / `401`       |

## Documents

| Method | Path                      | Auth                              | Body                          | Response                                                                                  |
| ------ | ------------------------- | --------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| GET    | /documents                | user                              | —                             | `200 { documents[] }` — caller's own documents (id, title, updatedAt)                     |
| POST   | /documents                | user                              | `{ title? }`                  | `201 { document }` — creates a new document owned by the caller                           |
| GET    | /documents/shared-with-me | user                              | —                             | `200 { documents[] }` — docs granted to caller, each tagged `access: "shared"`            |
| GET    | /documents/:id            | owner OR user with granted access | —                             | `200 { document }` — includes `access: "owner" \| "shared"` for the UI distinction        |
| PUT    | /documents/:id            | owner                             | `{ content }`                 | `200 { document }` — overwrites content, `version += 1` (ADR-0001: no conflict rejection) |
| POST   | /documents/:id/share      | owner                             | `{ email }`                   | `201 { grant }` — creates a `DocumentAccess` row for the user with that email             |
| GET    | /documents/:id/shares     | owner                             | —                             | `200 { users[] }` — who the document is currently shared with                             |
| POST   | /documents/:id/import     | owner                             | multipart file (`.txt`/`.md`) | `200 { document }` — replaces content, bumps version                                      |

## Attachments

| Method | Path                       | Auth                              | Body                          | Response                                       |
| ------ | -------------------------- | --------------------------------- | ----------------------------- | ---------------------------------------------- |
| POST   | /documents/:id/attachments | owner                             | multipart file (`.txt`/`.md`) | `201 { attachment }`                           |
| GET    | /documents/:id/attachments | owner OR user with granted access | —                             | `200 { attachments[] }`                        |
| GET    | /attachments/:id/download  | owner OR user with granted access | —                             | file stream, `Content-Disposition: attachment` |

## Error conventions

- `400` — validation failure (bad email, missing field, disallowed file type/extension, or trying
  to share a document with its own owner).
- `401` — missing/invalid session. Every route requires login; there is no anonymous public
  access.
- `403` — valid session but caller is neither the owner nor a granted user for that document.
- `404` — document/attachment not found, or `/documents/:id/share` given an email with no
  matching account.
- File type validation checks both the extension (`.txt`/`.md`) and reported MIME type; reject
  otherwise with `400`.
