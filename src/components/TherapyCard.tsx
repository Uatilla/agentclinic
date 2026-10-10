import type { Therapy } from '../db/queries.ts'

export type TherapyCardProps = Therapy

export const TherapyCard = ({ id, name, description, duration }: TherapyCardProps) => (
  <article class="card-linked">
    <h2>
      <a href={`/therapies/${id}`}>{name}</a>
    </h2>
    <p>{description}</p>
    <p class="card-meta">{duration}</p>
  </article>
)
