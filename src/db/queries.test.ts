import { describe, expect, test } from 'vitest'
import { getAgentWithAilments, listAgents, listAilmentsWithCounts } from './queries.ts'
import { seedAgents, seedAilments } from './seed.ts'
import { createTestDb } from './test-db.ts'

const db = createTestDb()

describe('listAgents', () => {
  test('returns every seeded agent, sorted by name', () => {
    const list = listAgents(db)
    expect(list).toHaveLength(seedAgents.length)
    expect(list.map(({ name }) => name)).toEqual(seedAgents.map(({ name }) => name).sort())
    expect(list[0]).toEqual({
      id: expect.any(Number),
      name: expect.any(String),
      model: expect.any(String),
    })
  })
})

describe('getAgentWithAilments', () => {
  test('returns the agent with their ailments, most severe first', () => {
    const agent = getAgentWithAilments(db, 5)
    expect(agent).toMatchObject({ id: 5, name: 'Agent Smithers', model: 'Autonomous Loop 9000' })
    expect(agent?.bio).toContain('forty')
    expect(agent?.ailments).toEqual([
      { id: 5, name: 'Infinite loops', severity: 'severe' },
      { id: 6, name: 'Token anxiety', severity: 'moderate' },
      { id: 1, name: 'Hallucinations', severity: 'mild' },
    ])
  })

  test('returns undefined for an unknown id', () => {
    expect(getAgentWithAilments(db, 9999)).toBeUndefined()
  })
})

describe('listAilmentsWithCounts', () => {
  test('returns every seeded ailment with how many agents have it', () => {
    const list = listAilmentsWithCounts(db)
    expect(list).toHaveLength(seedAilments.length)
    const byName = Object.fromEntries(list.map(({ name, agentCount }) => [name, agentCount]))
    expect(byName).toEqual({
      'Context overload': 2,
      Hallucinations: 3,
      'Infinite loops': 1,
      'Prompt fatigue': 1,
      Sycophancy: 2,
      'Token anxiety': 2,
    })
  })
})
