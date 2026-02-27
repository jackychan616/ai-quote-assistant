# Implementation Plan (Phase 0 -> Phase 1)

## Goal
Ship an MVP to manage lead intake, quote generation, and automated follow-up scheduling.

## Stack
- Frontend/API: Next.js 14 (App Router, TypeScript)
- DB/Auth: Supabase Postgres + Supabase Auth + RLS
- AI: OpenAI (quote summary + follow-up suggestion)
- Scheduling (next step): Supabase Edge Function + pg_cron or external queue

## Milestones

### M0: Foundation (today)
- [x] Repository scaffold (`apps/web`, `docs`, `supabase/migrations`)
- [x] Core API route stubs
- [x] DB schema migration draft for users/leads/quotes/followups
- [x] API contracts doc

### M1: Data + CRUD
- [ ] Wire Supabase client (server + browser variants)
- [ ] Build leads list + create form
- [ ] Build quote create flow with line items and totals
- [ ] Build follow-up Kanban/list and status updates

### M2: AI Assistant
- [ ] API endpoint to generate quote summary text
- [ ] API endpoint to propose follow-up cadence/messages
- [ ] Persist prompt/response metadata for audit

### M3: Automation + Ops
- [ ] Daily task scheduler for due follow-ups
- [ ] Notification delivery adapters (email/WhatsApp/LINE)
- [ ] Dashboard metrics: pipeline, conversion, overdue followups

## Suggested Initial Pages
- `/` dashboard summary
- `/leads` list + add
- `/leads/[id]` detail timeline
- `/quotes` list + create
- `/followups` task queue

## Non-functional Requirements
- Strict input validation (zod)
- Full audit columns (`created_at`, `updated_at`, `created_by`)
- Multi-tenant ready via `org_id` (optional in v1)
- RLS enabled for all business tables
