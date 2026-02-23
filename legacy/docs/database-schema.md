# MVP Database Schema — Dental Appointment Scheduling Platform

This document describes the logical database schema for the MVP.

The goal is to support:
- clinic onboarding
- multi-doctor scheduling
- appointment lifecycle
- availability management
- basic search and filtering

The schema is intentionally minimal and optimized for learning speed, not long-term scalability.

---

## Core Entities

---

### Clinic

Represents a single dental clinic.

| Field | Type | Notes |
|------|------|------|
|id | UUID | primary key  
|name | string | unique per system  
|created_at | timestamp |  
|updated_at | timestamp |  

---

### User

Represents system users (doctors and clinic managers).

| Field | Type | Notes |
|------|------|------|
|id | UUID | primary key  
|email | string | unique  
|password_hash | string |  
|role | enum | doctor / clinic_manager  
|clinic_id | UUID | FK → Clinic  
|created_at | timestamp |  
|updated_at | timestamp |  

Notes:
- One clinic per user (MVP constraint)
- Clinic manager is a role, not a separate entity

---

### Appointment

Represents scheduled patient visits.

| Field | Type | Notes |
|------|------|------|
|id | UUID | primary key  
|clinic_id | UUID | FK → Clinic  
|doctor_id | UUID | FK → User  
|patient_name | string | free text  
|appointment_type | string | consultation / treatment  
|start_time | timestamp |  
|end_time | timestamp |  
|status | enum | scheduled / cancelled / completed  
|created_at | timestamp |  
|updated_at | timestamp |  

Business Rules:
- Appointments cannot overlap per doctor
- Cancelled appointments free time slots
- Completed appointments are immutable

---

### BlockedTime

Represents unavailable time periods for doctors.

| Field | Type | Notes |
|------|------|------|
|id | UUID | primary key  
|doctor_id | UUID | FK → User  
|start_time | timestamp |  
|end_time | timestamp |  
|created_at | timestamp |  

Notes:
- Treated as first-class schedule entities
- Overrides availability for appointment creation

---

### Invitation

Represents pending doctor invitations.

| Field | Type | Notes |
|------|------|------|
|id | UUID | primary key  
|clinic_id | UUID | FK → Clinic  
|email | string | invited doctor email  
|token | string | unique  
|status | enum | pending / accepted / expired  
|expires_at | timestamp |  
|created_at | timestamp |  

---

## Relationships Overview

Clinic 1 --- * User
Clinic 1 --- * Appointment
User (Doctor) 1 --- * Appointment
User (Doctor) 1 --- * BlockedTime
Clinic 1 --- * Invitation

---

## Appointment Lifecycle State

scheduled --> completed |+--> cancelled


Notes:
- No automatic transitions
- All state changes are manual
- Cancelled and completed appointments remain in history

---

## Key Constraints (Enforced Server-Side)

- One clinic per user (MVP)
- No overlapping appointments for same doctor
- No appointments inside blocked time
- Completed appointments cannot be modified
- Role changes take effect immediately

---

## Indexing (Suggested for MVP)

- Appointment(doctor_id, start_time)
- Appointment(patient_name)
- BlockedTime(doctor_id, start_time)
- User(email)

---

## Explicit Non-Goals

- Multi-clinic users
- Soft deletes
- Audit tables
- Historical snapshots
- Analytics aggregation tables

These may be added post-MVP if validation succeeds.

---

## Design Philosophy

- Prefer explicit tables over implicit logic
- Treat scheduling as source of truth
- Optimize for clarity over abstraction
- Ship fast, evolve later
