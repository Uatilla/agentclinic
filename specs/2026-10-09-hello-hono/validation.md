# Validation: Phase 1 — Hello Hono

The phase can merge to `main` when every box below is checked.

## Automated

- [x] `npm ci` installs cleanly from the lockfile.
- [x] `npm run validate` passes: type-check with zero errors (strict mode), then all tests.
- [x] Vitest tests in `src/app.test.tsx` assert:
  - [x] `GET /` returns status 200.
  - [x] The `Content-Type` starts with `text/html`.
  - [x] The response contains the AgentClinic header and the hero heading.
  - [x] The response contains the Agents, Ailments and Therapies teaser cards.
  - [x] Accessibility baseline: `<html lang="en">`, exactly one `<h1>`, and `<header>`,
        `<main>`, `<footer>` landmarks.
  - [x] The page links `/public/styles.css`, which returns 200 with `text/css`.
  - [x] Scope guard: no `<script>` tag (no client-side JavaScript) and no `<a>` links
        (no links to routes that don't exist yet).
- [x] Vitest tests in `src/project.test.ts` assert:
  - [x] No build step or `dist/` (no `build` script or `main`, tsconfig `noEmit`, no `dist/` dir).
  - [x] Tests live in `src/` next to the code.
  - [x] Node 24 is pinned in `.nvmrc` and `engines`.
  - [x] The `validate` script exists.
- [x] The GitHub Actions CI workflow runs on the PR (Node 24) and is green.

## Manual

- [x] `node --version` is 24.x; `npm run dev` starts the server; `http://localhost:3000` loads.
- [x] In a current evergreen browser, the page shows the header, hero, three teaser cards and
      footer, with styles applied.
- [x] The copy matches the tone reference in `requirements.md` (playful but polished).
- [x] No horizontal scroll at 375px viewport width (browser dev tools).

## Scope guard

- [x] No database, Drizzle or seed code (review only: Phase 2 adds them, so a test would be
      temporary).
