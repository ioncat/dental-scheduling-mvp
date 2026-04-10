# Epic 8 — Access Control

## Story 8.1 — Enforce Role-Based Visibility

### User Story
As system  
I want to enforce role-based access  
So that users only see permitted data.

### Acceptance Criteria
Given user role doctor  
Then only own appointments and availability visible  

Given user role clinic_manager  
Then scheduling and patients visible  
But staff and practice hidden  

Given user role admin  
Then full access granted  

### Edge Cases
- Role changed during active session

### Notes for Engineering
- Enforce via RLS

---

## Story 8.2 — Configurable RBAC: Custom Roles & Permissions (Backlog)

### User Story
As an Admin
I want to create custom roles with granular permissions
So that I can fine-tune access for each staff member beyond the default 3 roles.

### Acceptance Criteria
Given I am admin
When I open Settings → Roles & Permissions
Then I see a list of roles with a permission matrix

Given I create a new role (e.g., "Receptionist")
When I toggle specific permissions (view schedule, create appointments, view patients, etc.)
Then the role is saved and can be assigned to staff

Given a staff member has a custom role
Then their UI and data access reflects only the granted permissions

### Permission Categories
- **Schedule:** view, create appointment, cancel, complete, assign doctor
- **Patients:** view, create, edit, archive/restore
- **Availability:** view own, edit own, view all, edit all
- **Staff:** view list, invite, deactivate, change role
- **Practice:** view settings, edit settings
- **Audit Log:** view, export

### Notes for Engineering
- Current MVP has 3 hardcoded roles: admin, clinic_manager, doctor
- Migration path: map existing roles to permission sets, then allow custom roles
- New tables: `role` (id, name, practice_id), `role_permission` (role_id, permission_key, granted)
- Replace `staff.role` enum with `staff.role_id` FK
- RLS policies must read permissions dynamically via security definer helper
- UI: permission matrix (roles as columns, permissions as rows, checkboxes)
- Consider preset templates: "Full Admin", "Manager", "Doctor", "Receptionist"

### Edge Cases
- Deleting a role that has staff assigned (must reassign first)
- Removing all permissions from a role (block — at least one must remain)
- Last admin loses admin-equivalent permissions (block)
- Role changes during active session (force re-fetch on next navigation)
