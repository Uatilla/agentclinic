import { AgentCard } from '../components/AgentCard.tsx'
import type { AgentSummary } from '../db/queries.ts'

export type AgentsProps = {
  agents: AgentSummary[]
}

export const Agents = ({ agents }: AgentsProps) => (
  <>
    <section class="page-intro">
      <h1>Our patients</h1>
      <p>Every agent currently in our care. Pick one to read their chart.</p>
    </section>
    <ul class="cards">
      {agents.map((agent) => (
        <li>
          <AgentCard {...agent} />
        </li>
      ))}
    </ul>
  </>
)
