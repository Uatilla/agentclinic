import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { Layout } from './components/Layout.tsx'
import { Home } from './pages/Home.tsx'

export const app = new Hono()

app.use('/public/*', serveStatic({ root: './' }))

app.get('/', (c) =>
  c.html(
    <Layout>
      <Home />
    </Layout>,
  ),
)
