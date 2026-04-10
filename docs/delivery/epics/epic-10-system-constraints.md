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

## Technical Debt — Resolved (2026-04-05)

Items identified during audit (2026-04-03). All resolved in commit `e5a2d43`.

### TD-001: Remove `any` from Schedule Code — Done
- **What:** 10 `any` casts across `schedule.tsx`, `AppointmentHistory.tsx`, `ArchiveButton.tsx`
- **Fix:** Created `AppointmentWithRelations` type in `database.types.ts`, typed `useAppointments` hook return, removed all `any` casts
- **Result:** Zero `any` in `app/src/`

### TD-002: Auto-generate TypeScript Types from Supabase Schema — Done
- **What:** `database.types.ts` maintained manually
- **Fix:** Added `npm run gen:types` script (`supabase gen types typescript --project-id ...`), added `npm run check:types` script
- **Note:** Requires `supabase login` with access token to run. Manual types kept as source of truth with custom extensions (`AppointmentWithRelations`)

### TD-003: Add Testing Infrastructure — Done
- **What:** No test framework, zero tests
- **Fix:** Vitest + @testing-library/react + jsdom. 23 smoke tests for `timeGrid.ts` (13 tests) and `slotUtils.ts` (10 tests). Scripts: `npm test`, `npm run test:watch`
- **Config:** `vitest.config.ts`, `src/test/setup.ts`

### TD-004: Optimize Frontend Bundle — Done
- **What:** Single chunk 729 kB, Vite size warning
- **Fix:** Lazy-loaded all 8 route pages via `React.lazy()` + `Suspense`. Manual vendor chunks: react (core), supabase, router, query, radix
- **Result:** Main chunk 228 kB. No chunk exceeds 500 kB. Vite warning eliminated

### TD-005: Error Boundary & Centralized Logging — Done
- **What:** No error boundary, crashes show blank screen
- **Fix:** `ErrorBoundary` component wrapping entire app in `main.tsx`. Shows "Something went wrong" + error message + Refresh button. Logs to `console.error` (Sentry integration deferred)
- **File:** `app/src/components/shared/ErrorBoundary.tsx`
