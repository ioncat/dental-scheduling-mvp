# План построения UI по спецификации

## Контекст

Продуктовая документация описывает 27 user stories, 7 страниц, ~25 компонентов, 5 репозиториев. Текущий код реализует ~5%: минимальный login, JSON-дамп schedule, 1 repo без типов. Нет build tooling (package.json, vite.config, tsconfig отсутствуют). Supabase backend развёрнут и работает. Роутинг — code-based (ручной router.tsx).

Цель: пошагово собрать фронтенд от фундамента до полного MVP по спецификациям `ui.pages.md`, `ui.components.md`, `domain-ui.md`.

---

## Фаза 0 — Фундамент проекта

**Цель:** запускаемый проект с Vite + React + TypeScript + Tailwind + shadcn/ui

### Шаги:
1. Получить от пользователя / создать конфиги: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `postcss.config.js`, `tailwind.config.ts`
2. Установить зависимости: `react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query`, `@supabase/supabase-js`, `tailwindcss`, `shadcn/ui`
3. Настроить `globals.css` с Tailwind directives
4. Инициализировать shadcn/ui (`npx shadcn-ui@latest init`)
5. Удалить мёртвый код:
   - `src/app.tsx` (пустой)
   - `src/routes/__root.tsx` (file-based stub)
   - `src/components/schedule/schedule.tsx` (broken stub)
   - `src/components/schedule/CreateAppointment.tsx` (дубликат)
6. Исправить `src/repositories/appointments.repo.ts` (лишняя `}`)
7. Удалить `import './index.css'` из `main.tsx`, заменить на `import './styles/globals.css'`
8. Сгенерировать Supabase TypeScript-типы (`supabase gen types`) → `src/lib/database.types.ts`
9. Типизировать Supabase-клиент в `src/lib/supabase.ts`

### Проверка: `npm run dev` запускается, пустая страница без ошибок

### Файлы:
- `app/package.json` — создать
- `app/vite.config.ts` — создать
- `app/tsconfig.json` — создать
- `app/index.html` — создать
- `app/tailwind.config.ts` — создать
- `app/postcss.config.js` — создать
- `app/src/styles/globals.css` — создать
- `app/src/lib/database.types.ts` — сгенерировать
- `app/src/lib/supabase.ts` — обновить (типизация)
- `app/src/main.tsx` — обновить (импорт стилей)
- Удалить: `src/app.tsx`, `src/routes/__root.tsx`, `src/components/schedule/schedule.tsx`, `src/components/schedule/CreateAppointment.tsx`

---

## Фаза 1 — Layout + Auth + Router

**Цель:** рабочий каркас: sidebar, topbar, auth flow, все 7 маршрутов

### Шаги:
1. Создать `AppLayout` — sidebar + topbar + outlet
2. Создать `SidebarNav` — элементы: Schedule, Patients, Availability, Settings (admin only), Account; props: `role`
3. Создать `TopBar` — текущая дата, имя пользователя
4. Доработать `LoginForm` (из `routes/login.tsx`):
   - Заменить inline styles на shadcn/ui `Input` + `Button`
   - Добавить состояния: idle / loading / success / error
   - Добавить обработку ошибок
   - Убрать `alert()`, заменить на UI-feedback
5. Добавить auth callback обработку (Supabase `onAuthStateChange`)
6. Расширить `router.tsx`:
   - 7 маршрутов: `/login`, `/schedule`, `/patients`, `/patients/$id`, `/availability`, `/settings`, `/account`
   - Auth guard на root route (уже есть, доработать redirect после логина → `/schedule`)
   - Role guard для `/settings` (admin only)
   - Обернуть authenticated routes в `AppLayout`
7. Создать заглушки для всех страниц (placeholder `<h1>Page Name</h1>`)
8. Создать `src/lib/auth.ts`:
   - `getCurrentUser()` — уже есть
   - `getCurrentStaff()` — запрос к таблице `staff` по `auth.uid()`
   - `signOut()` — logout
9. Создать auth context / hook `useCurrentStaff()` → `{ staff, role, isLoading }`

### Проверка: логин работает, sidebar отображается, навигация между страницами, `/settings` доступен только admin

### Файлы:
- `src/components/layout/AppLayout.tsx` — создать
- `src/components/layout/SidebarNav.tsx` — создать
- `src/components/layout/TopBar.tsx` — создать
- `src/routes/login.tsx` — переписать
- `src/router.tsx` — расширить
- `src/lib/auth.ts` — расширить
- `src/hooks/useCurrentStaff.ts` — создать
- Заглушки для страниц: `schedule.tsx`, `patients.tsx`, `patient-details.tsx`, `availability.tsx`, `settings.tsx`, `account.tsx`

---

## Фаза 2 — Data Layer (все репозитории)

**Цель:** типизированный data layer — все 5 репозиториев + TanStack Query хуки

### Шаги:
1. Переписать `appointments.repo.ts` — типизированные CRUD, фильтры по дате/доктору/статусу
2. Создать `patients.repo.ts` — list, get, create, update, archive, restore
3. Создать `staff.repo.ts` — list, get, create (invite), update (role, status)
4. Создать `availability.repo.ts` — CRUD для availability + time_off
5. Создать `practice.repo.ts` — get, update
6. Создать TanStack Query хуки для каждого репо:
   - `src/hooks/useAppointments.ts` — `useAppointments(date, doctorId?)`, `useCreateAppointment()`, etc.
   - `src/hooks/usePatients.ts`
   - `src/hooks/useStaff.ts`
   - `src/hooks/useAvailability.ts`
   - `src/hooks/usePractice.ts`

### Проверка: хуки возвращают данные из Supabase, мутации работают, типы не `any`

### Файлы:
- `src/repositories/appointments.repo.ts` — переписать
- `src/repositories/patients.repo.ts` — создать
- `src/repositories/staff.repo.ts` — создать
- `src/repositories/availability.repo.ts` — создать
- `src/repositories/practice.repo.ts` — создать
- `src/hooks/useAppointments.ts` — создать
- `src/hooks/usePatients.ts` — создать
- `src/hooks/useStaff.ts` — создать
- `src/hooks/useAvailability.ts` — создать
- `src/hooks/usePractice.ts` — создать

---

## Фаза 3 — Shared компоненты

**Цель:** переиспользуемые UI-примитивы

### Компоненты:
1. `DoctorSelector` — dropdown активных врачей, данные из `useStaff(role=doctor, status=active)`
2. `PatientSelector` — dropdown/поиск неархивированных пациентов
3. `ConfirmDialog` — обёртка над shadcn/ui `AlertDialog`
4. `LoadingSpinner` — индикатор загрузки
5. `ErrorBanner` — отображение ошибок

### Файлы:
- `src/components/shared/DoctorSelector.tsx`
- `src/components/shared/PatientSelector.tsx`
- `src/components/shared/ConfirmDialog.tsx`
- `src/components/shared/LoadingSpinner.tsx`
- `src/components/shared/ErrorBanner.tsx`

---

## Фаза 4 — Schedule Page (ядро продукта)

**Цель:** полноценная страница расписания — Epic 5 + Epic 7 (alerts)

### Компоненты:
1. `SchedulePage` — контейнер: дата-селектор, alert, grid
2. `UnassignedAlert` — баннер с количеством неназначенных (admin/clinic_manager)
3. `TimeGrid` — сетка часов, клик по пустому слоту → create
4. `DoctorColumn` — колонка врача с карточками
5. `AppointmentCard` — карточка приёма: цвет по статусу (scheduled/unassigned/completed/cancelled)
6. `AppointmentModal` — 3 режима (create/view/edit):
   - Create: PatientSelector, DoctorSelector (optional), start/end time, notes → save
   - View: все поля read-only + actions: cancel, complete, assign doctor
   - Edit: изменение полей + save

### Бизнес-логика в UI:
- Doctor видит только свою колонку
- Admin/clinic_manager видят всех врачей
- Unassigned карточки подсвечены
- Alert не dismissable — исчезает только когда 0 unassigned

### Покрываемые stories: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.2, 7.3

### Файлы:
- `src/routes/schedule.tsx` — переписать
- `src/components/schedule/SchedulePage.tsx` — создать
- `src/components/schedule/UnassignedAlert.tsx` — создать
- `src/components/schedule/TimeGrid.tsx` — создать
- `src/components/schedule/DoctorColumn.tsx` — создать
- `src/components/schedule/AppointmentCard.tsx` — создать
- `src/components/schedule/AppointmentModal.tsx` — создать

---

## Фаза 5 — Patients

**Цель:** управление пациентами — Epic 4

### Компоненты:
1. `PatientsPage` — список + поиск + кнопка создания
2. `PatientsTable` / `PatientRow` — таблица пациентов (archived скрыты по умолчанию)
3. `CreatePatientModal` — full_name, phone (обязательные), email, messenger, notes
4. `PatientDetailsPage` — профиль + история приёмов + archive/restore
5. `PatientInfoCard` — информация о пациенте + редактирование
6. `AppointmentHistory` — список приёмов пациента
7. `ArchiveButton` — disabled если есть будущие приёмы

### Покрываемые stories: 4.1, 4.2, 4.3, 4.4

### Файлы:
- `src/routes/patients.tsx` — создать
- `src/routes/patient-details.tsx` — создать
- `src/components/patients/PatientsPage.tsx` — создать
- `src/components/patients/PatientsTable.tsx` — создать
- `src/components/patients/CreatePatientModal.tsx` — создать
- `src/components/patients/PatientDetailsPage.tsx` — создать
- `src/components/patients/PatientInfoCard.tsx` — создать
- `src/components/patients/AppointmentHistory.tsx` — создать
- `src/components/patients/ArchiveButton.tsx` — создать

---

## Фаза 6 — Availability

**Цель:** управление расписанием врачей — Epic 6

### Компоненты:
1. `AvailabilityPage` — контейнер: DoctorSelector (admin), weekly editor, time off
2. `WeeklyAvailabilityEditor` — сетка по дням недели, add/update/remove слотов
3. `TimeOffList` — список отпусков/больничных, add/remove

### Покрываемые stories: 6.1, 6.2, 6.3, 6.4, 6.5

### Файлы:
- `src/routes/availability.tsx` — создать
- `src/components/availability/AvailabilityPage.tsx` — создать
- `src/components/availability/WeeklyAvailabilityEditor.tsx` — создать
- `src/components/availability/TimeOffList.tsx` — создать

---

## Фаза 7 — Settings + Account

**Цель:** настройки клиники + управление персоналом — Epics 2, 3; Account — Epic 1

### Settings (admin only):
1. `SettingsPage` — две вкладки: Practice / Staff
2. `PracticeSettingsForm` — редактирование clinic_name, address, phone, email, timezone, date_format
3. `StaffManagement` — таблица сотрудников + приглашение
4. `StaffTable` / `StaffRow` — список, actions: change role, deactivate
5. `InviteStaffModal` — full_name, email, role → создание с status=pending + magic link

### Account:
6. `AccountPage` — read-only: full_name, email, phone, role

### Покрываемые stories: 1.2, 2.1, 3.1, 3.2, 3.3, 3.4

### Файлы:
- `src/routes/settings.tsx` — создать
- `src/routes/account.tsx` — создать
- `src/components/settings/SettingsPage.tsx` — создать
- `src/components/settings/PracticeSettingsForm.tsx` — создать
- `src/components/settings/StaffManagement.tsx` — создать
- `src/components/settings/StaffTable.tsx` — создать
- `src/components/settings/InviteStaffModal.tsx` — создать
- `src/components/account/AccountPage.tsx` — создать

---

## Фаза 8 — Access Control + Edge Cases

**Цель:** доводка RBAC и edge cases — Epics 8, 10

### Шаги:
1. Ревизия role-based visibility на всех страницах:
   - Doctor → только своя колонка, свои availability, нет Settings
   - Clinic_manager → все колонки, patients, availability, нет Settings
   - Admin → всё
2. Проверка UTC: все datetime в UTC, отображение в practice.time_zone
3. Проверка edge cases из эпиков:
   - Нельзя архивировать пациента с будущими приёмами
   - Нельзя деактивировать последнего admin
   - Нельзя создать приём вне availability
   - Нельзя reschedule unassigned
4. Error states на каждой странице (ErrorBanner)
5. Loading states (LoadingSpinner)

### Покрываемые stories: 8.1, 10.1, 10.2, 10.3, 10.4

---

## Верификация

После каждой фазы:
1. `npm run dev` — приложение запускается без ошибок
2. Визуальная проверка через браузер (preview screenshot)
3. Проверка console на ошибки
4. Проверка network requests к Supabase — данные приходят

Финальная проверка:
- Логин через magic link → редирект на /schedule
- Создание приёма → отображение на сетке
- Создание пациента → отображение в списке
- Деактивация врача → приёмы становятся unassigned → alert появляется
- Role switching: проверить видимость для каждой роли
