# PDR-001 — No Patient Self-Booking in MVP

## Status
Accepted

---

## Context

Many appointment scheduling products start with patient self-booking as a core feature.

However, small dental clinics often rely on doctors or receptionists to manage appointments manually.  
Introducing patient self-booking would require complex availability synchronization, slot management, and UX flows.

---

## Decision

Patient self-booking is excluded from the MVP.

All appointments are created and managed by clinic staff (doctors or clinic managers).

---

## Rationale

- Focus initial validation on doctor adoption, not patient behavior
- Reduce MVP complexity and surface area
- Avoid premature marketplace dynamics
- Maintain full control over scheduling logic
- Accelerate delivery and learning speed

---

## Consequences

- Clinics must manually create appointments
- MVP remains operationally focused
- Patient experience is indirect

---

## Alternatives Considered

- Simple booking form
- Time-slot based booking

Rejected due to increased complexity and weaker learning signal for core value.
