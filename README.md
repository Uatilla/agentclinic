# AgentClinic

## Input from stakeholders

- Mary in engineering wants a reliable site with a popular stack based on TypeScript, giving agents and staff a dashboard for easy access.
- Susan in product has a set of features about agents and their ailments, therapies, and booking appointments.
- Steve in marketing wants an attractive site that works well with a modern browser.

## Getting started

Requires Node 24 (`nvm use` reads `.nvmrc`).

```bash
npm ci              # install from the lockfile
npm run db:migrate  # create data/agentclinic.db and apply migrations
npm run db:seed     # load the sample agents, ailments and therapies (safe to re-run)
npm run dev         # http://localhost:3000
```

The database path defaults to `data/agentclinic.db` (git-ignored); set `DATABASE_URL` to use
another file. The app also applies pending migrations on start.

| Script | What it does |
|---|---|
| `npm run dev` / `npm start` | Run the server (with / without file watching) |
| `npm run validate` | Type-check and run all tests: the merge gate for each phase |
| `npm run db:generate` | Generate a migration in `drizzle/` after changing `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations to the database |
| `npm run db:seed` | Replace all data with the seed data |

## Pages

| Path | Shows |
|---|---|
| `/` | Home, with cards linking to each section |
| `/agents`, `/agents/:id` | Agents; a profile lists their ailments (most severe first), each with recommended therapies |
| `/ailments`, `/ailments/:id` | Ailments; an ailment lists its therapies (most effective first) and the agents who have it |
| `/therapies`, `/therapies/:id` | Therapies; a therapy lists the ailments it treats |

Specs live in [`specs/`](./specs/): start with the [mission](./specs/mission.md) and the
[roadmap](./specs/roadmap.md).
