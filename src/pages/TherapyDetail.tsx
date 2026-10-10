import { EffectivenessBadge } from '../components/EffectivenessBadge.tsx'
import { RatedLink } from '../components/RatedLink.tsx'
import type { TherapyWithAilments } from '../db/queries.ts'

export type TherapyDetailProps = {
  therapy: TherapyWithAilments
}

export const TherapyDetail = ({ therapy }: TherapyDetailProps) => (
  <>
    <p class="back-link">
      <a href="/therapies">← All therapies</a>
    </p>
    <article class="profile">
      <header>
        <h1>{therapy.name}</h1>
        <p class="profile-model">Duration: {therapy.duration}</p>
      </header>
      <p>{therapy.description}</p>
      <h2>Ailments it treats</h2>
      {therapy.ailments.length > 0 ? (
        <ul class="detail-list">
          {therapy.ailments.map(({ id, name, effectiveness }) => (
            <li class="rated-row">
              <RatedLink
                href={`/ailments/${id}`}
                name={name}
                badge={<EffectivenessBadge effectiveness={effectiveness} />}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p>Treats nothing in particular. Feels great, though.</p>
      )}
    </article>
  </>
)
