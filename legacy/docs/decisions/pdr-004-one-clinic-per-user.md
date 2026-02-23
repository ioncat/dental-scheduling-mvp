# PDR-004 — One Clinic per User

## Status
Accepted

---

## Context

Some platforms allow users to belong to multiple organizations.

Supporting multi-clinic membership introduces additional complexity in permissions, data isolation, and UX.

---

## Decision

Each user can belong to only one clinic in MVP.

Multi-clinic support is deferred.

---

## Rationale

- Simplify authorization logic
- Reduce data model complexity
- Focus on core scheduling workflows
- Accelerate MVP delivery

---

## Consequences

- Users cannot switch between clinics
- Future migration required for multi-clinic scenarios

---

## Alternatives Considered

- Multi-clinic membership
- Organization switching

Rejected due to MVP scope constraints.
