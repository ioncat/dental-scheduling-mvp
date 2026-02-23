# UI Component Map — Dental Scheduling MVP

Stack:
- React
- TypeScript
- shadcn/ui
- Tailwind
- TanStack Router
- TanStack Query

---

## Layout

### AppLayout
Root authenticated layout.

Contains:
- SidebarNav
- TopBar
- MainContent

---

### SidebarNav

Items:
- Schedule
- Patients
- Availability
- Settings (admin only)
- Account

Props:
- role

---

### TopBar

Elements:
- Current date selector
- User name

---

## Auth

### LoginForm

Fields:
- email

States:
- idle
- loading
- success
- error

---

## Schedule

### SchedulePage

Composed of:
- UnassignedAlert
- DoctorColumn[]
- TimeGrid
- AppointmentModal

---

### UnassignedAlert

Visible:
- admin
- clinic_manager

Props:
- unassignedCount

---

### DoctorColumn

Props:
- doctor
- appointments

---

### TimeGrid

Responsible for:
- layout slots
- click handlers

---

### AppointmentCard

States:
- scheduled
- unassigned
- completed
- cancelled

Props:
- appointment

---

### AppointmentModal

Modes:
- create
- view
- edit

Fields:
- patient selector
- doctor selector (optional)
- start / end time
- notes

Actions:
- save
- cancel
- complete
- assign doctor

---

## Patients

### PatientsPage

Contains:
- PatientSearch
- PatientsTable
- CreatePatientModal

---

### PatientsTable

Rows:
- PatientRow

---

### PatientRow

Props:
- patient

---

### PatientDetailsPage

Blocks:
- PatientInfoCard
- AppointmentHistory
- ArchiveButton

---

### ArchiveButton

Disabled if:
- future appointments exist

---

## Availability

### AvailabilityPage

Contains:
- DoctorSelector (admin)
- WeeklyAvailabilityEditor
- TimeOffList

---

### WeeklyAvailabilityEditor

Grid per weekday.

---

### TimeOffList

Actions:
- add
- remove

---

## Settings

### SettingsPage (admin only)

Tabs:
- PracticeSettingsForm
- StaffManagement

---

### PracticeSettingsForm

Editable:
- clinic_name
- address
- phone
- email
- timezone
- date_format

---

### StaffManagement

Contains:
- StaffTable
- InviteStaffModal

---

### StaffTable

Rows:
- StaffRow

---

### StaffRow

Actions:
- change role
- deactivate

---

## Account

### AccountPage

Fields:
- full_name
- email
- phone
- role

Read-only.

---

## Shared

### DoctorSelector
### PatientSelector
### ConfirmDialog
### LoadingSpinner
### ErrorBanner

---

## Data Layer (non-UI)

repositories/
- appointments.repo.ts
- patients.repo.ts
- staff.repo.ts
- availability.repo.ts
- practice.repo.ts

Each repo exposes:
- list()
- get()
- create()
- update()
- delete() (soft)

Components never call Supabase directly.

---

End.