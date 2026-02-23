-- =============================================================
-- SEED: First-time system bootstrap
-- =============================================================
-- Run ONCE after deploying schema.sql, rls.sql, and triggers.sql.
-- Creates the first practice and admin account.
--
-- ⚠️  EDIT the values below before running!
-- =============================================================

insert into practice (id, clinic_name, time_zone, date_format)
values (
  'a0000000-0000-0000-0000-000000000001',   -- fixed UUID for reference
  'My Dental Clinic',                        -- ← CHANGE: clinic name
  'Europe/Kyiv',                             -- ← CHANGE: timezone
  'DD.MM.YYYY'                               -- ← CHANGE: date format
)
on conflict (id) do nothing;

insert into staff (id, practice_id, full_name, email, role, status)
values (
  gen_random_uuid(),                         -- placeholder, replaced by trigger on first login
  'a0000000-0000-0000-0000-000000000001',   -- must match practice.id above
  'System Administrator',                    -- ← CHANGE: admin name
  'admin@your-clinic.com',                   -- ← CHANGE: admin email (must be real)
  'admin',
  'active'
)
on conflict on constraint staff_email_unique do nothing;

-- =============================================================
-- After running this seed:
-- 1. Admin opens the app → enters email → receives magic link
-- 2. First login triggers link_staff_on_first_login()
--    which sets staff.id = auth.uid()
-- 3. Admin goes to Settings → Staff → adds other members
-- =============================================================
