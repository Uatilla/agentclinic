# Validation: MVP — Therapies catalog and matching (Phases 3–4)

The MVP can merge to `main` when every box below is checked.

## Automated

- [ ] `npm ci` installs cleanly from the lockfile.
- [ ] `npm run validate` passes: type-check with zero errors (strict mode), then all tests.
- [ ] Tests run against a fresh, migrated and seeded `:memory:` DB; no test sets
      `DATABASE_URL`.
- [ ] Phase 1 and Phase 2 tests still pass, except the guards this spec replaces (no
      `therapies` table, no `/therapies` route, "Coming soon" on Therapies).
- [ ] Data layer tests assert:
  - [ ] Migrations create `therapies` and `therapy_ailments`.
  - [ ] Seed inserts the therapies; seeding twice gives the same row counts.
  - [ ] Every seeded ailment has at least one therapy; at least one therapy treats 2+ ailments.
  - [ ] The database rejects an `effectiveness` other than `low`, `medium`, `high` (`'banana'`
        throws a `CHECK` error).
  - [ ] A duplicate therapy name is rejected (`UNIQUE`).
  - [ ] Deleting a therapy or an ailment deletes its `therapy_ailments` rows (cascade).
  - [ ] `listTherapiesWithCounts`, `getTherapyWithAilments`, `getAilmentDetail` and the
        extended `getAgentWithAilments` return the seeded data in the specified order; unknown
        ids return nothing.
- [ ] Route tests assert:
  - [ ] `GET /therapies` returns 200 listing every seeded therapy (name, description, duration,
        ailment count), each linking to `/therapies/:id`.
  - [ ] `GET /therapies/:id` returns 200 with the therapy and each ailment it treats, with its
        visible effectiveness label (Low, Medium, High) and a link to `/ailments/:id`.
  - [ ] `GET /ailments/:id` returns 200 with the ailment, its therapies (high → low) and its
        affected agents with severity, all linked.
  - [ ] `GET /ailments` cards link to `/ailments/:id`.
  - [ ] `GET /agents/:id` links each ailment to `/ailments/:id` and lists all its therapies,
        high → low effectiveness.
  - [ ] Empty states: an ailment with no therapies shows "No known cure — yet."; a therapy with
        no ailments shows its empty-state text.
  - [ ] `GET /therapies/9999`, `/therapies/abc`, `/ailments/9999` and `/ailments/abc` return 404
        with the not-found page, marking no nav item.
  - [ ] Header nav links to `/`, `/agents`, `/ailments` and `/therapies` on every page, and
        marks the current section (`/therapies/1` → Therapies, `/ailments/1` → Ailments).
  - [ ] Home: all three cards link; "Coming soon" appears nowhere.
- [ ] Baseline on every page (`/`, `/agents`, `/agents/:id`, `/ailments`, `/ailments/:id`,
      `/therapies`, `/therapies/:id`, 404, 500): `<html lang="en">`, one `<h1>`, `<header>`,
      `<main>`, `<footer>`, viewport meta, stylesheets exactly Pico then `styles.css`, no
      `<script>`.
- [ ] Link integrity: every internal `href` on every page above returns 200.
- [ ] Scope guard: no booking or dashboard routes (`/appointments`, `/dashboard` → 404) and no
      write routes (`POST /therapies`, `POST /agents` → 404).
- [ ] The GitHub Actions CI workflow is green on the `mvp` → `main` pull request (Node 24).

## Manual

- [ ] `npm run db:migrate && npm run db:seed && npm run dev` starts the app with seeded
      therapies and matches.
- [ ] New `drizzle/` migrations are committed.
- [ ] Walkthrough in a current evergreen browser: home → Agents → an agent → one of their
      ailments → a recommended therapy → back to the ailment, using only links.
- [ ] New pages look consistent with Phase 2 pages; effectiveness badges are readable in light
      and dark mode.
- [ ] Contrast (WCAG AA, 4.5:1) checked for each effectiveness badge in light and dark mode.
- [ ] Seed therapies and empty-state copy match the tone (playful but polished).
- [ ] Responsive at each reference width, on every new or changed page:
  - [ ] 320px: no horizontal scroll; header nav with four links wraps without overflow; agent
        profile recommendations stay readable.
  - [ ] 768px: layout uses the extra width; nothing overflows.
  - [ ] 1280px: content centered within the max width.
  - [ ] Nav links, cards and therapy links are at least 44×44px touch targets.
- [ ] README, roadmap and tech-stack reflect the MVP.
- [ ] `CHANGELOG.md` has an entry for the MVP.
- [ ] `prompts.md` has concise, reusable SDD lessons from this MVP.

## Scope guard

- [ ] No booking, dashboard, forms or client-side JavaScript (review only; routes are tested
      above).
