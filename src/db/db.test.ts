import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { count, eq, sql } from 'drizzle-orm'
import { afterEach, describe, expect, test } from 'vitest'
import { createDb } from './client.ts'
import { defaultDatabaseUrl, resolveDatabaseUrl } from './database-url.ts'
import { agentAilments, agents, ailments, therapies, therapyAilments } from './schema.ts'
import { seed, seedAgents, seedAilments, seedTherapies, seedTherapyAilments } from './seed.ts'
import { createTestDb } from './test-db.ts'

const counts = (db: ReturnType<typeof createTestDb>) => ({
  agents: db.select({ n: count() }).from(agents).get()?.n,
  ailments: db.select({ n: count() }).from(ailments).get()?.n,
  agentAilments: db.select({ n: count() }).from(agentAilments).get()?.n,
  therapies: db.select({ n: count() }).from(therapies).get()?.n,
  therapyAilments: db.select({ n: count() }).from(therapyAilments).get()?.n,
})

describe('migrations', () => {
  test('create the agents, ailments and agent_ailments tables', () => {
    const db = createDb(':memory:')
    const tables = db
      .all<{ name: string }>(sql`select name from sqlite_master where type = 'table'`)
      .map(({ name }) => name)
    expect(tables).toEqual(expect.arrayContaining(['agents', 'ailments', 'agent_ailments']))
  })

  test('create the therapies and therapy_ailments tables', () => {
    const db = createDb(':memory:')
    const tables = db
      .all<{ name: string }>(sql`select name from sqlite_master where type = 'table'`)
      .map(({ name }) => name)
    expect(tables).toEqual(expect.arrayContaining(['therapies', 'therapy_ailments']))
  })
})

describe('seed', () => {
  test('inserts 5 agents and 6 ailments', () => {
    const db = createTestDb()
    expect(counts(db)).toMatchObject({ agents: 5, ailments: 6 })
    expect(seedAgents).toHaveLength(5)
    expect(seedAilments).toHaveLength(6)
  })

  test('inserts 6 therapies and their matches to ailments', () => {
    const db = createTestDb()
    expect(counts(db)).toMatchObject({
      therapies: 6,
      therapyAilments: seedTherapyAilments.length,
    })
    expect(seedTherapies).toHaveLength(6)
  })

  test('gives every ailment a therapy and has a therapy that treats several ailments', () => {
    const db = createTestDb()
    const untreated = db.all(
      sql`select id from ailments where id not in (select ailment_id from therapy_ailments)`,
    )
    expect(untreated).toEqual([])

    const multiPurpose = db.all(
      sql`select therapy_id from therapy_ailments group by therapy_id having count(*) >= 2`,
    )
    expect(multiPurpose.length).toBeGreaterThan(0)
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

  test('the database rejects an unknown effectiveness', () => {
    const db = createTestDb()
    const insertBanana = () => db.run(sql`insert into therapy_ailments values (2, 2, 'banana')`)
    expect(sqliteErrorCode(insertBanana)).toBe('SQLITE_CONSTRAINT_CHECK')
  })

  test('foreign keys are enforced', () => {
    const db = createTestDb()
    const insertUnknownAgent = () =>
      db.insert(agentAilments).values({ agentId: 999, ailmentId: 1, severity: 'mild' }).run()
    expect(sqliteErrorCode(insertUnknownAgent)).toBe('SQLITE_CONSTRAINT_FOREIGNKEY')
  })

  test('deleting an agent deletes their diagnoses (cascade)', () => {
    const db = createTestDb()
    db.delete(agents).where(eq(agents.id, 5)).run()
    const left = db.select().from(agentAilments).where(eq(agentAilments.agentId, 5)).all()
    expect(left).toEqual([])
  })

  test('deleting a therapy deletes its matches (cascade)', () => {
    const db = createTestDb()
    db.delete(therapies).where(eq(therapies.id, 1)).run()
    const left = db.select().from(therapyAilments).where(eq(therapyAilments.therapyId, 1)).all()
    expect(left).toEqual([])
  })

  test('deleting an ailment deletes its diagnoses and therapy matches (cascade)', () => {
    const db = createTestDb()
    db.delete(ailments).where(eq(ailments.id, 1)).run()
    expect(db.select().from(agentAilments).where(eq(agentAilments.ailmentId, 1)).all()).toEqual([])
    expect(
      db.select().from(therapyAilments).where(eq(therapyAilments.ailmentId, 1)).all(),
    ).toEqual([])
  })

  test('ailment names are unique', () => {
    const db = createTestDb()
    const insertDuplicate = () =>
      db.insert(ailments).values({ name: 'Hallucinations', description: 'Again.' }).run()
    expect(sqliteErrorCode(insertDuplicate)).toBe('SQLITE_CONSTRAINT_UNIQUE')
  })

  test('therapy names are unique', () => {
    const db = createTestDb()
    const insertDuplicate = () =>
      db
        .insert(therapies)
        .values({ name: 'Context detox', description: 'Again.', duration: '1 session' })
        .run()
    expect(sqliteErrorCode(insertDuplicate)).toBe('SQLITE_CONSTRAINT_UNIQUE')
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

describe('resolveDatabaseUrl', () => {
  test.each([
    ['', defaultDatabaseUrl],
    ['   ', defaultDatabaseUrl],
    ['data/test.db', 'data/test.db'],
    ['file:data/test.db', 'data/test.db'],
    ['file:///tmp/test.db', '/tmp/test.db'],
    [':memory:', ':memory:'],
  ])('%j → %s', (url, expected) => {
    expect(resolveDatabaseUrl(url)).toBe(expected)
  })
})
