# Epic 10 — System Constraints

## Story 10.1 — Enforce UTC Storage of Appointments

### User Story
As system  
I want to store all appointment datetimes in UTC  
So that timezone handling is consistent.

### Acceptance Criteria
Given appointment created  
Then start_time and end_time stored in UTC  

Displayed times use practice timezone.

---

## Story 10.2 — Block Booking Outside Availability

### User Story
As system  
I want to block booking outside availability  
So that scheduling rules are enforced.

### Acceptance Criteria
Given slot outside availability  
When booking attempted  
Then operation rejected  

---

## Story 10.3 — Prevent Overlapping Appointments

### User Story
As system  
I want to prevent overlapping appointments  
So that doctors are not double-booked.

### Acceptance Criteria
Given overlapping slot  
When appointment created  
Then operation rejected  

---

## Story 10.4 — Block Reschedule of Unassigned Appointments

### User Story
As system  
I want to block rescheduling unassigned appointments  
So that doctor assignment happens first.

### Acceptance Criteria
Given appointment status unassigned
When reschedule attempted
Then operation rejected

---

## Technical Debt — Backlog

Items identified during audit (2026-04-03). Not user stories, but engineering tasks required before production.

### TD-001: Remove `any` from Schedule Code
- **What:** Critical schedule components use `any` for query results and filter callbacks
- **Why:** With `strict: true` enabled, `any` bypasses type safety in the most important business flow
- **Scope:** `schedule.tsx`, related hooks and repositories
- **Priority:** P0

### TD-002: Auto-generate TypeScript Types from Supabase Schema
- **What:** `database.types.ts` is maintained manually. It can drift from the actual SQL schema.
- **Why:** Manual sync breaks first when schema evolves (new fields, enums, policies)
- **Fix:** `supabase gen types typescript` → CI check
- **Priority:** P0

### TD-003: Add Testing Infrastructure
- **What:** No test framework, no test scripts in `package.json`, zero tests
- **Why:** Quality checks are limited to `tsc` build. Behavioral regressions and domain logic errors are undetectable.
- **Scope:** Vitest setup, smoke tests for key flows (auth, create appointment, reassign)
- **Priority:** P1

### TD-004: Optimize Frontend Bundle
- **What:** Production build chunk ~716 kB, Vite warns about size
- **Why:** Slow first load on weak devices/networks
- **Fix:** Lazy-load route pages, review large imports, code splitting
- **Priority:** P1

### TD-005: Error Boundary & Centralized Logging
- **What:** Errors handled via local state/banner, no central error boundary, no external logging
- **Why:** Incidents hard to diagnose in pilot, especially for intermittent failures
- **Fix:** React Error Boundary + Sentry/equivalent
- **Priority:** P2
