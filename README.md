# Dental Scheduling MVP  
End-to-End Product Case → Executable System

This repository represents a complete Product Owner / Product Manager case that evolved into a working product.

It started as a product discovery and specification exercise  
and continues as a real system implementation.

This is not a coding demo.

This is a product brought to life.

---

## What This Project Is

An operational scheduling system for dental clinics covering:

- staff lifecycle (admin / doctor / clinic manager)
- patient lifecycle (create / archive / restore)
- appointment scheduling with reassignment
- availability and time off
- role-based access
- database-enforced business rules

The product was designed first at product level (vision, scope, roadmap, decisions)  
and only then translated into system architecture and implementation.

---

## What This Repository Demonstrates

This project intentionally shows the full product loop:

Product discovery  
→ domain modeling  
→ delivery planning  
→ system architecture  
→ working application  

Most repositories show either documentation or code.

This one connects both.

Architecture here is not speculative — it directly follows product decisions.

---

## Where to Start (Recommended Reading Order)

If you only have a few minutes:

1. Executive Summary — product context and goals  
2. Domain Contract — canonical product definition  
3. Delivery Epics — how the product is broken down  
4. System Context — high-level technical view  

These provide the fastest understanding of both the product thinking and its execution.

---

## High-Level System View


Browser (Single Page Application)
↓
Frontend Application
↓
Backend Platform (Postgres + Auth + Access Control)


Core business rules are enforced at database level rather than in UI code.

---

## Project Status

The product definition and backend contracts are complete.

The project is currently in the implementation phase, focusing on UI assembly and frontend integration.

---

## Author Note

This repository intentionally demonstrates:

- product discovery and framing  
- domain-driven thinking  
- architectural translation of product decisions  
- delivery breakdown  
- and execution  

as a single continuous process.

It started as a Product Manager case study and is being developed into a real application.

Alex Bondarenko  

---

