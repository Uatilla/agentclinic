import { EffectivenessBadge } from '../components/EffectivenessBadge.tsx'
import { RatedLink } from '../components/RatedLink.tsx'
import { SeverityBadge } from '../components/SeverityBadge.tsx'
import type { AilmentWithTherapiesAndAgents } from '../db/queries.ts'

export type AilmentDetailProps = {
  ailment: AilmentWithTherapiesAndAgents
}

export const AilmentDetail = ({ ailment }: AilmentDetailProps) => (
  <>
    <p class="back-link">
      <a href="/ailments">← All ailments</a>
    </p>
    <article class="profile">
      <header>
        <h1>{ailment.name}</h1>
      </header>
      <p>{ailment.description}</p>
      <h2>Recommended therapies</h2>
      {ailment.therapies.length > 0 ? (
        <ul class="detail-list">
          {ailment.therapies.map(({ id, name, effectiveness }) => (
            <li class="rated-row">
              <RatedLink
                href={`/therapies/${id}`}
                name={name}
                badge={<EffectivenessBadge effectiveness={effectiveness} />}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p>No known cure — yet.</p>
      )}
      <h2>Affected agents</h2>
      {ailment.agents.length > 0 ? (
        <ul class="detail-list">
          {ailment.agents.map(({ id, name, severity }) => (
            <li class="rated-row">
              <RatedLink
                href={`/agents/${id}`}
                name={name}
                badge={<SeverityBadge severity={severity} />}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p>No agents affected — for now.</p>
      )}
    </article>
  </>
)
