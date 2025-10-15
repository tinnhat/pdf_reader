# My PDF Desk

My PDF Desk is a personal PDF reading workspace built with Next.js 15. The
application combines a library interface, real-time progress tracking, rich text
notes, and on-demand translation so that heavy readers can keep all of their
context in a single place.

## Key Features

- 📚 **Personal document library** – Files are persisted in MongoDB along with metadata such as the
  last opened page and title.
- 📖 **Reading progress sync** – Reading positions are stored per document and
  propagated over Server-Sent Events. Whether the reader is on another tab or a
  different device, the open page is kept in sync without manual refreshes.
- 📝 **Per-page notes editor** – A TipTap-based rich text editor stores notes per
  PDF page. Content is sanitized with `sanitize-html` before persisting so users
  can paste formatted text and embedded images safely.
- 🌐 **Inline translation** – A helper panel calls the Lingva Translate service
  via the `/api/translate` route, returning sentence-level translations without
  leaving the reader flow.
- 🎨 **Polished UI with theme switching** – Tailwind CSS and glassmorphism
  styling create a focused interface that supports instant light/dark theme
  toggling using `next-themes`.

## Technical Stack

- **Framework**: Next.js 15 App Router with React Server Components and edge
  friendly layouts.
- **Language & Tooling**: TypeScript, ESLint, Prettier.
- **UI Layer**: Tailwind CSS, Headless UI primitives, React PDF for rendering
  documents.
- **State & Data**: MongoDB for persistence, MongoDB Change Streams for
  real-time progress updates, TipTap for notes state.
- **APIs**: Custom Next.js API routes for library CRUD, progress updates, notes,
  translation proxy, and progress SSE streaming.
- **Testing**: Vitest covers server helpers and translation payload builders.

## Project Structure

```
app/
  api/
    progress/         # CRUD endpoints and SSE stream for reading progress
    notes/            # Notes management routes
    translate/        # Lingva Translate proxy route
  layout.tsx
  page.tsx            # Main entry point with library and reader layout
components/
  layout/             # Layout primitives (sidebar, header)
  library/            # Document list and upload controls
  notes/              # TipTap editor for page notes
  pdf/                # React-PDF viewer composition
  translation/        # UI for translate panel
hooks/                # React hooks for fetching notes/progress
lib/
  repositories/       # MongoDB repositories and data mappers
  server/             # Server utilities such as translation client
  constants.ts, env.ts, mongodb.ts, types.ts
```

## Application Flow

1. **Library selection** – Documents are listed from MongoDB. Selecting a file
   loads its metadata and persists the active document in context.
2. **PDF rendering** – `PdfReader` wraps React PDF with pagination controls. It
   dispatches progress updates to the backend as the user navigates.
3. **Real-time sync** – Clients subscribe to `/api/progress/stream`, an SSE
   endpoint relaying MongoDB Change Stream events. When the current page changes
   elsewhere, the reader updates automatically.
4. **Notes and translation** – The sidebar allows switching between the notes
   editor and translation panel. Notes are stored per page and translation calls
   use the server route to avoid CORS issues.

## Environment Configuration

Create a `.env.local` file in the repository root:

```bash
MONGODB_URI="mongodb://localhost:27017/pdf_reader"
MONGODB_DB="pdf_reader"
TRANSLATE_URI="https://lingva.ml"
```

> ℹ️ MongoDB change streams require running MongoDB in replica set mode—even on a
> single node. Start the database with `mongod --replSet rs0` and initialize the
> replica set before using the real-time progress feature.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The app listens on [http://localhost:3000](http://localhost:3000). Choose a PDF
from the library, switch themes, edit notes, and observe progress syncing across
open sessions.

## Testing

Run the Vitest suite:

```bash
npm run test
```

