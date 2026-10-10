export type HeaderProps = {
  currentPath?: string
}

const links = [
  { href: '/', label: 'Home' },
  { href: '/agents', label: 'Agents' },
  { href: '/ailments', label: 'Ailments' },
]

// A section is current on its own page and on pages below it (e.g. /agents/1 → Agents)
const isCurrent = (href: string, currentPath = '') =>
  href === '/' ? currentPath === '/' : currentPath === href || currentPath.startsWith(`${href}/`)

export const Header = ({ currentPath }: HeaderProps) => (
  <header class="site-header">
    <nav class="container" aria-label="Main">
      <ul>
        <li>
          <a href="/" class="brand">
            <span class="brand-mark" aria-hidden="true">✚</span> AgentClinic
          </a>
        </li>
      </ul>
      <ul>
        {links.map(({ href, label }) => (
          <li>
            <a href={href} aria-current={isCurrent(href, currentPath) ? 'page' : undefined}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </header>
)
