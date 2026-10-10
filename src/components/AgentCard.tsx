import type { AgentSummary } from '../db/queries.ts'

export type AgentCardProps = AgentSummary

export const AgentCard = ({ id, name, model }: AgentCardProps) => (
  <article class="card-linked">
    <h2>
      <a href={`/agents/${id}`}>{name}</a>
    </h2>
    <p>{model}</p>
  </article>
)
