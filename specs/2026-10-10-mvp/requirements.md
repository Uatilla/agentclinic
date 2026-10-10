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

> **Amended 2026-10-10 (after group 1, before group 2):** a pre-build review settled four gaps:
> therapy↔ailment info appears only once the link table exists (no zeros at the Phase 3
> checkpoint); agent profiles list every therapy per ailment, best first; the header may wrap
> taller at 320px with four links; close-out includes the changelog, study notes and a pushed PR.
>
> **Amended 2026-10-10 (after the branch review, group 8):** a three-angle review (spec
> conformance, code and tests, UX and accessibility) found no bugs but showed that ratings
> were hard to read on agent profiles. Severity moves to a warm color scale so it no longer
> looks like effectiveness; badges say what they measure; profile therapy lists get a visible
> label; badges stay next to their names; the 404 page links every section; the therapy
> duration is labelled; extra empty states are recorded; shared row and badge components
> replace four copies; the roadmap waits for the merge before saying "done".

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
  - `/agents/:id`: each ailment links to `/ailments/:id` and lists all its recommended
    therapies, best first.
  - `/ailments` cards link to `/ailments/:id`.
  - Unknown or non-numeric ids on the new detail routes → the existing 404 page.
- **Navigation:** header nav gets Therapies (Home, Agents, Ailments, Therapies); the home
  Therapies card becomes a link, so no card says "coming soon".
- **Tests:** Vitest tests for every automated check in [`validation.md`](./validation.md),
  against the in-memory test DB.
- **Docs:** README, roadmap and tech-stack updated to reflect the MVP; `CHANGELOG.md` updated
  with the `/changelog` skill; concise, reusable SDD lessons added to `prompts.md`.
- **Pull request:** `mvp` pushed to `origin` and a PR opened to `main` (confirmed with the
  author right before pushing).

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
| Agent profile recommendations | Every therapy for each ailment, best first, as compact links with effectiveness badges; a therapy may appear under two ailments | Seed has 1–3 therapies per ailment, so lists stay short; per-ailment grouping explains *why* each therapy is there |
| Low effectiveness | Still listed, ranked last, with its "Low" label | Honest and on-tone; the label carries the meaning |
| Phase 3 checkpoint content | Groups 2–3 show only therapy name, description and duration; ailment counts and lists arrive with `therapy_ailments` in groups 4–5 | No page shows placeholder zeros or empty states caused by unbuilt work |
| Effectiveness badges | Teal scale (low neutral, medium teal tint, high solid teal), text label always shown, at least 4.5:1 contrast | Good news uses the brand color; color is never the only signal |
| Empty states | Ailment page with no therapies, and an ailment on a profile with none: "No known cure — yet." Ailment with no agents: "No agents affected — for now." Therapy with no ailments: "Treats nothing in particular. Feels great, though." on its page, "Treats nothing in particular" on its card. The seed never hits them; tests add rows | Every list has an empty state that fits the tone |
| Migration | One new drizzle-kit migration per phase half (`therapies`, then `therapy_ailments`) | Schema history follows the plan order and stays reviewable |
| Route ids | `/therapies/:id{[0-9]+}`, `/ailments/:id{[0-9]+}`, same as `/agents/:id` | One pattern for every detail page |
| Current page in nav | `/therapies/…` marks Therapies, `/ailments/…` marks Ailments; 404/500 mark nothing | Same rule as Phase 2 |
| Scope guards | Phase 2's "no `therapies` table" and "no `/therapies` route" guards are replaced by booking/dashboard/write-route guards | Those guards are now wrong on purpose; the new ones keep the backlog out |
| Queries | Plain data out from `src/db/queries.ts`: `listTherapiesWithCounts`, `getTherapyWithAilments`, `getAilmentWithTherapiesAndAgents`; `getAgentWithAilments` adds each ailment's therapies. Sort ranks are built from the enum arrays in `schema.ts`. (Groups 2–3 used `listTherapies`/`getTherapy`; group 4 renamed and extended them) | Pages stay independent of Drizzle; adding an enum value can't silently mis-rank |
| Header at 320px | With four nav links the nav may wrap to two rows; the header stays left-aligned with no overflow (Phase 2's ~100px height becomes a guide, not a limit) | Four touch-friendly links don't fit one row at 320px |
| Components | One `RatedLink` row (link plus badge) and one `Badge` component serve every detail list; `SeverityBadge` and `EffectivenessBadge` are thin wrappers. Detail lists use a neutral `.detail-list` class, styled through direct children only. Every props type is a named `type FooProps` | One markup pattern instead of four copies; nested lists can't inherit row styles by accident |
| Severity badges | Warm scale replacing Phase 2's teal one: mild neutral, moderate amber tint (light `#fbecd0`/`#8a4b00`, dark `#3d2b12`/`#f0b85c`), severe solid red-brown (light `#a8402b`/white, dark `#e8826a`/`#2a0e07`); all at least 4.5:1 | On a profile, severity (bad) and effectiveness (good) sit side by side; one scale made "Severe" and "High" look identical |
| What a badge measures | Each badge carries a visually hidden prefix ("Severity: ", "Effectiveness: "), and lists say it visibly once: profile therapy lists open with a "Recommended therapies" label (also their accessible name via `aria-labelledby`) | "High" alone is ambiguous, for sighted and screen-reader users |
| Badge placement | A badge follows its name on the same line; a long name wraps instead; detail lists are capped at `40rem` | Keeps name and rating together at 320px and avoids a 900px gap at 1280px |
| 404 page | Links to Agents, Ailments and Therapies | A stale link to any section has a way back |
| Therapy duration | Shown as "Duration: …"; the therapy list heading is "Ailments it treats" | Unlabelled values and terse headings read poorly, especially in heading navigation |
| Unused code | `TeaserCard`'s "Coming soon" path is removed (`href` required) | Every home card links now; dead code misleads |
