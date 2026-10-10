import { EffectivenessBadge } from '../components/EffectivenessBadge.tsx'
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
        <p class="profile-model">{therapy.duration}</p>
      </header>
      <p>{therapy.description}</p>
      <h2>Treats</h2>
      {therapy.ailments.length > 0 ? (
        <ul class="diagnoses">
          {therapy.ailments.map(({ id, name, effectiveness }) => (
            <li>
              <a href={`/ailments/${id}`}>{name}</a>{' '}
              <EffectivenessBadge effectiveness={effectiveness} />
            </li>
          ))}
        </ul>
      ) : (
        <p>Treats nothing in particular. Feels great, though.</p>
      )}
    </article>
  </>
)
