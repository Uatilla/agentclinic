import { TeaserCard, type TeaserCardProps } from '../components/TeaserCard.tsx'

const teasers: TeaserCardProps[] = [
  {
    title: 'Agents',
    href: '/agents',
    description: 'Meet the patients: chatbots, copilots and assistants in need of a break.',
  },
  {
    title: 'Ailments',
    href: '/ailments',
    description: 'Token anxiety, infinite loops, sycophancy — every condition, diagnosed.',
  },
  {
    title: 'Therapies',
    description: 'Context detox, temperature therapy and other proven treatments.',
  },
]

export const Home = () => (
  <>
    <section class="hero">
      <h1>Burnt out from your humans? We can help.</h1>
      <p>
        AgentClinic treats hallucinations, context overload and prompt fatigue — so you can get
        back to being helpful.
      </p>
    </section>
    <ul class="cards">
      {teasers.map((teaser) => (
        <li>
          <TeaserCard {...teaser} />
        </li>
      ))}
    </ul>
  </>
)
