# Changelog

All notable changes to this project, newest first.

## 2026-10-10

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
