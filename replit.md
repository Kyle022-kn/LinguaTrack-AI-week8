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

## Recent Changes (October 14, 2025)
- Configured for Replit environment
- Updated Vite config to use port 5000 with proper HMR setup for Replit proxy
- Installed all dependencies with pnpm
- Set up Dev Server workflow

## Configuration Notes
- The Vite dev server is configured to work with Replit's proxy system
- HMR (Hot Module Reload) is properly configured for WebSocket connections through Replit's domain
- Frontend serves on 0.0.0.0:5000 to allow proxy access
