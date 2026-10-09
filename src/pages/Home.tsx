const teasers = [
  {
    title: 'Agents',
    description: 'Meet the patients: chatbots, copilots and assistants in need of a break.',
  },
  {
    title: 'Ailments',
    description: 'From hallucinations to prompt fatigue — every condition, diagnosed.',
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
      {teasers.map(({ title, description }) => (
        <li class="card">
          <h2>{title}</h2>
          <p>{description}</p>
          <span class="badge">Coming soon</span>
        </li>
      ))}
    </ul>
  </>
)
