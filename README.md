# Team Task Manager

A team task management web app: projects, members, role-based access, a Kanban board, and an analytics dashboard.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **Prisma 6** ORM against any Postgres (Supabase, Neon, Railway, local — pick one)
- **Custom auth**: bcrypt password hashing + signed JWT in HTTP-only cookies (no third-party auth service)
- **shadcn/ui** + Tailwind CSS v4
- react-hook-form + zod, recharts, lucide-react, date-fns, sonner

## Features

- Email + password signup / login / logout (JWT session cookie, 30-day expiry)
- Create projects (creator becomes admin), invite members by email, manage roles
- Kanban board (To Do / In Progress / Done) with title, description, due date, priority, assignee
- Overdue badge for past-due tasks
- Members can only update tasks assigned to them; admins manage everything in their project
- Dashboard with stat cards, status pie chart, per-assignee bar chart, and overdue list

## Local setup

### 1. Install

```bash
npm install
```

This runs `prisma generate` automatically via `postinstall`.

### 2. Configure environment

Copy `.env.example` to `.env` (Prisma reads `.env`; Next.js reads both `.env` and `.env.local`):

```bash
cp .env.example .env
```

Fill in:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"
AUTH_SECRET="<48 random bytes, base64url-encoded>"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Generate the auth secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

If you're using Supabase as your Postgres host, get both connection strings from
**Project Settings → Database → Connection string** (use the *Pooler* URL for `DATABASE_URL` and *Direct connection* for `DIRECT_URL` if you'll deploy to a serverless platform; for purely local dev they can be the same).

### 3. Run migrations

```bash
npx prisma migrate dev
```

This creates the `users`, `projects`, `project_members`, and `tasks` tables.

### 4. Start dev

```bash
npm run dev
```

Open http://localhost:3000, hit signup, and you're in.

## Project structure

```
app/
  (auth)/                # /login, /signup
  (dashboard)/           # protected — sidebar + topbar layout
    dashboard/           # analytics page
    projects/            # list, /new, /[id], /[id]/members
    settings/
components/
  ui/                    # shadcn primitives
  features/              # auth, layout, projects, tasks, dashboard
lib/
  prisma.ts              # singleton Prisma client
  auth/
    password.ts          # bcrypt hash/verify
    session.ts           # JWT sign / verify, cookie helpers
    current-user.ts      # getCurrentUser() / requireUser()
    authz.ts             # project membership / admin checks
  actions/               # Server Actions (auth, projects, members, tasks)
  validations/           # zod schemas
prisma/
  schema.prisma          # data model
  migrations/            # generated migration history
proxy.ts                 # session cookie check on every request
types/database.ts        # domain type aliases over Prisma types
```

## How role-based access is enforced

There's no Postgres RLS in this stack — Prisma connects with full DB privileges. Authorization is enforced in app code:

- **`requireUser()`** — every Server Action and protected page resolves the JWT cookie to a user, redirects to `/login` if missing.
- **`requireMembership(projectId, userId)`** — gates project-scoped operations to project members.
- **`requireAdmin(projectId, userId)`** — gates admin-only operations (invite, remove member, role changes, project + task delete).
- **Per-task edit check** — for `updateTaskAction`, members can edit only when `assigneeId === userId`; admins can edit anything in their project.

The UI mirrors these checks: admin-only buttons are hidden or disabled for non-admins. Both layers run on every request.

## Deployment to Railway

1. Push to GitHub.
2. Railway → **New Project → Deploy from GitHub repo**.
3. Add env vars: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`.
4. Railway runs `npm install` (which runs `prisma generate`), then `npm run build` (which runs `prisma generate && next build`), then `npm start`.
5. **Generate domain** in Railway → Settings → Networking. Update `NEXT_PUBLIC_SITE_URL` to that domain.
6. Run migrations against prod once after first deploy:
   - Locally with the prod `DIRECT_URL` exported, run `npx prisma migrate deploy`.

## Scripts

```bash
npm run dev     # dev server
npm run build   # prisma generate + next build
npm start       # production server (binds to $PORT)
npm run lint    # eslint
npx prisma studio   # GUI to browse the DB
npx prisma migrate dev --name <change>   # add a new migration
```
