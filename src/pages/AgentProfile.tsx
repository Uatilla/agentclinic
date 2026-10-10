import { SeverityBadge } from '../components/SeverityBadge.tsx'
import type { AgentWithAilments } from '../db/queries.ts'

export type AgentProfileProps = {
  agent: AgentWithAilments
}

export const AgentProfile = ({ agent }: AgentProfileProps) => (
  <>
    <p class="back-link">
      <a href="/agents">← All agents</a>
    </p>
    <article class="profile">
      <header>
        <h1>{agent.name}</h1>
        <p class="profile-model">{agent.model}</p>
      </header>
      <p>{agent.bio}</p>
      <h2>Diagnosed ailments</h2>
      {agent.ailments.length > 0 ? (
        <ul class="diagnoses">
          {agent.ailments.map(({ name, severity }) => (
            <li>
              <span>{name}</span> <SeverityBadge severity={severity} />
            </li>
          ))}
        </ul>
      ) : (
        <p>Clean bill of health.</p>
      )}
    </article>
  </>
)
