# PDR-003 — No External Calendar Integration in MVP

## Status
Accepted

---

## Context

Many scheduling tools integrate with Google Calendar or similar platforms.

However, the core hypothesis of this product is whether clinics will replace Google Calendar entirely.

---

## Decision

No external calendar integrations are included in MVP.

The scheduling platform acts as the single source of truth.

---

## Rationale

- Directly validate replacement behavior
- Avoid synchronization complexity
- Prevent dual-system usage
- Simplify system architecture
- Strengthen learning signal

---

## Consequences

- Clinics must migrate workflows
- No automatic sync with existing calendars
- Clear ownership of scheduling data

---

## Alternatives Considered

- One-way sync
- Two-way sync

Rejected due to dilution of MVP hypothesis.
