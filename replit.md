# LinguaTrack AI - Language Learning Platform

## Overview
A full-stack language learning application built with React, TypeScript, and Express. This is a production-ready Fusion Starter template featuring integrated frontend and backend on a single development server.

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS 3 + React Router 6
- **Backend**: Express 5 server integrated with Vite dev server
- **UI Components**: Radix UI + Lucide React icons
- **Package Manager**: pnpm
- **Testing**: Vitest
- **Validation**: Zod
- **Backend Integration**: Supabase

## Project Structure
```
client/                   # React SPA frontend
├── pages/               # Route components (Login, Dashboard, etc.)
├── components/ui/       # Pre-built UI component library (Radix UI)
├── components/          # Custom components (Logo, ThemeToggle, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utilities and helpers
├── App.tsx             # App entry point with SPA routing
└── global.css          # TailwindCSS theming and global styles

server/                  # Express API backend
├── index.ts            # Main server setup (express config + routes)
└── routes/             # API handlers

shared/                  # Types used by both client & server
└── api.ts              # Shared API interfaces
```

## Development

### Running the App
The app runs on port 5000 with both frontend and backend integrated:
- Dev server: `pnpm dev` (already configured in workflow)
- Build: `pnpm build`
- Production: `pnpm start`
- Type check: `pnpm typecheck`
- Tests: `pnpm test`

### Key Features
- Single-port development (port 5000) for both frontend/backend
- Hot reload for both client and server code
- API endpoints prefixed with `/api/`
- Type-safe API communication via shared interfaces
- Path aliases: `@/*` for client, `@shared/*` for shared

### Available Routes
- `/` - Login page
- `/signup` - Sign up page
- `/dashboard` - Main dashboard
- `/lessons` - Lessons page
- `/profile` - User profile
- `/settings` - Settings page
And more...

### API Endpoints
- `GET /api/ping` - Simple ping endpoint
- `GET /api/demo` - Demo endpoint

## Database

### PostgreSQL + Drizzle ORM
The app uses PostgreSQL with Drizzle ORM for user authentication and data persistence.

**Database Schema:**
- `users` table: stores user credentials and profile information
  - id (serial primary key)
  - email (unique)
  - password_hash (bcrypt hashed)
  - name
  - role (learner/admin)
  - created_at, updated_at

**Database Commands:**
- `pnpm db:push` - Push schema changes to database
- Schema defined in `shared/schema.ts`
- Database config in `drizzle.config.ts`

**Authentication API:**
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/user/:id` - Get user by ID

**AI Journal API (Protected):**
- `POST /api/ai/analyze-journal` - AI grammar/vocabulary analysis (requires auth, 10 req/min limit)
- `POST /api/ai/generate-prompts` - Generate writing prompts (requires auth, 5 req/min limit)

## Recent Changes (October 14, 2025)
- Configured for Replit environment
- Updated Vite config to use port 5000 with proper HMR setup for Replit proxy
- Installed all dependencies with pnpm
- Set up Dev Server workflow
- **Added PostgreSQL database with Drizzle ORM**
- **Created user authentication system with database persistence**
- **Set up database schema and storage layer**
- **Connected frontend authentication to database API**
- **Fixed critical security vulnerability: Server now enforces "learner" role for all new registrations (no client-controlled role assignment)**
- **Integrated OpenAI for AI-powered journaling with grammar correction and vocabulary feedback**
- **Added rich topic content with detailed learning materials for all languages**
- **Implemented PWA capabilities for mobile app experience (manifest, service worker, install prompt)**
- **Added authentication and rate limiting to AI endpoints (10 requests/min for analysis, 5 requests/min for prompts)**

## Configuration Notes
- The Vite dev server is configured to work with Replit's proxy system
- HMR (Hot Module Reload) is properly configured for WebSocket connections through Replit's domain
- Frontend serves on 0.0.0.0:5000 to allow proxy access
- Server files use relative imports (not path aliases) to avoid Vite config loading issues
- Database uses standard PostgreSQL driver (pg) for compatibility with Replit
- AI features use Replit AI Integrations (OpenAI-compatible) - charges billed to credits
- PWA manifest and service worker enable offline capabilities and app installation
