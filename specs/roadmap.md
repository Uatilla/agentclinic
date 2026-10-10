# Roadmap

Each phase is one user-visible slice, built end to end and mergeable on its own.
Phases run in order, and each one gets its own feature spec before implementation.
Every phase that adds or changes UI keeps it responsive (see [`tech-stack.md`](./tech-stack.md)),
and its validation checks the reference widths.

## Phase 1: Hello Hono — ✅ Done

Spec: [`2026-10-09-hello-hono`](./2026-10-09-hello-hono/)

- Hono server running on Node with TypeScript
- Shared layout (header, footer, base styles), responsive and mobile-first
- Minimal AgentClinic home page
- First Vitest test for the home route
- GitHub Actions CI (type-check + tests)

## Phase 2: Agents & ailments — 🔍 In review (merge when CI is green and manual checks pass)

Spec: [`2026-10-10-agents-ailments`](./2026-10-10-agents-ailments/)

- PicoCSS adopted as the CSS foundation; existing layout and home page migrated
- SQLite + Drizzle set up: `agents` and `ailments` schemas, plus the link between them;
  migrations and seed data
- `/agents` page listing agents
- `/agents/:id` page showing an agent's profile and their ailments
- 404 page for unknown agents
- `/ailments` page listing ailments
- Header nav (Home, Agents, Ailments); home cards link to the new pages

## Phase 3: Therapies catalog

- `therapies` schema + seed data
- `/therapies` page listing therapies

## Phase 4: Therapies ↔ ailments

- Match therapies to ailments
- Ailment and agent pages show recommended therapies

## Backlog (not scheduled)

- Appointment booking
- Staff dashboard
