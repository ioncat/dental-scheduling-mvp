# Product Lifecycle Map
## Discovery > MVP > Delivery > Implementation

This document maps all product artifacts in the repository to the corresponding stages of the product lifecycle.

It reflects the current state of the project: **MVP complete and functional**.

---

## Discovery
Understanding the problem, defining the hypothesis, and setting product boundaries.

| Document | Purpose |
|----------|---------|
| [Executive Summary](docs/0%20executive-summary.md) | Problem, hypothesis, MVP goal |
| [Product Vision](docs/1%20product-vision%20(!revise!).md) | Product vision and primary user |
| [MVP Scope](docs/2%20mvp-scope.md) | MVP boundaries (in / out) |
| [Roadmap](docs/3%20roadmap.md) | Phased evolution from MVP to multi-clinic |

### Product Decisions Made in Discovery

| Decision | Rationale |
|----------|-----------|
| [PDR-001 No Patient Self-Booking](docs/decisions/pdr-001-no-patient-self-booking.md) | Focus on doctor adoption first |
| [PDR-003 No External Calendar Integration](docs/decisions/pdr-003-no-external-calendar-integration.md) | Validate full replacement hypothesis |

---

## MVP Definition
Transforming the hypothesis into a minimal, testable product.

| Epic | Scope | Status |
|------|-------|--------|
| [Epic 1 — Authentication & Account](docs/delivery/epics/epic-1-authentication-and-account.md) | Setup wizard, magic link, Google auth, demo data | Done |
| [Epic 2 — Practice Management](docs/delivery/epics/epic-2-practice-management.md) | Clinic settings, slogan, branding | Done |
| [Epic 3 — Staff Management](docs/delivery/epics/epic-3-staff-management.md) | Invite, activate/deactivate, role assignment | Done |
| [Epic 4 — Patient Lifecycle](docs/delivery/epics/epic-4-patient-lifecycle.md) | Create, edit, archive, restore | Done |
| [Epic 5 — Scheduling Engine](docs/delivery/epics/epic-5-scheduling-engine.md) | Daily schedule, create/cancel/complete appointments | Done |
| [Epic 6 — Availability & Time Off](docs/delivery/epics/epic-6-availability-and-time-off.md) | Weekly templates, time-off periods, enforcement | Done |
| [Epic 7 — Operational Reassignment](docs/delivery/epics/epic-7-operational-reassignment.md) | Unassigned state, manual reassignment | Done |
| [Epic 8 — Access Control](docs/delivery/epics/epic-8-access-control.md) | Role-based visibility, RLS | Done |

### Product Decisions Made in MVP

| Decision | Rationale |
|----------|-----------|
| [PDR-002 Manual Appointment Completion](docs/decisions/pdr-002-manual-appointment-completion.md) | Keep lifecycle explicit and operationally accurate |
| [PDR-004 One Clinic per User](docs/decisions/pdr-004-one-clinic-per-user.md) | Reduce complexity and accelerate delivery |

### MVP Result: 28/28 stories implemented

---

## Delivery
Turning scope into delivery-ready artifacts and a working application.

| Document | Purpose |
|----------|---------|
| [Delivery Conventions](docs/4%20product-delivery-conventions.md) | Contract between Product and Engineering |
| [Dev Plan (EN)](docs/delivery/dev-plan-en.md) | Technical implementation plan |
| [Dev Plan (RU)](docs/delivery/dev-plan%20-ru.md) | Technical implementation plan (Russian) |
| [Deferred Decisions](docs/decisions/deferred-decisions.md) | Explicit list of what was postponed |
| [Quick Start](app/QUICK-START.md) | Installation and launch guide |

### Backlog (Post-MVP)

| Item | Epic | Description |
|------|------|-------------|
| Story 1.3 | Auth | Google Social Auth (button exists, needs Supabase config + toggle) |
| Story 1.4 | Auth | Dark Mode Toggle |
| Story 1.5 | Auth | Edit Own Contact Details |
| Story 3.6 | Staff | Admin Edit Staff Profile |
| Story 8.2 | Access | Configurable RBAC |
| Epic 9 | Notifications | Email/SMS notifications (deferred) |
| Epic 11 | Audit | User action logging + CSV export |

---

## System Design
How the product works as a system.

### Architecture Overview

```
Browser (SPA)
    |
    v
Frontend Application (React + TypeScript)
    |  Supabase client, RPC calls, real-time subscriptions
    v
Supabase Platform
    |-- Auth (Magic Link, Google OAuth)
    |-- PostgreSQL Database
    |     |-- Row-Level Security (practice-scoped)
    |     |-- Triggers (business rule enforcement)
    |     |-- Security Definer Functions (RLS helpers)
    |-- Storage (future)
```

Core business rules are enforced at database level (triggers + RLS), not in UI code. The frontend validates for UX but the database is the source of truth.

| Document | Purpose |
|----------|---------|
| [System Context](docs/system/system-context.md) | System boundaries and actors |
| [Container Diagram](docs/system/container-diagram.md) | High-level architecture |
| [Architecture](docs/system/architecture-container.md) | Container-level design |
| [Domain Contract](docs/contracts/domain-ui.md) | Canonical UI domain definition |
| [UI Pages](docs/ui/ui.pages.md) | Page specifications |
| [UI Components](docs/ui/ui.components.md) | Component specifications |

### Database

| Document | Purpose |
|----------|---------|
| [Logical Schema](docs/backend/schema.logical.md) | Entity model and relationships |
| [Physical Schema](docs/backend/schema.sql) | Table definitions |
| [Triggers](docs/backend/triggers.sql) | Business rules enforced at DB level |
| [RLS Policies](docs/backend/rls.sql) | Row-level security |
| [Init Script](docs/backend/init-all.sql) | Single file to bootstrap entire database |
| [Demo Seed](docs/backend/seed-demo.sql) | Demo data population function |

### Key System Constraints

| Constraint | Enforcement |
|------------|-------------|
| No double booking | DB trigger: overlap detection |
| No booking outside availability | DB trigger: availability + time-off check |
| UTC storage for all datetimes | DB trigger: timezone validation |
| Archived patients excluded | DB trigger: booking prevention |
| Doctor deactivation cascades | DB trigger: future appointments unassigned |
| Practice-scoped data isolation | RLS policies on all tables |
| Role-based access | RLS + UI-level guards |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite 6 + React 19 + TypeScript 5 |
| Styling | Tailwind CSS 3 + shadcn/ui |
| Routing | TanStack Router (code-based) |
| Data | TanStack React Query + Supabase client |
| Auth | Supabase Auth (Magic Link + Google OAuth) |
| Database | PostgreSQL (Supabase) |
| Security | Row-Level Security + security definer functions |

---

## End-to-End Flow

```
Discovery          Problem framing, hypothesis, scope
    |
MVP Definition     Epics, stories, acceptance criteria, decisions
    |
Delivery           Dev plans, conventions, implementation
    |
Working Product    28/28 MVP stories, demo data, Quick Start
```

Each stage builds on the previous one.
Artifacts are complementary and intentionally non-overlapping.

---

## Summary

This repository represents a complete product lifecycle:

- from identifying a real-world problem in dental clinic scheduling
- through hypothesis-driven MVP definition and prioritization
- to delivery-ready backlog with explicit trade-offs
- to a **working application** with database-enforced business rules
- with demo data for immediate evaluation

The MVP is complete. The product is ready for user testing and feedback.
