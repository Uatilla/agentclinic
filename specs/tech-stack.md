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

## Styling

- **[PicoCSS](https://picocss.com/) v2** is the CSS foundation: CSS only (no JavaScript), it
  styles semantic HTML, it's mobile-first, and it supports light and dark mode.
- Installed from npm (`@picocss/pico`) and **served locally** at
  `/public/vendor/pico.min.css` via `serveStatic`. No CDN, so the version is pinned in the
  lockfile and the stylesheet is covered by route tests.
- **`public/styles.css`** loads after Pico and holds only overrides: brand colors set through
  Pico's `--pico-*` CSS variables, plus components Pico doesn't provide (e.g. the card grid,
  badges). Prefer Pico's semantic elements and classes (`.container`, `<article>`, `<nav>`)
  over custom CSS.

## Responsive design

Every page in the web UI is responsive:

- **Mobile-first CSS:** base styles target small screens, and `min-width` media queries in `rem`
  add layout for larger ones.
- **Fluid layout:** use CSS Grid/Flexbox, relative units, and `min()`/`clamp()` instead of fixed
  pixel widths. Media (images, video) never overflows its container.
- **Viewport meta tag** (`width=device-width, initial-scale=1`) in the shared layout.
- **Supported widths:** from 320px up, with no horizontal scroll and readable text without
  zooming. Reference widths for checks: 320px (small phone), 768px (tablet), 1280px (desktop).
- **Touch-friendly:** interactive elements are at least 44×44px.

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
- One branch per roadmap phase, or per milestone that groups consecutive phases under one
  spec (e.g. the MVP: Phases 3–4), merged to `main` through a pull request when its
  validation passes.
- Component props are declared as a named, extracted TypeScript type (`type FooProps = {...}`),
  never as an inline object type in the parameter list.
