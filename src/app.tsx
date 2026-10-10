import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { Layout } from './components/Layout.tsx'
import { Home } from './pages/Home.tsx'

// Resolved from this module, not the working directory, so styles load wherever the server starts
const picoCss = createRequire(import.meta.url).resolve('@picocss/pico/css/pico.min.css')
const projectRoot = fileURLToPath(new URL('..', import.meta.url))

export const app = new Hono()

app.get('/public/vendor/pico.min.css', serveStatic({ path: picoCss }))
app.use('/public/*', serveStatic({ root: projectRoot }))

app.get('/', (c) =>
  c.html(
    <Layout>
      <Home />
    </Layout>,
  ),
)
