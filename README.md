# PDF Reader - Personal PDF Reading Workspace

PDF Reader is a modern, full-featured PDF reading application built with Next.js 16. The application provides a comprehensive reading experience with document library management, real-time progress tracking, rich text note-taking, inline translation, and seamless theme switching.

## Key Features

- 📚 **Personal Document Library** – Upload and manage multiple PDF files with persistent storage in MongoDB
- 📖 **Real-time Reading Progress Sync** – Reading positions are synchronized across devices and browser tabs using Server-Sent Events
- 📝 **Advanced Note Management** – Rich text editor with TipTap for per-page notes, including edit and delete functionality
- 🗑️ **Document Management** – Full CRUD operations for documents with cascade deletion of associated notes and progress
- 🌐 **Inline Translation** – Integrated translation service for selected text without leaving the reading flow
- 🎨 **Modern UI with Theme Support** – Glassmorphism design with instant light/dark theme switching
- 📱 **Responsive Design** – Optimized for desktop and mobile reading experiences
- 🔍 **PDF Navigation** – Intuitive page navigation with progress tracking and page jumping

## Technology Stack

### Core Framework
- **Next.js 16.1.1** – App Router with React Server Components and edge-friendly layouts
- **React 19.1.0** – Latest React with concurrent features and improved performance
- **TypeScript** – Full type safety throughout the application

### UI & Styling
- **Tailwind CSS 4** – Utility-first CSS framework with custom design system
- **Lucide React** – Modern icon library
- **next-themes** – Theme switching with system preference detection

### PDF Processing
- **react-pdf 9.1.0** – PDF rendering and manipulation
- **pdfjs-dist 4.10.38** – PDF.js for client-side PDF processing

### Data & State Management
- **MongoDB** – Document database for persistent storage
- **MongoDB Change Streams** – Real-time data synchronization
- **SWR** – React hooks for data fetching and caching

### Rich Text Editing
- **TipTap** – Extensible rich text editor framework
- **sanitize-html** – HTML sanitization for security

### Development Tools
- **ESLint** – Code linting and formatting
- **Vitest** – Unit testing framework
- **MongoDB Memory Server** – In-memory MongoDB for testing

## Project Architecture

The application follows a modern Next.js App Router architecture with clear separation of concerns:

### Frontend Architecture
- **App Router Structure** – File-based routing with nested layouts
- **Server Components** – Optimized rendering with selective client components
- **Custom Hooks** – Reusable data fetching and state management logic
- **Component Composition** – Modular, reusable UI components

### Backend Architecture
- **API Routes** – RESTful endpoints for CRUD operations
- **Repository Pattern** – Data access layer with MongoDB abstraction
- **Real-time Updates** – Server-Sent Events for live progress synchronization
- **Middleware** – Request processing and authentication

### Data Flow
```
User Interaction → API Routes → Repositories → MongoDB
                      ↓
              Server-Sent Events → Client Updates
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (running in replica set mode for change streams)
- npm or yarn package manager

### Environment Setup

Create a `.env.local` file in the repository root:

```bash
MONGODB_URI="mongodb://localhost:27017/pdf_reader"
MONGODB_DB="pdf_reader"
TRANSLATE_URI="https://lingva.ml"
```

> **Note**: MongoDB change streams require replica set mode. Start MongoDB with:
> ```bash
> mongod --replSet rs0
> ```
> Then initialize the replica set in MongoDB shell:
> ```javascript
> rs.initiate()
> ```

### Installation & Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd pdf_reader
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── documents/            # Document CRUD operations
│   │   ├── notes/                # Note management (with [noteId] routes)
│   │   ├── progress/             # Reading progress tracking
│   │   └── translate/            # Translation service proxy
│   ├── globals.css               # Global styles and Tailwind imports
│   ├── layout.tsx                # Root layout with theme provider
│   └── page.tsx                  # Main application page
├── components/                   # React components
│   ├── layout/                   # Layout components (header, theme toggle)
│   ├── library/                  # Document library management
│   ├── notes/                    # Note editor and list components
│   └── pdf/                      # PDF viewer components
├── hooks/                        # Custom React hooks
│   ├── useNotes.ts               # Note management hook
│   ├── useReadingProgress.ts     # Progress tracking hook
│   └── ...
├── lib/                          # Utility libraries
│   ├── repositories/             # Database access layer
│   ├── server/                   # Server-side utilities
│   ├── constants.ts              # Application constants
│   ├── env.ts                    # Environment configuration
│   ├── mongodb.ts                # Database connection
│   └── types.ts                  # TypeScript type definitions
├── tests/                        # Test files
│   ├── setup.ts                  # Test configuration
│   └── translate.test.ts         # Translation tests
└── public/                       # Static assets
```

## Application Flow

1. **Document Management** – Users can upload multiple PDFs, view library, and delete documents with associated data
2. **Reading Experience** – Select document → PDF renders with navigation controls → Progress automatically saves
3. **Note Taking** – Rich text editor for page-specific notes → Edit/delete existing notes → Real-time updates
4. **Real-time Sync** – Progress and notes sync across browser tabs/devices via Server-Sent Events
5. **Translation** – Select text → Inline translation without leaving reading context

## Development Workflow

### Code Quality
- **TypeScript** – Strict type checking enabled
- **ESLint** – Automated code linting with Next.js rules
- **Prettier** – Consistent code formatting

### Testing Strategy
- **Unit Tests** – Vitest for utility functions and API logic
- **Integration Tests** – API route testing with MongoDB Memory Server
- **Component Testing** – React component testing with Testing Library

### Git Workflow
- **Feature Branches** – Create branches for new features
- **Pull Requests** – Code review process for all changes
- **Main Branch** – Protected with CI/CD checks

## Coding Standards

### TypeScript Guidelines
- Strict null checks and type safety
- Interface definitions for all data structures
- Proper error handling with typed exceptions

### React Best Practices
- Functional components with hooks
- Custom hooks for shared logic
- Proper dependency arrays in useEffect/useCallback

### Database Patterns
- Repository pattern for data access
- Proper error handling for database operations
- Type-safe queries with MongoDB

## Testing

Run the test suite with Vitest:

```bash
npm run test
```

Test coverage includes:
- Translation service utilities
- API route handlers
- Data validation functions
- MongoDB repository operations

## API Reference

### Documents
- `GET /api/documents` – List all documents
- `POST /api/documents` – Upload new document
- `DELETE /api/documents/[id]` – Delete document and associated data

### Notes
- `GET /api/notes?documentId=...` – Get notes for document
- `POST /api/notes` – Create new note
- `PUT /api/notes/[id]` – Update existing note
- `DELETE /api/notes/[id]` – Delete note

### Progress
- `GET /api/progress?documentId=...` – Get reading progress
- `POST /api/progress` – Update reading progress
- `GET /api/progress/stream?documentId=...` – SSE stream for real-time updates

### Translation
- `POST /api/translate` – Translate text via Lingva service

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code patterns and TypeScript conventions
- Add tests for new functionality
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## Deployment

The application is optimized for deployment on Vercel with:
- Static generation for improved performance
- API routes for dynamic functionality
- MongoDB Atlas for database hosting
- Automatic scaling and CDN distribution

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- PDF rendering powered by [React PDF](https://react-pdf.org/)
- Rich text editing by [TipTap](https://tiptap.dev/)
- Icons by [Lucide](https://lucide.dev/)
  notes/              # TipTap editor for page notes
  pdf/                # React-PDF viewer composition
  translation/        # UI for translate panel
hooks/                # React hooks for fetching notes/progress
lib/
  repositories/       # MongoDB repositories and data mappers
  server/             # Server utilities such as translation client
  constants.ts, env.ts, mongodb.ts, types.ts
```

## License

This project is licensed under the MIT License.

