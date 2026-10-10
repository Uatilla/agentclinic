import type { TherapyWithCount } from '../db/queries.ts'

export type TherapyCardProps = TherapyWithCount

const treatsLabel = (ailmentCount: number) =>
  ailmentCount === 0
    ? 'Treats nothing in particular'
    : `Treats ${ailmentCount} ${ailmentCount === 1 ? 'ailment' : 'ailments'}`

export const TherapyCard = ({
  id,
  name,
  description,
  duration,
  ailmentCount,
}: TherapyCardProps) => (
  <article class="card-linked">
    <h2>
      <a href={`/therapies/${id}`}>{name}</a>
    </h2>
    <p>{description}</p>
    <p class="card-meta">
      {duration} · {treatsLabel(ailmentCount)}
    </p>
  </article>
)
