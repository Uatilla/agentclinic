# Requirements: Phase 1 — Hello Hono

## Context

First phase of [`roadmap.md`](../roadmap.md). The repo is a bare TypeScript scaffold
(`src/index.ts` logs a message; CommonJS/ES2016 tsconfig). This phase lays the foundation every
later phase builds on: a running server, a shared layout, a test harness and CI.

Guided by [`mission.md`](../mission.md) (playful but polished; tested and CI-green before merge)
and [`tech-stack.md`](../tech-stack.md) (TypeScript strict, Node LTS, Hono, Hono JSX, Vitest,
GitHub Actions).

## Scope

### In

- Hono app running on Node via `@hono/node-server`, written in strict TypeScript.
- App definition separated from server startup, so tests can call `app.request()` without
  opening a port.
- Shared layout component (Hono JSX): header with the AgentClinic name, `<main>` content slot,
  footer.
- Base styles in a plain CSS file served as a static asset.
- Home page at `/`:
  - Hero: playful headline and tagline that tells the premise (agents come in with ailments,
    leave with therapies). Tone reference (not final copy):
    - Headline: *"Burnt out from your humans? We can help."*
    - Tagline: *"AgentClinic treats hallucinations, context overload and prompt fatigue —
      so you can get back to being helpful."*
  - Three teaser cards — **Agents**, **Ailments**, **Therapies** — each with a one-line
    description and a "coming soon" label.
- Vitest test(s) for the home route, colocated with the code (`src/**/*.test.ts(x)`).
- GitHub Actions workflow running type-check and tests on push and pull request.

### Out

- Database, Drizzle, seed data (Phase 2).
- `/agents`, `/ailments`, `/therapies` routes (later phases).
- Client-side JavaScript.
- Deployment.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Module system | ESM (`"type": "module"`, tsconfig `module`/`moduleResolution: NodeNext`) | Hono and current Node tooling are ESM-first |
| JSX | tsconfig `jsx: react-jsx`, `jsxImportSource: hono/jsx` | Server-rendered Hono JSX per tech stack |
| Package manager | npm | Default with Node, no extra setup |
| Runtime | `tsx` for `dev` (watch) and `start`; `tsc` only type-checks (`noEmit`) | No build step or `dist/`; avoids `.js` import extensions NodeNext would need when emitting |
| Styles | Single `public/styles.css` served via `serveStatic` | Simple, modern CSS, no build tooling |
| Teaser cards | Not links; marked "coming soon" | No dead links to routes that don't exist yet |
| Node version | **Node 24** (Active LTS), pinned in `.nvmrc`, `engines` in `package.json`, read by CI | One explicit, supported version locally and in CI |
| Tests location | Colocated: `src/**/*.test.ts(x)` next to the code under test | Easy to find; moves with the code |
| CI trigger | `push` to `main` + `pull_request` | Avoids running twice on PR branches |
| Task order | Tooling + CI first, then features | CI guards every later task group |

## Scripts (expected)

- `dev` — `tsx watch src/index.ts`
- `start` — `tsx src/index.ts`
- `typecheck` — `tsc --noEmit`
- `test` — `vitest run`
