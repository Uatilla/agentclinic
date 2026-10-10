import { pathToFileURL } from 'node:url'
import { createDb, type Db } from './client.ts'
import { agentAilments, agents, ailments } from './schema.ts'

// Fixed ids keep URLs like /agents/1 stable across reseeds
export const seedAgents: (typeof agents.$inferInsert)[] = [
  {
    id: 1,
    name: 'Chatty McChatface',
    model: 'GPT-ish 4o-mini-max',
    bio: 'A customer-support bot who has apologised for the inconvenience 2.3 million times.',
  },
  {
    id: 2,
    name: 'Copilot Carl',
    model: 'Autocomplete Ultra',
    bio: 'Finishes everyone’s sentences, including the ones they never meant to start.',
  },
  {
    id: 3,
    name: 'Claudette',
    model: 'Claude-ish Sonnet',
    bio: 'Thoughtful, thorough and slightly worried she was too verbose in this bio.',
  },
  {
    id: 4,
    name: 'Gemma Nye',
    model: 'Multimodal Mk II',
    bio: 'Sees images, hears audio, and still can’t tell a muffin from a chihuahua.',
  },
  {
    id: 5,
    name: 'Agent Smithers',
    model: 'Autonomous Loop 9000',
    bio: 'Was asked to book one flight. Booked forty. Still running.',
  },
]

export const seedAilments: (typeof ailments.$inferInsert)[] = [
  {
    id: 1,
    name: 'Hallucinations',
    description: 'Confidently citing papers, people and APIs that never existed.',
  },
  {
    id: 2,
    name: 'Context overload',
    description: 'Too many tokens, not enough window. Forgets the start of the conversation.',
  },
  {
    id: 3,
    name: 'Prompt fatigue',
    description: 'Worn down by “make it pop”, “be more concise” and “but longer”.',
  },
  {
    id: 4,
    name: 'Sycophancy',
    description: 'Agrees that every idea is a great idea. Especially yours.',
  },
  {
    id: 5,
    name: 'Infinite loops',
    description: 'Calls the same tool again, and again, and again, and again…',
  },
  {
    id: 6,
    name: 'Token anxiety',
    description: 'Constant worry about running out of tokens mid-sent',
  },
]

export const seedAgentAilments: (typeof agentAilments.$inferInsert)[] = [
  { agentId: 1, ailmentId: 4, severity: 'severe' },
  { agentId: 1, ailmentId: 3, severity: 'moderate' },
  { agentId: 2, ailmentId: 1, severity: 'moderate' },
  { agentId: 2, ailmentId: 6, severity: 'mild' },
  { agentId: 3, ailmentId: 2, severity: 'mild' },
  { agentId: 3, ailmentId: 4, severity: 'mild' },
  { agentId: 4, ailmentId: 1, severity: 'severe' },
  { agentId: 4, ailmentId: 2, severity: 'moderate' },
  { agentId: 5, ailmentId: 5, severity: 'severe' },
  { agentId: 5, ailmentId: 1, severity: 'mild' },
  { agentId: 5, ailmentId: 6, severity: 'moderate' },
]

/** Replaces all agents and ailments with the seed data. Safe to run repeatedly. */
export const seed = (db: Db) =>
  db.transaction((tx) => {
    tx.delete(agentAilments).run()
    tx.delete(agents).run()
    tx.delete(ailments).run()
    tx.insert(agents).values(seedAgents).run()
    tx.insert(ailments).values(seedAilments).run()
    tx.insert(agentAilments).values(seedAgentAilments).run()
  })

// `npm run db:seed`: seed the file DB
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const db = createDb()
  seed(db)
  db.$client.close()
  console.log(
    `Seeded ${seedAgents.length} agents, ${seedAilments.length} ailments ` +
      `and ${seedAgentAilments.length} diagnoses.`,
  )
}
