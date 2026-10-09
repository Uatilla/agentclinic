# Validation: Phase 1 — Hello Hono

The phase can merge to `main` when every box below is checked.

## Automated

- [ ] `npm ci` installs cleanly from the lockfile.
- [ ] `npm run typecheck` passes with zero errors (strict mode).
- [ ] `npm test` passes.
- [ ] The home route test asserts:
  - [ ] `GET /` returns status 200.
  - [ ] The `Content-Type` starts with `text/html`.
  - [ ] The response contains the AgentClinic heading.
  - [ ] The response contains the Agents, Ailments and Therapies teaser cards.
  - [ ] Accessibility baseline: `<html lang="en">`, exactly one `<h1>`, and `<header>`,
        `<main>`, `<footer>` landmarks.
  - [ ] No client-side JavaScript: the HTML contains no `<script>` tag.
- [ ] The GitHub Actions CI workflow runs on the PR (Node 24) and is green.

## Manual

- [ ] `node --version` is 24.x; `npm run dev` starts the server; `http://localhost:3000` loads.
- [ ] In a current evergreen browser, the page shows the header, hero, three teaser cards and footer.
- [ ] Styles load (no unstyled page; `/public/styles.css` returns 200).
- [ ] The copy matches the tone reference in `requirements.md` (playful but polished).
- [ ] No horizontal scroll at 375px viewport width (browser dev tools).

## Scope guard

- [ ] No database, Drizzle or seed code.
- [ ] No links to routes that don't exist yet.
- [ ] No client-side JavaScript (also asserted by the route test).
- [ ] No `dist/` or build step; tests live in `src/` next to the code.
