import type { Child } from 'hono/jsx'
import { raw } from 'hono/html'

type LayoutProps = {
  title?: string
  children?: Child
}

export const Layout = ({ title = 'AgentClinic', children }: LayoutProps) => (
  <>
    {raw('<!DOCTYPE html>')}
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <link rel="stylesheet" href="/public/styles.css" />
      </head>
      <body>
        <header class="site-header">
          <div class="container">
            <span class="brand">
              <span class="brand-mark" aria-hidden="true">✚</span> AgentClinic
            </span>
          </div>
        </header>
        <main class="container">{children}</main>
        <footer class="site-footer">
          <div class="container">
            <p>AgentClinic — caring for overworked agents since today.</p>
          </div>
        </footer>
      </body>
    </html>
  </>
)
