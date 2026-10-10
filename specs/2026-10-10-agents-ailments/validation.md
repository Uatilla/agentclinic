# Validation: Phase 2 — Agents & ailments

The phase can merge to `main` when every box below is checked.

## Automated

- [x] `npm ci` installs cleanly from the lockfile (including `better-sqlite3` on Node 24).
- [x] `npm run validate` passes: type-check with zero errors (strict mode), then all tests.
- [x] Tests run against a fresh, migrated and seeded `:memory:` DB: `src/app.tsx` exports only
      `createApp` (importing it opens no DB), and no test sets `DATABASE_URL`.
- [x] Styling tests assert:
  - [x] `GET /public/vendor/pico.min.css` returns 200 with `text/css`, and the body is Pico.
  - [x] `GET /public/styles.css` returns 200 with `text/css`.
  - [x] `@picocss/pico` v2 is a dependency in `package.json`.
- [x] Data layer tests assert:
  - [x] Migrations create `agents`, `ailments` and `agent_ailments`.
  - [x] Seed inserts 5 agents and 6 ailments; seeding twice gives the same row counts.
  - [x] Every seeded agent has at least one ailment; at least one ailment is shared by 2+ agents.
  - [x] The database rejects a `severity` other than `mild`, `moderate`, `severe` (inserting
        `'banana'` throws a `CHECK` constraint error).
  - [x] `createDb` on a path in a missing directory creates the directory.
  - [x] Deleting an agent deletes its `agent_ailments` rows (cascade); a duplicate ailment name
        is rejected (`UNIQUE`).
  - [x] `DATABASE_URL` is normalised: a `file:` prefix is stripped; empty means the default.
  - [x] No `therapies` table exists (Phase 3 adds it).
  - [x] Query functions (`listAgents`, `getAgentWithAilments`, `listAilmentsWithCounts`) return
        the seeded data; an unknown id returns nothing.
- [x] Route tests assert:
  - [x] `GET /agents` returns 200 HTML listing every seeded agent, each linking to
        `/agents/:id`.
  - [x] `GET /agents/:id` for a seeded agent returns 200 with their name, model, bio, and each
        of their ailments with its visible severity label (Mild, Moderate, Severe).
  - [x] An agent with no ailments shows "Clean bill of health."
  - [x] `GET /agents/9999` and `GET /agents/abc` return 404 with the not-found page inside the
        layout.
  - [x] An unknown path (e.g. `GET /nope`) returns 404 with the same not-found page.
  - [x] 404 pages, including ones under a section (`/agents/9999`), mark no nav item as current.
  - [x] An unexpected error returns 500 with an error page inside the layout.
  - [x] `GET /ailments` returns 200 HTML listing every seeded ailment with its affected-agent
        count.
  - [x] `GET /` still passes all Phase 1 checks except the no-`<a>` guard, which is replaced
        below.
  - [x] Home: Agents and Ailments cards link to `/agents` and `/ailments`; Therapies is still
        "coming soon" and not a link ("Coming soon" appears exactly once).
  - [x] Header nav links to `/`, `/agents` and `/ailments` on every page.
- [x] Baseline on every page (`/`, `/agents`, `/agents/:id`, `/ailments`, 404, 500):
  - [x] `<html lang="en">`, exactly one `<h1>`, and `<header>`, `<main>`, `<footer>` landmarks.
  - [x] Viewport meta tag (`width=device-width, initial-scale=1`).
  - [x] Stylesheets are exactly `/public/vendor/pico.min.css` then `/public/styles.css` (no
        external URLs).
  - [x] No `<script>` tag (no client-side JavaScript).
- [x] Link integrity (replaces Phase 1's no-`<a>` guard): every internal `href` on every page
      above returns 200.
- [x] Scope guard: no `/therapies` route (returns 404) and no write routes (`POST /agents`
      returns 404).
- [x] The GitHub Actions CI workflow runs on the PR (Node 24) and is green. (Ran on the push of
      the merge to `main` instead of a PR: run 38038108478, 93 tests green.)

## Manual

- [x] `npm run db:migrate && npm run db:seed && npm run dev` starts the app with seeded data.
- [x] `drizzle/` migrations are committed; `data/` is git-ignored.
- [x] In a current evergreen browser, the agents list, agent profile, ailments list and 404
      page look consistent with the home page, with Pico and the overrides applied.
- [x] Pico migration: the home page looks the same or better than Phase 1; the teal brand color
      shows in light and dark mode (OS setting); severity badges are readable in both.
- [x] `public/styles.css` contains only overrides and Pico-missing components (review only).
- [x] Contrast (WCAG AA, 4.5:1) checked with a contrast checker in light and dark mode: links,
      badge text on badge background (each severity), text on primary buttons, muted text on
      page and card backgrounds; focus outlines at least 3:1.
- [x] Footer text is muted; at 1280px the content is at most `1024px` wide and the headline
      is `48px`, as in Phase 1.
- [x] Starting the server from another directory still serves the page and both stylesheets:
      `cd /tmp && <repo>/node_modules/.bin/tsx --tsconfig <repo>/tsconfig.json <repo>/src/index.ts`
      (`--tsconfig` because `tsx` reads it from the working directory, for the JSX settings).
- [x] Seed data and 404 copy match the tone (playful but polished).
- [x] Responsive (browser dev tools), on every page (including `/`, which Phase 1 deferred
      here), at each reference width from `tech-stack.md`:
  - [x] 320px: no horizontal scroll; cards stack in one column; header nav sits on its own
        row without overflow, header about 100px tall; text readable without zooming.
  - [x] 768px: layout uses the extra width; nothing overflows.
  - [x] 1280px: content is centered within the max width; cards sit side by side.
  - [x] Nav links and cards are at least 44×44px touch targets.

## Scope guard

- [x] No therapies seed data or pages (review only; the missing table is tested above).
