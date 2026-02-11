# Appointment Lifecycle — State Model

This diagram defines valid state transitions for an appointment in MVP.

```mermaid
stateDiagram-v2

    [*] --> Scheduled

    Scheduled --> Completed
    Scheduled --> Cancelled

    Completed --> [*]
    Cancelled --> [*]