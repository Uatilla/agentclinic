# Validation: Phase 2 — Agents & ailments

The phase can merge to `main` when every box below is checked.

## Automated

- [ ] `npm ci` installs cleanly from the lockfile (including `better-sqlite3` on Node 24).
- [ ] `npm run validate` passes: type-check with zero errors (strict mode), then all tests.
- [ ] Tests run against a fresh, migrated and seeded `:memory:` DB; they never touch
      `data/agentclinic.db`.
- [ ] Styling tests assert:
  - [ ] `GET /public/vendor/pico.min.css` returns 200 with `text/css` (served locally, no CDN
        URL in any page).
  - [ ] `GET /public/styles.css` returns 200 with `text/css`.
  - [ ] `@picocss/pico` is a dependency in `package.json`.
- [ ] Data layer tests assert:
  - [ ] Migrations create `agents`, `ailments` and `agent_ailments`.
  - [ ] Seed is idempotent: seeding twice gives the same row counts.
  - [ ] Every seeded agent has at least one ailment; at least one ailment is shared by 2+ agents.
  - [ ] `severity` only accepts `mild`, `moderate`, `severe`.
- [ ] Route tests assert:
  - [ ] `GET /agents` returns 200 HTML listing every seeded agent, each linking to
        `/agents/:id`.
  - [ ] `GET /agents/:id` for a seeded agent returns 200 with their name, model, bio, and each
        of their ailments with its severity.
  - [ ] `GET /agents/9999` and `GET /agents/abc` return 404 with the not-found page inside the
        layout.
  - [ ] An unknown path (e.g. `GET /nope`) returns 404 with the same not-found page.
  - [ ] `GET /ailments` returns 200 HTML listing every seeded ailment with its affected-agent
        count.
  - [ ] `GET /` still passes all Phase 1 checks except the no-`<a>` guard, which is replaced
        below.
  - [ ] Home: Agents and Ailments cards link to `/agents` and `/ailments`; Therapies is still
        "coming soon" and not a link.
  - [ ] Header nav links to `/`, `/agents` and `/ailments` on every page.
- [ ] Baseline on every page (`/`, `/agents`, `/agents/:id`, `/ailments`, 404):
  - [ ] `<html lang="en">`, exactly one `<h1>`, and `<header>`, `<main>`, `<footer>` landmarks.
  - [ ] Viewport meta tag (`width=device-width, initial-scale=1`).
  - [ ] Links `/public/vendor/pico.min.css` before `/public/styles.css`.
  - [ ] No `<script>` tag (no client-side JavaScript).
- [ ] Link integrity (replaces Phase 1's no-`<a>` guard): every internal `href` on every page
      above returns a non-404 status.
- [ ] Scope guard: no `/therapies` route (returns 404) and no write routes (`POST /agents`
      returns 404).
- [ ] The GitHub Actions CI workflow runs on the PR (Node 24) and is green.

## Manual

- [ ] `npm run db:migrate && npm run db:seed && npm run dev` starts the app with seeded data.
- [ ] `drizzle/` migrations are committed; `data/` is git-ignored.
- [ ] In a current evergreen browser, the agents list, agent profile, ailments list and 404
      page look consistent with the home page, with Pico and the overrides applied.
- [ ] Pico migration: the home page looks the same or better than Phase 1; the teal brand color
      shows in light and dark mode (OS setting); severity badges are readable in both.
- [ ] `public/styles.css` contains only overrides and Pico-missing components (review only).
- [ ] Seed data and 404 copy match the tone (playful but polished).
- [ ] Responsive (browser dev tools), on every new page, at each reference width from
      `tech-stack.md`:
  - [ ] 320px: no horizontal scroll; cards stack in one column; header nav wraps without
        overflow; text readable without zooming.
  - [ ] 768px: layout uses the extra width; nothing overflows.
  - [ ] 1280px: content is centered within the max width; cards sit side by side.
  - [ ] Nav links and cards are at least 44×44px touch targets.

## Scope guard

- [ ] No therapies schema or seed data (review only: Phase 3 adds them).
