# Requirements: MVP — Therapies catalog and matching (Phases 3–4)

## Context

The MVP finishes the mission's scope: agents come in with their ailments and leave with
therapies. It combines roadmap **Phase 3 (Therapies catalog)** and **Phase 4 (Therapies ↔
ailments)** on one `mvp` branch, built in phase order with a checkpoint between them.

Phase 2 ([`2026-10-10-agents-ailments`](../2026-10-10-agents-ailments/)) delivered PicoCSS,
SQLite + Drizzle (`agents`, `ailments`, `agent_ailments` with severity), seed data, `/agents`,
`/agents/:id`, `/ailments`, 404/500 pages, header nav and home links. The home Therapies card
is still "coming soon", and Phase 2 tests guard that no `therapies` table or `/therapies` route
exists.

Guided by [`mission.md`](../mission.md) (scope: agents & ailments, therapies matched to
ailments; playful but polished; responsive; tested and CI-green before merge) and
[`tech-stack.md`](../tech-stack.md) (Hono JSX, PicoCSS, SQLite + Drizzle, Vitest). Phase 2's
decisions (fixed seed ids, `CHECK` enums, cascades, `createApp(db)`, queries module, graded
badges, page baseline) carry over unless changed here.

## Scope

### In

- **Schema:**
  - `therapies`: id, name (unique), description, duration (text, e.g. "3 sessions").
  - `therapy_ailments`: join table (`therapy_id`, `ailment_id`, `effectiveness`); composite
    primary key; foreign keys with cascade delete; `effectiveness` is one of `low`, `medium`,
    `high`, enforced by a database `CHECK`.
- **Seed data:** about 6 playful therapies (tone: context detox, temperature therapy, grounding
  retreat). Every seeded ailment has at least one therapy; at least one therapy treats 2+
  ailments. Fixed ids; `seed(db)` stays idempotent.
- **Pages** (server-rendered in the shared `Layout`, responsive):
  - `/therapies`: list of therapies (name, description, duration, number of ailments treated),
    each linking to its detail page.
  - `/therapies/:id`: therapy detail (name, description, duration) and the ailments it treats,
    each with an effectiveness label and a link to the ailment.
  - `/ailments/:id`: ailment detail (name, description), its recommended therapies (with
    effectiveness, linking to the therapy) and the agents affected (with severity, linking to
    the agent).
  - `/agents/:id`: each ailment links to `/ailments/:id` and lists its recommended therapies.
  - `/ailments` cards link to `/ailments/:id`.
  - Unknown or non-numeric ids on the new detail routes → the existing 404 page.
- **Navigation:** header nav gets Therapies (Home, Agents, Ailments, Therapies); the home
  Therapies card becomes a link, so no card says "coming soon".
- **Tests:** Vitest tests for every automated check in [`validation.md`](./validation.md),
  against the in-memory test DB.
- **Docs:** README, roadmap and tech-stack updated to reflect the MVP.

### Out

- Appointment booking and staff dashboard (backlog).
- Creating, editing or deleting anything (no forms, no write routes).
- Client-side JavaScript, search or filters.
- Personalised recommendations that weigh severity against effectiveness (recommendations are
  per ailment, the same for every agent).
- Deployment.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Branch | One `mvp` branch and one spec for Phases 3 and 4, merged by a GitHub PR | The two phases only make sense together for an MVP; tech-stack's "one branch per phase" convention is updated to allow a combined milestone |
| Plan order | Phase-ordered slices: Phase 3 groups, a checkpoint, then Phase 4 groups | Each half is user-visible and testable on its own, and the checkpoint keeps the "small phases" principle |
| Therapy ↔ ailment relationship | Many-to-many via `therapy_ailments`, with `effectiveness` | One therapy can treat several ailments and an ailment can have several therapies; the rating gives a meaningful order |
| Effectiveness values | `text({ enum })` plus a `check()` constraint, as for `severity` | Same pattern as Phase 2: typed in TypeScript, enforced in SQLite |
| Recommendation order | Effectiveness high → low, then name | The most promising therapy is what a reader looks for first |
| Effectiveness badges | Graded like severity (low neutral, medium teal tint, high solid teal), text label always shown, at least 4.5:1 contrast | One visual language for ratings; color is never the only signal |
| Ailment with no therapies | Shows "No known cure — yet." (the seed never hits it; tested with an extra row) | Every page has an empty state that fits the tone |
| Therapy with no ailments | Shows "Treats nothing in particular. Feels great, though." | Same as above |
| Migration | One new drizzle-kit migration per phase half (`therapies`, then `therapy_ailments`) | Schema history follows the plan order and stays reviewable |
| Route ids | `/therapies/:id{[0-9]+}`, `/ailments/:id{[0-9]+}`, same as `/agents/:id` | One pattern for every detail page |
| Current page in nav | `/therapies/…` marks Therapies, `/ailments/…` marks Ailments; 404/500 mark nothing | Same rule as Phase 2 |
| Scope guards | Phase 2's "no `therapies` table" and "no `/therapies` route" guards are replaced by booking/dashboard/write-route guards | Those guards are now wrong on purpose; the new ones keep the backlog out |
| Queries | New functions in `src/db/queries.ts`, plain data out: `listTherapiesWithCounts`, `getTherapyWithAilments`, `getAilmentDetail`; `getAgentWithAilments` adds each ailment's therapies | Pages stay independent of Drizzle and easy to test |
| Components | New cards and badges reuse `TeaserCard`/card-grid patterns, each with an extracted `type FooProps` | Per [`tech-stack.md`](../tech-stack.md) conventions |
