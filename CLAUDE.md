# Claude Code Guidelines — Dental Scheduling MVP

**Project:** Dental Appointment Scheduling MVP  
**Version:** 1.0 (2026-04-10)  
**Status:** MVP Complete (28/28 stories)  
**Branch:** `redesign/ui-ux-pro-max` (UI/UX improvements)

---

## 🎯 Project Overview

**What:** A real Product Owner case study — end-to-end dental appointment scheduling system designed to replace Google Calendar for small dental clinics.

**Why:** Small clinics typically manage scheduling through fragmented tools (Google Calendar, messaging apps, spreadsheets), leading to:
- Double bookings
- Unclear staff availability
- Operational friction when doctors become unavailable
- Lack of visibility into patient lifecycle

**MVP Goal:** Validate whether dentists will adopt a purpose-built scheduling system as their primary tool.

**Status:** Fully functional, ready for pilot validation with real clinics.

---

## 🏗️ Basic Architecture

```
┌─────────────────────────────────────────┐
│   Frontend (React 19 + TypeScript)      │
│   ├─ Pages: Schedule, Appointments,     │
│   │  Patients, Staff, Settings          │
│   └─ State: TanStack Query + Router     │
└────────────────┬────────────────────────┘
                 │
        (PostgREST API)
                 │
┌────────────────▼────────────────────────┐
│   Backend (Supabase / PostgreSQL)       │
│   ├─ RLS (Row-Level Security)           │
│   ├─ Triggers (business rules)          │
│   ├─ RPC functions (complex ops)        │
│   └─ Constraints (appointments, slots)  │
└─────────────────────────────────────────┘
```

**Key Principle:** Business rules are enforced at the database level, not in frontend code. Every appointment state change goes through backend validation.

---

## 💻 Technology Stack

### Frontend
| Layer | Technology | Notes |
|-------|-----------|-------|
| **Runtime** | React 19 | Latest version with hooks |
| **Language** | TypeScript 5.7 | Full type safety |
| **Build** | Vite 6.1 | Fast dev server, HMR enabled |
| **Routing** | TanStack Router | Type-safe route definitions |
| **State** | TanStack Query 5.6 | Server state + caching |
| **UI Components** | Radix UI + shadcn/ui | Accessible, unstyled |
| **Styling** | Tailwind CSS 3.4 | Utility-first, theming |
| **Icons** | Lucide React | 575+ icons |
| **Testing** | Vitest + Testing Library | Component & integration tests |

### Backend
| Component | Technology | Notes |
|-----------|-----------|-------|
| **Database** | PostgreSQL | Via Supabase |
| **API** | PostgREST | Auto-generated REST API |
| **Auth** | Supabase Auth | Email/password, RLS integration |
| **RLS** | PostgreSQL Row-Level Security | Policy-based access control |
| **Triggers** | PostgreSQL Functions | Enforce business rules |
| **RPCs** | SQL Functions | Complex operations (reassign, complete) |

### Deployment
| Tool | Purpose |
|------|---------|
| Docker | Containerized frontend |
| Nginx | Reverse proxy + static serving |
| Supabase Cloud | Hosted PostgreSQL + API |

---

## 📁 Project Structure

```
dental-scheduling-mvp/
├── docs/                          # Product documentation (38 files)
│   ├── discovery/                 # Product discovery (vision, scope, roadmap)
│   │   ├── executive-summary.md   # MVP hypothesis & outcome
│   │   ├── product-vision.md      # Problem statement, principles
│   │   ├── mvp-scope.md           # In/out of scope, user flows
│   │   └── roadmap.md             # Phases 1–6, pilot validation
│   ├── architecture/              # System design artifacts
│   │   ├── contracts/             # Domain contracts
│   │   │   ├── domain-ui.md       # Roles, pages, business rules
│   │   │   └── appointment-lifecycle.md  # Status flow, triggers
│   │   ├── system/                # C4 diagrams (context, container)
│   │   ├── backend/               # SQL schema, RLS, triggers, seed
│   │   └── ui/                    # UI component specs, pages
│   ├── decisions/                 # Product decisions (PDR-001–PDR-005)
│   ├── delivery/                  # Backlog & stories (12 epics, 28+ stories)
│   └── screenshots/               # Visual assets
│
├── app/                           # Frontend application (React)
│   ├── src/
│   │   ├── pages/               # Route pages (Schedule, Appointments, etc.)
│   │   ├── components/          # Reusable UI components
│   │   ├── lib/                 # Utilities & hooks
│   │   │   ├── supabase.ts      # Supabase client config
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   └── api/             # API layer (queries, mutations)
│   │   ├── styles/              # Global CSS, Tailwind config
│   │   └── types/               # TypeScript types from Supabase schema
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── QUICK-START.md           # How to run locally
│
├── CLAUDE.md                      # This file
├── README.md                      # Project intro & navigation
└── MEMORY.md                      # Project memory index
```

---

## 🔧 Core Concepts

### Domain Model

**Three main lifecycles:**

1. **Staff Lifecycle**
   - Create → Activate/Deactivate → (Delete on hard reset)
   - Roles: Admin, Doctor, Clinic Manager
   - Deactivation → auto-reassign all future appointments

2. **Patient Lifecycle**
   - Create → Active/Archived → (Delete on hard reset)
   - Archived patients cannot receive new appointments
   - Can be restored

3. **Appointment Lifecycle**
   - Scheduled → Completed/Cancelled (terminal states)
   - Unassigned → (alert until reassigned)
   - Status transitions validated at backend
   - Automatic state changes via triggers

### Key Business Rules (Database-Enforced)

| Rule | Trigger | Enforcement |
|------|---------|------------|
| No double bookings | Insert appointment | UNIQUE constraint on (doctor_id, scheduled_at) |
| No booking outside availability | Insert/update appointment | CHECK + function validation |
| No scheduling archived patients | Insert appointment | Foreign key constraint |
| Deactivation triggers reassign | Update staff.is_active=false | AFTER trigger |
| Archived patient → cancel appointments | Update patient.archived_at | AFTER trigger |
| Completed/cancelled are terminal | Update appointment.status | CHECK constraint |

---

## 🌍 Global Context & Interaction Rules

### Global Instructions
All projects follow rules defined in: **`E:\My files\0 My_Dev\external_repo\ClaudeCode\my_claude\`**

#### INTERACTION_RULES.md
1. **Wait for Answers** — If a question is pending (yours or user's), wait for response before taking action
2. **Self-Explaining UI** — Every element explains itself (tooltips, hints for disabled states, empty state text)
   - No silent greyed-out buttons
   - No blank tables without explanation
   - Disabled features show WHY they're disabled

#### DOCUMENTATION_STRATEGY.md
- **Language:** English only. Russian documents archived to `docs/archive/` (gitignored)
- **Structure:** `docs/discovery/` (architecture), `docs/delivery/` (user-facing)
- **Tone:** Make definitive statements about what we control; use relative language for third-party tools
- **Example hedging:** "tends to", "may", "worth trying" instead of "always", "never", "best"

---

## 💾 Project Memory System

**Location:** `.claude/memory/` — inside the project folder, gitignored, survives reinstalls when copied/backed up with the project.

**Rule:** Every time a memory is saved, write it to `.claude/memory/`. This folder travels with the project — back it up, sync via cloud, or commit to a private repo. It won't be pushed to a public repo (`.claude/` is gitignored).

**Current Memories:**
- `project_scrollbar_alignment.md` — TimeGridCalendar header/body alignment fix
- `project_appointment_flow_direction.md` — PDR-005: doctor-first vs patient-first (deferred)
- `feedback_wait_for_answer.md` — Global interaction rules reference

**When to save new memories:**
- Non-obvious technical decisions
- Bugs and their fixes
- Patterns that recur across sessions
- User preferences & feedback about approach
- Project constraints & deadlines

---

## 🚀 Getting Started

### 1. Run the Application
```bash
cd app
npm install
npm run dev
# Opens http://localhost:5173
# Demo data pre-loaded: 6 doctors, 25 patients, 350+ appointments
```

### 2. Explore Documentation
**Start here:** [README.md](README.md) → "Where to Start" section

**Quick path for developers:**
1. [Executive Summary](docs/discovery/executive-summary.md) — 5 min
2. [MVP Scope](docs/discovery/mvp-scope.md) — understand user flows
3. [Domain ↔ UI Contract](docs/architecture/contracts/domain-ui.md) — 15 business rules
4. [Quick Start](app/QUICK-START.md) — run locally
5. [Dev Plan](docs/delivery/dev-plan.md) — 11 epics, 28 stories

### 3. Tech Notes
- **Type generation:** `npm run gen:types` (syncs Supabase schema → TypeScript)
- **Type checking:** `npm run check:types` (before commit)
- **Tests:** `npm test` or `npm run test:watch`
- **Build:** `npm run build` (outputs to `dist/`)

---

## 📋 Common Tasks

### When working on UI/UX
1. Check `docs/architecture/ui/ui.pages.md` for page specs
2. Check `docs/architecture/ui/ui.components.md` for component library
3. Apply INTERACTION_RULES.md #2 (self-explaining UI)
4. Test in Tailwind dark mode: `preview_resize` with `colorScheme: dark`

### When working on appointments
1. Review `docs/architecture/contracts/appointment-lifecycle.md` — status flow is canonical
2. Check database triggers in `docs/architecture/backend/schema.logical.md`
3. Verify backend enforces rules, don't duplicate in UI
4. Test edge cases: deactivation, archival, reassignment

### When adding a feature
1. **Product first:** Update the relevant epic/story in `docs/delivery/`
2. **Contract:** Update `docs/architecture/contracts/domain-ui.md` or appointment-lifecycle.md
3. **Backend:** Add database constraints/triggers
4. **Frontend:** Implement UI & validation
5. **Test:** Verify in demo data scenario

---

## 🔐 Authentication & Roles

**Roles in system:**
- **Admin** — full access, can deactivate doctors, archive patients, create appointments
- **Doctor** — see own schedule & appointments, cannot create new appointments
- **Clinic Manager** — create appointments, manage staff (via admin), create patients

**Auth:** Email-based (Supabase Auth). Users assigned to single clinic.

**RLS:** All queries automatically filtered by clinic_id at database level.

---

## ⚠️ Critical Rules

### Database
- ✅ Business rules enforced in PostgreSQL (constraints + triggers)
- ✅ RLS policies block cross-clinic data access
- ❌ Don't bypass RLS validation in frontend
- ❌ Don't trust frontend data; validate all mutations on backend

### UI/UX
- ✅ Every disabled state explains WHY (tooltip/hint)
- ✅ Empty tables have action guidance ("No appointments — click + to create")
- ❌ Silent failures, greyed buttons with no explanation

### Code
- ✅ Use TypeScript strictly (`npm run check:types` before commit)
- ✅ Write tests for complex logic (hooks, utils, components)
- ❌ Don't leave console.logs in production code

---

## 📝 Session Memory (MANDATORY)

**Location:** `.claude/sessions/` — inside the project folder, gitignored, travels with the project.

### On Session Start
1. Read `.claude/sessions/` — check the latest session log for context
2. Understand what was done last, what's pending, what decisions were made
3. Continue from where the previous session left off

⚠️ **If `.claude/sessions/` does not exist:** notify the user and create it upon confirmation.

### On Session End
1. Create: `.claude/sessions/YYYY-MM-DD-short-description.md`
2. Include:
   - **Done** (3–5 bullets)
   - **Decisions** made during the session
   - **Next** (pending tasks, open questions)
   - **Commits** (hashes + messages)

### Format
```markdown
# Session: YYYY-MM-DD — Short Title

## Done
- ...

## Decisions
- ...

## Next
- ...

## Commits
- `abc1234` commit message
```

---

## 📞 Questions?

1. **Product questions?** → Review `docs/discovery/` (vision, scope, roadmap)
2. **Architecture questions?** → See `docs/architecture/` (system, backend, contracts, ui)
3. **Feature definition?** → Check `docs/delivery/backlog/`
4. **Session context?** → Read `.claude/sessions/` (latest file)

**Also check:** [Documentation Guide](docs/GUIDE.md) for full navigation across 38 files.

---

**Last updated:** 2026-06-18
