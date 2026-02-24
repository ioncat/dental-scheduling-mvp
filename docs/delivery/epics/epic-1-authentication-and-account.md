# Epic 1 — Authentication & Account

## Story 1.0 — First Launch Setup & Staff Access Control

### User Story
As the person deploying the system
I want to set up the clinic and become administrator through a web interface
So that no manual database access is required to start using the application.

### Acceptance Criteria
Given the system is deployed with an empty database
When I open the application for the first time
Then I am redirected to the /setup page

Given I am on the /setup page
When I enter the clinic name, my name, and my email
Then the system creates the practice and my admin account
And sends a Magic Link to my email
And after I click the link, I am signed in as administrator

Given the system has been set up (at least one staff record exists)
When anyone tries to access /setup
Then they are redirected to /login

Given I am not registered in the staff table
When I enter my email on the login page
Then I see an "Access denied. Contact your administrator." message
And no Magic Link is sent

Given I am registered in the staff table with status "active" or "pending"
When I enter my email on the login page
Then a Magic Link is sent to my email

Given a new staff member signs in for the first time
When the Supabase auth account is created
Then the system automatically links the auth user ID to the existing staff record by email

### Edge Cases
- Someone tries to access /setup after system is already bootstrapped — redirect to /login
- `bootstrap_practice()` called twice concurrently — second call fails with guard clause
- Admin email is unreachable — account created but magic link undelivered; admin can retry via /login
- Staff record exists but status is "inactive" — login must be denied
- Two staff records with the same email (prevented by unique constraint)

### Out of Scope
- Self-registration flow
- Password-based authentication
- Multi-clinic setup from UI

### Notes for Engineering
- `is_system_bootstrapped()` — RPC, returns true if staff table is non-empty
- `bootstrap_practice(clinic_name, admin_name, admin_email)` — RPC, creates practice + admin, fails if already bootstrapped
- `is_staff_email()` — RPC, returns boolean, called before signInWithOtp
- `link_staff_on_first_login()` — trigger on auth.users INSERT, links staff.id to auth.uid()
- Router: all routes check `is_system_bootstrapped()` and redirect to /setup if false
- The `staff.email` column must have a unique constraint
- No seed.sql required — setup happens entirely through the UI

### Dependencies
- Database schema (staff table must exist)
- Supabase Auth configured with Magic Link enabled

---

## Story 1.1 — Login via Magic Link

### User Story
As a Staff member  
I want to log in using a magic link sent to my email  
So that I can access the system without managing passwords.

### Acceptance Criteria
Given I am an active staff member  
When I enter my email on the login page  
Then I receive a magic link email  

Given I click a valid magic link  
When the link is verified  
Then I am authenticated and redirected to /schedule  

Given I am inactive staff  
When I attempt to log in  
Then access is denied  

### Edge Cases
- Expired magic link
- Invalid email
- User exists in Auth but Staff record is inactive
- Multiple login requests in short time

### Out of Scope
- Password-based authentication

### Notes for Engineering
- Supabase Auth magic link flow
- Login allowed only if staff.status = active
- Google Social Auth added in Story 1.3

---

## Story 1.2 — View Account Profile (Read Only)

### User Story
As a Staff member  
I want to view my account profile  
So that I can confirm my registered information.

### Acceptance Criteria
Given I am authenticated  
When I open Account page  
Then I see full_name, email, phone_number, role  

Given I view my profile  
Then all fields are read-only  

### Edge Cases
- Missing phone_number
- Messenger fields empty

### Out of Scope
- Password management

### Notes for Engineering
- Data sourced from Staff table
- See Story 1.5 for self-edit of contact details

---

## Story 1.3 — Google Social Auth (Backlog)

### User Story
As a Staff member
I want to sign in with my Google account
So that I can access the system faster without waiting for a magic link email.

### Acceptance Criteria
Given I am on the login page
When I click "Sign in with Google"
Then I am redirected to Google OAuth
And after authenticating, I am signed in and redirected to /schedule

Given my Google email is NOT in the staff table
When I complete Google sign-in
Then the system signs me out immediately
And shows "Access denied. Contact your administrator."

### Edge Cases
- Google email differs from staff email (case sensitivity — compare lowercase)
- User cancels Google OAuth flow
- Google account has no email (extremely rare)

### Notes for Engineering
- Enable Google provider in Supabase Dashboard → Authentication → Providers
- Create OAuth 2.0 credentials in Google Cloud Console
- Add redirect URI: `https://<project>.supabase.co/auth/v1/callback`
- Use `supabase.auth.signInWithOAuth({ provider: 'google' })`
- After OAuth callback, check `is_staff_email()` — if not registered, sign out and show error
- `link_staff_on_first_login()` trigger handles auth.uid → staff.id linking
- Google Auth button should appear BELOW the Magic Link form (secondary option)
- Add `google_auth_enabled` boolean to `practice` table (default: false)
- Admin can toggle Google Auth on/off in Settings → Practice (PracticeSettingsForm)
- Login page reads this flag and conditionally shows/hides the Google button
- Google OAuth may not work on localhost — the toggle lets admins disable it when not configured

### Dependencies
- Google Cloud Console project with OAuth configured
- Supabase Auth Google provider enabled
- `practice.google_auth_enabled` column in schema

---

## Story 1.5 — Edit Own Contact Details (Backlog)

### User Story
As a Staff member
I want to edit my phone number, email, and messenger details on the Account page
So that my contact information stays up to date.

### Acceptance Criteria
Given I am on the Account page
When I click "Edit"
Then phone_number, contact_email, messenger_type, messenger_id become editable
And full_name and role remain read-only

Given I save changes
Then the staff record is updated
And I see a success confirmation

### Edge Cases
- Email changed to one already used by another staff member (unique constraint)
- Empty phone number (allowed — nullable field)

### Notes for Engineering
- Reuse inline edit pattern from PatientInfoCard
- RLS: staff can update own record (`id = auth.uid()`)
- full_name is NOT editable by the user (only admin can change it)

---

## Story 1.6 — Bug: Staff Profile Not Found for New Users (Backlog)

### Bug Description
A newly invited staff member (doctor) who signs in via magic link sees
"Staff profile not found" on the Account page.

### Root Cause (Suspected)
The `link_staff_on_first_login()` trigger fires on `auth.users INSERT` and sets
`staff.id = auth.uid()`. If the timing is off, or the trigger fails silently,
`useCurrentStaff()` queries `staff` by `auth.uid()` and finds no match.

### Steps to Reproduce
1. Admin invites a new doctor via Settings → Staff → Invite
2. Doctor clicks magic link in email
3. Doctor lands on /schedule → navigates to /account
4. Error: "Staff profile not found"

### Expected Behavior
Account page shows the staff member's profile (name, email, role, status).

### Notes for Engineering
- Verify `link_staff_on_first_login()` trigger is correctly updating `staff.id`
- Check if `signInWithOtp` with `shouldCreateUser: true` creates the auth.users
  record BEFORE the staff record exists (race condition)
- Consider adding a retry/polling mechanism in `useCurrentStaff` if staff record
  is not immediately found after first login
- Add logging to the trigger for debugging

---

## Story 1.7 — Demo Data on First Launch (Backlog)

### User Story
As a person evaluating the system
I want to populate the database with demo data during first launch
So that I can immediately explore the interface with realistic content.

### Acceptance Criteria
Given I am on the /setup page
When I check "Enable Demo Data"
And complete the setup
Then the system creates the practice and admin account as usual
And additionally populates the database with demo staff, patients, appointments, and availability

Given I do NOT check "Enable Demo Data"
Then only the practice and admin account are created (current behavior)

### Demo Data Set
- 3–4 staff members (2 doctors, 1 clinic_manager)
- 10–15 patients with varied contact details
- 20–30 appointments spread across the current and next week (mix of scheduled, completed, cancelled, unassigned)
- Weekly availability slots for each doctor
- 1–2 time-off entries

### Notes for Engineering
- Add checkbox to setup.tsx: "Populate with demo data" (default: unchecked)
- Create `seed_demo_data(practice_id)` RPC (security definer) that inserts all demo records
- Call it after `bootstrap_practice()` if the flag is checked
- Demo staff should have real-looking names but @example.com emails (non-deliverable)
- Demo appointments should be relative to `now()` so they always look current
- Consider adding a `is_demo` boolean to practice table for future "Reset Demo" feature

### Edge Cases
- Demo data should not conflict with the admin account created during setup
- Re-running setup on an already-bootstrapped system is blocked (existing guard)

---

## Story 1.4 — Dark Mode Toggle (Backlog)

### User Story
As a Staff member
I want to toggle between light and dark mode
So that I can use the interface comfortably in different lighting conditions.

### Acceptance Criteria
Given I am authenticated
When I click the dark mode toggle in the top bar
Then the interface switches to dark/light mode
And my preference is persisted in localStorage

Given I return to the app later
Then my previous theme preference is restored

### Notes for Engineering
- shadcn/ui dark mode already configured via CSS variables in globals.css
- Add toggle button (sun/moon icon) to TopBar
- Apply `.dark` class to `<html>` element
- Persist preference in `localStorage('theme')`
- Respect `prefers-color-scheme` as initial default