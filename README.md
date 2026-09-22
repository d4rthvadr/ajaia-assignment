# Lightweight Collaborative Document Editor

A focused, Google-Docs-inspired editor for creating documents, editing rich text, granting
view-only access, and working with `.txt` and `.md` files. The app uses polling and last-write-wins
saves to keep the implementation small and easy to run locally.

## Stack

- Node.js 24, TypeScript, and Express 5
- React, Vite, Tailwind CSS, and Tiptap
- PostgreSQL with Prisma
- JWT sessions in an httpOnly cookie
- Multer with project-local `uploads/` storage for attachments

## Prerequisites

- Node.js 24 (`nvm use` reads the repository `.nvmrc`)
- npm
- Docker with Docker Compose, or a PostgreSQL database matching the connection string below

## Setup

From the repository root:

```bash
docker compose up -d
```

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

For local development, the example values use:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/ajaia_dev?schema=public
JWT_SECRET=change-me-in-real-env
PORT=4000
```

Install dependencies and apply the Prisma migrations:

```bash
cd backend
npm install
npx prisma migrate dev
cd ../frontend
npm install
```

## Run

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173/login](http://localhost:5173/login). The root URL redirects to the
documents workspace; unauthenticated users are sent back to the login page after the API responds.
The backend must be running on port `4000` unless `PORT` or `VITE_API_BASE` is changed.

## Using The App

1. Create an account or log in.
2. Create a document from the documents workspace and open it.
3. Edit with the rich text toolbar. Changes autosave after a short debounce and refresh through
   polling approximately every three seconds.
4. Share a document with another existing account by entering its email. Shared users have
   read-only access and see the document under **Shared with me**.
5. Upload `.txt` or `.md` files as attachments, download them, or import one as document content.
   Upload validation checks both the file extension and reported MIME type.

## Useful Commands

Backend:

```bash
npm run typecheck
npm run lint
npm test
```

Frontend:

```bash
npm run typecheck
npm run lint
npm run build
npm test
```

Run these from the relevant package directory. The test scripts are currently smoke-test
placeholders; route and browser verification remains part of the local development workflow.

## Project Docs

- [docs/PRD.md](docs/PRD.md) — goals, scope, and non-goals.
- [docs/adr/](docs/adr/) — decisions behind sync, sharing, ownership, and storage.
- [docs/specs/](docs/specs/) — data model, API contract, and editor sync behavior.
- [docs/architecture.md](docs/architecture.md) — how the application pieces fit together.
- [workflow-note.md](workflow-note.md) — implementation decisions and trade-offs.
- [AGENTS.md](AGENTS.md) — repository conventions and verification requirements.

## Scope Notes

This pass intentionally does not include WebSockets, CRDT/OT collaboration, anonymous links,
granular roles, document deletion/renaming/search, cloud blob storage, or deployment configuration.
