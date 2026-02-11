# System Context

## 1. System Context (Logical View)

The MVP system consists of a single core application with clearly separated user roles.

External integrations are intentionally excluded in MVP.

---

### Actors

- Doctor
- Clinic Manager
- Patient (indirect)
- Product Owner (configuration / validation)

---

### Core System

Dental Appointment Scheduling Platform

---

### Logical Interactions

Doctor:
- views personal schedule
- creates appointments
- blocks time
- completes visits

Clinic Manager:
- manages doctors
- creates appointments
- assigns doctors
- cancels visits

Patient:
- provides personal information to clinic staff
- attends appointments

---

### Context Diagram (Textual Representation)

[Doctor] ----------> [Scheduling Platform] --> [Appointment Data] / [Clinic Manager]-/ [Patient] --> (via clinic staff)


Single source of truth: Scheduling Platform  
No external calendar integrations in MVP.

---