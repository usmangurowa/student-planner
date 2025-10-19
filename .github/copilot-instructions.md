# AI Agent Instructions for Student Planner

## Project Overview

**Student Planner** is a Next.js student planning assistant integrating AI-powered scheduling, task management, and calendar functionality with Supabase auth and real-time features.

**Stack**: Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui, React Hook Form + Zod, TanStack Query, Supabase (Auth/DB/Storage), Hono RPC, Vercel AI SDK (Google Gemini).

---

## Architecture & Key Patterns

### Directory Structure

```
src/
├── app/                    # Next.js App Router (protected by middleware.ts)
│   ├── (dashboard)/        # Protected routes: calendar, tasks, reminders, notifications
│   ├── auth/              # Auth callbacks (confirm-email, confirm, callback)
│   ├── api/               # Hono RPC server at /api/**
│   ├── login/, register/  # Public auth UI
│   └── onboarding/        # Post-signup profile setup
├── components/            # Presentational & client logic
│   ├── ai-elements/       # AI chat components (chat-panel, prompt-input, conversation)
│   └── ui/                # shadcn/ui primitives
├── hooks/                 # Shared hooks (use-user, use-mobile)
├── lib/
│   ├── ai/               # AI system prompt & tools (read_calendar, create_event)
│   ├── hono/             # Hono app + typed client factory (lib/hono/index.ts)
│   ├── supabase/
│   │   ├── client.ts     # Browser Supabase client
│   │   ├── server.ts     # Server Supabase client
│   │   ├── middleware.ts # Auth middleware & route gating
│   │   ├── queries/      # TanStack Query helpers
│   │   └── mutations/    # Client mutation helpers (upserts, deletes)
│   └── env.ts            # T3 env validation (server + client)
└── supabase/             # SQL migrations with RLS first design
```

### Authentication & Middleware Flow

**Middleware** (`src/middleware.ts` → `lib/supabase/middleware.ts`):

1. Not authenticated → redirect to `/login`
2. Authenticated but email not confirmed → redirect to `/auth/confirm-email`
3. Confirmed but no `user_metadata.displayName` → redirect to `/onboarding`
4. Confirmed & onboarded → allow access to `/dashboard/**`

**Public routes**: `/`, `/login`, `/register`, `/auth/*`, static assets.

### API Layer: Hono RPC

- Base path: `/api`
- Located: `src/lib/hono/index.ts`
- Pattern: Define endpoints with strict types, export typed client factory `hcWithType`
- **Chat endpoint** (`POST /api/chat`):
  - Receives `UIMessage[]` from client
  - Converts to `CoreMessage[]` via `convertToModelMessages()`
  - Always prepends system prompt if absent
  - Streams response via `streamText()` → `toDataStreamResponse()`
  - Use case: Stuplan AI assistant for scheduling & task extraction

### AI / Chat Integration

**System Prompt** (`src/lib/ai/index.ts`):

- Role: "Stuplan", a student-planning assistant
- Capabilities: schedule planning, task extraction, conflict detection
- Tools: `read_calendar`, `create_event` (stub implementations)
- Output format: summary + optional structured actions (tasks/events)

**Chat Panel** (`src/components/ai-elements/chat-panel.tsx`):

- Uses `useChat` from `@ai-sdk/react`
- Persists chat history to localStorage (user-scoped via `user.id`)
- Rehydrates on mount via `initialMessages`
- Syncs new messages (user & assistant) via `onFinish` callback

### Data & User Context

- **useUser()** hook: Fetches `auth.user` and linked `profiles` row
- **user_metadata**: Stored in `auth.users.user_metadata` (displayName, profileComplete)
- **Profiles table**: RLS enforces read/insert/update only by owner
- **Chat history**: Stored in `localStorage` with key pattern `${userId}-chats-history`

---

## AI/Chat Workflow (Latest Pattern)

### Sending Messages

1. User types prompt in `<PromptInput>`, triggers `onSubmit`
2. Extract text, call `sendMessage({ text, files? })`
3. `useChat` appends user message to `messages`
4. Client sends `POST /api/chat?userId=${userId}` with message array + custom headers
5. Server receives, validates, prepends system prompt if needed, streams response
6. Response streams back to client; `useChat` appends assistant message
7. `onFinish` callback fires → `setChatHistory([...prev, assistantMessage])`

### Including User ID in Requests

**Option 1 (Recommended)**: Query parameter

```typescript
const { messages, sendMessage } = useChat({
  api: `/api/chat?userId=${data?.id}`,
  // ...
});
```

Server extracts: `const userId = c.req.query("userId")`

**Option 2**: Custom header

```typescript
const { messages, sendMessage } = useChat({
  api: "/api/chat",
  headers: { "X-User-ID": data?.id || "" },
  // ...
});
```

Server extracts: `const userId = c.req.header("X-User-ID")`

**Option 3**: Request body (less clean)

```typescript
const { messages, sendMessage } = useChat({
  api: "/api/chat",
  body: { userId: data?.id },
  // ...
});
```

### Key Properties

- **localStorage key**: `${userId}-chats-history` (user-scoped; persists across sessions)
- **initialMessages**: Hydrate useChat with stored history on mount
- **onFinish**: Hook to save new assistant messages
- **System prompt enforcement**: Always prepend in Hono handler if absent

---

## Forms & Validation

- Use **React Hook Form** + **Zod** for validation
- Schema defined in same file as form component
- Submit handlers: keep small, show success/error via `sonner` toast
- Client forms in `src/components`; server mutations via Supabase RLS

---

## Data Flow: Queries & Mutations

- **TanStack Query** for data fetching post-auth (e.g., profile, events)
- Query keys: flat arrays like `['profile']` or `['events', userId]`
- **Mutations**: use Supabase client with RLS; prefer simple table ops via mutation helpers
- **Complex logic**: use Hono RPC (`src/lib/hono/`)

---

## Coding Standards & Conventions

### Naming

- **Files**: `kebab-case` (e.g., `chat-panel.tsx`, `use-mobile.ts`)
- **Components**: `PascalCase` (e.g., `ChatPanel`, `PromptInput`)
- **Variables/functions**: `camelCase` (e.g., `const sendMessage = () => {}`)
- **Types/Interfaces**: `PascalCase` (e.g., `type ChatMessage`, `interface UserProfile`)
- **Database columns & user_metadata**: `snake_case` (e.g., `display_name`, `profile_complete`)

### Best Practices

- **Early returns**: avoid deep nesting
- **No deep `any`**: use strict TypeScript in public APIs
- **Comments**: only for non-obvious rationale
- **File size**: keep components <300 lines; extract utilities
- **Error handling**: surface helpful messages; fail open in middleware to prevent lockouts

---

## UI/UX Conventions

- **shadcn/ui** components with consistent spacing & typography
- **Forms**: clear labels, inline errors, disabled submit during loading
- **Onboarding**: minimal, single-field-per-step pattern
- **Chat**: streaming messages, "Thinking…" loading state, message history preservation

---

## Common Tasks

### Add a New Chat-Like AI Feature

1. Define system prompt & tools in `src/lib/ai/index.ts`
2. Create Hono endpoint in `src/lib/hono/index.ts` (e.g., `/analyze`, `/suggest`)
3. Create client component using `useChat` with appropriate `api` endpoint
4. Persist history to localStorage if needed (follow chat-panel pattern)
5. Wire user context via query param or header

### Add a Protected Route

1. Create folder under `src/app/(dashboard)/`
2. Add to `protected_routes` array in `src/lib/supabase/middleware.ts`
3. Middleware will auto-gate; ensure user is onboarded

### Add a Database Table

1. Create `.sql` migration in `supabase/migrations/`
2. Include **RLS policies** (select/insert/update/delete by owner or role)
3. Run `supabase migration up` (or use Supabase CLI)
4. Regenerate types: `npm run db:generate`
5. Create query/mutation helpers in `lib/supabase/queries/` or `mutations/`

---

## Environment & Deployment

- **Env vars**: T3 env validation in `src/lib/env.ts`; split into server/client/shared
- **Supabase**: PostgreSQL backend with RLS; Auth, Storage, Realtime
- **Vercel**: Next.js hosting; API routes supported via Hono
- **AI Model**: Google Gemini 2.5 Flash via `@ai-sdk/google`

---

## Quick Reference: File Locations

- Chat logic: `src/components/ai-elements/chat-panel.tsx`
- System prompt: `src/lib/ai/index.ts`
- API endpoints: `src/lib/hono/index.ts`
- Auth middleware: `src/lib/supabase/middleware.ts`
- User hook: `src/hooks/use-user.ts`
- UI components: `src/components/ui/` (shadcn/ui)
- Env config: `src/lib/env.ts`
