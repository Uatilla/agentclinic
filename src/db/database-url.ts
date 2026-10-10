// Shared by createDb and drizzle.config.ts, so the app and drizzle-kit open the same file
export const defaultDatabaseUrl = 'data/agentclinic.db'

/** A better-sqlite3 path from a DATABASE_URL: `file:` prefix stripped, empty means the default. */
export const resolveDatabaseUrl = (url: string | undefined = process.env.DATABASE_URL) => {
  const trimmed = url?.trim() ?? ''
  if (trimmed === '') return defaultDatabaseUrl
  return trimmed.replace(/^file:(\/\/)?/, '')
}
