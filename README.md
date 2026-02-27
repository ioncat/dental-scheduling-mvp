# Dental Appointment / Scheduling MVP
> End-to-end Product Owner case (Discovery > MVP > Delivery > System Design)

This repository contains a complete product case for an MVP dental appointment scheduling platform.

It represents a full Product Owner / Product Manager workflow — from problem discovery and MVP scoping to delivery artifacts and system design.

The product is designed to replace Google Calendar as the primary scheduling tool for small dental clinics.

This is not a theoretical exercise — the MVP has been fully implemented and is ready for user testing.

---

## What This Project Is

Small dental clinics often use Google Calendar to manage appointments.

While convenient, Google Calendar lacks:

- staff lifecycle (admin / doctor / clinic manager)
- patient lifecycle (create / archive / restore)
- appointment scheduling with reassignment
- availability and time off
- role-based access
- database-enforced business rules

As a result, clinics may experience scheduling chaos and rely on manual coordination.

This project explores whether dentists would adopt a purpose-built scheduling system if it provided clarity, control, and operational simplicity.

The product was designed first at product level (vision, scope, roadmap, decisions)
and only then translated into system architecture and implementation.

---

## What This Repository Demonstrates

This project intentionally shows the full product loop:

Product discovery
> domain modeling
> delivery planning
> system architecture
> working application

Most repositories show either documentation or code.

This one connects both.

Architecture here is not speculative — it directly follows product decisions.

---

## MVP Goal

Validate **Value + Adoption**.

Specifically:

Determine whether doctors are willing to replace Google Calendar with a dedicated scheduling platform for daily operations.

---

## Where to Start

**Understand the product**

1. [Executive Summary](docs/0%20executive-summary.md) — hypothesis, MVP goal, success criteria
2. [Product Vision](docs/1%20product-vision.md) — target audience, pain points, core principles
3. [MVP Scope](docs/2%20mvp-scope.md) — what's in, what's out, user flows
4. [Domain ↔ UI Contract](docs/contracts/domain-ui.md) — roles, pages, routes, 15 business rules
5. [Appointment Lifecycle](docs/contracts/appointment-lifecycle.md) — status flow, triggers, permissions
6. [Product Decisions](docs/decisions/) — 4 conscious "no"s (PDR-001 → PDR-004)

**Architecture, Delivery & Code**

| Goal | Start here | Then |
|------|-----------|------|
| **Review architecture** | [System Context](docs/system/system-context.md) | [Container Diagram](docs/system/container-diagram.md) → [Schema](docs/backend/schema.logical.md) |
| **See delivery process** | [Dev Plan](docs/delivery/dev-plan-en.md) | [Epics](docs/delivery/epics/) (11 epics, 28 user stories) |
| **Run the application** | [Quick Start](app/QUICK-START.md) | `npm install` → `npm run dev` → demo data included |

Full navigation across all 36 documents: **[Documentation Guide](docs/GUIDE.md)**

---

## Project Status

**MVP complete — 28/28 stories implemented.**

The application supports end-to-end clinic workflows: staff management, patient lifecycle, appointment scheduling with availability enforcement, role-based access control, and demo data for immediate evaluation.

See [Quick Start](app/QUICK-START.md) to install and run the application.

---

## Author

Alex Bondarenko — Product Owner / Product Manager

[GitHub](https://github.com/ioncat/) · [LinkedIn](https://www.linkedin.com/in/alexibondarenko/)

### AI Co-Authors

**ChatGPT 5.2** — product discovery, planning & system design
- Problem analysis and hypothesis framing
- Product vision, MVP scope, roadmap
- Epic breakdown and user story writing
- Delivery conventions and decision records
- System architecture and database design
- Backend contracts (triggers, RLS, RPC functions)

**Claude Code (Opus 4.6)** — development, refinement & deployment
- Frontend development (React, TypeScript, full MVP)
- Architecture and database refinement during implementation
- Documentation sync and product orientation
- Docker deployment with production hardening

---
