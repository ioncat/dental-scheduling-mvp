#Scheduling Logic

## 2. Scheduling Logic Rules

This table defines the core business rules governing appointments and availability.

| Rule ID | Rule Description                                            |
| ------- | ----------------------------------------------------------- |
| R1      | Appointments cannot overlap for the same doctor             |
| R2      | Appointments cannot be created in blocked time              |
| R3      | Default appointment duration is 1 hour                      |
| R4      | Appointment status is "scheduled" on creation               |
| R5      | Only doctors and clinic managers can modify appointments    |
| R6      | Completed appointments are immutable                        |
| R7      | Cancelled appointments free the time slot                   |
| R8      | Blocked time overrides availability                         |
| R9      | Appointment history includes completed and cancelled visits |
| R10     | Search operates on patient name only (MVP)                  |
| R11     | Filters can be combined (doctor + date + status)            |
| R12     | Role changes take effect immediately                        |

---

## 3. Appointment Lifecycle State Model


scheduled --> completed | +--> cancelled


Notes:
- No automatic transitions
- Completion is manual
- Cancelled appointments remain visible in history

---

## 4. Key Architectural Constraints (MVP)

- Single clinic per user
- No external integrations
- Stateless authentication
- Server-side validation of conflicts
- Schedule is the system of record

---

## 5. Product Assumptions

- Doctors will manage availability themselves
- Clinics accept manual lifecycle management
- Scheduling clarity is more valuable than automation in MVP