export type TeaserCardProps = {
  title: string
  description: string
  href: string
}

export const TeaserCard = ({ title, description, href }: TeaserCardProps) => (
  <article class="card-linked">
    <h2>
      <a href={href}>{title}</a>
    </h2>
    <p>{description}</p>
  </article>
)
