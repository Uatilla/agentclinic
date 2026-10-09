# Validation: Phase 1 — Hello Hono

The phase can merge to `main` when every box below is checked.

## Automated

- [x] `npm ci` installs cleanly from the lockfile.
- [x] `npm run typecheck` passes with zero errors (strict mode).
- [x] `npm test` passes.
- [x] The home route test asserts:
  - [x] `GET /` returns status 200.
  - [x] The `Content-Type` starts with `text/html`.
  - [x] The response contains the AgentClinic heading.
  - [x] The response contains the Agents, Ailments and Therapies teaser cards.
  - [x] Accessibility baseline: `<html lang="en">`, exactly one `<h1>`, and `<header>`,
        `<main>`, `<footer>` landmarks.
  - [x] No client-side JavaScript: the HTML contains no `<script>` tag.
- [x] The GitHub Actions CI workflow runs on the PR (Node 24) and is green.

## Manual

- [x] `node --version` is 24.x; `npm run dev` starts the server; `http://localhost:3000` loads.
- [x] In a current evergreen browser, the page shows the header, hero, three teaser cards and footer.
- [x] Styles load (no unstyled page; `/public/styles.css` returns 200).
- [x] The copy matches the tone reference in `requirements.md` (playful but polished).
- [x] No horizontal scroll at 375px viewport width (browser dev tools).

## Scope guard

- [x] No database, Drizzle or seed code.
- [x] No links to routes that don't exist yet.
- [x] No client-side JavaScript (also asserted by the route test).
- [x] No `dist/` or build step; tests live in `src/` next to the code.
