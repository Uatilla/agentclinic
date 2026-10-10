import { sql } from 'drizzle-orm'
import { check, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const severities = ['mild', 'moderate', 'severe'] as const
export type Severity = (typeof severities)[number]

export const agents = sqliteTable('agents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  model: text('model').notNull(),
  bio: text('bio').notNull(),
})

export const ailments = sqliteTable('ailments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
})

export const agentAilments = sqliteTable(
  'agent_ailments',
  {
    agentId: integer('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
    ailmentId: integer('ailment_id')
      .notNull()
      .references(() => ailments.id, { onDelete: 'cascade' }),
    // `enum` only narrows the TypeScript type; the CHECK makes SQLite enforce it too
    severity: text('severity', { enum: severities }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.agentId, table.ailmentId] }),
    check(
      'agent_ailments_severity_check',
      sql.raw(`${table.severity.name} IN (${severities.map((s) => `'${s}'`).join(', ')})`),
    ),
  ],
)
