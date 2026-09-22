# Spec: Data Model

## Prisma schema (conceptual)

```prisma
model User {
  id             String           @id @default(uuid())
  email          String           @unique
  passwordHash   String
  createdAt      DateTime         @default(now())
  documents      Document[]       // documents this user owns
  accessGrants   DocumentAccess[] // documents shared with this user
}

model Document {
  id          String           @id @default(uuid())
  ownerId     String
  owner       User             @relation(fields: [ownerId], references: [id])
  title       String           @default("Untitled document")
  content     String           @default("") // Tiptap HTML/JSON serialized as text
  version     Int              @default(1)
  updatedAt   DateTime         @updatedAt
  attachments Attachment[]
  sharedWith  DocumentAccess[]
}

model DocumentAccess {
  id         String   @id @default(uuid())
  documentId String
  document   Document @relation(fields: [documentId], references: [id])
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  createdAt  DateTime @default(now())

  @@unique([documentId, userId])
}

model Attachment {
  id         String   @id @default(uuid())
  documentId String
  document   Document @relation(fields: [documentId], references: [id])
  filename   String   // original uploaded filename, shown to users
  storedPath String   // randomized on-disk path, never derived from user input
  mimeType   String
  size       Int
  createdAt  DateTime @default(now())
}
```

## Notes

- `Document.ownerId` is a plain foreign key (not unique, per ADR-0005) — a user can own any
  number of documents.
- `version` increments on every successful save; used for the polling comparison (ADR-0001).
- `DocumentAccess` is the grant table for ADR-0002: one row per (document, user) pair means "this
  user can view this document read-only." A document's `sharedWith` relation is exactly the set
  of users it's been shared with; a user's `accessGrants` relation is exactly their "Shared with
  me" list. There is no `role` column yet — presence of the row means view access, nothing more.
- `Attachment.storedPath` is always server-generated (e.g. `uploads/<uuid>.<ext>`), never the raw
  client filename, to prevent path traversal.
