export type TeaserCardProps = {
  title: string
  description: string
  /** Links the card to a live page; without it the card is marked "Coming soon". */
  href?: string
}

export const TeaserCard = ({ title, description, href }: TeaserCardProps) => (
  <article class={href ? 'card-linked' : undefined}>
    <h2>{href ? <a href={href}>{title}</a> : title}</h2>
    <p>{description}</p>
    {!href && <span class="badge">Coming soon</span>}
  </article>
)
