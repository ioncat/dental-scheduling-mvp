# Product Lifecycle Map  
## Discovery → MVP → Delivery → System Design

This document maps all product artifacts in the repository to the corresponding stages of the product lifecycle.

It demonstrates how the project moves from problem discovery to a build-ready MVP and system design.

---

## Discovery  
Understanding the problem, defining the hypothesis, and setting product boundaries.

| Document | Purpose |
|---------|---------|
| docs/executive-summary.md | High-level context: problem, hypothesis, MVP goal |
| docs/product-vision.md (optional) | Product vision and primary user |
| docs/mvp-scope.md | Definition of MVP boundaries (in / out) |

### Product Decisions Originating in Discovery

| Decision | Stage | Why |
|----------|-------|-----|
| PDR-001 — No Patient Self-Booking | Discovery | Focus validation on doctor adoption |
| PDR-003 — No External Calendar Integration | Discovery | Validate full replacement hypothesis |

### Demonstrates
- Problem framing  
- Hypothesis-driven thinking  
- Explicit constraints  
- Product discovery mindset  

---

## MVP  
Transforming the hypothesis into a minimal, testable product.

| Document | Purpose |
|---------|---------|
| docs/mvp-scope.md | MVP defined as validation tool |
| docs/epics/epic-01-clinic-setup.md | MVP foundation |
| docs/epics/epic-02-scheduling-core.md | Core value of the MVP |
| docs/epics/epic-03-availability.md | Operational workflows |
| docs/epics/epic-04-lifecycle.md | Appointment state management |
| docs/epics/epic-05-search.md | Usability at scale |

### Product Decisions Originating in MVP Definition

| Decision | Stage | Why |
|----------|-------|-----|
| PDR-002 — Manual Appointment Completion | MVP | Keep lifecycle explicit and operationally accurate |
| PDR-004 — One Clinic per User | MVP | Reduce complexity and accelerate delivery |

### Demonstrates
- MVP discipline  
- Value decomposition  
- Prioritization  
- Ability to say “no”  

---

## Delivery  
Turning MVP scope into delivery-ready artifacts for a cross-functional team.

| Document | Purpose |
|---------|---------|
| docs/product-delivery-conventions.md | Contract between Product and Engineering |
| docs/epics/* | Delivery-ready backlog (stories, AC, edge cases) |
| docs/roadmap.md | Phased delivery and learning milestones |
| docs/decisions/* | Context behind product trade-offs |
| README.md | Entry point for stakeholders |

### Demonstrates
- Backlog ownership  
- Delivery readiness  
- Team alignment  
- Operational product management  

---

## System Design  
Describing how the product works as a system (without overengineering).

| Document | Purpose |
|---------|---------|
| docs/system-context.md | System boundaries and actors |
| docs/scheduling-logic.md | Core domain rules |
| docs/database-schema.md | Logical data model |
| docs/diagrams/user-flow.md | Primary user flow |
| docs/diagrams/appointment-lifecycle.md | Appointment state machine |
| docs/diagrams/database-erd.md | Entity relationships |
| docs/diagrams/container-diagram.md | High-level container architecture |

### Demonstrates
- System thinking  
- Domain modeling  
- Product–engineering bridge  
- Implementation readiness  

---

## Decision Layer (Cross-Cutting)

Product Decision Records are not limited to one stage.

They capture explicit trade-offs across Discovery, MVP, and Delivery.

All decisions are documented in:

docs/decisions/

---

## End-to-End Flow

Discovery  
↓  
MVP Definition  
↓  
Delivery Planning  
↓  
System Design  

Each stage builds on the previous one.  
Artifacts are complementary and intentionally non-overlapping.

---

## Summary

This repository represents a complete Product Owner workflow:

- from identifying a real-world problem  
- through MVP definition and prioritization  
- to delivery-ready backlog  
- and finally to system and data design  

With explicit documentation of product trade-offs at every stage.
