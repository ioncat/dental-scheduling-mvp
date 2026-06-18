# Documentation Guide

> 38 documents, 12 epics, 28+ user stories.
> This guide helps you navigate without getting lost.

## Reading Paths

- **"I want to understand the product"** — read Discovery top to bottom (5 min)
- **"I want to understand the architecture"** — Discovery #1 → Architecture → Backend
- **"I want to start developing"** — Discovery #1–3 → Contracts → UI → Delivery
- **"I want to review decisions"** — Discovery #1 → Decisions (all 5 files)
- **"I want to understand the operational flow"** — follow the 4 phases below:

### Operational Flow (Bootstrap → Daily Usage)

| Phase | What happens | Key documents |
|-------|-------------|---------------|
| 1. Bootstrap | Empty DB → /setup → practice + admin created | [Epic 1 — Auth](delivery/backlog/epic-1-authentication-and-account.md) (stories 1.0–1.2) |
| 2. Configuration | Invite staff, set availability, add patients | [Epic 3 — Staff](delivery/backlog/epic-3-staff-management.md), [Epic 6 — Availability](delivery/backlog/epic-6-availability-and-time-off.md), [Epic 4 — Patients](delivery/backlog/epic-4-patient-lifecycle.md) |
| 3. Daily Operations | Schedule, complete, cancel appointments | [Appointment Lifecycle](architecture/contracts/appointment-lifecycle.md), [Domain ↔ UI](architecture/contracts/domain-ui.md) |
| 4. Exception Handling | Deactivation → auto-unassign → reassign | [Epic 7 — Reassignment](delivery/backlog/epic-7-operational-reassignment.md), [Appointment Lifecycle](architecture/contracts/appointment-lifecycle.md) |

---

## Discovery — why we're building this

| # | Document | Purpose | You'll learn |
|---|----------|---------|-------------|
| 1 | [Executive Summary](discovery/executive-summary.md) | Big picture in 2 minutes | Hypothesis, MVP goal, success criteria |
| 2 | [Product Vision](discovery/product-vision.md) | Problem and target audience | Who uses it, what pain it solves, core principles |
| 3 | [MVP Scope](discovery/mvp-scope.md) | What's in and what's out | User flows, feature boundaries, explicit exclusions |
| 4 | [Roadmap](discovery/roadmap.md) | Where we go after MVP | 6 phases, success signals per phase, pivot criteria |

## Decisions — why we said "no"

| # | Document | Decision | Rationale |
|---|----------|----------|-----------|
| 5 | [PDR-001](decisions/pdr-001-no-patient-self-booking.md) | No patient self-booking | Focus on doctor adoption first |
| 6 | [PDR-002](decisions/pdr-002-manual-appointment-completion.md) | Manual appointment completion | Reflect real clinic workflows |
| 7 | [PDR-003](decisions/pdr-003-no-external-calendar-integration.md) | No Google Calendar sync | Validate standalone value |
| 8 | [PDR-004](decisions/pdr-004-one-clinic-per-user.md) | One clinic per user | Simplify auth and data model |
| 9 | [PDR-005](decisions/pdr-005-appointment-flow-direction.md) | Dual appointment flow (v1 implemented) | Doctor-first / Patient-first toggle |
| 10 | [Deferred Decisions](decisions/deferred-decisions.md) | Weekly view, drag-n-drop, dark mode | Conscious post-MVP deferral |

## Architecture — how it's structured

| # | Document | Purpose | You'll learn |
|---|----------|---------|-------------|
| 11 | [System Context](architecture/system/system-context.md) | High-level overview | SPA + Supabase, no custom backend |
| 12 | [Container Diagram](architecture/system/container-diagram.md) | Simplified C4 view | User → Browser → Supabase data flow |

## Contracts — the bridge between product and code

| # | Document | Purpose | You'll learn |
|---|----------|---------|-------------|
| 13 | [Domain ↔ UI Contract](architecture/contracts/domain-ui.md) | Single source of truth | Roles, pages, routes, 15 business rules |
| 14 | [Appointment Lifecycle](architecture/contracts/appointment-lifecycle.md) | Full status flow | Transitions, triggers, permissions, visual indicators |

## UI Specification — what the user sees

| # | Document | Purpose | You'll learn |
|---|----------|---------|-------------|
| 15 | [Pages](architecture/ui/ui.pages.md) | All 8 pages spec | /setup, /login, /schedule, /patients, /availability, /settings, /account |
| 16 | [Components](architecture/ui/ui.components.md) | Component tree | Layout, forms, modals, design fidelity level |

## Backend — what the database enforces

| # | Document | Purpose | You'll learn |
|---|----------|---------|-------------|
| 17 | [Logical Schema](architecture/backend/schema.logical.md) | Data model | 6 tables, attributes, constraints |
| 18 | [Schema SQL](architecture/backend/schema.sql) | DDL reference | Enums, tables, indexes |
| 19 | [Triggers](architecture/backend/triggers.sql) | Business rule enforcement | Overlap check, availability guard, UTC, auto-unassign |
| 20 | [RLS Policies](architecture/backend/rls.sql) | Row Level Security | Helper functions, per-table policies |
| 21 | [Demo Seed](architecture/backend/seed-demo.sql) | Sample data function | Staff, patients, appointments for evaluation |
| 22 | [**init-all.sql**](architecture/backend/init-all.sql) | **Production deploy script** | Everything above in one executable file |

## Delivery — how it was built

| # | Document | Purpose | You'll learn |
|---|----------|---------|-------------|
| 23 | [Dev Plan](delivery/dev-plan.md) | Implementation roadmap | 8 phases, 28/28 stories, status |
| 24 | [Delivery Conventions](delivery/conventions.md) | How stories are written | Story format, acceptance criteria standards |
| 25 | [Testing Strategy](delivery/TESTING-STRATEGY.md) | Test coverage approach | Unit, integration, E2E strategy |

### Epics (28 user stories)

| # | Epic | Stories | Key capability |
|---|------|---------|---------------|
| 26 | [Epic 1 — Auth & Account](delivery/backlog/epic-1-authentication-and-account.md) | 1.0–1.5 | Setup, magic link, Google OAuth, account |
| 27 | [Epic 2 — Practice](delivery/backlog/epic-2-practice-management.md) | 2.1–2.2 | Clinic settings, branding in header |
| 28 | [Epic 3 — Staff](delivery/backlog/epic-3-staff-management.md) | 3.1–3.6 | Invite, onboard, deactivate, reactivate |
| 29 | [Epic 4 — Patients](delivery/backlog/epic-4-patient-lifecycle.md) | 4.1–4.4 | CRUD, archive/restore |
| 30 | [Epic 5 — Scheduling](delivery/backlog/epic-5-scheduling-engine.md) | 5.1–5.8 | Daily view, create/edit/cancel/complete, dual flow, suggested slots |
| 31 | [Epic 6 — Availability](delivery/backlog/epic-6-availability-and-time-off.md) | 6.1–6.5 | Weekly slots, time-off (vacation/sick) |
| 32 | [Epic 7 — Reassignment](delivery/backlog/epic-7-operational-reassignment.md) | 7.1–7.3 | Auto-unassign, alert banner |
| 33 | [Epic 8 — Access Control](delivery/backlog/epic-8-access-control.md) | 8.1–8.2 | RLS-based RBAC |
| 34 | [Epic 9 — Notifications](delivery/backlog/epic-9-notifications.md) | 9.1–9.2 | *Deferred to post-MVP* |
| 35 | [Epic 10 — Constraints](delivery/backlog/epic-10-system-constraints.md) | 10.1–10.4 + TD | UTC, overlap, availability, tech debt (resolved) |
| 36 | [Epic 11 — Audit Log](delivery/backlog/epic-11-audit-log.md) | 11.1–11.2 | *Backlog* |
| 37 | [Epic 12 — Theming & UI](delivery/backlog/epic-12-theming-and-ui.md) | 12.1–12.5 | Themes, layout modes, glassmorphism, working hours |
