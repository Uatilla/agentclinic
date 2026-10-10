// `npm run db:migrate`: apply migrations to the file DB without starting the server
import { createDb } from './client.ts'

const db = createDb()
db.$client.close()
console.log('Database migrated.')
