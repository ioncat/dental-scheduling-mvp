# User Flow — Doctor Scheduling Journey

This diagram represents the primary operational flow for a doctor using the system.

```mermaid
flowchart TD

    A[Login] --> B[View Personal Schedule]

    B --> C[Create Appointment]
    C --> D[Appointment Scheduled]

    B --> E[Block Time]
    E --> F[Time Marked Unavailable]

    D --> G[Complete Appointment]
    D --> H[Cancel Appointment]

    G --> I[Appointment in History]
    H --> I