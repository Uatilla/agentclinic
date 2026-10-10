import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { Layout } from './components/Layout.tsx'
import type { Db } from './db/client.ts'
import { listAgents, listAilmentsWithCounts } from './db/queries.ts'
import { Agents } from './pages/Agents.tsx'
import { Ailments } from './pages/Ailments.tsx'
import { Home } from './pages/Home.tsx'

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
      <Layout>
        <Home />
      </Layout>,
    ),
  )

  app.get('/agents', (c) =>
    c.html(
      <Layout title="Agents · AgentClinic">
        <Agents agents={listAgents(db)} />
      </Layout>,
    ),
  )

  app.get('/ailments', (c) =>
    c.html(
      <Layout title="Ailments · AgentClinic">
        <Ailments ailments={listAilmentsWithCounts(db)} />
      </Layout>,
    ),
  )

  return app
}
