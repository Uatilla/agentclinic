import { createDb } from './client.ts'
import { seed } from './seed.ts'

/** A fresh in-memory database with the real migrations and seed data, for tests. */
export const createTestDb = () => {
  const db = createDb(':memory:')
  seed(db)
  return db
}
