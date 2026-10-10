# Requirements: Phase 2 — Agents & ailments

## Context

Second phase of [`roadmap.md`](../roadmap.md). Phase 1
([`2026-10-09-hello-hono`](../2026-10-09-hello-hono/)) delivered a Hono server, a shared
responsive layout, a home page with three "coming soon" teaser cards, Vitest and CI. There is no
data layer yet.

This phase adds the first real data and the first pages built on it: the clinic's patients
(agents) and what they suffer from (ailments).

Guided by [`mission.md`](../mission.md) (scope: agents & ailments; playful but polished;
responsive; tested and CI-green before merge) and [`tech-stack.md`](../tech-stack.md) (SQLite,
Drizzle ORM + drizzle-kit, seed data, Hono JSX, PicoCSS, Vitest). PicoCSS is new product-wide,
so this phase also migrates the existing layout and home page to it.

## Scope

### In

- **PicoCSS migration:**
  - Install `@picocss/pico` and serve `pico.min.css` locally at `/public/vendor/pico.min.css`.
  - `Layout` links Pico first, then `public/styles.css`.
  - Layout and home page use Pico's semantic patterns (`.container`, `<nav>`, `<article>`
    cards); the current look stays the same or better (teal brand, light/dark, content width).
  - Static files are resolved from the module, so styles load wherever the server starts.
  - `public/styles.css` shrinks to overrides: brand colors via `--pico-*` variables, the card
    grid, badges (with their own `--badge-*` tokens).
  - Text and controls meet WCAG AA contrast (4.5:1) in light and dark mode.
- **Data layer:** SQLite via Drizzle ORM (`better-sqlite3` driver), with drizzle-kit migrations
  committed to the repo.
- **Schema:**
  - `agents`: id, name, model (e.g. "GPT-something", "Claude-ish"), bio.
  - `ailments`: id, name, description.
  - `agent_ailments`: join table (`agent_id`, `ailment_id`, `severity`); composite primary key;
    `severity` is one of `mild`, `moderate`, `severe`, enforced by a database `CHECK`.
- **Seed data:** a small, playful set (5 agents, 6 ailments) where each agent has at least
  one ailment and at least one ailment is shared by several agents. Ailment tone reference:
  hallucinations, context overload, prompt fatigue.
- **Pages** (server-rendered inside the shared `Layout`, responsive):
  - `/agents`: list of agents (name, model), each linking to its profile.
  - `/agents/:id`: agent profile (name, model, bio) and their ailments with severity.
  - `/ailments`: list of ailments (name, description) with how many agents have each.
  - 404 page for unknown or invalid agent ids, and as the app-wide not-found page.
- **Navigation:**
  - Header nav with links to Home, Agents and Ailments.
  - Home teaser cards for Agents and Ailments become links; Therapies stays "coming soon"
    and is not a link. `TeaserCard` gets an optional `href`; the badge shows only without one.
- **Tests:** Vitest route tests against a fresh in-memory database seeded with the same seed
  data.

### Out

- Therapies schema, pages and matching (Phases 3–4).
- `/ailments/:id` detail page (Phase 4 adds recommended therapies there).
- Creating, editing or deleting agents or ailments (no forms, no write routes).
- Client-side JavaScript (including Pico's optional theme-switcher script).
- A custom Pico build (Sass); the precompiled CSS is enough.
- Appointment booking and staff dashboard (backlog).
- Deployment.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Agent ↔ ailment relationship | Many-to-many via `agent_ailments`, with `severity` | One ailment affects many agents (needed for Phase 4 matching); severity adds product value and fits the tone |
| Severity values | Text column with Drizzle `text({ enum })` plus a `check()` constraint (`severity IN ('mild','moderate','severe')`) | `enum` only narrows the TypeScript type; the `CHECK` makes SQLite reject bad values too. Readable in the DB |
| SQLite driver | `better-sqlite3` | Most common, stable Drizzle + drizzle-kit pairing; synchronous; prebuilt binaries for Node 24 |
| Install scripts | `"allowScripts": { "better-sqlite3": false }` in `package.json` (npm 11) | v13 bundles prebuilt binaries, so its `node-gyp rebuild` script isn't needed; denying it runs no package code at install time and records the choice. A test opens an in-memory DB, so a release without a binary for the platform fails fast |
| Migrations | `drizzle-kit generate`; SQL files committed in `drizzle/`; applied with Drizzle's migrator | Schema history is reviewable in PRs; the same migrations run locally and in tests |
| DB file | `data/agentclinic.db`, path from `DATABASE_URL` (default above), git-ignored; `createDb` creates the parent directory | No binary data in git; easy to reset; works on a fresh clone (better-sqlite3 doesn't create directories) |
| Seeding | `npm run db:seed` script, idempotent (clears and re-inserts in one transaction), with fixed ids | Repeatable local setup; URLs like `/agents/1` stay stable across reseeds |
| Referential integrity | Foreign keys enforced (`PRAGMA foreign_keys = ON`); deleting an agent or ailment cascades to its `agent_ailments` rows; ailment names unique | No orphan diagnoses; no duplicate ailments |
| App wiring | `createApp(db)` factory; `src/app.tsx` only exports it and opens nothing on import; `src/index.ts` creates the file DB and passes it | Tests inject an in-memory DB without touching the file DB or opening a port |
| Static file paths | Resolved from the module, not the working directory (`require.resolve` for Pico, `import.meta.url` for `public/`) | Styles load no matter where the server is started from |
| Test database | Fresh `:memory:` DB per test file: run migrations, then seed | Fast, isolated, and it tests the real migrations |
| Route ids | Numeric autoincrement `:id`; non-numeric or unknown → 404 | Simple; slugs can come later if needed |
| Queries | Small data-access module (`src/db/queries.ts`); pages receive plain data. Agents and ailments sorted by name; a profile lists ailments most severe first | Pages stay easy to test and don't depend on Drizzle; the worst problem is what a reader looks for first |
| Home links | Agents and Ailments cards link; Therapies stays "coming soon" | No links to routes that don't exist yet |
| Scope guard | Phase 1's "no `<a>` links" becomes "every internal link resolves (not 404)" | The old guard is now wrong on purpose; the new one keeps its intent |
| CSS foundation | PicoCSS v2, default build (`pico.min.css`, not classless) | Semantic HTML gets polished styles, mobile-first and dark mode for free; the default build also gives `.container` and `.grid` |
| Pico delivery | npm `@picocss/pico`, served from `node_modules` at `/public/vendor/pico.min.css` | Version pinned in the lockfile; no third-party request; route-testable |
| Brand color | Phase 1 teal family via `--pico-primary*` overrides: light `#1f7f74` (darkened from `#2a9d8f`), dark `#4fc3b4` with dark text on teal buttons | Keeps the brand without a custom Pico build; the original teal fails AA contrast on white (3.3:1) |
| Content width | Cap `.container` at `1024px` (Phase 1's `64rem`) from 1280px up; hero headline capped at `48px` | Pico's container grows to 1450px and its root font to 125%, so `rem` caps would grow too; below 1280px Pico's own widths keep side margins (its `.container` has no side padding from 576px) |
| Custom CSS | `public/styles.css` keeps only overrides and components Pico lacks | Less CSS to maintain; Pico stays the single source of base styles |
| Cards | Pico `<article>` inside the existing `auto-fit` card grid; card components return the `<article>` and the page wraps it in `<li>` | Pico's `.grid` collapses to one column below 768px but doesn't reflow to 2 columns; the custom grid does. Card components stay reusable outside lists |
| Props types | Component props use a named, extracted type (`type FooProps`), per [`tech-stack.md`](../tech-stack.md) | Readable signatures; data arrays can reuse the type |
| Badges | `.badge` with `--badge-bg` / `--badge-text` tokens per theme, a text label (not color alone), at least 4.5:1 contrast | Readable and accessible in light and dark mode; severity labels reuse it |
| Responsive lists | Reuse the card grid for agent and ailment lists | One pattern, already responsive |

## Scripts (expected, added to Phase 1's)

- `db:generate`: `drizzle-kit generate`
- `db:migrate`: `tsx src/db/migrate.ts`, applies migrations to the file DB (the app also
  migrates on start via `createDb`; the script exists to migrate without starting the server)
- `db:seed`: seed the file DB
