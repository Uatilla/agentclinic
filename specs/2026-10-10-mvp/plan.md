# Plan: MVP — Therapies catalog and matching (Phases 3–4)

Work through the groups in order. Finish each group by checking that it works, then commit.
Every group must leave the repo working.

## Phase 3: Therapies catalog

### 1. Therapies schema and seed

1. Add `therapies` to `src/db/schema.ts` (id, unique name, description, duration).
2. Run `npm run db:generate` and commit the new SQL in `drizzle/`.
3. Add about 6 playful seed therapies with fixed ids to `src/db/seed.ts`; keep `seed(db)`
   idempotent.
4. Replace Phase 2's "no `therapies` table" test with table, seed count, idempotency and
   unique-name tests.

**Check:** `npm run validate` passes; `npm run db:migrate && npm run db:seed` works on the file
DB.

### 2. Therapy queries

1. Add `listTherapiesWithCounts` (sorted by name) to `src/db/queries.ts`, with unit tests.
   The count is 0 until group 4 adds the link table.

**Check:** `npm run validate` passes.

### 3. Therapies pages, nav and home link

1. Create `src/pages/Therapies.tsx` and a `TherapyCard` (extracted `TherapyCardProps`): name,
   description, duration, linking to `/therapies/:id`.
2. Create `src/pages/TherapyDetail.tsx` (name, description, duration; the ailments list comes
   in group 4) and wire `/therapies/:id{[0-9]+}`; unknown or non-numeric id → 404.
3. Add Therapies to the header nav; the home Therapies card gets `href="/therapies"`, so no
   card says "Coming soon".
4. Replace the "no `/therapies` route" scope guard; update the home test; add route, baseline
   and link-integrity coverage for the new pages.

**Check:** `npm run validate` passes; `/therapies` and `/therapies/1` render in the layout; no
horizontal scroll at 320px.

**Checkpoint — Phase 3 complete:** report results and confirm before starting Phase 4.

## Phase 4: Therapies ↔ ailments

### 4. Matching schema and seed

1. Add `therapy_ailments` (composite key, cascading foreign keys, `effectiveness` enum
   `low`/`medium`/`high` plus `check()`) to the schema; generate and commit the migration.
2. Seed the links: every ailment has at least one therapy; at least one therapy treats 2+
   ailments.
3. Add `getTherapyWithAilments(id)` and `getAilmentDetail(id)` (therapies by effectiveness then
   name; agents by severity then name); `getAgentWithAilments` adds each ailment's therapies;
   `listTherapiesWithCounts` now counts ailments. Unit tests for each.
4. Data-layer tests: `CHECK` rejects `'banana'`, cascade on deleting a therapy or ailment, seed
   coverage rules.

**Check:** `npm run validate` passes.

### 5. Ailment detail and therapy ailments

1. Add an `EffectivenessBadge` (extracted props, graded styles, at least 4.5:1 contrast) in
   `public/styles.css` next to the severity badges.
2. Create `src/pages/AilmentDetail.tsx`: name, description, recommended therapies (badge, link)
   and affected agents (severity, link); "No known cure — yet." when it has no therapies.
   Wire `/ailments/:id{[0-9]+}`; `/ailments` cards link to it.
3. `TherapyDetail` lists the ailments it treats (badge, link), with its empty state.
4. Route tests for both pages, their empty states and 404s.

**Check:** `npm run validate` passes; badges are readable in light and dark mode.

### 6. Agent profile recommendations

1. On `/agents/:id`, each ailment links to `/ailments/:id` and lists its recommended therapies
   (links with effectiveness labels).
2. Route tests: a seeded agent's profile shows each ailment's therapies in order.

**Check:** `npm run validate` passes; the profile stays readable at 320px.

### 7. Full validation, docs and roadmap

1. Expand tests to cover every automated check in [`validation.md`](./validation.md),
   including the new scope guards (no booking, dashboard or write routes).
2. Update `README.md` (pages, seed data), `specs/roadmap.md` (Phases 3–4 done via this spec)
   and the branch convention in `specs/tech-stack.md`.
3. Open a GitHub PR from `mvp` to `main` and get CI green.

**Check:** `npm run validate` passes, CI is green on the PR, then the manual checks in
[`validation.md`](./validation.md).

### 8. Review fixes

Filled in after the branch review, with an amendment note in
[`requirements.md`](./requirements.md).
