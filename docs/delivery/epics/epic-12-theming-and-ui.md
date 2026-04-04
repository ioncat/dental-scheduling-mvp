# Epic 12 — Theming & UI

## Story 12.1 — Design Token Palette "Dental Practice" (Done)

### User Story
As a User
I want the application to have a professional, healthcare-appropriate visual style
So that the interface feels polished and trustworthy.

### Acceptance Criteria
Given the application loads
When I view any page
Then I see the "Dental Practice" palette applied:
- Primary: Fresh Blue (`hsl(199 89% 48%)`)
- Accent: Smile Yellow (`hsl(45 97% 56%)`)
- Sidebar: Dark Navy (`hsl(201 79% 18%)`)
- Background: Light Blue-White (`hsl(204 100% 97%)`)
- Typography: Fira Sans (UI), Fira Code (tables/mono)

Given I view the sidebar
When the application renders
Then the sidebar uses dark navy background with yellow logo accent

Given I view the login page
When the application renders
Then I see a centered card with the "D" logo and shadow

### Edge Cases
- Google Fonts CDN unavailable — fallback to `ui-sans-serif, system-ui, sans-serif`
- Browser does not support HSL — modern browsers only (IE not supported)

### Out of Scope
- Dark mode
- User-selectable themes (see Story 12.2)
- Per-page color overrides

### Notes for Engineering
- All colors defined as CSS custom properties in HSL format (shadcn/ui convention)
- Google Fonts loaded via `@import` in `globals.css`
- Branch: `redesign/ui-ux-pro-max`

### Dependencies
- Epic 5 (Schedule) — time grid layout affected by palette and border styling

---

## Story 12.2 — Switchable Theme System

### User Story
As a Developer
I want themes to be switchable via `data-theme` attribute
So that multiple palettes can coexist and be toggled at runtime.

### Acceptance Criteria
Given the default theme is "dental-practice"
When `data-theme` attribute is changed on `<html>`
Then all CSS custom properties update to the selected theme

Given I add a new theme
When I define its custom properties under `[data-theme="new-theme"]`
Then the application renders correctly with the new palette

Given no `data-theme` attribute is set
When the application loads
Then `:root` fallback applies the default "dental-practice" palette

### Edge Cases
- `localStorage` unavailable (private browsing) — use default theme, no persistence
- Invalid `data-theme` value — fall back to `:root` defaults
- Theme switch mid-session — all components re-render with new tokens without page reload

### Out of Scope
- Admin UI for theme management
- Per-user theme preferences stored server-side
- CSS-in-JS theme providers

### Notes for Engineering
- Refactor `:root` variables into `[data-theme="dental-practice"]`
- Preserve `:root` as fallback (same as default theme)
- Theme preference persisted in `localStorage`

---

## Story 12.2.1 — Light / Dark Mode per Theme

### User Story
As a User
I want each theme to have a light and dark variant
So that I can use the application comfortably in different lighting conditions.

### Acceptance Criteria
Given a theme is selected (e.g. "dental-practice")
When I toggle between light and dark mode
Then the application switches to the corresponding variant of the same theme

Given I select dark mode
When the application renders
Then all CSS custom properties switch to the dark variant (darker backgrounds, lighter text, adjusted accents)

Given I have not explicitly chosen a mode
When the application loads
Then it respects the OS preference (`prefers-color-scheme`) as default

### Edge Cases
- OS preference changes mid-session — application reacts in real-time
- Theme has no dark variant defined — fall back to light variant
- User override persists over OS preference until explicitly reset

### Out of Scope
- Per-page mode overrides
- Scheduled auto-switching (e.g. dark after 8 PM)

### Notes for Engineering
- Each theme defines two sets of CSS custom properties: `[data-theme="x"]` (light) and `[data-theme="x"].dark` or `[data-theme="x"][data-mode="dark"]`
- Mode toggle in System Settings: Auto (OS) / Light / Dark
- Stored alongside theme preference in `localStorage` (later DB via Story 12.4)

### Dependencies
- Story 12.2 (theme switching infrastructure)

---

## Story 12.3 — Centered Layout & Glassmorphism for Large Screens

### User Story
As a User on a large monitor (27"+)
I want the application workspace to be visually centered and not stretched edge-to-edge
So that the interface feels focused and professional, similar to modern SaaS dashboards.

### Acceptance Criteria
Given I am on a screen wider than the configured max-width
When the application renders
Then the workspace (sidebar + content) is centered horizontally with a background visible behind it

Given I open Settings → System
When I configure layout options
Then I can set:
- Layout mode: Full width / Centered
- Max width: 1400 / 1600 / 1800 px
- Rounded corners: On / Off
- Glass effect (glassmorphism): On / Off
- Background: Color or Image URL

Given I enable the glass effect
When the application renders in centered mode
Then the workspace has a semi-transparent frosted glass appearance (`backdrop-filter: blur`)

Given I am on a screen narrower than the configured max-width
When the application renders
Then the layout behaves as full-width regardless of settings (no visual difference)

### Edge Cases
- Background image fails to load — fall back to background color
- `localStorage` unavailable — use defaults (full width, no glass)
- Very narrow max-width on medium screen — layout should never be narrower than viewport

### Out of Scope
- Background image upload to server (user provides URL for now)
- Per-user layout preferences

### Notes for Engineering
- Glassmorphism: `backdrop-filter: blur(20px)` + `background: rgba(255,255,255,0.85)` + `box-shadow`
- Settings stored in `localStorage` for now (see Story 12.4 for DB migration)
- Applied via CSS variables and classes on the outermost layout wrapper (`AppLayout.tsx`)
- On screens < max-width, centered mode has no visible effect

### Dependencies
- Story 12.2 (theme system infrastructure, System tab in Settings)

---

## Story 12.4 — Persist UI Settings in Database

### User Story
As an Admin
I want UI settings (theme, layout, background) to be stored in the database at practice level
So that the visual configuration is consistent across all devices and users within the clinic.

### Acceptance Criteria
Given an Admin changes UI settings in Settings → System
When the settings are saved
Then they are persisted in the database associated with the practice

Given a User logs in from a new device
When the application loads
Then it applies the practice-level UI settings from the database

Given the database is unreachable
When the application loads
Then it falls back to `localStorage` cache or defaults

### Edge Cases
- Migration from `localStorage`-only to DB — first admin save writes current local values to DB
- Multiple admins changing settings concurrently — last write wins
- Practice without UI settings row — use application defaults

### Out of Scope
- Per-user overrides (all users in a practice share the same UI settings)
- Version history of settings changes

### Notes for Engineering
- Add `ui_settings JSONB` column to `practices` table (or a dedicated `practice_settings` table)
- API: `GET /practice/:id/ui-settings`, `PUT /practice/:id/ui-settings`
- Client reads DB on login, caches in `localStorage` for offline fallback
- RLS: any authenticated staff can read, only admin can write

### Dependencies
- Story 12.3 (all settings exist and work via `localStorage`)
- Epic 2 (Practice Management — extends practice settings)

---

## Resolved Bugs

### BUG-001: Column Divider Misalignment in Schedule (Scrollbar)

**Problem:**
On the Schedule page, dividers between doctor columns in the header don't align with dividers in the body (time grid). Noticeable on wide screens.

**Root Cause:**
`TimeGridHeader` and `TimeGridBody` are separate containers. Body has `overflow-y: auto`, and when a vertical scrollbar appears (~17px), it narrows body columns while header columns remain full-width.

**Solution:**
In `TimeGridCalendar.tsx`, measure scrollbar width via JS (`offsetWidth - clientWidth`) and pass it as CSS variable `--scrollbar-w`. Header uses `pr-[var(--scrollbar-w,0px)]` to compensate. Added `+1px` for sub-pixel border rendering correction.

**Files:**
- `app/src/components/schedule/TimeGridCalendar.tsx` — scrollbar measurement, CSS variable
- `app/src/components/schedule/TimeGridHeader.tsx` — `pr-[var(--scrollbar-w)]`
- `app/src/components/schedule/TimeGridBody.tsx` — `overflow-y: auto`

**Note:** Scrollbar width varies across devices/browsers. JS measurement adapts automatically. If the bug returns — check `offsetWidth - clientWidth` calculation and the `+1` value.

---

### BUG-002: First Time Slot (08:00) Clipped in Schedule

**Problem:**
On the Schedule page, the first row of the time grid (08:00) is partially hidden behind the header. The label "08:00" is cut off, and the visible grid starts at ~08:30.

**Root Cause:**
Two issues: (1) Non-today scroll used `top: 240` which skipped past 08:00 entirely. (2) TimeAxis labels use `-translate-y-1/2` centering, causing the 08:00 label at `y=0` to be clipped by the container overflow.

**Solution:**
- Changed non-today scroll from `top: 240` to `top: 0` (start from beginning of working day)
- Added `paddingTop: 8` to TimeGridBody inner container to prevent 08:00 label clipping

**Files:**
- `app/src/components/schedule/TimeGridCalendar.tsx` — scroll position
- `app/src/components/schedule/TimeGridBody.tsx` — top padding

**Status:** Resolved

---

### BUG-003: Clock in TopBar Drifts from Real Time

**Problem:**
The clock displayed in the TopBar periodically falls behind the actual system time. The `setInterval(60_000)` starts at an arbitrary point within the minute, accumulating drift.

**Solution:**
Replaced simple `setInterval` with a two-phase approach: first `setTimeout` aligns to the next minute boundary (`(60 - seconds) * 1000 - ms`), then `setInterval(60_000)` maintains the cadence. Clock now updates precisely at minute transitions.

**Files:**
- `app/src/components/layout/TopBar.tsx` — `useCurrentTime` hook

**Status:** Resolved
