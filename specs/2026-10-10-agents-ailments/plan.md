# Plan: Phase 2 — Agents & ailments

Work through the groups in order. Finish each group by checking that it works, then commit.
Every group must leave the repo working.

## 1. PicoCSS foundation

1. Install `@picocss/pico` (v2).
2. Serve `node_modules/@picocss/pico/css/pico.min.css` at `/public/vendor/pico.min.css`
   (`serveStatic` with its `path` option), registered before the `/public/*` handler. Resolve
   both from the module, not the working directory:
   `require.resolve('@picocss/pico/css/pico.min.css')` and `public/` via `import.meta.url`.
3. In `Layout.tsx`, link Pico first, then `/public/styles.css`.
4. Move the layout to Pico patterns: `.container` (capped at `1024px` from 1280px up) for page
   width, and a
   `TeaserCard` component (extracted `TeaserCardProps`) that returns a Pico `<article>`; the
   page wraps each card in `<li>`.
5. Shrink `public/styles.css` to overrides: `--pico-primary*` set to the brand teal (light
   `#1f7f74`, dark `#4fc3b4`, dark text on teal buttons), the `auto-fit` card grid, and a
   `.badge` with `--badge-*` tokens (at least 4.5:1 contrast). Delete rules Pico already covers
   (reset, typography, base colors, dark-mode palette).
6. Add tests: Pico and `styles.css` return 200 with `text/css` (Pico's body is really Pico);
   every page links exactly `[pico.min.css, styles.css]` in that order, with no external URLs.
   Put the stylesheet check in a helper later page tests reuse.

**Check:** `npm run validate` passes; the home page looks the same or better in light and dark
mode (footer muted, headline and width as in Phase 1); no horizontal scroll at 320px.

## 2. Database tooling

1. Install deps: `drizzle-orm`, `better-sqlite3`; dev deps: `drizzle-kit`,
   `@types/better-sqlite3`.
2. Add `drizzle.config.ts` (dialect `sqlite`, schema `src/db/schema.ts`, out `drizzle/`,
   URL from `DATABASE_URL` with default `data/agentclinic.db`).
3. Add `data/` to `.gitignore`.
4. Add scripts `db:generate`, `db:migrate`, `db:seed`.

**Check:** `npm run validate` still passes; CI installs `better-sqlite3` on Node 24.

## 3. Schema, migrations and seed data

1. Create `src/db/schema.ts` with `agents`, `ailments` and `agent_ailments` (composite primary
   key, foreign keys, `severity` enum `mild`/`moderate`/`severe` plus a `check()` constraint).
2. Run `npm run db:generate` and commit the SQL in `drizzle/`.
3. Create `src/db/client.ts`: `createDb(url)` creates the parent directory for a file DB, opens
   `better-sqlite3`, enables foreign keys and runs the migrations. Add `src/db/migrate.ts` for
   `db:migrate`.
4. Create `src/db/seed.ts`: seed data plus an idempotent `seed(db)` function, and a CLI entry
   used by `db:seed`.
5. Add a test helper (`src/db/test-db.ts`) that returns a migrated, seeded `:memory:` DB.

**Check:** on a fresh clone, `npm run db:migrate && npm run db:seed` creates
`data/agentclinic.db`; Vitest tests cover the data-layer checks in
[`validation.md`](./validation.md) (tables, seed counts and idempotency, shared ailment,
severity `CHECK`).

## 4. App factory and data access

1. Refactor `src/app.tsx` to export only `createApp(db)` (nothing opened on import);
   `src/index.ts` creates the file DB and passes it. Keep the module-resolved static paths
   from group 1.
2. Update `src/app.test.tsx` to build the app from the test DB; Phase 1 tests stay green.
3. Create `src/db/queries.ts`: `listAgents`, `getAgentWithAilments(id)`,
   `listAilmentsWithCounts`, with unit tests.

**Check:** `npm run validate` passes; `npm run dev` still serves `/`.

## 5. List pages: `/agents` and `/ailments`

1. Create `src/pages/Agents.tsx`: heading and a card (Pico `<article>`) per agent (name, model) linking to
   `/agents/:id`.
2. Create `src/pages/Ailments.tsx`: heading and a card per ailment (name, description, number
   of agents affected).
3. Wire both routes; add route tests (status, content, one `<h1>`, links).

**Check:** both pages render seeded data inside the layout; no horizontal scroll at 320px.

## 6. Agent profile and 404

1. Create `src/pages/AgentProfile.tsx`: name, model, bio, and the list of ailments with a
   severity label.
2. Create `src/pages/NotFound.tsx`: playful 404 message and a link back to `/agents`.
3. Wire `/agents/:id`: non-numeric or unknown id → 404 page with status 404; register
   `app.notFound` with the same page.
4. Add route tests for a known agent, an unknown id, a non-numeric id and an unknown path.

**Check:** profile shows the seeded ailments with severities; 404 cases return status 404 with
the layout.

## 7. Navigation and home links

1. Add header nav (Home, Agents, Ailments) to `Header.tsx` using Pico's `<nav>` with `<ul>`
   lists, with touch-friendly links (at least 44×44px) that wrap on small screens.
2. Give `TeaserCardProps` an optional `href`: with it, the card title is a link and there is no
   badge. Agents and Ailments link; Therapies stays "coming soon". Update the Phase 1 home test:
   "Coming soon" appears once, on Therapies.
3. Replace Phase 1's no-`<a>` scope guard with a link-integrity test: on every page, each
   internal `href` returns a non-404 status.
4. Expand tests to cover every automated check in [`validation.md`](./validation.md).
5. Update `README.md` with the database setup steps.

**Check:** `npm run validate` passes, then the manual checks in [`validation.md`](./validation.md).
