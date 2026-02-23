# Product Vision — Dental Appointment Scheduling Platform (MVP)

## 1. Background / Context

Small and mid-sized dental clinics often rely on **Google Calendar** as their primary tool for appointment scheduling.  
While Google Calendar is a powerful general-purpose calendar, it is **not designed** to support the operational realities of a dental practice.

As a result, clinics adapt it beyond its intended use, leading to:
- overloaded shared calendars,
- poor visibility of doctors’ individual workloads,
- manual coordination via phone calls and messages,
- frequent scheduling errors and last-minute changes.

The goal of this product is to help small dental clinics manage appointments and availability in a simple, reliable way.
The focus is on operational clarity rather than feature richness.

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
## 3. Core Idea  
  
Provide clinics with a single source of truth for:  
  
- who is working  
- when doctors are available  
- which appointments exist  
- which patients are active  
  
The system should reduce coordination overhead and prevent common operational errors such as double bookings or forgotten appointments.  
  
---  
  
## 4. Product Principles  
  
### Simplicity First  
  
The product prioritizes clear workflows over complex automation.  
  
Every feature must directly support daily clinic operations.  
  
---  
  
### Operational Reality Over Ideal Flows  
  
The system is designed around real-world clinic behavior:  
  
- doctors get sick  
- schedules change  
- patients cancel  
- staff availability fluctuates  
  
These situations are treated as core scenarios, not edge cases.  
  
---  
  
### Explicit Over Implicit  
  
State should always be visible:  
  
- appointments can be unassigned  
- staff can be inactive  
- patients can be archived  
  
The system should never hide operational uncertainty.  
  
---  
  
## 5. Long-Term Direction  
  
If the core scheduling model proves stable, future directions may include:  
  
- multi-clinic support  
- patient notifications  
- self-service booking  
- basic analytics  
  
These are intentionally deferred until operational workflows are solid.
  
---
## 6. Primary User

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

## 7. High-Level Solution

A lightweight, role-aware scheduling system that:
- provides each doctor with a **clear, personal schedule**,
- supports appointment-specific logic (duration, buffers, status),
- works out-of-the-box for **small clinics**, but is extensible to multi-clinic setups,
- replaces Google Calendar as the **single source of truth** for appointment,


The system focuses on **clarity, control, and simplicity**.

---

## 8. MVP Goal

**Validate Value and Adoption**

> Validate that dentists are willing to replace Google Calendar with a purpose-built appointment scheduling tool that provides clearer visibility and control over their daily workload.

---

## 9. MVP Non-Goals (Explicitly Out of Scope)

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

## 10. Success Definition (Stage 1)

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

## 11. Guiding Principles

- Replace workarounds, not habits
- Optimize for the doctor’s mental load
- Prefer clarity over configurability
- Build for small clinics first, scale later



## 12. Product Evolution  
  
The product started as a dentist-centered scheduling tool and evolved into a broader operational system as domain complexity became explicit.  
  
Staff lifecycle, patient lifecycle, reassignment, and availability constraints emerged naturally during discovery and are now treated as first-class product states.

---