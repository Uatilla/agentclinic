import { EffectivenessBadge } from '../components/EffectivenessBadge.tsx'
import { SeverityBadge } from '../components/SeverityBadge.tsx'
import type { AilmentDetail as AilmentDetailData } from '../db/queries.ts'

export type AilmentDetailProps = {
  ailment: AilmentDetailData
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
        <ul class="diagnoses">
          {ailment.therapies.map(({ id, name, effectiveness }) => (
            <li>
              <a href={`/therapies/${id}`}>{name}</a>{' '}
              <EffectivenessBadge effectiveness={effectiveness} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No known cure — yet.</p>
      )}
      <h2>Affected agents</h2>
      {ailment.agents.length > 0 ? (
        <ul class="diagnoses">
          {ailment.agents.map(({ id, name, severity }) => (
            <li>
              <a href={`/agents/${id}`}>{name}</a> <SeverityBadge severity={severity} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No agents affected.</p>
      )}
    </article>
  </>
)
