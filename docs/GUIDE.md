# Documentation Guide

> 35 documents, 11 epics, 28 user stories.
> This guide helps you navigate without getting lost.

## Reading Paths

- **"I want to understand the product"** — read Product layer top to bottom (5 min)
- **"I want to understand the architecture"** — Product #1 → Architecture → Backend
- **"I want to start developing"** — Product #1–3 → Contracts → UI → Delivery
- **"I want to review decisions"** — Product #1 → Decisions (all 5 files)

---

## Product — why we're building this

| # | Document | Purpose | You'll learn |
|---|----------|---------|-------------|
| 1 | [Executive Summary](0%20executive-summary.md) | Big picture in 2 minutes | Hypothesis, MVP goal, success criteria |
| 2 | [Product Vision](1%20product-vision.md) | Problem and target audience | Who uses it, what pain it solves, core principles |
| 3 | [MVP Scope](2%20mvp-scope.md) | What's in and what's out | User flows, feature boundaries, explicit exclusions |
| 4 | [Roadmap](3%20roadmap.md) | Where we go after MVP | 6 phases, success signals per phase, pivot criteria |
| 5 | [Delivery Conventions](4%20product-delivery-conventions.md) | How stories are written | Story format, acceptance criteria standards |

## Decisions — why we said "no"

| # | Document | Decision | Rationale |
|---|----------|----------|-----------|
| 6 | [PDR-001](decisions/pdr-001-no-patient-self-booking.md) | No patient self-booking | Focus on doctor adoption first |
| 7 | [PDR-002](decisions/pdr-002-manual-appointment-completion.md) | Manual appointment completion | Reflect real clinic workflows |
| 8 | [PDR-003](decisions/pdr-003-no-external-calendar-integration.md) | No Google Calendar sync | Validate standalone value |
| 9 | [PDR-004](decisions/pdr-004-one-clinic-per-user.md) | One clinic per user | Simplify auth and data model |
| 10 | [Deferred Decisions](decisions/deferred-decisions.md) | Weekly view, drag-n-drop, dark mode | Conscious post-MVP deferral |

## Architecture — how it's structured

| # | Document | Purpose | You'll learn |
|---|----------|---------|-------------|
| 11 | [System Context](system/system-context.md) | High-level overview | SPA + Supabase, no custom backend |
| 12 | [Architecture Container](system/architecture-container.md) | Tech stack diagram | React, Vite, TanStack, Supabase Auth/DB |
| 13 | [Container Diagram](system/container-diagram.md) | Simplified C4 view | User → Browser → Supabase data flow |

## Contracts — the bridge between product and code

| # | Document | Purpose | You'll learn |
|---|----------|---------|-------------|
| 14 | [Domain ↔ UI Contract](contracts/domain-ui.md) | Single source of truth | Roles, pages, routes, 15 business rules |

## UI Specification — what the user sees

| # | Document | Purpose | You'll learn |
|---|----------|---------|-------------|
| 15 | [Pages](ui/ui.pages.md) | All 8 pages spec | /setup, /login, /schedule, /patients, /availability, /settings, /account |
| 16 | [Components](ui/ui.components.md) | Component tree | Layout, forms, modals, design fidelity level |

## Backend — what the database enforces

| # | Document | Purpose | You'll learn |
|---|----------|---------|-------------|
| 17 | [Logical Schema](backend/schema.logical.md) | Data model | 6 tables, attributes, constraints |
| 18 | [Schema SQL](backend/schema.sql) | DDL reference | Enums, tables, indexes |
| 19 | [Triggers](backend/triggers.sql) | Business rule enforcement | Overlap check, availability guard, UTC, auto-unassign |
| 20 | [RLS Policies](backend/rls.sql) | Row Level Security | Helper functions, per-table policies |
| 21 | [Demo Seed](backend/seed-demo.sql) | Sample data function | Staff, patients, appointments for evaluation |
| 22 | [**init-all.sql**](backend/init-all.sql) | **Production deploy script** | Everything above in one executable file |

## Delivery — how it was built

| # | Document | Purpose | You'll learn |
|---|----------|---------|-------------|
| 23 | [Dev Plan (EN)](delivery/dev-plan-en.md) | Implementation roadmap | 8 phases, 28/28 stories, status |
| 24 | [Dev Plan (RU)](delivery/dev-plan%20-ru.md) | Same in Russian | Mirror of EN version |

### Epics (28 user stories)

| # | Epic | Stories | Key capability |
|---|------|---------|---------------|
| 25 | [Epic 1 — Auth & Account](delivery/epics/epic-1-authentication-and-account.md) | 1.0–1.5 | Setup, magic link, Google OAuth, account |
| 26 | [Epic 2 — Practice](delivery/epics/epic-2-practice-management.md) | 2.1–2.2 | Clinic settings, branding in header |
| 27 | [Epic 3 — Staff](delivery/epics/epic-3-staff-management.md) | 3.1–3.6 | Invite, onboard, deactivate, reactivate |
| 28 | [Epic 4 — Patients](delivery/epics/epic-4-patient-lifecycle.md) | 4.1–4.4 | CRUD, archive/restore |
| 29 | [Epic 5 — Scheduling](delivery/epics/epic-5-scheduling-engine.md) | 5.1–5.6 | Daily view, create/edit/cancel/complete |
| 30 | [Epic 6 — Availability](delivery/epics/epic-6-availability-and-time-off.md) | 6.1–6.5 | Weekly slots, time-off (vacation/sick) |
| 31 | [Epic 7 — Reassignment](delivery/epics/epic-7-operational-reassignment.md) | 7.1–7.3 | Auto-unassign, alert banner |
| 32 | [Epic 8 — Access Control](delivery/epics/epic-8-access-control.md) | 8.1–8.2 | RLS-based RBAC |
| 33 | [Epic 9 — Notifications](delivery/epics/epic-9-notifications.md) | 9.1–9.2 | *Deferred to post-MVP* |
| 34 | [Epic 10 — Constraints](delivery/epics/epic-10-system-constraints.md) | 10.1–10.5 | UTC, overlap, availability, triggers |
| 35 | [Epic 11 — Audit Log](delivery/epics/epic-11-audit-log.md) | 11.1–11.2 | *Backlog* |
