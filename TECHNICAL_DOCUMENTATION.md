# LinguaTrack AI - Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Frontend Implementation](#frontend-implementation)
4. [Backend Implementation](#backend-implementation)
5. [Database Design](#database-design)
6. [API Documentation](#api-documentation)
7. [Authentication & Security](#authentication--security)
8. [AI Integration](#ai-integration)
9. [Deployment](#deployment)
10. [Development Guide](#development-guide)

---

## 1. System Overview

### 1.1 Project Description
LinguaTrack AI is a full-stack web application designed for personalized language learning. It leverages artificial intelligence to provide adaptive learning experiences, gamified progress tracking, and real-time feedback across five languages: English, Spanish, French, Japanese, and Mandarin Chinese.

### 1.2 Technology Stack

#### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7.1.12
- **Styling**: TailwindCSS 3 with Tailwind Animate
- **Routing**: React Router 6
- **UI Components**: Radix UI, Lucide React Icons
- **State Management**: React Query (TanStack Query)
- **Animations**: Framer Motion, Canvas Confetti
- **Form Handling**: React Hook Form with Zod validation

#### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon-backed)
- **ORM**: Drizzle ORM
- **Authentication**: Session-based with bcrypt password hashing
- **AI Integration**: OpenAI API (via Replit AI Integrations)

#### Development Tools
- **Package Manager**: pnpm
- **Testing**: Vitest
- **Type Checking**: TypeScript
- **Database Migrations**: Drizzle Kit

---

## 2. Architecture

### 2.1 System Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │           React SPA (Port 5000)                   │  │
│  │  - Pages, Components, Hooks                       │  │
│  │  - State Management (React Query)                 │  │
│  │  - Routing (React Router)                         │  │
│  └───────────────┬───────────────────────────────────┘  │
└──────────────────┼──────────────────────────────────────┘
                   │ HTTP/HTTPS
                   │ REST API
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Vite Dev Server (Port 5000)                 │
│  ┌────────────────────────────────────────────────┐     │
│  │         Express.js Backend                     │     │
│  │  ┌──────────────────────────────────────────┐  │     │
│  │  │  Routes Layer                            │  │     │
│  │  │  - /api/auth/*                           │  │     │
│  │  │  - /api/ai/*                             │  │     │
│  │  │  - /api/progress/*                       │  │     │
│  │  └──────────────┬───────────────────────────┘  │     │
│  │                 │                                │     │
│  │  ┌──────────────▼───────────────────────────┐  │     │
│  │  │  Middleware Layer                        │  │     │
│  │  │  - Authentication                        │  │     │
│  │  │  - Rate Limiting                         │  │     │
│  │  │  - CORS                                  │  │     │
│  │  └──────────────┬───────────────────────────┘  │     │
│  └────────────────┼────────────────────────────────┘     │
└───────────────────┼──────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐      ┌────────────────┐
│  PostgreSQL   │      │  OpenAI API    │
│   Database    │      │  (gpt-3.5)     │
└───────────────┘      └────────────────┘
```

### 2.2 Directory Structure

```
linguatrack-ai/
├── client/                    # Frontend application
│   ├── components/           # React components
│   │   ├── ui/              # Radix UI components
│   │   ├── MainLayout.tsx   # Main app layout
│   │   ├── Logo.tsx         # Logo component
│   │   └── ...
│   ├── pages/               # Route pages
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── AIPractice.tsx
│   │   ├── Journal.tsx
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.tsx      # Authentication hook
│   ├── lib/                 # Utility functions
│   │   └── utils.ts
│   ├── data/                # Static data
│   │   ├── languages.ts
│   │   └── challenges.ts
│   ├── App.tsx              # Main app component
│   └── global.css           # Global styles
│
├── server/                   # Backend application
│   ├── routes/              # API route handlers
│   │   ├── auth.ts          # Authentication endpoints
│   │   ├── ai-journal.ts    # AI journal analysis
│   │   ├── ai-exercises.ts  # AI exercise generation
│   │   ├── ai-lessons.ts    # AI lesson generation
│   │   ├── progress.ts      # Progress tracking
│   │   └── demo.ts
│   ├── middleware/          # Express middleware
│   │   └── auth.ts          # Auth & rate limiting
│   ├── db.ts                # Database connection
│   ├── sessions.ts          # Session management
│   ├── storage.ts           # Database operations
│   └── index.ts             # Server entry point
│
├── shared/                   # Shared code (client & server)
│   ├── api.ts               # API type definitions
│   ├── schema.ts            # Database schema (Drizzle)
│   └── topic-content.ts     # Lesson content
│
├── public/                   # Static assets
│   ├── favicon.ico
│   ├── logo.svg
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service worker
│
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind configuration
├── drizzle.config.ts        # Drizzle ORM configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

### 2.3 Communication Flow

1. **User Interaction**: User interacts with React frontend
2. **API Request**: Frontend makes HTTP request to `/api/*` endpoints
3. **Middleware Processing**: Express middleware validates auth & rate limits
4. **Route Handler**: Specific route handler processes the request
5. **Database/AI Operation**: Handler interacts with PostgreSQL or OpenAI API
6. **Response**: JSON response sent back to frontend
7. **UI Update**: React component updates based on response

---

## 3. Frontend Implementation

### 3.1 Component Architecture

#### Pages (Route Components)
- **Index.tsx**: Landing page
- **Login.tsx**: User login with form validation
- **SignUp.tsx**: User registration
- **Dashboard.tsx**: Main dashboard with language cards
- **AIPractice.tsx**: AI-powered practice exercises with gamification
- **Journal.tsx**: AI journal with grammar analysis
- **LessonDetail.tsx**: Language-specific lessons with AI generation
- **Progress.tsx**: Progress visualization with charts
- **Profile.tsx**: User profile management
- **Admin.tsx**: Admin dashboard (role-restricted)

#### Reusable Components
- **MainLayout.tsx**: App shell with navigation
- **Logo.tsx**: Fox logo component
- **ThemeToggle.tsx**: Dark/light mode switcher
- **BackButton.tsx**: Navigation back button
- **PWAInstall.tsx**: Progressive Web App install prompt

### 3.2 State Management

#### Authentication State (`useAuth` hook)
```typescript
interface User {
  email: string;
  name: string;
  role: 'learner' | 'admin';
}

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  // Login, logout, register functions
};
```

#### Local State Management
- Component-level state with `useState`
- Form state with `react-hook-form`
- Server state with `@tanstack/react-query`

### 3.3 Routing Structure

```typescript
<Routes>
  {/* Public routes */}
  <Route path="/" element={<Index />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<SignUp />} />
  
  {/* Protected routes */}
  <Route element={<RequireAuth />}>
    <Route element={<MainLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ai-practice" element={<AIPractice />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/lessons/:lang" element={<LessonDetail />} />
      <Route path="/progress" element={<Progress />} />
      
      {/* Admin-only routes */}
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Route>
  </Route>
</Routes>
```

### 3.4 Key Frontend Features

#### AI Practice Session Flow
1. User selects language, exercise type, and difficulty
2. Frontend calls `/api/ai/exercises/generate`
3. Receives 5 AI-generated exercises
4. Displays exercises with hearts/lives system
5. Provides visual feedback (animations, confetti)
6. Updates XP and streak on completion

#### Journal Analysis Flow
1. User writes journal entry
2. Frontend calls `/api/ai/analyze-journal`
3. Receives grammar corrections, vocabulary, and feedback
4. Displays analysis with highlighted corrections
5. Saves entry to database

---

## 4. Backend Implementation

### 4.1 Server Configuration

#### Express Server Setup (`server/index.ts`)
```typescript
export async function createServer() {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Cache control for development
  app.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
  });
  
  // API routes
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  // ... more routes
  
  return app;
}
```

#### Vite Integration
The Express backend is integrated into Vite dev server via a custom plugin:
```typescript
function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    async configureServer(server) {
      const { createServer } = await import("./server/index.js");
      const app = await createServer();
      server.middlewares.use(app);
    },
  };
}
```

### 4.2 Middleware

#### Authentication Middleware (`server/middleware/auth.ts`)
```typescript
export const requireAuth: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
  
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const session = await getSession(token);
  if (!session || session.expiresAt < Date.now()) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
  
  next();
};
```

#### Rate Limiting Middleware
```typescript
export const rateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const userRequests = requests.get(key) || [];
    
    // Filter requests within window
    const recentRequests = userRequests.filter(
      time => now - time < windowMs
    );
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({ 
        error: "Rate limit exceeded" 
      });
    }
    
    recentRequests.push(now);
    requests.set(key, recentRequests);
    next();
  };
};
```

### 4.3 Session Management

#### Session Storage (`server/sessions.ts`)
```typescript
interface Session {
  token: string;
  userId: number;
  expiresAt: number;
}

const sessions = new Map<string, Session>();

export function createSession(userId: number): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  sessions.set(token, { token, userId, expiresAt });
  return token;
}

export function getSession(token: string): Session | undefined {
  return sessions.get(token);
}

export function deleteSession(token: string): void {
  sessions.delete(token);
}
```

---

## 5. Database Design

### 5.1 Database Schema (`shared/schema.ts`)

#### Users Table
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 50 }).notNull().default("learner"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

#### User Progress Table
```typescript
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

#### Language Progress Table
```typescript
export const languageProgress = pgTable("language_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  language: varchar("language", { length: 50 }).notNull(),
  fluencyPercentage: integer("fluency_percentage").notNull().default(0),
  lessonsCompleted: integer("lessons_completed").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

#### Streaks Table
```typescript
export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityDate: date("last_activity_date"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

#### Achievements Table
```typescript
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementType: varchar("achievement_type", { length: 100 }).notNull(),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
});
```

### 5.2 Database Operations (`server/storage.ts`)

#### User Operations
- `createUser(email, passwordHash, name)`: Create new user
- `getUserByEmail(email)`: Retrieve user by email
- `getUserById(id)`: Retrieve user by ID

#### Progress Operations
- `getUserProgress(userId)`: Get XP and level
- `addXP(userId, amount)`: Add XP and calculate level-ups
- `getLanguageProgress(userId)`: Get progress for all languages
- `updateLanguageProgress(userId, language, data)`: Update specific language progress

#### Streak Operations
- `getStreak(userId)`: Get current streak
- `updateStreak(userId)`: Update streak based on current date

---

## 6. API Documentation

### 6.1 Authentication Endpoints

#### POST `/api/auth/register`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "role": "learner"
  },
  "sessionToken": "abc123..."
}
```

**Error Responses:**
- `400`: Email already exists
- `500`: Internal server error

---

#### POST `/api/auth/login`
Authenticate user and create session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "role": "learner"
  },
  "sessionToken": "abc123..."
}
```

**Error Responses:**
- `401`: Invalid credentials
- `404`: User not found

---

#### POST `/api/auth/logout`
Revoke session token.

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 6.2 AI Endpoints (Protected)

#### POST `/api/ai/analyze-journal`
Analyze journal entry for grammar and vocabulary.

**Headers:**
```
Authorization: Bearer {sessionToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "I go to school yesterday.",
  "targetLanguage": "English"
}
```

**Response (200):**
```json
{
  "corrected": "I went to school yesterday.",
  "corrections": [
    {
      "from": "go",
      "to": "went",
      "reason": "Past tense required for 'yesterday'"
    }
  ],
  "vocabulary": [
    {
      "word": "yesterday",
      "meaning": "the day before today",
      "example": "I saw her yesterday at the park."
    }
  ],
  "feedback": "Good sentence structure! Remember to use past tense with time indicators like 'yesterday'."
}
```

**Rate Limit:** 10 requests per minute per user

---

#### POST `/api/ai/exercises/generate`
Generate AI-powered practice exercises.

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Request Body:**
```json
{
  "language": "spanish",
  "type": "vocab",
  "difficulty": "beginner",
  "count": 5
}
```

**Exercise Types:**
- `vocab`: Vocabulary matching
- `translation`: Translation exercises
- `fillblank`: Fill-in-the-blank
- `sentencebuilding`: Sentence construction
- `multiplechoice`: Grammar/culture questions

**Difficulty Levels:**
- `beginner`
- `intermediate`
- `advanced`

**Response (200):**
```json
{
  "exercises": [
    {
      "id": "ai_vocab_1234567890_0",
      "type": "vocab",
      "question": "What does 'hola' mean in English?",
      "options": ["hello", "goodbye", "thanks", "please"],
      "answer": "hello",
      "explain": "'Hola' is the most common greeting in Spanish.",
      "difficulty": "beginner"
    }
  ]
}
```

**Rate Limit:** 15 requests per minute per user

---

#### POST `/api/ai/lessons/generate`
Generate comprehensive AI lesson on a topic.

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Request Body:**
```json
{
  "language": "French",
  "topic": "Ordering Food at a Restaurant",
  "level": "intermediate"
}
```

**Response (200):**
```json
{
  "lesson": {
    "name": "Ordering Food at a Restaurant",
    "goals": [
      "Learn restaurant vocabulary",
      "Master ordering phrases",
      "Understand menu terms"
    ],
    "minutes": 25,
    "description": "Learn how to confidently order food in French restaurants",
    "vocabulary": [
      {
        "word": "le menu",
        "translation": "the menu",
        "example": "Puis-je voir le menu, s'il vous plaît?"
      }
    ],
    "grammar": [
      {
        "point": "Polite requests with 'Je voudrais'",
        "explanation": "Use 'Je voudrais' (I would like) for polite requests",
        "examples": ["Je voudrais un café", "Je voudrais l'addition"]
      }
    ],
    "culturalNotes": [
      "In France, it's polite to greet the server before ordering",
      "Tipping is not mandatory but appreciated (5-10%)"
    ]
  }
}
```

**Rate Limit:** 10 requests per minute per user

---

### 6.3 Progress Endpoints (Protected)

#### GET `/api/progress`
Get user's overall progress.

**Headers:**
```
Authorization: Bearer {sessionToken}
```

**Response (200):**
```json
{
  "xp": 1250,
  "level": 5,
  "languageProgress": [
    {
      "language": "spanish",
      "fluencyPercentage": 35,
      "lessonsCompleted": 12
    }
  ],
  "achievements": [
    {
      "type": "first_lesson",
      "unlockedAt": "2025-10-15T10:30:00Z"
    }
  ]
}
```

---

#### POST `/api/progress/add-xp`
Add XP to user (auto-calculates level-ups).

**Request Body:**
```json
{
  "amount": 50
}
```

**Response (200):**
```json
{
  "xp": 1300,
  "level": 6,
  "leveledUp": true
}
```

---

#### GET `/api/progress/streak`
Get user's current streak.

**Response (200):**
```json
{
  "currentStreak": 7,
  "longestStreak": 14,
  "lastActivityDate": "2025-10-27"
}
```

---

#### POST `/api/progress/streak`
Update streak (maintains daily consistency).

**Response (200):**
```json
{
  "currentStreak": 8,
  "longestStreak": 14,
  "continued": true
}
```

---

## 7. Authentication & Security

### 7.1 Password Security

#### Hashing with bcrypt
```typescript
import bcrypt from "bcrypt";

// Registration
const saltRounds = 10;
const passwordHash = await bcrypt.hash(password, saltRounds);

// Login verification
const isValid = await bcrypt.compare(password, user.passwordHash);
```

### 7.2 Session Management

#### Session Token Generation
- 64-character hexadecimal string
- Cryptographically secure random bytes
- 24-hour expiration
- Server-side storage (in-memory Map)

```typescript
const token = crypto.randomBytes(32).toString('hex');
```

### 7.3 Authorization

#### Role-Based Access Control
- **Learner**: Standard user role (default)
- **Admin**: Administrative access to admin panel

#### Protected Route Example
```typescript
app.get("/api/admin/stats", requireAuth, async (req, res) => {
  const session = await getSession(req.headers.authorization);
  const user = await getUserById(session.userId);
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  // Proceed with admin functionality
});
```

### 7.4 Rate Limiting

Rate limits prevent abuse of AI endpoints:
- Journal analysis: 10 requests/minute
- Prompt generation: 5 requests/minute
- Exercise generation: 15 requests/minute
- Lesson generation: 10 requests/minute

### 7.5 Security Best Practices

1. **Password Requirements**: Enforced on client and server
2. **SQL Injection Prevention**: Drizzle ORM parameterized queries
3. **XSS Prevention**: React's built-in escaping
4. **CORS Configuration**: Proper origin validation
5. **HTTPS Only**: In production deployment
6. **Session Expiration**: 24-hour timeout
7. **Input Validation**: Zod schema validation

---

## 8. AI Integration

### 8.1 OpenAI Configuration

#### Setup (via Replit AI Integrations)
```typescript
import OpenAI from "openai";

export function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
}
```

**Benefits:**
- No API key management required
- Automatic billing to Replit credits
- Pre-configured base URL
- Rate limiting handled by Replit

### 8.2 AI Model Usage

**Current Model:** `gpt-3.5-turbo`
- Fast response times
- Cost-effective
- Suitable for educational content
- JSON mode support

### 8.3 Prompt Engineering

#### Journal Analysis Prompt
```typescript
const systemPrompt = `You are a language learning assistant. 
Analyze the user's text for grammar, spelling, vocabulary, 
and language learning insights. Provide:
1. Corrected version of the text
2. List of specific corrections with explanations
3. Vocabulary suggestions for language learners
4. Overall feedback on their ${language} writing

Format your response as JSON...`;
```

#### Exercise Generation Prompt
```typescript
const prompt = `Generate ${count} ${type} exercises for ${language} 
at ${difficulty} level. 

For each exercise:
- Create an engaging question
- Provide 4 plausible options
- Include the correct answer
- Add a brief explanation

Return ONLY a JSON object...`;
```

### 8.4 Response Parsing

```typescript
const completion = await getOpenAI().chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userInput }
  ],
  response_format: { type: "json_object" },
  max_completion_tokens: 1024,
});

const result = JSON.parse(completion.choices[0].message.content);
```

### 8.5 Error Handling

```typescript
try {
  const result = await generateAIContent();
  res.json(result);
} catch (error) {
  if (error?.status === 429) {
    return res.status(429).json({ 
      error: "Rate limit exceeded" 
    });
  }
  if (error?.status === 401) {
    return res.status(502).json({ 
      error: "AI service authentication failed" 
    });
  }
  res.status(500).json({ error: "AI generation failed" });
}
```

---

## 9. Deployment

### 9.1 Environment Variables

Required environment variables:
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database
PGHOST=host
PGPORT=5432
PGUSER=user
PGPASSWORD=password
PGDATABASE=database

# AI Integration (Replit-managed)
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
AI_INTEGRATIONS_OPENAI_BASE_URL=https://...

# Replit
REPLIT_DOMAINS=app-domain.repl.co
```

### 9.2 Build Process

```bash
# Install dependencies
pnpm install

# Type checking
pnpm typecheck

# Build production bundle
pnpm build

# Output: dist/spa/ (frontend static files)
```

### 9.3 Production Server

```bash
# Start production server
pnpm start

# Serves on port 5000
# Includes both API and static files
```

### 9.4 Database Migrations

```bash
# Push schema changes to database
pnpm db:push

# Generate migration files (if needed)
npx drizzle-kit generate
```

### 9.5 Performance Optimization

1. **Code Splitting**: Vite automatic chunk splitting
2. **Tree Shaking**: Removes unused code
3. **Minification**: Production build minifies JS/CSS
4. **Caching**: Static assets with cache headers
5. **Lazy Loading**: React.lazy for route components

---

## 10. Development Guide

### 10.1 Setup Instructions

```bash
# Clone repository
git clone <repository-url>
cd linguatrack-ai

# Install dependencies
pnpm install

# Set up database (if using local PostgreSQL)
# Update .env with DATABASE_URL

# Push database schema
pnpm db:push

# Start development server
pnpm dev

# Open http://localhost:5000
```

### 10.2 Development Workflow

1. **Frontend Development**: Edit files in `client/`
   - Hot Module Replacement (HMR) active
   - Changes reflect immediately in browser

2. **Backend Development**: Edit files in `server/`
   - Server restarts automatically
   - API changes available immediately

3. **Database Changes**: Edit `shared/schema.ts`
   - Run `pnpm db:push` to apply changes

### 10.3 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Type checking
pnpm typecheck
```

### 10.4 Code Quality

```bash
# Format code
pnpm prettier --write .

# Lint code
pnpm eslint .
```

### 10.5 Debugging

#### Frontend Debugging
- React DevTools browser extension
- Browser console for logs
- Network tab for API requests

#### Backend Debugging
- Console logs in terminal
- Postman/Insomnia for API testing
- Database query logs

### 10.6 Common Issues & Solutions

#### Issue: Vite HMR not working
**Solution:** Check that `server.hmr` is configured with correct domain in `vite.config.ts`

#### Issue: Database connection failed
**Solution:** Verify `DATABASE_URL` and ensure PostgreSQL is running

#### Issue: AI API errors
**Solution:** Check `AI_INTEGRATIONS_OPENAI_API_KEY` is set and valid

#### Issue: Session not persisting
**Solution:** Check session token is stored in localStorage as `ltai_session`

---

## Appendix

### A. API Rate Limits Summary

| Endpoint | Rate Limit |
|----------|------------|
| `/api/ai/analyze-journal` | 10 req/min |
| `/api/ai/generate-prompts` | 5 req/min |
| `/api/ai/exercises/generate` | 15 req/min |
| `/api/ai/lessons/generate` | 10 req/min |

### B. Supported Languages

| Language | Code | Emoji |
|----------|------|-------|
| English | en | 🇬🇧 |
| Spanish | spanish | 🇪🇸 |
| French | french | 🇫🇷 |
| Japanese | japanese | 🇯🇵 |
| Chinese | chinese | 🇨🇳 |

### C. XP and Leveling Formula

```typescript
// XP required for level n
const xpForLevel = (level: number) => level * 100;

// Calculate level from XP
const calculateLevel = (xp: number) => {
  let level = 1;
  let totalXP = 0;
  
  while (totalXP + xpForLevel(level + 1) <= xp) {
    totalXP += xpForLevel(level + 1);
    level++;
  }
  
  return level;
};
```

### D. Exercise Type Definitions

```typescript
type ExerciseType = 
  | 'vocab'              // Vocabulary matching
  | 'translation'        // Translation exercises
  | 'fillblank'         // Fill-in-the-blank
  | 'sentencebuilding'  // Sentence construction
  | 'multiplechoice';   // Grammar/culture quiz
```

---

**Document Version:** 1.0  
**Last Updated:** October 27, 2025  
**Prepared for:** Academic Submission
