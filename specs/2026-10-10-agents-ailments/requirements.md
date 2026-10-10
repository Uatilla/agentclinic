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
Drizzle ORM + drizzle-kit, seed data, Hono JSX, PicoCSS, Vitest).

> **Amended 2026-10-10:** PicoCSS adopted product-wide ([`tech-stack.md`](../tech-stack.md)).
> This phase migrates the existing layout and home page to Pico and builds the new pages on it.

## Scope

### In

- **PicoCSS migration:**
  - Install `@picocss/pico` and serve `pico.min.css` locally at `/public/vendor/pico.min.css`.
  - `Layout` links Pico first, then `public/styles.css`.
  - Layout and home page use Pico's semantic patterns (`.container`, `<nav>`, `<article>`
    cards); the current look stays the same or better (teal brand, light/dark).
  - `public/styles.css` shrinks to overrides: brand colors via `--pico-*` variables, the card
    grid, severity badges.
- **Data layer:** SQLite via Drizzle ORM (`better-sqlite3` driver), with drizzle-kit migrations
  committed to the repo.
- **Schema:**
  - `agents`: id, name, model (e.g. "GPT-something", "Claude-ish"), bio.
  - `ailments`: id, name, description.
  - `agent_ailments`: join table (`agent_id`, `ailment_id`, `severity`); composite primary key;
    `severity` is one of `mild`, `moderate`, `severe`.
- **Seed data:** a small, playful set (about 5 agents, 6 ailments) where each agent has at least
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
    and is not a link.
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
| Severity values | Text column limited to `mild` / `moderate` / `severe` (Drizzle `text({ enum })`) | Readable in the DB and type-safe in TypeScript |
| SQLite driver | `better-sqlite3` | Most common, stable Drizzle + drizzle-kit pairing; synchronous; prebuilt binaries for Node 24 |
| Migrations | `drizzle-kit generate`; SQL files committed in `drizzle/`; applied with Drizzle's migrator | Schema history is reviewable in PRs; the same migrations run locally and in tests |
| DB file | `data/agentclinic.db`, path from `DATABASE_URL` (default above), git-ignored | No binary data in git; easy to reset |
| Seeding | `npm run db:seed` script, idempotent (clears and re-inserts) | Repeatable local setup |
| App wiring | `createApp(db)` factory; `src/index.ts` passes the file DB | Tests inject an in-memory DB without touching the file DB or opening a port |
| Test database | Fresh `:memory:` DB per test file: run migrations, then seed | Fast, isolated, and it tests the real migrations |
| Route ids | Numeric autoincrement `:id`; non-numeric or unknown → 404 | Simple; slugs can come later if needed |
| Queries | Small data-access module (`src/db/queries.ts`); pages receive plain data | Pages stay easy to test and don't depend on Drizzle |
| Home links | Agents and Ailments cards link; Therapies stays "coming soon" | No links to routes that don't exist yet |
| Scope guard | Phase 1's "no `<a>` links" becomes "every internal link resolves (not 404)" | The old guard is now wrong on purpose; the new one keeps its intent |
| CSS foundation | PicoCSS v2, default build (`pico.min.css`, not classless) | Semantic HTML gets polished styles, mobile-first and dark mode for free; the default build also gives `.container` and `.grid` |
| Pico delivery | npm `@picocss/pico`, served from `node_modules` at `/public/vendor/pico.min.css` | Version pinned in the lockfile; no third-party request; route-testable |
| Brand color | Keep the Phase 1 teal by overriding `--pico-primary*` variables in `styles.css` | Keeps the brand without a custom Pico build |
| Custom CSS | `public/styles.css` keeps only overrides and components Pico lacks | Less CSS to maintain; Pico stays the single source of base styles |
| Cards | Pico `<article>` inside the existing `auto-fit` card grid | Pico's `.grid` collapses to one column below 768px but doesn't reflow to 2 columns; the custom grid does |
| Severity labels | Small badge styled in `styles.css` with a text label (not color alone) | Readable and accessible in light and dark mode |
| Responsive lists | Reuse the card grid for agent and ailment lists | One pattern, already responsive |

## Scripts (expected, added to Phase 1's)

- `db:generate`: `drizzle-kit generate`
- `db:migrate`: apply migrations to the file DB
- `db:seed`: seed the file DB
