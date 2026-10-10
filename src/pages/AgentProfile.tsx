import { EffectivenessBadge } from '../components/EffectivenessBadge.tsx'
import { RatedLink } from '../components/RatedLink.tsx'
import { SeverityBadge } from '../components/SeverityBadge.tsx'
import type { AgentAilment, AgentWithAilments } from '../db/queries.ts'

export type AgentProfileProps = {
  agent: AgentWithAilments
}

type DiagnosisProps = AgentAilment

/** One ailment on a profile: the ailment and its severity, then its therapies, best first. */
const Diagnosis = ({ id, name, severity, therapies }: DiagnosisProps) => {
  const labelId = `therapies-for-${id}`
  return (
    <li class="diagnosis">
      <div class="rated-row">
        <RatedLink
          href={`/ailments/${id}`}
          name={name}
          badge={<SeverityBadge severity={severity} />}
        />
      </div>
      <div class="recommendations">
        <p class="recommendations-label" id={labelId}>
          Recommended therapies
        </p>
        {therapies.length > 0 ? (
          <ul aria-labelledby={labelId}>
            {therapies.map((therapy) => (
              <li class="rated-row">
                <RatedLink
                  href={`/therapies/${therapy.id}`}
                  name={therapy.name}
                  badge={<EffectivenessBadge effectiveness={therapy.effectiveness} />}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p class="recommendations-empty">No known cure — yet.</p>
        )}
      </div>
    </li>
  )
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
        <ul class="detail-list">
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
