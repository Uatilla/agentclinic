import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { count, sql } from 'drizzle-orm'
import { afterEach, describe, expect, test } from 'vitest'
import { createDb } from './client.ts'
import { agentAilments, agents, ailments } from './schema.ts'
import { seed, seedAgents, seedAilments } from './seed.ts'
import { createTestDb } from './test-db.ts'

const counts = (db: ReturnType<typeof createTestDb>) => ({
  agents: db.select({ n: count() }).from(agents).get()?.n,
  ailments: db.select({ n: count() }).from(ailments).get()?.n,
  agentAilments: db.select({ n: count() }).from(agentAilments).get()?.n,
})

describe('migrations', () => {
  test('create the agents, ailments and agent_ailments tables', () => {
    const db = createDb(':memory:')
    const tables = db
      .all<{ name: string }>(sql`select name from sqlite_master where type = 'table'`)
      .map(({ name }) => name)
    expect(tables).toEqual(expect.arrayContaining(['agents', 'ailments', 'agent_ailments']))
  })
})

describe('seed', () => {
  test('inserts 5 agents and 6 ailments', () => {
    const db = createTestDb()
    expect(counts(db)).toMatchObject({ agents: 5, ailments: 6 })
    expect(seedAgents).toHaveLength(5)
    expect(seedAilments).toHaveLength(6)
  })

  test('is idempotent: seeding twice gives the same row counts', () => {
    const db = createTestDb()
    const before = counts(db)
    seed(db)
    expect(counts(db)).toEqual(before)
  })

  test('gives every agent an ailment and shares at least one ailment across agents', () => {
    const db = createTestDb()
    const agentsWithoutAilments = db.all(
      sql`select id from agents where id not in (select agent_id from agent_ailments)`,
    )
    expect(agentsWithoutAilments).toEqual([])

    const shared = db.all(
      sql`select ailment_id from agent_ailments group by ailment_id having count(*) >= 2`,
    )
    expect(shared.length).toBeGreaterThan(0)
  })
})

/** The SQLite error code thrown by `run`, unwrapping Drizzle's error when it wraps one. */
const sqliteErrorCode = (run: () => unknown) => {
  try {
    run()
  } catch (error) {
    const sqliteError = (error as { cause?: unknown }).cause ?? error
    return (sqliteError as { code?: string }).code
  }
  return undefined
}

describe('constraints', () => {
  test('the database rejects an unknown severity', () => {
    const db = createTestDb()
    const insertBanana = () => db.run(sql`insert into agent_ailments values (1, 2, 'banana')`)
    expect(sqliteErrorCode(insertBanana)).toBe('SQLITE_CONSTRAINT_CHECK')
  })

  test('foreign keys are enforced', () => {
    const db = createTestDb()
    const insertUnknownAgent = () =>
      db.insert(agentAilments).values({ agentId: 999, ailmentId: 1, severity: 'mild' }).run()
    expect(sqliteErrorCode(insertUnknownAgent)).toBe('SQLITE_CONSTRAINT_FOREIGNKEY')
  })
})

describe('createDb with a file path', () => {
  let dir: string | undefined

  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true })
  })

  test('creates a missing parent directory', () => {
    dir = mkdtempSync(join(tmpdir(), 'agentclinic-'))
    const file = join(dir, 'missing', 'nested', 'test.db')
    const db = createDb(file)
    db.$client.close()
    expect(existsSync(file)).toBe(true)
  })
})
