import { AilmentCard } from '../components/AilmentCard.tsx'
import type { AilmentWithCount } from '../db/queries.ts'

export type AilmentsProps = {
  ailments: AilmentWithCount[]
}

export const Ailments = ({ ailments }: AilmentsProps) => (
  <>
    <section class="page-intro">
      <h1>Ailments</h1>
      <p>What our patients come in with, and how many of them have it.</p>
    </section>
    <ul class="cards">
      {ailments.map((ailment) => (
        <li>
          <AilmentCard {...ailment} />
        </li>
      ))}
    </ul>
  </>
)
