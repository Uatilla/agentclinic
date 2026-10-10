import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { Layout } from './components/Layout.tsx'
import type { Db } from './db/client.ts'
import { getAgentWithAilments, listAgents, listAilmentsWithCounts } from './db/queries.ts'
import { AgentProfile } from './pages/AgentProfile.tsx'
import { Agents } from './pages/Agents.tsx'
import { Ailments } from './pages/Ailments.tsx'
import { Home } from './pages/Home.tsx'
import { NotFound } from './pages/NotFound.tsx'
import { ServerError } from './pages/ServerError.tsx'

// Resolved from this module, not the working directory, so styles load wherever the server starts
const picoCss = createRequire(import.meta.url).resolve('@picocss/pico/css/pico.min.css')
const projectRoot = fileURLToPath(new URL('..', import.meta.url))

/** Builds the app around a database, so tests can pass an in-memory one. Opens nothing itself. */
export const createApp = (db: Db) => {
  const app = new Hono()

  app.get('/public/vendor/pico.min.css', serveStatic({ path: picoCss }))
  app.use('/public/*', serveStatic({ root: projectRoot }))

  app.get('/', (c) =>
    c.html(
      <Layout currentPath={c.req.path}>
        <Home />
      </Layout>,
    ),
  )

  app.get('/agents', (c) =>
    c.html(
      <Layout title="Agents · AgentClinic" currentPath={c.req.path}>
        <Agents agents={listAgents(db)} />
      </Layout>,
    ),
  )

  // Numeric ids only: anything else (e.g. /agents/abc) falls through to the 404 page
  app.get('/agents/:id{[0-9]+}', (c) => {
    const agent = getAgentWithAilments(db, Number(c.req.param('id')))
    if (!agent) return c.notFound()
    return c.html(
      <Layout title={`${agent.name} · AgentClinic`} currentPath={c.req.path}>
        <AgentProfile agent={agent} />
      </Layout>,
    )
  })

  app.get('/ailments', (c) =>
    c.html(
      <Layout title="Ailments · AgentClinic" currentPath={c.req.path}>
        <Ailments ailments={listAilmentsWithCounts(db)} />
      </Layout>,
    ),
  )

  // Error pages mark no nav section: a 404 under /agents/… isn't "in" Agents
  app.notFound((c) =>
    c.html(
      <Layout title="Page not found · AgentClinic">
        <NotFound />
      </Layout>,
      404,
    ),
  )

  app.onError((error, c) => {
    console.error(error)
    return c.html(
      <Layout title="Something went wrong · AgentClinic">
        <ServerError />
      </Layout>,
      500,
    )
  })

  return app
}
