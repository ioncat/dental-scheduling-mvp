# ER Diagram — MVP Data Model  


# MVP Database ER Diagram

This diagram represents the logical data model for the MVP.

```mermaid
erDiagram

    CLINIC ||--o{ USER : has
    CLINIC ||--o{ APPOINTMENT : owns
    CLINIC ||--o{ INVITATION : sends

    USER ||--o{ APPOINTMENT : performs
    USER ||--o{ BLOCKED_TIME : blocks

    CLINIC {
        uuid id
        string name
        timestamp created_at
    }

    USER {
        uuid id
        string email
        string role
        uuid clinic_id
    }

    APPOINTMENT {
        uuid id
        uuid clinic_id
        uuid doctor_id
        string patient_name
        datetime start_time
        datetime end_time
        string status
    }

    BLOCKED_TIME {
        uuid id
        uuid doctor_id
        datetime start_time
        datetime end_time
    }

    INVITATION {
        uuid id
        uuid clinic_id
        string email
        string status
    }
