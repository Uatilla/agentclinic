import { sql } from 'drizzle-orm'
import { check, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const severities = ['mild', 'moderate', 'severe'] as const
export type Severity = (typeof severities)[number]

export const effectivenessLevels = ['low', 'medium', 'high'] as const
export type Effectiveness = (typeof effectivenessLevels)[number]

/** `column IN ('a', 'b', …)` for a CHECK constraint that makes SQLite enforce a text enum. */
const inList = (column: string, values: readonly string[]) =>
  sql.raw(`${column} IN (${values.map((value) => `'${value}'`).join(', ')})`)

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
    check('agent_ailments_severity_check', inList(table.severity.name, severities)),
  ],
)

export const therapies = sqliteTable('therapies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  duration: text('duration').notNull(),
})

export const therapyAilments = sqliteTable(
  'therapy_ailments',
  {
    therapyId: integer('therapy_id')
      .notNull()
      .references(() => therapies.id, { onDelete: 'cascade' }),
    ailmentId: integer('ailment_id')
      .notNull()
      .references(() => ailments.id, { onDelete: 'cascade' }),
    effectiveness: text('effectiveness', { enum: effectivenessLevels }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.therapyId, table.ailmentId] }),
    check(
      'therapy_ailments_effectiveness_check',
      inList(table.effectiveness.name, effectivenessLevels),
    ),
  ],
)
