# Plan: Phase 1 — Hello Hono

Work through the groups in order. Finish each group by checking that it works, then commit.
Every group must leave the repo working.

## 1. Project configuration

1. Add `"type": "module"` to `package.json`.
2. Update `tsconfig.json`: modern `target`, `module`/`moduleResolution: NodeNext`,
   `jsx: react-jsx`, `jsxImportSource: hono/jsx`, keep `strict`.
3. Install deps: `hono`, `@hono/node-server`; dev deps: `tsx`, `vitest`, `@types/node`.
4. Add `.nvmrc` with the current Node LTS.
5. Add scripts: `dev`, `start`, `typecheck`, `test`.
6. Ignore `dist/` in `.gitignore`.

**Check:** `npm run typecheck` passes.

## 2. Test harness + CI

1. Add Vitest config (if needed) and a trivial passing test.
2. Add `.github/workflows/ci.yml`: checkout, setup Node from `.nvmrc` with npm cache,
   `npm ci`, `npm run typecheck`, `npm test`. Trigger on push and pull_request.

**Check:** `npm test` passes locally; CI runs green after pushing the branch.

## 3. Hono server

1. Create `src/app.tsx` exporting the Hono `app`.
2. Replace `src/index.ts` with server startup via `@hono/node-server` (port from `PORT`,
   default 3000).
3. Replace the trivial test with a route test using `app.request('/')`.

**Check:** `npm run dev` serves `/`; tests pass.

## 4. Shared layout + base styles

1. Create `src/components/Layout.tsx`: `<html lang="en">`, `<head>` with title, viewport meta
   and stylesheet link; `<header>`, `<main>`, `<footer>`.
2. Create `public/styles.css` with base styles (typography, colors, layout, cards).
3. Serve `/public/*` via `serveStatic` from `@hono/node-server/serve-static`.

**Check:** the page renders inside the layout; `/public/styles.css` returns 200.

## 5. Home page

1. Create `src/pages/Home.tsx`: hero (headline + tagline) and three teaser cards (Agents,
   Ailments, Therapies) marked "coming soon".
2. Wire `/` to render `Home` inside `Layout`.
3. Expand the home route test: 200 status, HTML content type, AgentClinic heading, all three
   teaser cards present.

**Check:** everything in [`validation.md`](./validation.md) passes.
