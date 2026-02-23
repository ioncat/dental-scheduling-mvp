# PDR-002 — Manual Appointment Completion

## Status
Accepted

---

## Context

Appointment systems often automatically mark visits as completed based on time.

However, real-world dental workflows include delays, cancellations, and extended treatments, making time-based automation unreliable.

---

## Decision

Appointments are completed manually by doctors or clinic managers.

No automatic state transitions are implemented in MVP.

---

## Rationale

- Reflect real operational workflows
- Avoid incorrect automatic completions
- Keep lifecycle logic explicit
- Maintain data accuracy

---

## Consequences

- Requires manual action by staff
- Higher operational clarity
- Simpler backend logic

---

## Alternatives Considered

- Automatic completion after end time
- Delayed auto-completion

Rejected due to risk of incorrect state transitions.
