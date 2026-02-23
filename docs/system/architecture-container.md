```mermaid
flowchart LR

User((User\nAdmin / Doctor / Clinic Manager))

User --> Browser[Browser]

Browser --> SPA[SPA Frontend\nVite + React + TypeScript]

%% SPA internal layers

SPA --> Router[TanStack Router\nPages + Auth Guard]
SPA --> UI[React UI Components\nshadcn/ui]
SPA --> Query[TanStack Query\nServer State]
SPA --> Repos[Repository Layer\nappointments / patients / staff]

Router --> UI
UI --> Query
Query --> Repos

%% Supabase

Repos --> Supabase[Supabase Platform]

subgraph Supabase
Auth[Auth\nMagic Link]
Postgres[(PostgreSQL)]
RLS[RLS Policies]
Triggers[Domain Triggers]
end

Supabase --> Auth
Supabase --> Postgres

Postgres --> RLS
Postgres --> Triggers

Auth --> SPA

%% Data

Postgres --- Tables[Tables\npractice\nstaff\npatient\nappointment\navailability\ntime_off]