# Testing Strategy — Dental Scheduling MVP

**Version:** 1.0 (2026-04-10)  
**Status:** Active  
**Audience:** Claude Code (automated execution) + Project Owner (review)

---

## 1. Overview

This document defines a practical testing plan for the Dental Scheduling MVP.  
It covers UI, API, Database, Integration, and Accessibility testing.

**Goal:** Ensure the application works correctly before pilot deployment and serves as a living reference for ongoing quality assurance.

**Tools:**
- **Unit & Component tests:** Vitest + Testing Library (already configured)
- **API tests:** curl / REST Client examples (documented, manually runnable)
- **Database tests:** SQL scripts against Supabase (constraints, triggers, RLS)
- **E2E scenarios:** Described as checklists; automation via Playwright is recommended for Phase 2

---

## 2. Current Test Coverage

### Existing Tests (23 tests, 2 files — all passing)

| File | Tests | What it covers |
|------|-------|---------------|
| `src/lib/slotUtils.test.ts` | 7 | Free slot computation: availability filtering, appointment overlap, time-off exclusion, cancelled appointment handling, full-day time-off |
| `src/lib/timeGrid.test.ts` | 16 | Time grid math: pixel conversion, Y-coordinate mapping, slot generation, ISO string building, date formatting, clamping |

### Coverage Gaps

| Area | Files | Status |
|------|-------|--------|
| Utility modules | `auth.ts`, `theme.ts`, `layout-settings.ts`, `utils.ts` | Not tested |
| Custom hooks | All 6 hooks (`useAppointments`, `usePatients`, `useStaff`, `useAvailability`, `usePractice`, `useCurrentStaff`) | Not tested |
| Repository layer | All 5 repos (`appointments`, `patients`, `staff`, `availability`, `practice`) | Not tested |
| Components | ~40 components (schedule, patients, availability, settings, shared, layout) | Not tested |
| Route pages | All 8 pages (login, setup, schedule, patients, patient-details, availability, settings, account) | Not tested |

---

## 3. UI / Frontend Testing

### 3.1 Utility Module Tests

**Priority:** High — pure functions, easy to test, high value.

#### `auth.ts`
| # | Scenario | Expected |
|---|----------|----------|
| 1 | `getCurrentUser()` returns user when authenticated | User object returned |
| 2 | `getCurrentUser()` returns null when not authenticated | null returned |
| 3 | `getCurrentStaff()` returns staff record matching auth UID | Staff object with role |
| 4 | `signOut()` clears session | Session cleared, no errors |

#### `theme.ts`
| # | Scenario | Expected |
|---|----------|----------|
| 1 | Theme object has required keys (colors, fonts) | All keys present |
| 2 | Theme CSS variables are valid format | Valid CSS values |

#### `layout-settings.ts`
| # | Scenario | Expected |
|---|----------|----------|
| 1 | Default layout settings have expected structure | All defaults defined |
| 2 | Settings persist to localStorage | Read matches write |

### 3.2 Component Tests

**Priority:** Medium — test interactive behavior, not visual appearance.

**Approach:** Render component → verify output → simulate interaction → verify result.

#### Schedule Components (Critical Path)

| # | Component | Scenario | Expected |
|---|-----------|----------|----------|
| 1 | `AppointmentModal` | Open modal with no data | All fields empty, Save disabled |
| 2 | `AppointmentModal` | Select patient → select doctor → pick date → pick slot | Save enabled, all fields populated |
| 3 | `AppointmentModal` | Submit with valid data | `createAppointment` mutation called with correct payload |
| 4 | `AppointmentModal` | Doctor-first flow toggle | Doctor selector appears first |
| 5 | `AppointmentModal` | Patient-first flow toggle | Patient selector appears first |
| 6 | `DoctorTimeColumn` | Render with appointments | Appointment blocks positioned correctly |
| 7 | `DoctorTimeColumn` | Click empty slot | `onSlotClick` called with correct time |
| 8 | `DoctorTimeColumn` | Hover booked slot | Tooltip shows patient name and time |
| 9 | `DoctorTimeColumn` | Hover unavailable slot | Tooltip shows "Outside working hours" |
| 10 | `TimeGridCalendar` | Render with 3 doctors | 3 columns rendered with correct headers |
| 11 | `TimeGridCalendar` | Scrollbar alignment | Header and body columns aligned |
| 12 | `MiniCalendar` | Click date | `onDateChange` called with selected date |
| 13 | `UnassignedAlert` | Render with 2 unassigned | Banner shows "2 unassigned appointments" |
| 14 | `UnassignedAlert` | Render with 0 unassigned | No banner visible |
| 15 | `AppointmentBlock` | Click appointment card | Detail modal/panel opens |
| 16 | `CurrentTimeIndicator` | Render at 12:00 | Red line at correct Y position |

#### Patient Components

| # | Component | Scenario | Expected |
|---|-----------|----------|----------|
| 17 | `PatientsTable` | Render with 5 patients | 5 rows displayed |
| 18 | `PatientsTable` | Empty state | "No patients found" message shown |
| 19 | `PatientsTable` | Search by name | Filtered results displayed |
| 20 | `CreatePatientModal` | Submit with valid data | `createPatient` mutation called |
| 21 | `CreatePatientModal` | Submit with missing phone | Validation error shown |
| 22 | `ArchiveButton` | Click archive → confirm | `archivePatient` mutation called |
| 23 | `ArchiveButton` | Click archive → cancel | No mutation called |
| 24 | `PatientInfoCard` | Render archived patient | "Archived" badge visible |
| 25 | `AppointmentHistory` | Render with 3 appointments | 3 history items shown |

#### Availability Components

| # | Component | Scenario | Expected |
|---|-----------|----------|----------|
| 26 | `WeeklyAvailabilityEditor` | Render doctor schedule | 7 weekdays shown with times |
| 27 | `WeeklyAvailabilityEditor` | Add availability slot | New slot created |
| 28 | `WeeklyAvailabilityEditor` | Delete availability slot | Slot removed |
| 29 | `TimeOffList` | Render with active time-off | Time-off periods displayed |
| 30 | `TimeOffList` | Add time-off | New entry created |

#### Settings Components

| # | Component | Scenario | Expected |
|---|-----------|----------|----------|
| 31 | `StaffTable` | Render with 6 staff | 6 rows with roles shown |
| 32 | `StaffTable` | Deactivate doctor | Confirmation dialog shown |
| 33 | `InviteStaffModal` | Submit with valid email | `createStaff` mutation called |
| 34 | `PracticeSettingsForm` | Update clinic name | `updatePractice` mutation called |

#### Shared Components

| # | Component | Scenario | Expected |
|---|-----------|----------|----------|
| 35 | `PatientSelector` | Type and search | Filtered dropdown shown |
| 36 | `DoctorSelector` | Render with active doctors only | Inactive doctors excluded |
| 37 | `ConfirmDialog` | Confirm action | `onConfirm` called |
| 38 | `ConfirmDialog` | Cancel action | `onCancel` called, no side effects |
| 39 | `ErrorBanner` | Render with error message | Error text visible |
| 40 | `ErrorBoundary` | Child throws error | Fallback UI shown |
| 41 | `LoadingSpinner` | Render | Spinner visible |

#### Layout Components

| # | Component | Scenario | Expected |
|---|-----------|----------|----------|
| 42 | `SidebarNav` | Render as admin | All menu items visible (including Settings) |
| 43 | `SidebarNav` | Render as doctor | Settings hidden |
| 44 | `SidebarNav` | Click active route | Item highlighted |
| 45 | `TopBar` | Render | Current date and user name shown |

### 3.3 Route / Page Tests

**Priority:** Medium — verify page loads, data displayed, navigation works.

| # | Page | Scenario | Expected |
|---|------|----------|----------|
| 46 | `/login` | Render login form | Email input + submit button visible |
| 47 | `/login` | Submit invalid email | Error message shown |
| 48 | `/schedule` | Load with demo data | Time grid + doctor columns rendered |
| 49 | `/schedule` | Navigate date forward | Next day's appointments shown |
| 50 | `/schedule` | Click "Today" button | Returns to current date |
| 51 | `/patients` | Load patient list | Table with patients rendered |
| 52 | `/patients/:id` | Load patient details | Patient info card + appointment history |
| 53 | `/availability` | Load availability page | Weekly editor rendered |
| 54 | `/settings` | Load as admin | Practice settings + staff table visible |
| 55 | `/settings` | Load as doctor (redirect) | Redirected away from settings |
| 56 | `/account` | Load account page | Current user info shown |

---

## 4. API Testing (PostgREST / Supabase)

**Approach:** curl commands + REST Client examples. Documented here as reference, executable by Claude Code or manually.

**Prerequisites:**
- Supabase project running
- Valid JWT token (from `supabase.auth.getSession()`)
- API URL: `${SUPABASE_URL}/rest/v1/`

### 4.1 Appointments API

```bash
# List appointments for a date
curl -s "${API_URL}/appointments?scheduled_at=gte.2026-04-10T00:00:00&scheduled_at=lt.2026-04-11T00:00:00" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}"

# Create appointment
curl -s "${API_URL}/appointments" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "PATIENT_UUID",
    "staff_id": "DOCTOR_UUID",
    "scheduled_at": "2026-04-11T10:00:00",
    "end_time": "2026-04-11T11:00:00",
    "status": "scheduled"
  }'

# Complete appointment (via RPC)
curl -s "${API_URL}/rpc/complete_appointment" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d '{"appointment_id": "APPOINTMENT_UUID"}'

# Cancel appointment
curl -s "${API_URL}/appointments?id=eq.APPOINTMENT_UUID" \
  -X PATCH \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d '{"status": "cancelled"}'
```

### 4.2 API Test Scenarios

| # | Endpoint | Scenario | Expected |
|---|----------|----------|----------|
| 1 | `GET /appointments` | List by date range | 200, array of appointments |
| 2 | `POST /appointments` | Create valid appointment | 201, appointment created |
| 3 | `POST /appointments` | Double booking (same doctor, same time) | 409, conflict error |
| 4 | `POST /appointments` | Book outside availability | 400, validation error |
| 5 | `POST /appointments` | Book archived patient | 400, constraint error |
| 6 | `PATCH /appointments` | Cancel scheduled appointment | 200, status=cancelled |
| 7 | `PATCH /appointments` | Cancel already completed | 400, terminal state error |
| 8 | `RPC complete_appointment` | Complete scheduled | 200, status=completed |
| 9 | `RPC complete_appointment` | Complete already cancelled | 400, terminal state error |
| 10 | `GET /patients` | List all active patients | 200, array (no archived) |
| 11 | `POST /patients` | Create with valid data | 201, patient created |
| 12 | `POST /patients` | Create with duplicate phone | 409, unique constraint |
| 13 | `PATCH /patients` | Archive patient | 200, archived_at set |
| 14 | `PATCH /patients` | Restore archived patient | 200, archived_at null |
| 15 | `GET /staff` | List active staff | 200, array |
| 16 | `PATCH /staff` | Deactivate doctor | 200, triggers reassignment |
| 17 | `GET /availability` | List doctor availability | 200, array by weekday |
| 18 | `POST /availability` | Create availability slot | 201, slot created |
| 19 | `GET /time_off` | List doctor time-off | 200, array |
| 20 | `GET /practices` | Get practice info | 200, single practice |

### 4.3 RLS (Row-Level Security) Tests

| # | Scenario | Expected |
|---|----------|----------|
| 21 | Query appointments with Clinic A token | Only Clinic A data returned |
| 22 | Query appointments with no token | 401, unauthorized |
| 23 | Query another clinic's patient by ID | Empty result (RLS blocks) |
| 24 | Doctor queries own appointments | Own appointments returned |
| 25 | Doctor queries another doctor's appointments | Depends on policy (verify) |

---

## 5. Database Testing

**Approach:** SQL scripts run directly against Supabase to verify constraints, triggers, and RLS.

### 5.1 Constraint Tests

| # | Constraint | Test | Expected |
|---|-----------|------|----------|
| 1 | Unique (doctor_id, scheduled_at) | Insert two appointments same doctor+time | ERROR: unique violation |
| 2 | Status enum check | Insert with status='invalid' | ERROR: check violation |
| 3 | Terminal state check | UPDATE completed → scheduled | ERROR: check violation |
| 4 | Terminal state check | UPDATE cancelled → scheduled | ERROR: check violation |
| 5 | Patient phone unique per practice | Insert duplicate phone | ERROR: unique violation |
| 6 | Staff email unique | Insert duplicate email | ERROR: unique violation |
| 7 | Availability weekday range | Insert weekday=8 | ERROR: check violation |

### 5.2 Trigger Tests

| # | Trigger | Test | Expected |
|---|---------|------|----------|
| 8 | `prevent_booking_outside_availability` | Book when doctor has no availability | ERROR: prevented |
| 9 | `prevent_booking_outside_availability` | Book within availability window | SUCCESS |
| 10 | `reassign_on_deactivation` | Deactivate doctor with 3 future appointments | All 3 → status='unassigned' |
| 11 | `reassign_on_deactivation` | Deactivate doctor with past appointments | Past appointments unchanged |
| 12 | `cancel_on_patient_archive` | Archive patient with 2 scheduled appointments | Both → status='cancelled' |
| 13 | `cancel_on_patient_archive` | Archive patient with completed appointments | Completed unchanged |
| 14 | `link_staff_on_first_login` | New auth user with matching staff email | staff.auth_id linked |

### 5.3 RPC Function Tests

| # | Function | Test | Expected |
|---|----------|------|----------|
| 15 | `complete_appointment(id)` | Valid scheduled appointment | status → completed |
| 16 | `complete_appointment(id)` | Already cancelled | ERROR |
| 17 | `bootstrap_practice(name, email)` | First call, empty DB | Practice + admin created |
| 18 | `bootstrap_practice(name, email)` | Second call | ERROR: already bootstrapped |
| 19 | `is_system_bootstrapped()` | No staff records | false |
| 20 | `is_system_bootstrapped()` | Staff exists | true |

---

## 6. Integration Testing (End-to-End Scenarios)

**Approach:** Manual checklists describing full user flows. Each scenario crosses multiple layers (UI → API → DB → UI).

### 6.1 Core Flows

#### Scenario I-1: Create and Complete an Appointment
```
Precondition: Logged in as admin, demo data loaded

1. Navigate to /schedule
2. Click empty slot on Doctor A's column at 10:00
3. Verify: AppointmentModal opens with Doctor A pre-selected, date pre-filled
4. Select patient from patient picker
5. Verify: Available slots shown (10:00 should be available)
6. Click 10:00 slot
7. Click Save
8. Verify: Modal closes, appointment card appears at 10:00 on Doctor A's column
9. Click the new appointment card
10. Click "Complete"
11. Verify: Status changes to "completed", no further actions available
```

#### Scenario I-2: Cancel an Appointment
```
Precondition: Existing scheduled appointment

1. Click appointment card on schedule
2. Click "Cancel Appointment"
3. Verify: Confirmation dialog appears
4. Click "Confirm"
5. Verify: Appointment card shows "cancelled" status
6. Verify: Time slot is now free (can book new appointment there)
```

#### Scenario I-3: Doctor Deactivation → Reassignment Flow
```
Precondition: Doctor B has 3 future appointments

1. Navigate to /settings → Staff
2. Click "Deactivate" on Doctor B
3. Verify: Confirmation dialog appears
4. Confirm deactivation
5. Navigate to /schedule
6. Verify: Orange alert banner shows "3 unassigned appointments"
7. Click on an unassigned appointment
8. Select Doctor C from dropdown
9. Click Save
10. Verify: Appointment reassigned to Doctor C's column
11. Repeat for remaining unassigned appointments
12. Verify: Alert banner disappears when all reassigned
```

#### Scenario I-4: Patient Archive → Appointment Cancellation
```
Precondition: Patient X has 2 scheduled appointments

1. Navigate to /patients
2. Find Patient X
3. Click "Archive"
4. Verify: Confirmation dialog
5. Confirm archive
6. Navigate to /schedule
7. Verify: Patient X's 2 appointments are now "cancelled"
8. Navigate to /patients
9. Verify: Patient X shown as "Archived" (or filtered out)
```

#### Scenario I-5: Double Booking Prevention
```
Precondition: Doctor A has appointment at 10:00 on April 11

1. Open new appointment modal
2. Select any patient
3. Select Doctor A
4. Pick April 11
5. Verify: 10:00 slot is NOT shown in available slots
6. (API level): POST appointment at same time → expect 409 error
```

#### Scenario I-6: Availability Enforcement
```
Precondition: Doctor A available Mon-Fri 09:00-17:00

1. Open new appointment modal
2. Select Doctor A
3. Pick a Saturday
4. Verify: No available slots shown
5. Pick a Monday
6. Verify: Slots shown only 09:00-16:00 (last slot for 1h appointment)
```

### 6.2 Edge Cases

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| I-7 | Book during time-off | Doctor has vacation, try to book | No slots available for that period |
| I-8 | Restore archived patient | Archive → restore → try to book | Patient bookable again |
| I-9 | Concurrent booking attempt | Two users book same slot | First succeeds, second gets conflict error |
| I-10 | Empty schedule | New clinic, no appointments | "No appointments" message + "Create" guidance |
| I-11 | Login as inactive staff | Deactivated user tries to log in | Access denied message |
| I-12 | Setup page after bootstrap | Visit /setup when system is set up | Redirect to /login |

---

## 7. Accessibility Testing

**Priority:** Medium — verify basic accessibility compliance.

**Approach:** Manual checklist + automated audit tools (axe-core, Lighthouse).

### 7.1 Keyboard Navigation

| # | Area | Scenario | Expected |
|---|------|----------|----------|
| 1 | Login form | Tab through fields → Enter to submit | All fields focusable, form submits |
| 2 | Sidebar | Tab through nav items → Enter to navigate | All items reachable, selection works |
| 3 | Schedule grid | Tab to appointment → Enter to open | Appointment detail opens |
| 4 | Modal dialogs | Tab through form fields → Escape to close | Focus trapped in modal, Escape closes |
| 5 | Confirmation dialogs | Tab between Cancel/Confirm → Enter | Correct button activated |
| 6 | Patient table | Tab through rows → Enter on row | Patient detail opens |
| 7 | Dropdowns (DoctorSelector) | Arrow keys to navigate → Enter to select | Selection works via keyboard |

### 7.2 Screen Reader

| # | Area | Check | Expected |
|---|------|-------|----------|
| 8 | Page structure | Heading hierarchy (h1 → h2 → h3) | Logical heading levels |
| 9 | Buttons | All buttons have accessible labels | aria-label or text content |
| 10 | Form inputs | All inputs have associated labels | `<label>` or aria-labelledby |
| 11 | Status changes | Appointment status change announced | aria-live region updates |
| 12 | Alerts | Unassigned alert announced | role="alert" on banner |
| 13 | Tables | Patient table has proper headers | `<th>` elements present |
| 14 | Icons | Icon-only buttons have labels | aria-label on icon buttons |

### 7.3 Visual

| # | Check | Expected |
|---|-------|----------|
| 15 | Color contrast | Text meets WCAG AA (4.5:1 ratio) |
| 16 | Focus indicators | Visible focus ring on all interactive elements |
| 17 | Text scaling | UI readable at 200% zoom |
| 18 | Disabled states | Disabled elements visually distinct + explained (tooltip) |

### 7.4 Automated Audit

```bash
# Run Lighthouse accessibility audit
npx lighthouse http://localhost:5173/schedule --only-categories=accessibility --output=json

# Run axe-core via CLI
npx @axe-core/cli http://localhost:5173/schedule
```

---

## 8. Test Data Strategy

### Unified Seed (Demo + Testing)

One seed dataset serves both demonstration and testing purposes.

**Current seed:** 6 doctors, 25 patients, ~350 appointments (static dates).

**Update plan:** Modify seed to use relative dates (today, tomorrow, next week) so data is always fresh.

| Data category | Current | Target |
|---------------|---------|--------|
| Appointments | Fixed dates (Feb-Mar 2026) | Relative: today ±7 days |
| Time-off | Fixed dates | Relative: one doctor on leave tomorrow |
| Availability | Static | Keep as-is (weekday-based, always valid) |
| Patients | 25, none archived | 25 active + 2 archived (for testing restore) |
| Staff | 6 doctors, all active | 6 doctors (5 active + 1 inactive for testing) |

### Seed Update Script

```sql
-- Example: shift all appointments to be relative to today
UPDATE appointments
SET scheduled_at = scheduled_at + (CURRENT_DATE - '2026-03-15'::date) * INTERVAL '1 day',
    end_time = end_time + (CURRENT_DATE - '2026-03-15'::date) * INTERVAL '1 day'
WHERE status = 'scheduled';
```

---

## 9. Automation Recommendations

### Phase 1 (Now) — Expand Vitest Coverage

**Priority order:**
1. Utility modules (`auth.ts`, `theme.ts`, `layout-settings.ts`) — pure functions, quick wins
2. Component tests (AppointmentModal, PatientsTable, SidebarNav) — critical UI
3. Hook tests (mocked Supabase client) — data layer verification

**Estimated effort:** ~50 test cases, 2-3 sessions with Claude Code.

### Phase 2 (Before Pilot) — E2E with Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

**Cover:**
- Login flow
- Create appointment flow
- Patient CRUD flow
- Doctor deactivation → reassignment flow

**Estimated effort:** ~12 E2E scenarios, 1-2 sessions.

### Phase 3 (Post-Pilot) — CI Integration

```yaml
# GitHub Actions example
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run check:types
      - run: npm test
```

---

## 10. Test Execution Checklist

### Before Each Release / Demo

- [ ] `npm run check:types` — no TypeScript errors
- [ ] `npm test` — all unit tests pass
- [ ] Manual: Login flow works
- [ ] Manual: Create appointment → complete → verify
- [ ] Manual: Cancel appointment → verify slot freed
- [ ] Manual: Navigate schedule dates (prev/next/today)
- [ ] Manual: Patient list loads, search works
- [ ] Manual: Settings page loads (admin only)
- [ ] Manual: No console errors in browser DevTools
- [ ] Visual: No layout breaks on 1280x720 and 1920x1080

---

## Appendix: File → Test Mapping

| Source File | Test File | Status |
|-------------|-----------|--------|
| `lib/slotUtils.ts` | `lib/slotUtils.test.ts` | ✅ 7 tests |
| `lib/timeGrid.ts` | `lib/timeGrid.test.ts` | ✅ 16 tests |
| `lib/auth.ts` | `lib/auth.test.ts` | ❌ Not created |
| `lib/theme.ts` | `lib/theme.test.ts` | ❌ Not created |
| `lib/layout-settings.ts` | `lib/layout-settings.test.ts` | ❌ Not created |
| `hooks/useAppointments.ts` | `hooks/useAppointments.test.ts` | ❌ Not created |
| `hooks/usePatients.ts` | `hooks/usePatients.test.ts` | ❌ Not created |
| `hooks/useStaff.ts` | `hooks/useStaff.test.ts` | ❌ Not created |
| `components/schedule/AppointmentModal.tsx` | `components/schedule/AppointmentModal.test.tsx` | ❌ Not created |
| `components/patients/PatientsTable.tsx` | `components/patients/PatientsTable.test.tsx` | ❌ Not created |
| `components/layout/SidebarNav.tsx` | `components/layout/SidebarNav.test.tsx` | ❌ Not created |

---

**Last updated:** 2026-04-10  
**Next review:** After first round of test implementation
