# Dental Scheduling MVP  
## Product Design Brief (Admin Web App)

---

## 1. Product Summary

This is a **B2B internal scheduling system for a dental clinic**.

Primary user: **Clinic Administrator**

The system is designed to:

- Manage doctor availability
- Create and control appointments
- Track visit lifecycle
- Search patients and bookings

This is an **operational tool**, not a patient-facing product.

Desktop-first.

---

## 2. Core Principles

- Schedule screen is the product core
- Minimum navigation
- Inline editing over page transitions
- Modals over new pages
- Keyboard-friendly
- No dashboards
- No analytics
- No patient self-booking
- No external calendar integrations

---

## 3. Primary User

### Clinic Administrator

Daily tasks:

- Create appointments
- Reschedule visits
- Change appointment status
- Manage doctor availability
- Search patients

Speed and clarity are higher priority than visuals.

---

## 4. Information Architecture


Schedule is root workspace.

Everything else is satellite.

---

## 5. User Flow Overview

### Create Appointment

Schedule → Empty Slot / +New → Appointment Modal → Save

---

### Manage Appointment

Schedule → Click Appointment → Edit / Drag / Change Status

---

### Manage Availability

Availability → Select Doctor → Edit Weekly Template → Add Date Overrides → Save

---

### Find Patient / Booking

Global Search → Result → Appointment Modal

---

## 6. Screens

---

# S1 — Schedule Screen (Core Workspace)

### Layout Zones

- Top Bar
- Sidebar
- Time Grid
- Appointment Blocks

---

### Top Bar

- Date navigation (prev / next / today)
- Global search
- + New Appointment

---

### Sidebar

- Schedule
- Patients
- Availability
- Settings

---

### Schedule Grid

- Vertical: time slots
- Horizontal: doctors

Cell states:

- Empty → available
- Grey → unavailable
- Colored → appointment

---

### Appointment Block

Displays:

- Patient name
- Time
- Status

Status colors:

- Scheduled
- Confirmed
- Completed
- Cancelled
- No-show

---

### Interactions

- Click empty slot → create appointment
- Drag appointment → reschedule
- Click appointment → edit modal
- Hover → quick actions

---

### Validation

Shown inline before save:

- Doctor unavailable
- Slot occupied
- Outside working hours

Save disabled if invalid.

---

---

# S2 — Appointment Modal (Create / Edit / View)

Single reusable modal.

---

### Fields

Required:

- Patient
- Doctor
- Date
- Time

Optional:

- Service

System:

- Status

---

### Layout

Patient (search / +create)  
Doctor  
Date  
Time  
Service  
Status  

Validation message  
Cancel / Save

---

### Inline Patient Create

If patient not found:

Name  
Phone  
Save  

(no separate screen)

---

### Status Options

- Scheduled
- Confirmed
- Completed
- Cancelled
- No-show

Completed auto-closes modal.

---

---

# S3 — Availability Screen

Purpose: configure doctor working hours.

Not a calendar.

---

### Layout

Doctor selector (dropdown)

---

### Weekly Template

Each weekday:

Start time — End time  
or  
Off

---

### Date Overrides

Add specific date exceptions:

- Full day off
- Partial working hours

Overrides always take precedence over weekly template.

---

### Rules

- No overlaps
- Past dates disabled
- Single Save button

---

---

# S4 — Patients List

Simple directory, not CRM.

---

### Layout

Search input

Table:

Name | Phone | Last Visit | Actions

Actions:

- View
- Edit

---

### Interactions

- Click patient → opens Appointment Modal
- Edit inline or modal

---

### Fields (Patient)

- Name
- Phone

Only minimal data.

---

---

# S5 — Settings (Minimal)

- Clinic name
- Default working hours

---

## 7. MVP Feature Checklist

Schedule:

- Time grid
- Drag reschedule
- Status management
- Inline validation

Appointments:

- Create / edit
- Inline patient creation
- Status lifecycle

Availability:

- Weekly template
- Date overrides
- Doctor selector

Patients:

- List
- Search
- Edit

No analytics.  
No onboarding.  
No integrations.

---

## 8. Design Priorities

1. Speed of operation
2. Visual clarity
3. Minimal cognitive load
4. Fewest clicks possible

This is a receptionist tool — not a marketing product.

---


