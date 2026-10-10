# Changelog

All notable changes to this project, newest first.

## 2026-10-10

- Added the database: SQLite through Drizzle ORM and better-sqlite3 (its install script denied,
  since v13 ships prebuilt binaries), with `agents`, `ailments` and an `agent_ailments` join
  table whose severity is enforced by a database `CHECK`, committed migrations, and an
  idempotent seed of 5 agents, 6 ailments and 11 diagnoses.
- Added the first data-driven pages: `/agents`, agent profiles at `/agents/:id` with graded
  severity badges and a "Clean bill of health." empty state, `/ailments` with how many agents
  have each, a playful 404 and a 500 page inside the layout.
- Added a header nav that marks the current section, a compact phone header, and home cards
  that link to Agents and Ailments while Therapies stays "Coming soon".
- Tightened accessibility after a second review: dark-mode muted text and keyboard focus
  outlines now meet WCAG AA, and error pages no longer mark a nav section as current.
- Grew the test suite to 93 Vitest tests: an in-memory database per test file, a shared page
  baseline on every page, link integrity (every internal link returns 200) replacing Phase 1's
  no-links guard, and scope guards for therapies and write routes.
- Added a getting-started section to the README covering the database scripts.
- Adopted PicoCSS v2 as the product-wide CSS foundation: installed from npm and served locally,
  with `styles.css` reduced to brand overrides, the card grid and badges; home teaser cards are
  now Pico `<article>`s. After review, the brand teal and badges meet WCAG AA contrast in
  light and dark mode, the footer is muted again, content width and headline size match
  Phase 1, styles load wherever the server starts, and tests check the exact stylesheet list
  with no external URLs.
- Added a convention that component props use a named, extracted TypeScript type, starting with
  a new `TeaserCard` component.
- Wrote the Phase 2 feature spec (Agents & ailments: SQLite + Drizzle, agent and ailment pages,
  404, header nav), then amended it after a three-angle review: database-enforced severity,
  WCAG AA contrast, fixed content width, cwd-independent static paths and sharper validation
  checks.

## 2026-10-09

- Added a `/changelog` skill that builds this file from git history, to run before each merge.
- Replanned the roadmap: merged agents, agent detail, ailments and their link into one Phase 2
  (Agents & ailments), with therapies now Phases 3 and 4.
- Made responsive design a product-wide requirement: mobile-first rules in the mission, tech
  stack and roadmap, and the home page now fits screens from 320px up without overflow.
- Automated phase validation with Vitest: every behavior check in `validation.md` has a test,
  and `npm run validate` runs type-check plus tests as the single merge gate.
- Completed Phase 1 (Hello Hono): Hono server on Node 24 with strict TypeScript and ESM, a
  shared layout split into Header, Main and Footer components, linked base styles, and a
  playful home page with a hero and Agents, Ailments and Therapies teaser cards.
- Set up Vitest route tests and GitHub Actions CI running type-check and tests on every push
  to `main` and every pull request.
- Wrote the Phase 1 feature spec (requirements, plan and validation), amended with Node 24,
  the `tsx` runtime, colocated tests and the CI trigger.
- Added the project constitution: mission, tech stack and roadmap.
- Started the project from a bare TypeScript scaffold.
