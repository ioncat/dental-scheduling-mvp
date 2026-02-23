# Product Vision — Dental Appointment Scheduling Platform (MVP)

## 1. Background / Context

Small and mid-sized dental clinics often rely on **Google Calendar** as their primary tool for appointment scheduling.  
While Google Calendar is a powerful general-purpose calendar, it is **not designed** to support the operational realities of a dental practice.

As a result, clinics adapt it beyond its intended use, leading to:
- overloaded shared calendars,
- poor visibility of doctors’ individual workloads,
- manual coordination via phone calls and messages,
- frequent scheduling errors and last-minute changes.

This product is designed as a **purpose-built appointment scheduling tool** for dental clinics, starting with the doctor as the primary user.

---

## 2. Problem Statement

Dental clinics use Google Calendar as an appointment scheduling system, even though it lacks:
- clear ownership of time slots,
- support for medical appointment constraints,
- separation of roles (doctor vs clinic operations),
- visibility into daily clinical workload,
-  the ability to reuse collected scheduling data for history, analysis, or optimization. As a result, valuable operational data remains locked inside a generic calendar tool and cannot be leveraged for:
	- understanding workload patterns,
	- improving scheduling efficiency,
	- identifying no-shows or bottlenecks,
	- making informed operational decisions.

This leads to scheduling chaos, operational friction, and reduced focus on patient care.

---

## 3. Primary User

### Primary User
**Dentist (Doctor)**

The dentist is the primary user because:
- they are directly affected by schedule chaos,
- they need a clear, predictable daily workload,
- in small clinics, the dentist often also acts as a clinic manager.

### Secondary Users (MVP scope-aware)
- Clinic Manager / Receptionist (may overlap with Doctor role)
- Patient (limited interaction in MVP)

---

## 4. High-Level Solution

A lightweight, role-aware scheduling system that:
- provides each doctor with a **clear, personal schedule**,
- supports appointment-specific logic (duration, buffers, status),
- works out-of-the-box for **small clinics**, but is extensible to multi-clinic setups,
- replaces Google Calendar as the **single source of truth** for appointment,


The system focuses on **clarity, control, and simplicity**, not on being a full practice management platform.

---

## 5. MVP Goal

**Validate Value and Adoption**

> Validate that dentists are willing to replace Google Calendar with a purpose-built appointment scheduling tool that provides clearer visibility and control over their daily workload.

---

## 6. MVP Non-Goals (Explicitly Out of Scope)

To avoid overengineering, the MVP will **not** include:

- billing or invoicing
- insurance processing
- medical records (EHR)
- advanced analytics or reporting
- patient self-service booking (initially)
- complex permissions or enterprise-grade roles
- calendar sync with external systems (Google, Apple, etc.)

These may be considered in later stages.

---

## 7. Success Definition (Stage 1)

The MVP is considered successful if:

- Dentists actively use the system to manage appointments
- Dentists create and manage appointments without external tools
- The system becomes the **primary scheduling tool**, replacing Google Calendar
- Dentists report improved clarity and reduced scheduling friction

### Example Success Signals
- A doctor creates ≥10 appointments in the system
- Uses the system on ≥5 working days
- Stops maintaining a parallel Google Calendar
- Qualitative feedback: “This is clearer / easier than Google Calendar”

---

## 8. Guiding Principles

- Replace workarounds, not habits
- Optimize for the doctor’s mental load
- Prefer clarity over configurability
- Build for small clinics first, scale later
