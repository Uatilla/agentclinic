// `npm run db:seed`: replace all data in the file DB with the seed data
import { createDb } from './client.ts'
import {
  seed,
  seedAgentAilments,
  seedAgents,
  seedAilments,
  seedTherapies,
  seedTherapyAilments,
} from './seed.ts'

const db = createDb()
seed(db)
db.$client.close()
console.log(
  `Seeded ${seedAgents.length} agents, ${seedAilments.length} ailments, ` +
    `${seedAgentAilments.length} diagnoses, ${seedTherapies.length} therapies ` +
    `and ${seedTherapyAilments.length} therapy matches.`,
)
