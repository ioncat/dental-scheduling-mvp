# Deferred Decisions

Decisions explicitly postponed during MVP development.
Each item includes context on why it was deferred and when it may be revisited.

---

## Scheduling & UX

### Weekly Schedule View
- **Context:** Daily view was implemented as the primary schedule interface. Weekly view was planned but deferred after evaluating that daily navigation (prev/next + Today) covers core workflows.
- **Revisit:** After demo data evaluation and user feedback on scheduling UX.
- **Reference:** Story 5.2 notes

### Drag-and-Drop Rescheduling
- **Context:** Appointments are rescheduled via edit modal. Drag-and-drop would improve speed but adds significant UI complexity.
- **Revisit:** Phase 2 (Usability & Workflow Refinement)

---

## Authentication & Access

### Google Auth Production Configuration
- **Context:** Google OAuth button is implemented in the login page. However, it requires Google Cloud Console setup (OAuth credentials, redirect URIs) and may not work on localhost. A toggle flag (`google_auth_enabled` on practice table) is planned to let admins enable/disable it.
- **Revisit:** When deploying to a production domain.
- **Reference:** Story 1.3

### Configurable RBAC
- **Context:** Current roles (admin, doctor, clinic_manager) are hardcoded in the enum. A more flexible permission system would allow custom roles and granular permissions.
- **Revisit:** When clinics request custom role configurations.
- **Reference:** Story 8.2

---

## User Experience

### Dark Mode
- **Context:** shadcn/ui CSS variables are already set up for dark mode. Toggle implementation is straightforward but was not prioritized for MVP.
- **Revisit:** Low effort, can be added anytime.
- **Reference:** Story 1.4

### Self-Edit Contact Details
- **Context:** Staff members currently cannot edit their own phone, email, or messenger details. Only admins can modify staff records. All users should be able to update their own contact info (but not name or role).
- **Revisit:** Near-term improvement.
- **Reference:** Story 1.5

### Admin Edit Staff Profile
- **Context:** Admins and clinic managers should be able to edit staff profile details beyond role and status (e.g., phone number, messenger).
- **Revisit:** Together with Story 1.5.
- **Reference:** Story 3.6

---

## Notifications

### Email / SMS Notifications
- **Context:** No notification system exists in MVP. Appointment reminders, schedule changes, and staff alerts are all manual. Adding notifications requires choosing a delivery provider and designing templates.
- **Revisit:** Phase 2 or when user feedback identifies this as a pain point.
- **Reference:** Epic 9

---

## Audit & Compliance

### Audit Log
- **Context:** No user action logging exists. For compliance and operational transparency, a log of who did what and when would be valuable. Includes CSV export capability.
- **Revisit:** When moving toward production use with multiple staff members.
- **Reference:** Epic 11

---

## Data Model

### Children as Patients (No Phone Number)
- **Context:** Current schema requires `phone` as a non-null unique field per practice. Children or dependents without their own phone number cannot be created as separate patient records.
- **Revisit:** Introduce optional parent/guardian linkage or allow phone to be nullable with alternative identifier.

### Family Accounts
- **Context:** No concept of family grouping exists. Each patient is independent. Linking family members (parent + children) would improve clinic workflows for pediatric dentistry.
- **Revisit:** Post-MVP when patient model is extended.

### Insurance
- **Context:** No insurance or billing data is tracked. MVP focuses on scheduling, not financial workflows.
- **Revisit:** Phase 3+ or as a separate module.

### Multi-Practice Staff
- **Context:** A staff member belongs to exactly one practice (PDR-004). Doctors who work at multiple clinics cannot share a single account.
- **Revisit:** Phase 3 (Multi-Clinic Readiness).
- **Reference:** PDR-004

---

## Architecture

### Availability Enforcement — UI vs Server
- **Decision made:** Both. DB trigger `prevent_booking_outside_availability` enforces server-side. UI shows warning and disables the create button. This is not deferred — noting it here as an architectural decision.
- **Reference:** Trigger #5 in triggers.sql

### Demo Data Reset
- **Context:** `seed_demo_data()` can be called once. There is no "reset demo" or "clear demo data" function. If demo data needs to be refreshed, the database must be reset manually.
- **Revisit:** Add `is_demo` flag to practice and a reset function if demo mode becomes a recurring need.
