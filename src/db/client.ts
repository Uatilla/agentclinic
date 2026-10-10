import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema.ts'

export const defaultDatabaseUrl = 'data/agentclinic.db'

// Resolved from this module, not the working directory
const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url))

/** Opens a SQLite database (file path or `:memory:`) and brings it up to the latest migration. */
export const createDb = (url: string = process.env.DATABASE_URL ?? defaultDatabaseUrl) => {
  // better-sqlite3 doesn't create missing directories
  if (url !== ':memory:') mkdirSync(dirname(url), { recursive: true })

  const sqlite = new Database(url)
  sqlite.pragma('foreign_keys = ON')

  const db = drizzle(sqlite, { schema })
  migrate(db, { migrationsFolder })
  return db
}

export type Db = ReturnType<typeof createDb>
