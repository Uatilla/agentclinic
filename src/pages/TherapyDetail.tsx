import type { Therapy } from '../db/queries.ts'

export type TherapyDetailProps = {
  therapy: Therapy
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
    </article>
  </>
)
