import type { AilmentWithCount } from '../db/queries.ts'

export type AilmentCardProps = AilmentWithCount

const affectedLabel = (agentCount: number) =>
  agentCount === 0
    ? 'No agents affected'
    : `${agentCount} ${agentCount === 1 ? 'agent' : 'agents'} affected`

export const AilmentCard = ({ id, name, description, agentCount }: AilmentCardProps) => (
  <article class="card-linked">
    <h2>
      <a href={`/ailments/${id}`}>{name}</a>
    </h2>
    <p>{description}</p>
    <p class="card-meta">{affectedLabel(agentCount)}</p>
  </article>
)
