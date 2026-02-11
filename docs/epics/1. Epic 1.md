# Epic 1 — Clinic & User Setup

## Epic Goal

Enable a clinic to onboard into the system and provide doctors with secure, role-aware access to their schedules.

This epic establishes the foundation required for all further scheduling functionality.

---

## Business Value

- Enables real clinics to start using the product
- Establishes clinic ownership and role boundaries
- Allows doctors to access personal schedules
- Creates a realistic onboarding flow for MVP validation

Without this epic, no scheduling functionality can be used.

---

## In Scope

- Clinic creation
- Doctor onboarding
- Role assignment (Doctor / Clinic Manager)
- User authentication (login)
- Basic user profile

---

## Out of Scope

- Advanced permission matrices
- Password recovery flows
- Social login
- Multi-clinic membership for a single user
- System-wide admin dashboards

---

## Delivery RACI

| Role               | R   | A   | C   | I   |
| ------------------ | --- | --- | --- | --- |
| Product Owner      |     | ✔   |     |     |
| Backend Developer  | ✔   |     |     |     |
| Frontend Developer | ✔   |     |     |     |
| QA Engineer        |     |     | ✔   |     |
| UX Designer        |     |     | ✔   |     |
| Tech Lead          |     |     | ✔   |     |

---

## User Stories

---

### US-1.1 — Create Clinic

As a Clinic Manager  
I want to create a clinic in the system  
So that I can start managing doctors and appointments.

#### Acceptance Criteria

Given I am a new user  
When I create a clinic by providing a clinic name  
Then the clinic is created successfully  
And I am assigned the Clinic Manager role  
And I am redirected to the clinic dashboard

#### Edge Cases

- Clinic name is empty
- Clinic name exceeds allowed length
- Duplicate clinic name within the system

#### Out of Scope

- Editing clinic details after creation
- Clinic branding or customization

#### Notes for Engineering

- Clinic name uniqueness rules must be defined
- Clinic creation and role assignment must be atomic

---

### US-1.2 — Add Doctor to Clinic

As a Clinic Manager  
I want to add a doctor to my clinic  
So that the doctor can manage their personal schedule.

#### Acceptance Criteria

Given I am logged in as a clinic manager  
When I invite a doctor by email  
Then an invitation is sent to the provided email  
And the doctor appears in the clinic doctors list with “Pending” status

#### Edge Cases

- Email already associated with another clinic
- Doctor already invited
- Invalid email format

#### Out of Scope

- Bulk doctor import
- Role assignment beyond Doctor / Clinic Manager

#### Notes for Engineering

- Invitation token must be time-limited
- Invitation status must be persisted

---

### US-1.3 — Accept Clinic Invitation

As a Doctor  
I want to accept a clinic invitation  
So that I can access my schedule within the clinic.

#### Acceptance Criteria

Given I received a valid invitation  
When I accept the invitation  
Then I become associated with the clinic  
And I can log in and access my personal schedule

#### Edge Cases

- Invitation expired
- Invitation already accepted
- Invitation revoked by clinic manager

#### Out of Scope

- Invitation reassignment
- Invitation reminders

#### Notes for Engineering

- Invitation acceptance must be idempotent
- Role assignment must happen automatically on acceptance

---

### US-1.4 — Login to the System

As a Doctor or Clinic Manager  
I want to log into the system  
So that I can access my clinic and schedule.

#### Acceptance Criteria

Given I have valid credentials  
When I log in  
Then I am authenticated successfully  
And redirected to the appropriate landing page based on my role

#### Edge Cases

- Invalid credentials
- User without clinic association
- User associated with multiple clinics (future scenario)

#### Out of Scope

- Password recovery
- Session management customization

#### Notes for Engineering

- Authentication must be secure and stateless
- Role-based routing must be explicit

---

### US-1.5 — Assign Clinic Manager Role to Doctor

As a Clinic Manager  
I want to grant clinic manager privileges to a doctor  
So that administrative responsibilities can be shared.

#### Acceptance Criteria

Given I am a clinic manager  
When I assign manager role to a doctor  
Then the doctor gains clinic management permissions  
And can perform manager-level actions

#### Edge Cases

- Assigning role to inactive doctor
- Removing own manager role

#### Out of Scope

- Custom role definitions
- Partial permission assignment

#### Notes for Engineering

- Role changes must take effect immediately
- Audit logging of role changes is required

---

## Definition of Done (Epic Level)

- Clinic can be created
- Doctors can be invited and onboarded
- Roles work as expected
- Users can log in and access the system
- No critical security issues
- Product Owner accepts onboarding flow
- QA signs off core scenarios
