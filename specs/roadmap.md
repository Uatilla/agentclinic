# Roadmap

Each phase is one user-visible slice, built end to end and mergeable on its own.
Phases run in order, and each one gets its own feature spec before implementation.

## Phase 1: Hello Hono — ✅ Done

Spec: [`2026-10-09-hello-hono`](./2026-10-09-hello-hono/)

- Hono server running on Node with TypeScript
- Shared layout (header, footer, base styles)
- Minimal AgentClinic home page
- First Vitest test for the home route
- GitHub Actions CI (type-check + tests)

## Phase 2: List agents

- SQLite + Drizzle set up: `agents` schema, migration, seed data
- `/agents` page listing agents

## Phase 3: Agent detail

- `/agents/:id` page showing an agent's profile
- 404 page for unknown agents

## Phase 4: Ailments catalog

- `ailments` schema + seed data
- `/ailments` page listing ailments

## Phase 5: Agents ↔ ailments

- Link agents to their ailments
- Agent detail page shows the agent's ailments

## Phase 6: Therapies catalog

- `therapies` schema + seed data
- `/therapies` page listing therapies

## Phase 7: Therapies ↔ ailments

- Match therapies to ailments
- Ailment and agent pages show recommended therapies

## Backlog (not scheduled)

- Appointment booking
- Staff dashboard
