# Quick Start Guide

## Prerequisites

- **Node.js** 18+ and npm
- **Supabase** project (free tier works) — [supabase.com](https://supabase.com)

## 1. Set Up the Database

1. Create a new Supabase project (or use an existing one)
2. Open **SQL Editor** in the Supabase Dashboard
3. Copy the contents of `../docs/backend/init-all.sql` and execute it
   - This creates all tables, triggers, RLS policies, and the demo data function

## 2. Configure Environment

Create a file `app/.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in Supabase Dashboard > Settings > API.

## 3. Install and Run

```bash
cd app
npm install
npm run dev
```

The app opens at **http://localhost:5173**.

## 4. First Launch Setup

1. The app redirects you to `/setup`
2. Enter your clinic name, your name, and your email
3. (Optional) Check **"Populate with demo data"** to load sample staff, patients, and appointments
4. Click **"Create Clinic & Send Magic Link"**
5. Check your email and click the magic link to sign in

## 5. Demo Data

If you checked the demo data option, you get:

| Data | Count | Details |
|------|-------|---------|
| Staff | 3 | 2 doctors + 1 clinic manager |
| Patients | 12 | International names, varied contacts |
| Appointments | 23 | Mix of scheduled, completed, cancelled, unassigned |
| Availability | Mon-Sat | Mon-Fri 10:00-19:00, Sat 10:00-15:00 |
| Time off | 1 | Vacation entry |

Appointments are relative to the current week, so they always look current.

### Adding Demo Data to an Existing Database

If you already completed setup without demo data, run in SQL Editor:

```sql
select seed_demo_data((select id from practice limit 1));
```

## Docker

### Prerequisites

- Docker and Docker Compose

### Steps

1. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
# Edit .env with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

2. Build and start the container:

```bash
docker compose up --build
```

3. Open **http://localhost:3000**

The Docker image uses a multi-stage build (Node.js for build, Nginx for serving) and includes security headers, gzip compression, and a health check. Final image size is ~25 MB.

---

## Tech Stack

- **Vite 6** + **React 19** + **TypeScript 5**
- **Tailwind CSS 3** + **shadcn/ui**
- **TanStack Router** (code-based routing)
- **TanStack React Query** (data fetching)
- **Supabase** (auth, database, RLS)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (http://localhost:5173) |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
