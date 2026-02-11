# Dental Appointment Scheduling MVP  
> End-to-end Product Owner case (Discovery → MVP → Delivery → System Design)

This repository contains a complete product case for an MVP dental appointment scheduling platform.

It represents a full Product Owner / Product Manager workflow — from problem discovery and MVP scoping to delivery artifacts and system design.

The product is designed to replace Google Calendar as the primary scheduling tool for small dental clinics.

This is not a theoretical exercise — the MVP is planned for real implementation using vibe-coding.

---

## What is this project?

Small dental clinics often use Google Calendar to manage appointments.

While convenient, Google Calendar lacks:
- doctor-centric workload visibility
- availability management
- appointment lifecycle control
- domain-specific scheduling constraints
- reusable operational data

As a result, clinics experience scheduling chaos and rely on manual coordination.

This project explores whether dentists would adopt a purpose-built scheduling system if it provided clarity, control, and operational simplicity.

---

## MVP Goal

Validate **Value + Adoption**.

Specifically:

Determine whether doctors are willing to replace Google Calendar with a dedicated scheduling platform for daily operations.

---

## What’s inside this repository

Product artifacts:
- Product Vision
- MVP Scope
- Product Delivery Conventions (backlog standards)
- Epics 1–5 with User Stories and Acceptance Criteria
- MVP Roadmap
- System Context
- Scheduling Logic
- Database Schema

Diagrams:
- User Flow
- Appointment Lifecycle
- ER Diagram
- Container Diagram

All documentation lives in the `/docs` folder.

---
## Product Lifecycle Overview

For a structured view of how this case moves from Discovery to MVP, Delivery, and System Design, see:  
👉 [product-lifecycle-map.md](product-lifecycle-map.md)

---

## Where to start (recommended reading order)

If you only have a few minutes:

1. `docs/executive-summary.md`  
2. `docs/epics/epic-02-scheduling-core.md`  
3. `docs/roadmap.md`  
4. `docs/system-context.md`  

These files provide the fastest understanding of the product and delivery approach.

---

## MVP Scope (high level)

Included:
- Clinic onboarding
- Multi-doctor scheduling
- Appointment creation (default duration)
- Availability blocking
- Appointment lifecycle (scheduled / cancelled / completed)
- Search by patient name
- Filters by doctor, date, and status

Explicitly excluded:
- Patient self-booking
- Payments and billing
- Medical records
- External calendar integrations
- Analytics dashboards
- Notifications

---

## Status

MVP documentation complete.  
Implementation in progress via vibe-coding.

---

## Author

Alex Bondarenko  
Product Owner / Product Manager
