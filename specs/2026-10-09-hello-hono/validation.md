# Validation: Phase 1 — Hello Hono

The phase can merge to `main` when every box below is checked.

## Automated

- [ ] `npm ci` installs cleanly from the lockfile.
- [ ] `npm run typecheck` passes with zero errors (strict mode).
- [ ] `npm test` passes.
- [ ] The home route test asserts:
  - [ ] `GET /` returns status 200.
  - [ ] The `Content-Type` is `text/html`.
  - [ ] The response contains the AgentClinic heading.
  - [ ] The response contains the Agents, Ailments and Therapies teaser cards.
- [ ] The GitHub Actions CI workflow runs on the PR and is green.

## Manual

- [ ] `npm run dev` starts the server; `http://localhost:3000` loads.
- [ ] In a current evergreen browser, the page shows the header, hero, three teaser cards and footer.
- [ ] Styles load (no unstyled page; `/public/styles.css` returns 200).
- [ ] The tone reads as playful but polished.
- [ ] Layout holds up at mobile width (no horizontal scroll).

## Scope guard

- [ ] No database, Drizzle or seed code.
- [ ] No links to routes that don't exist yet.
- [ ] No client-side JavaScript.
