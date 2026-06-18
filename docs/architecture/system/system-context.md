# System Context

This document describes how the product is realized as a working system.

It intentionally stays high-level and focuses on responsibilities rather than technologies.

---

## Overview

The system is built as a single-page application backed by a managed database platform.

There is no custom backend layer.

Product rules are enforced directly at data level.

This reflects a product-first approach where domain constraints are treated as part of the system, not UI logic.

---

## Core Components

### Frontend Application

A browser-based single-page application used by clinic staff.

Responsibilities:

- authentication
- scheduling workflows
- patient and staff management
- operational alerts
- UI state and navigation

The frontend does not contain business rules.
It acts as an interaction layer.

---

### Backend Platform

Managed Postgres-based backend providing:

- authentication
- persistent storage
- access control
- business rule enforcement

Responsibilities:

- data integrity
- role-based visibility
- lifecycle enforcement
- appointment reassignment
- prevention of invalid states

Core product constraints live here.

---

## High-Level Flow


Clinic Staff
↓
Frontend Application
↓
Backend Platform (Postgres + Auth + Access Control)


All product rules are validated at backend level.

The frontend cannot bypass domain constraints.

---

## Design Principles

- Product decisions drive architecture
- No duplicated business logic
- Domain rules enforced centrally
- Explicit lifecycle states
- Operational edge cases treated as first-class
- Minimal infrastructure complexity

---

## Rationale

This structure allows:

- fast product iteration
- strong data guarantees
- reduced system complexity
- clear ownership of responsibilities

The system is intentionally simple:

one frontend,
one backend,
one source of truth.

---