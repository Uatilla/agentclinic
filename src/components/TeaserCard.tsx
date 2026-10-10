export type TeaserCardProps = {
  title: string
  description: string
}

export const TeaserCard = ({ title, description }: TeaserCardProps) => (
  <li>
    <article>
      <h2>{title}</h2>
      <p>{description}</p>
      <span class="badge">Coming soon</span>
    </article>
  </li>
)
