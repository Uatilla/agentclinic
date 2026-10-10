import { EffectivenessBadge } from '../components/EffectivenessBadge.tsx'
import { SeverityBadge } from '../components/SeverityBadge.tsx'
import type { AgentAilment, AgentWithAilments } from '../db/queries.ts'

export type AgentProfileProps = {
  agent: AgentWithAilments
}

export type DiagnosisProps = AgentAilment

/** One ailment on a profile: the ailment and its severity, then its therapies, best first. */
const Diagnosis = ({ id, name, severity, therapies }: DiagnosisProps) => (
  <li class="diagnosis">
    <div class="diagnosis-head">
      <a href={`/ailments/${id}`}>{name}</a> <SeverityBadge severity={severity} />
    </div>
    {therapies.length > 0 ? (
      <ul class="recommendations" aria-label={`Therapies for ${name}`}>
        {therapies.map((therapy) => (
          <li>
            <a href={`/therapies/${therapy.id}`}>{therapy.name}</a>{' '}
            <EffectivenessBadge effectiveness={therapy.effectiveness} />
          </li>
        ))}
      </ul>
    ) : (
      <p class="recommendations-empty">No known cure — yet.</p>
    )}
  </li>
)

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
          {agent.ailments.map((ailment) => (
            <Diagnosis {...ailment} />
          ))}
        </ul>
      ) : (
        <p>Clean bill of health.</p>
      )}
    </article>
  </>
)
