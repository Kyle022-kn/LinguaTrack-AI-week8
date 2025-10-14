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
- `POST /api/auth/register` - Create new user account (returns user + sessionToken)
- `POST /api/auth/login` - Authenticate user (returns user + sessionToken)
- `POST /api/auth/logout` - Revoke session token
- `GET /api/auth/user/:id` - Get user by ID

**AI Journal API (Protected):**
- `POST /api/ai/analyze-journal` - AI grammar/vocabulary analysis (requires auth, 10 req/min limit)
- `POST /api/ai/generate-prompts` - Generate writing prompts (requires auth, 5 req/min limit)

**AI Exercise API (Protected):**
- `POST /api/ai/exercises/generate` - Generate AI-powered exercises (requires auth, 15 req/min limit)
  - Supports 5 exercise types: vocab, translation, fillblank, sentencebuilding, multiplechoice
  - Adaptive difficulty: beginner, intermediate, advanced
  - Dynamic generation for all 5 languages

**AI Lesson API (Protected):**
- `POST /api/ai/lessons/generate` - Generate comprehensive AI-powered lessons (requires auth, 10 req/min limit)
  - Dynamic lesson creation on any topic
  - Includes vocabulary (8-12 words), grammar points (3-5), cultural notes (3-5)
  - Adaptive difficulty: beginner, intermediate, advanced
  - Works for all 5 languages

**Progress & Gamification API (Protected):**
- `GET /api/progress` - Get user XP, level, language progress, and achievements
- `POST /api/progress/add-xp` - Add XP to user (auto-calculates level-ups)
- `POST /api/progress/update-language` - Update language-specific progress
- `GET /api/progress/streak` - Get user's current streak
- `POST /api/progress/streak` - Update streak (maintains consistency across days)

## Recent Changes (October 14, 2025)
- **🦊 NEW: Cute Fox Logo** - Added adorable fox logo symbolizing cleverness and quick learning
- **🏠 NEW: Home Button** - Added prominent home button in header for easy navigation back to dashboard
- **✨ IMPROVED: Auth Error Messages** - Enhanced login/signup with specific error messages:
  - "No account found with this email address" when email doesn't exist
  - "Incorrect password. Please try again" for wrong password
  - Network error handling with user-friendly messages
  - Loading states during authentication
- **🎨 UI/UX Enhancements** - Better visual feedback with toast notifications for all auth operations
- **🎮 GAME-LIKE PRACTICE EXPERIENCE** - Transformed AI Practice into a Duolingo-style game:
  - ❤️ Hearts/Lives System - Start with 5 hearts, lose 1 per wrong answer, practice ends at 0 hearts
  - 🎯 Visual Feedback - Correct answers bounce in green, wrong answers shake in red (custom animations)
  - 🎉 Celebration Screen - Confetti burst (canvas-confetti) and stats when completing exercises successfully
  - 🎨 Colorful UI - Game-like buttons with hover effects and smooth animations
  - 💪 Progress Tracking - Visual progress bar through exercises
  - ⚡ Immediate Feedback - Instant visual response to answers
  - ✅ Success/Failure Flows - Streak updates only on successful completion, no rewards on heart depletion
  - 🎊 Confetti Effect - Only triggers on successful completion (uses canvas-confetti library)

## Recent Changes (October 14, 2025) - Previous
- Configured for Replit environment
- Updated Vite config to use port 5000 with proper HMR setup for Replit proxy
- Installed all dependencies with pnpm
- Set up Dev Server workflow
- **✅ DATABASE FULLY OPERATIONAL: PostgreSQL database created and configured**
  - All tables created successfully: users, user_progress, language_progress, streaks, achievements
  - Database schema pushed with Drizzle ORM
  - Connection verified and tested
- **Created user authentication system with database persistence**
- **Set up database schema and storage layer**
- **Connected frontend authentication to database API**
- **Fixed critical security vulnerability: Server now enforces "learner" role for all new registrations (no client-controlled role assignment)**
- **✅ AI INTEGRATION FULLY WORKING: Configured Replit AI Integrations for OpenAI**
  - Updated to use latest gpt-5-mini model (released August 7, 2025)
  - Proper environment variable configuration (AI_INTEGRATIONS_OPENAI_BASE_URL, AI_INTEGRATIONS_OPENAI_API_KEY)
  - No API key required - charges billed to Replit credits
  - AI-powered journaling with grammar correction and vocabulary feedback
  - AI exercise generation with JSON response format
  - **Fixed localStorage key mismatch**: Updated AI Practice page to use correct session token key ("ltai_session")
- **Added rich topic content with detailed learning materials for all 5 languages (Spanish, French, Japanese, Chinese, English)**
- **Implemented PWA capabilities for mobile app experience (manifest, service worker, install prompt)**
- **Added authentication and rate limiting to AI endpoints (10 requests/min for analysis, 5 requests/min for prompts, 15 requests/min for exercises)**
- **🚀 FULLY FUNCTIONAL: Built comprehensive AI-Powered Practice system (Duolingo-like features)**
  - AI exercise generation API with 5 exercise types (vocab, translation, fill-blank, sentence building, grammar/culture)
  - Adaptive difficulty levels (beginner, intermediate, advanced)
  - XP and leveling system with automatic level-up calculations
  - Database-backed streak tracking with daily consistency
  - Real-time progress tracking per language
  - Achievement system framework
  - New `/ai-practice` route with full Duolingo-style learning experience
- **Disabled PWA service worker in development** to prevent caching issues
- **✨ NEW: AI-Powered Lesson Generation** (October 14, 2025)
  - Users can now generate custom lessons on any topic using AI
  - API endpoint: POST /api/ai/lessons/generate (10 req/min rate limit)
  - Generates comprehensive lessons with vocabulary, grammar, and cultural notes
  - Integrated into lesson detail pages for all 5 languages
  - Note: AI-generated lessons are temporary (not persisted to database)

## Security & Authentication
- **Session-based authentication**: Cryptographically secure session tokens (64-char hex)
- **Session management**: Server-side session storage with 24-hour expiration
- **Protected AI endpoints**: Require valid session token + database user verification
- **Rate limiting**: Per-user limits (10 req/min analysis, 5 req/min prompts)
- **Role enforcement**: Server enforces "learner" role for all new registrations

## Configuration Notes
- The Vite dev server is configured to work with Replit's proxy system
- HMR (Hot Module Reload) is properly configured for WebSocket connections through Replit's domain
- Frontend serves on 0.0.0.0:5000 to allow proxy access
- Server files use relative imports (not path aliases) to avoid Vite config loading issues
- Database uses standard PostgreSQL driver (pg) for compatibility with Replit
- AI features use Replit AI Integrations (OpenAI-compatible) - charges billed to credits
- PWA manifest and service worker enable offline capabilities and app installation
