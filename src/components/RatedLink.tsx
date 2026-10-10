import type { Child } from 'hono/jsx'

export type RatedLinkProps = {
  href: string
  name: string
  /** The rating shown right after the name, e.g. a `SeverityBadge`. */
  badge: Child
}

/** A link followed by its rating badge: the content of one row in a detail list. */
export const RatedLink = ({ href, name, badge }: RatedLinkProps) => (
  <>
    <a href={href}>{name}</a> {badge}
  </>
)
