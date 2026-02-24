# Epic 11 — Audit Log (Backlog)

> **Status:** Backlog. No audit infrastructure exists in the MVP.

## Story 11.1 — Log User Actions

### User Story
As an Admin
I want to see a log of all significant actions performed by staff
So that I can track who did what and when for accountability and troubleshooting.

### Acceptance Criteria
Given any staff member performs a significant action
Then the system records: who (staff_id), what (action type), target (entity + id), when (timestamp)

Given I am admin
When I open the Audit Log page
Then I see a chronological list of actions with filters by user, action type, and date range

### Actions to Log
- **Auth:** login, logout, failed login attempt
- **Appointments:** create, cancel, complete, assign doctor
- **Patients:** create, archive, restore, edit
- **Staff:** invite, deactivate, reactivate, change role
- **Practice:** update settings
- **Availability:** create/update/delete slots, create/delete time-off

### Notes for Engineering
- Create `audit_log` table: `id, staff_id, action, entity_type, entity_id, metadata (jsonb), created_at`
- Options for implementation:
  - **DB triggers** — automatic, no app changes, but limited context (no UI action names)
  - **Application-level** — explicit logging calls in mutation hooks, richer context
  - **Hybrid** — DB triggers for data changes + app-level for auth events
- RLS: only admin can read audit_log
- Consider retention policy (e.g., keep 90 days)
- Add `/audit-log` route, admin-only, with filters and pagination

### Edge Cases
- High-frequency actions (e.g., rapid edits) — consider debouncing or batching
- Deleted entities — log should retain entity_id even if original record is gone
- Storage growth — implement pagination and optional archival

---

## Story 11.2 — Export Audit Log (Backlog)

### User Story
As an Admin
I want to export the audit log as CSV
So that I can share it with management or keep external records.

### Acceptance Criteria
Given I am on the Audit Log page
When I click "Export CSV"
Then a CSV file is downloaded with the currently filtered log entries
