import { defineConfig } from 'drizzle-kit'
import { resolveDatabaseUrl } from './src/db/database-url.ts'

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: resolveDatabaseUrl(),
  },
})
