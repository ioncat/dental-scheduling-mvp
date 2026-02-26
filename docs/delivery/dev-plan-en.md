# UI Implementation Plan (Based on Specification)

> **Status: Complete.** All 8 phases have been implemented. 28/28 user stories delivered. This document is preserved as a historical artifact showing the incremental build strategy.

## Context

Product documentation defines 28 user stories, 8 pages, ~25 components, and 5 repositories. Supabase backend is deployed and running. Routing approach: code-based (manual router.tsx).

Goal: incrementally build the frontend from foundation to full MVP, following `ui.pages.md`, `ui.components.md`, and `domain-ui.md` specifications.

---

## Phase 0 — Project Foundation

**Goal:** a runnable project with Vite + React + TypeScript + Tailwind + shadcn/ui

### Steps:
1. Obtain from user / create configs: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `postcss.config.js`, `tailwind.config.ts`
2. Install dependencies: `react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query`, `@supabase/supabase-js`, `tailwindcss`, `shadcn/ui`
3. Set up `globals.css` with Tailwind directives
4. Initialize shadcn/ui (`npx shadcn-ui@latest init`)
5. Remove dead code:
   - `src/app.tsx` (empty)
   - `src/routes/__root.tsx` (file-based routing stub)
   - `src/components/schedule/schedule.tsx` (broken stub)
   - `src/components/schedule/CreateAppointment.tsx` (duplicate)
6. Fix `src/repositories/appointments.repo.ts` (extra `}`)
7. Replace `import './index.css'` in `main.tsx` with `import './styles/globals.css'`
8. Generate Supabase TypeScript types (`supabase gen types`) → `src/lib/database.types.ts`
9. Add types to Supabase client in `src/lib/supabase.ts`

### Verification: `npm run dev` starts successfully, blank page with no errors

### Files:
- `app/package.json` — create
- `app/vite.config.ts` — create
- `app/tsconfig.json` — create
- `app/index.html` — create
- `app/tailwind.config.ts` — create
- `app/postcss.config.js` — create
- `app/src/styles/globals.css` — create
- `app/src/lib/database.types.ts` — generate
- `app/src/lib/supabase.ts` — update (add types)
- `app/src/main.tsx` — update (style import)
- Delete: `src/app.tsx`, `src/routes/__root.tsx`, `src/components/schedule/schedule.tsx`, `src/components/schedule/CreateAppointment.tsx`

---

## Phase 1 — Layout + Auth + Router

**Goal:** working shell: sidebar, topbar, auth flow, all 7 routes

### Steps:
1. Create `AppLayout` — sidebar + topbar + outlet
2. Create `SidebarNav` — items: Schedule, Patients, Availability, Settings (admin only), Account; props: `role`
3. Create `TopBar` — current date, user name
4. Rework `LoginForm` (from `routes/login.tsx`):
   - Replace inline styles with shadcn/ui `Input` + `Button`
   - Add states: idle / loading / success / error
   - Add error handling
   - Remove `alert()`, replace with UI feedback
5. Add auth callback handling (Supabase `onAuthStateChange`)
6. Extend `router.tsx`:
   - 7 routes: `/login`, `/schedule`, `/patients`, `/patients/$id`, `/availability`, `/settings`, `/account`
   - Auth guard on root route (exists, add post-login redirect → `/schedule`)
   - Role guard for `/settings` (admin only)
   - Wrap authenticated routes in `AppLayout`
7. Create placeholder stubs for all pages (`<h1>Page Name</h1>`)
8. Extend `src/lib/auth.ts`:
   - `getCurrentUser()` — already exists
   - `getCurrentStaff()` — query `staff` table by `auth.uid()`
   - `signOut()` — logout
9. Create auth context / hook `useCurrentStaff()` → `{ staff, role, isLoading }`

### Verification: login works, sidebar renders, page navigation works, `/settings` accessible only to admin

### Files:
- `src/components/layout/AppLayout.tsx` — create
- `src/components/layout/SidebarNav.tsx` — create
- `src/components/layout/TopBar.tsx` — create
- `src/routes/login.tsx` — rewrite
- `src/router.tsx` — extend
- `src/lib/auth.ts` — extend
- `src/hooks/useCurrentStaff.ts` — create
- Page stubs: `schedule.tsx`, `patients.tsx`, `patient-details.tsx`, `availability.tsx`, `settings.tsx`, `account.tsx`

---

## Phase 2 — Data Layer (All Repositories)

**Goal:** typed data layer — all 5 repositories + TanStack Query hooks

### Steps:
1. Rewrite `appointments.repo.ts` — typed CRUD, filters by date/doctor/status
2. Create `patients.repo.ts` — list, get, create, update, archive, restore
3. Create `staff.repo.ts` — list, get, create (invite), update (role, status)
4. Create `availability.repo.ts` — CRUD for availability + time_off
5. Create `practice.repo.ts` — get, update
6. Create TanStack Query hooks for each repo:
   - `src/hooks/useAppointments.ts` — `useAppointments(date, doctorId?)`, `useCreateAppointment()`, etc.
   - `src/hooks/usePatients.ts`
   - `src/hooks/useStaff.ts`
   - `src/hooks/useAvailability.ts`
   - `src/hooks/usePractice.ts`

### Verification: hooks return data from Supabase, mutations work, no `any` types

### Files:
- `src/repositories/appointments.repo.ts` — rewrite
- `src/repositories/patients.repo.ts` — create
- `src/repositories/staff.repo.ts` — create
- `src/repositories/availability.repo.ts` — create
- `src/repositories/practice.repo.ts` — create
- `src/hooks/useAppointments.ts` — create
- `src/hooks/usePatients.ts` — create
- `src/hooks/useStaff.ts` — create
- `src/hooks/useAvailability.ts` — create
- `src/hooks/usePractice.ts` — create

---

## Phase 3 — Shared Components

**Goal:** reusable UI primitives

### Components:
1. `DoctorSelector` — dropdown of active doctors, data from `useStaff(role=doctor, status=active)`
2. `PatientSelector` — dropdown/search of non-archived patients
3. `ConfirmDialog` — wrapper over shadcn/ui `AlertDialog`
4. `LoadingSpinner` — loading state indicator
5. `ErrorBanner` — error state display

### Files:
- `src/components/shared/DoctorSelector.tsx`
- `src/components/shared/PatientSelector.tsx`
- `src/components/shared/ConfirmDialog.tsx`
- `src/components/shared/LoadingSpinner.tsx`
- `src/components/shared/ErrorBanner.tsx`

---

## Phase 4 — Schedule Page (Core Product)

**Goal:** fully functional schedule page — Epic 5 + Epic 7 (alerts)

### Components:
1. `SchedulePage` — container: date selector, alert, grid
2. `UnassignedAlert` — banner with unassigned count (admin/clinic_manager only)
3. `TimeGrid` — hour slot grid, click on empty slot → create
4. `DoctorColumn` — doctor column with appointment cards
5. `AppointmentCard` — appointment card: color-coded by status (scheduled/unassigned/completed/cancelled)
6. `AppointmentModal` — 3 modes (create/view/edit):
   - Create: PatientSelector, DoctorSelector (optional), start/end time, notes → save
   - View: all fields read-only + actions: cancel, complete, assign doctor
   - Edit: modify fields + save

### Business Logic in UI:
- Doctor sees only their own column
- Admin/clinic_manager see all doctors
- Unassigned cards are visually highlighted
- Alert is not dismissable — disappears only when 0 unassigned

### Covered Stories: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.2, 7.3

### Files:
- `src/routes/schedule.tsx` — rewrite
- `src/components/schedule/SchedulePage.tsx` — create
- `src/components/schedule/UnassignedAlert.tsx` — create
- `src/components/schedule/TimeGrid.tsx` — create
- `src/components/schedule/DoctorColumn.tsx` — create
- `src/components/schedule/AppointmentCard.tsx` — create
- `src/components/schedule/AppointmentModal.tsx` — create

---

## Phase 5 — Patients

**Goal:** patient management — Epic 4

### Components:
1. `PatientsPage` — list + search + create button
2. `PatientsTable` / `PatientRow` — patient table (archived hidden by default)
3. `CreatePatientModal` — full_name, phone (required), email, messenger, notes
4. `PatientDetailsPage` — profile + appointment history + archive/restore
5. `PatientInfoCard` — patient info + editing
6. `AppointmentHistory` — patient's appointment list
7. `ArchiveButton` — disabled if future appointments exist

### Covered Stories: 4.1, 4.2, 4.3, 4.4

### Files:
- `src/routes/patients.tsx` — create
- `src/routes/patient-details.tsx` — create
- `src/components/patients/PatientsPage.tsx` — create
- `src/components/patients/PatientsTable.tsx` — create
- `src/components/patients/CreatePatientModal.tsx` — create
- `src/components/patients/PatientDetailsPage.tsx` — create
- `src/components/patients/PatientInfoCard.tsx` — create
- `src/components/patients/AppointmentHistory.tsx` — create
- `src/components/patients/ArchiveButton.tsx` — create

---

## Phase 6 — Availability

**Goal:** doctor schedule management — Epic 6

### Components:
1. `AvailabilityPage` — container: DoctorSelector (admin), weekly editor, time off
2. `WeeklyAvailabilityEditor` — weekday grid, add/update/remove slots
3. `TimeOffList` — vacation/sick/blocked list, add/remove

### Covered Stories: 6.1, 6.2, 6.3, 6.4, 6.5

### Files:
- `src/routes/availability.tsx` — create
- `src/components/availability/AvailabilityPage.tsx` — create
- `src/components/availability/WeeklyAvailabilityEditor.tsx` — create
- `src/components/availability/TimeOffList.tsx` — create

---

## Phase 7 — Settings + Account

**Goal:** clinic settings + staff management — Epics 2, 3; Account — Epic 1

### Settings (admin only):
1. `SettingsPage` — two tabs: Practice / Staff
2. `PracticeSettingsForm` — edit clinic_name, address, phone, email, timezone, date_format
3. `StaffManagement` — staff table + invite
4. `StaffTable` / `StaffRow` — list, actions: change role, deactivate
5. `InviteStaffModal` — full_name, email, role → create with status=pending + magic link

### Account:
6. `AccountPage` — read-only: full_name, email, phone, role

### Covered Stories: 1.2, 2.1, 3.1, 3.2, 3.3, 3.4

### Files:
- `src/routes/settings.tsx` — create
- `src/routes/account.tsx` — create
- `src/components/settings/SettingsPage.tsx` — create
- `src/components/settings/PracticeSettingsForm.tsx` — create
- `src/components/settings/StaffManagement.tsx` — create
- `src/components/settings/StaffTable.tsx` — create
- `src/components/settings/InviteStaffModal.tsx` — create
- `src/components/account/AccountPage.tsx` — create

---

## Phase 8 — Access Control + Edge Cases

**Goal:** RBAC finalization and edge case handling — Epics 8, 10

### Steps:
1. Audit role-based visibility across all pages:
   - Doctor → own column only, own availability, no Settings
   - Clinic_manager → all columns, patients, availability, no Settings
   - Admin → full access
2. UTC verification: all datetimes stored in UTC, displayed in practice.time_zone
3. Validate edge cases from epics:
   - Cannot archive patient with future appointments
   - Cannot deactivate last admin
   - Cannot create appointment outside availability
   - Cannot reschedule unassigned appointments
4. Error states on every page (ErrorBanner)
5. Loading states (LoadingSpinner)

### Covered Stories: 8.1, 10.1, 10.2, 10.3, 10.4

---

## Verification

After each phase:
1. `npm run dev` — application starts without errors
2. Visual check via browser (preview screenshot)
3. Console check for errors
4. Network requests to Supabase — data is returned

Final verification:
- Login via magic link → redirect to /schedule
- Create appointment → displayed on the grid
- Create patient → displayed in the list
- Deactivate doctor → appointments become unassigned → alert appears
- Role switching: verify visibility for each role
