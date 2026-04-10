# Навигатор по документации

> 35 документов, 11 эпиков, 28 пользовательских историй.
> Этот гайд поможет не потеряться.

## Маршруты чтения

- **«Хочу понять продукт»** — читай секцию Продукт сверху вниз (5 мин)
- **«Хочу понять архитектуру»** — Продукт #1 → Архитектура → Бэкенд
- **«Хочу начать разрабатывать»** — Продукт #1–3 → Контракты → UI → Delivery
- **«Хочу понять принятые решения»** — Продукт #1 → Решения (все 5 файлов)

---

## Продукт — зачем мы это строим

| # | Документ | Назначение | Что узнаешь |
|---|----------|-----------|-------------|
| 1 | [Executive Summary](0%20executive-summary.md) | Общая картина за 2 минуты | Гипотеза, цель MVP, критерии успеха |
| 2 | [Product Vision](1%20product-vision.md) | Проблема и целевая аудитория | Кто пользуется, какую боль решаем, принципы |
| 3 | [MVP Scope](2%20mvp-scope.md) | Что входит, а что нет | User flows, границы фич, явные исключения |
| 4 | [Roadmap](3%20roadmap.md) | Куда идём после MVP | 6 фаз, сигналы успеха по фазам, критерии пивота |
| 5 | [Delivery Conventions](4%20product-delivery-conventions.md) | Как пишутся истории | Формат story, стандарты acceptance criteria |

## Решения — почему мы сказали «нет»

| # | Документ | Решение | Обоснование |
|---|----------|---------|-------------|
| 6 | [PDR-001](decisions/pdr-001-no-patient-self-booking.md) | Нет самозаписи пациентов | Сначала adoption врачей |
| 7 | [PDR-002](decisions/pdr-002-manual-appointment-completion.md) | Ручное завершение приёмов | Отражаем реальный workflow клиники |
| 8 | [PDR-003](decisions/pdr-003-no-external-calendar-integration.md) | Нет синхронизации с Google Calendar | Валидируем standalone-ценность |
| 9 | [PDR-004](decisions/pdr-004-one-clinic-per-user.md) | Одна клиника на пользователя | Упрощаем auth и модель данных |
| 10 | [Deferred Decisions](decisions/deferred-decisions.md) | Недельный вид, drag-n-drop, тёмная тема | Осознанный перенос на post-MVP |

## Архитектура — как устроена система

| # | Документ | Назначение | Что узнаешь |
|---|----------|-----------|-------------|
| 11 | [System Context](system/system-context.md) | Обзор верхнего уровня | SPA + Supabase, нет кастомного бэкенда |
| 12 | [Architecture Container](system/architecture-container.md) | Диаграмма стека | React, Vite, TanStack, Supabase Auth/DB |
| 13 | [Container Diagram](system/container-diagram.md) | Упрощённый C4-вид | User → Browser → Supabase поток данных |

## Контракты — мост между продуктом и кодом

| # | Документ | Назначение | Что узнаешь |
|---|----------|-----------|-------------|
| 14 | [Domain ↔ UI Contract](contracts/domain-ui.md) | Единый источник правды | Роли, страницы, маршруты, 15 бизнес-правил |

## UI-спецификация — что видит пользователь

| # | Документ | Назначение | Что узнаешь |
|---|----------|-----------|-------------|
| 15 | [Pages](ui/ui.pages.md) | Спецификация 8 страниц | /setup, /login, /schedule, /patients, /availability, /settings, /account |
| 16 | [Components](ui/ui.components.md) | Дерево компонентов | Layout, формы, модалки, уровень дизайна |

## Бэкенд — что обеспечивает база данных

| # | Документ | Назначение | Что узнаешь |
|---|----------|-----------|-------------|
| 17 | [Logical Schema](backend/schema.logical.md) | Модель данных | 6 таблиц, атрибуты, ограничения |
| 18 | [Schema SQL](backend/schema.sql) | DDL-справочник | Enum'ы, таблицы, индексы |
| 19 | [Triggers](backend/triggers.sql) | Контроль бизнес-правил | Overlap, availability guard, UTC, auto-unassign |
| 20 | [RLS Policies](backend/rls.sql) | Row Level Security | Хелпер-функции, политики по таблицам |
| 21 | [Demo Seed](backend/seed-demo.sql) | Функция демо-данных | Персонал, пациенты, приёмы для оценки |
| 22 | [**init-all.sql**](backend/init-all.sql) | **Скрипт деплоя** | Всё вышеперечисленное в одном файле |

## Delivery — как это было построено

| # | Документ | Назначение | Что узнаешь |
|---|----------|-----------|-------------|
| 23 | [Dev Plan (EN)](delivery/dev-plan-en.md) | План реализации | 8 фаз, 28/28 историй, статус |
| 24 | [Dev Plan (RU)](delivery/dev-plan%20-ru.md) | То же на русском | Зеркало EN-версии |

### Эпики (28 пользовательских историй)

| # | Эпик | Истории | Ключевая возможность |
|---|------|---------|---------------------|
| 25 | [Epic 1 — Auth & Account](delivery/backlog/epic-1-authentication-and-account.md) | 1.0–1.5 | Setup, magic link, Google OAuth, аккаунт |
| 26 | [Epic 2 — Practice](delivery/backlog/epic-2-practice-management.md) | 2.1–2.2 | Настройки клиники, брендинг в хедере |
| 27 | [Epic 3 — Staff](delivery/backlog/epic-3-staff-management.md) | 3.1–3.6 | Приглашение, онбординг, деактивация |
| 28 | [Epic 4 — Patients](delivery/backlog/epic-4-patient-lifecycle.md) | 4.1–4.4 | CRUD, архив/восстановление |
| 29 | [Epic 5 — Scheduling](delivery/backlog/epic-5-scheduling-engine.md) | 5.1–5.6 | Дневной вид, создание/редакт/отмена/завершение |
| 30 | [Epic 6 — Availability](delivery/backlog/epic-6-availability-and-time-off.md) | 6.1–6.5 | Недельные слоты, отпуск/больничный |
| 31 | [Epic 7 — Reassignment](delivery/backlog/epic-7-operational-reassignment.md) | 7.1–7.3 | Авто-снятие назначений, баннер |
| 32 | [Epic 8 — Access Control](delivery/backlog/epic-8-access-control.md) | 8.1–8.2 | RBAC на уровне RLS |
| 33 | [Epic 9 — Notifications](delivery/backlog/epic-9-notifications.md) | 9.1–9.2 | *Отложено на post-MVP* |
| 34 | [Epic 10 — Constraints](delivery/backlog/epic-10-system-constraints.md) | 10.1–10.5 | UTC, overlap, availability, триггеры |
| 35 | [Epic 11 — Audit Log](delivery/backlog/epic-11-audit-log.md) | 11.1–11.2 | *Бэклог* |
