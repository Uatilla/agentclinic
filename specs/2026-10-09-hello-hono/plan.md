# Plan: Phase 1 — Hello Hono

Work through the groups in order. Finish each group by checking that it works, then commit.
Every group must leave the repo working.

## 1. Project configuration

1. Install and use Node 24 locally (`nvm install 24`); add `.nvmrc` (`24`) and
   `"engines": { "node": ">=24" }`.
2. In `package.json`: add `"type": "module"`; remove `main` and the `build` script.
3. Update `tsconfig.json`: modern `target`, `module`/`moduleResolution: NodeNext`,
   `jsx: react-jsx`, `jsxImportSource: hono/jsx`, `noEmit: true`, keep `strict`.
4. Install deps: `hono`, `@hono/node-server`; dev deps: `tsx`, `vitest`, `@types/node` (v24).
5. Add scripts: `dev` (`tsx watch`), `start` (`tsx`), `typecheck`, `test`, and `validate`
   (`typecheck` + `test`).

**Check:** `npm run typecheck` passes.

## 2. Test harness + CI

1. Add Vitest config (if needed, include `src/**/*.test.{ts,tsx}`) and a trivial passing
   test in `src/`.
2. Add `.github/workflows/ci.yml`: checkout, setup Node from `.nvmrc` with npm cache,
   `npm ci`, `npm run typecheck`, `npm test`. Trigger on `push` to `main` and `pull_request`.

**Check:** `npm test` passes locally; CI runs green after pushing the branch.

## 3. Hono server

1. Create `src/app.tsx` exporting the Hono `app`.
2. Replace `src/index.ts` with server startup via `@hono/node-server` (port from `PORT`,
   default 3000).
3. Replace the trivial test with `src/app.test.tsx`, a route test using `app.request('/')`.

**Check:** `npm run dev` serves `/`; tests pass.

## 4. Shared layout + base styles

1. Create the layout as a main component composed of three subcomponents in `src/components/`:
   - `Header.tsx`: `<header>` with the AgentClinic brand.
   - `Main.tsx`: `<main>` wrapping the page content (`children`).
   - `Footer.tsx`: `<footer>` with the footer note.
   - `Layout.tsx`: `<!DOCTYPE html>`, `<html lang="en">`, `<head>` with title, viewport meta
     and stylesheet link; `<body>` renders `<Header />`, `<Main>{children}</Main>`, `<Footer />`.
2. Create `public/styles.css` with mobile-first base styles (typography, colors, layout,
   cards): fluid widths, `clamp()` for type, a card grid that reflows without overflow, and
   `min-width` media queries only where larger screens need more room.
3. Serve `/public/*` via `serveStatic` from `@hono/node-server/serve-static`, and link the
   stylesheet from `Layout`'s `<head>` (`<link rel="stylesheet" href="/public/styles.css">`).
   CSS is linked, not imported into TSX: without a bundler, Node can't import `.css` modules.

**Check:** the page renders inside the layout with header, main and footer; `/public/styles.css`
returns 200; the HTML links the stylesheet; the page has no horizontal scroll at 320px.

## 5. Home page

1. Create `src/pages/Home.tsx`: hero (headline + tagline) and three teaser cards (Agents,
   Ailments, Therapies) marked "coming soon".
2. Wire `/` to render `Home` inside `Layout`.
3. Expand `src/app.test.tsx` to cover every automated check in `validation.md`
   (status, content type, content, accessibility baseline, viewport meta, stylesheet, scope
   guards).

**Check:** `npm run validate` passes, then the manual checks in [`validation.md`](./validation.md).
