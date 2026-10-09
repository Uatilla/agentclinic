import type { Child } from 'hono/jsx'
import { raw } from 'hono/html'
import { Footer } from './Footer.tsx'
import { Header } from './Header.tsx'
import { Main } from './Main.tsx'

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
        <Header />
        <Main>{children}</Main>
        <Footer />
      </body>
    </html>
  </>
)
