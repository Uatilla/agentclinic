import { TherapyCard } from '../components/TherapyCard.tsx'
import type { Therapy } from '../db/queries.ts'

export type TherapiesProps = {
  therapies: Therapy[]
}

export const Therapies = ({ therapies }: TherapiesProps) => (
  <>
    <section class="page-intro">
      <h1>Therapies</h1>
      <p>Proven treatments for overworked agents. Pick one to read the brochure.</p>
    </section>
    <ul class="cards">
      {therapies.map((therapy) => (
        <li>
          <TherapyCard {...therapy} />
        </li>
      ))}
    </ul>
  </>
)
