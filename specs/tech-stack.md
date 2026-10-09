# Tech Stack

## Language & runtime

- **TypeScript** (strict mode), server-side
- **Node.js** (current LTS)

## Web framework

- **Hono**: lightweight, built on Web Standards, with first-class TypeScript support. It runs on
  Node via `@hono/node-server`.

## Rendering

- **Server-rendered Hono JSX**, with a shared layout component.
- Minimal client-side JavaScript; add it only when a feature needs it.
- Semantic HTML and modern CSS, targeting current evergreen browsers.

## Data

- **SQLite** as the database.
- **Drizzle ORM** for a type-safe schema and queries, with **drizzle-kit** for migrations.
- Seed data for local development and tests.

## Quality

- **Vitest** for unit and integration tests (route tests use Hono's `app.request()`).
- **Validation is automated with Vitest**: every behavior check in a phase's `validation.md`
  (routes, content, accessibility, scope guards) is backed by a Vitest test; only judgment calls
  (look, tone, layout in a browser) stay manual. `npm run validate` (type-check + tests) is the
  single command that shows whether a phase meets its automated merge bar.
- **GitHub Actions CI** runs type-checking and tests on every push and pull request.

## Conventions

- Specs live in `specs/` and are the source of truth.
- One branch per roadmap phase, merged to `main` when its validation passes.
