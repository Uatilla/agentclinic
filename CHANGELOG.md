# Changelog

All notable changes to this project, newest first.

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
