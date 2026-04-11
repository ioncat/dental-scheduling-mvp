# Session: 2026-04-11 — Seed Fix, Dev Bypass & Docs

## Done
- Fixed seed data: added admin staff (Taras Melnyk), increased load profiles (75-85% / 70-80% / 50-60%), fixed `v_status` type (`text` → `appointment_status`)
- Synced changes across both `seed-demo.sql` and `init-all.sql`
- Added sign-out notice in dev bypass mode (instead of broken redirect loop)
- Made dialog overlay more transparent (`bg-black/80` → `bg-black/40`)
- Added "Development Auth Bypass" section to QUICK-START.md
- Updated demo data tables in QUICK-START.md (8 staff, new load percentages)
- Added screenshot to README.md (`docs/screenshots/dental-schedule.png`)
- Verified `.gitignore` covers `.env` and service role keys — no secrets in code
- Updated EFFORT-LOG.md with today's session (~45 min)
- Verified all pages work after seed update (Schedule, Patients, Availability, Account, Settings)

## Decisions
- **Admin in seed** — added `role='admin'` staff to fix 406 errors in dev bypass mode; safe because seed is demo data and bypass is dev-only
- **Sign-out in bypass** — show warning notice instead of attempting logout (bypass always returns a fake user, so redirect to /login loops back)
- **No need to remove bypass for GitHub** — env vars are in `.gitignore`, bypass inactive by default, standard open-source practice

## Next
- Push to remote (main is ahead of origin by 4 commits)
- Consider adding more screenshots to README (Patients, Availability pages)
- Manual tests still blocked by auth (need DEV_BYPASS_AUTH or JWT token)
- Explore app on different pages for further UI/UX issues

## Commits
- `24a8de0` fix: add admin to seed data, dev bypass improvements, and docs updates
