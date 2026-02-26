# Epic 2 — Practice Management

## Story 2.1 — Update Practice Settings

### User Story
As an Admin  
I want to update practice settings  
So that clinic information remains accurate.

### Acceptance Criteria
Given I am admin  
When I open Settings  
Then I see editable fields:
- clinic_name
- slogan
- show_on_main (checkbox — display name + slogan in header)
- address
- phone_number
- contact_email
- time_zone
- date_format

Given I modify fields and click Save  
Then changes are persisted  

### Edge Cases
- Invalid email format
- Empty clinic_name
- Unsupported timezone

### Out of Scope
- Multiple practices
- Audit history

### Notes for Engineering
- Single form submission
- Validate required fields
- Timezone used for display only