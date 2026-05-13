# Baldrige + OCAI Organizational Assessment Platform

A Next.js platform for conducting **Baldrige Performance Excellence Framework** and **Organizational Culture Assessment Instrument (OCAI)** surveys across enterprise teams. Built for consulting engagements where facilitators run structured assessments across multiple cohorts at once.

---

## What it does

Provides facilitator-led organizational assessment workflows for enterprises and consulting firms.

- **Bulk credential provisioning** — administrators upload CSVs of employee email/password pairs; each gets unique tracked access.
- **Dual authentication modes** — shared access keys (cohort-level tracking) or email credentials (individual-level tracking).
- **Real-time response tracking** — facilitator dashboard tracking who's responded, who's pending, and completion percentage by team.
- **Multi-batch credential management** — provision dozens of assessment cohorts in parallel; each with separate access tokens and analytics.
- **Two assessment frameworks** — Baldrige PEF (7 categories, performance excellence) and OCAI (4 culture types, organizational culture).
- **Analytics & reporting** — aggregated insights at the team, department, and organization level.

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 15 · React 19 · TypeScript · Tailwind CSS · shadcn/ui |
| Backend | Next.js App Router · JWT authentication · server-side validation |
| Database | PostgreSQL · Prisma ORM |
| Auth | JWT · bcrypt · access-key + email-credential flows |
| Deployment | Vercel · Linux VPS · Nginx |

## Architecture

- **Multi-tenant data model:** organizations → assessment batches → users → responses
- **Three authentication flows:** admin login, facilitator access keys, individual credential login
- **Role-based access:** Super Admin · Organization Admin · Facilitator · Respondent — each scoped to its data
- **Cohort isolation:** every batch's responses, users, and analytics live in its own namespace

## Status

In production use with consulting clients for organizational assessment engagements across Ethiopia.

## Author

Built by [Oliyad Bekele](https://github.com/Oli-yad13) — full-stack engineer.
