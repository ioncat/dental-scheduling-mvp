# Container Diagram — MVP Architecture

This diagram shows the high-level containers of the MVP system.

```mermaid
flowchart LR

    Doctor["Doctor / Clinic Manager<br/>Web Browser"]
        --> Frontend["Frontend Web App"]

    Frontend --> Backend["Backend API"]

    Backend --> DB["Database"]

    subgraph System["Dental Scheduling Platform"]
        Frontend
        Backend
        DB
    end