import { describe, expect, test } from 'vitest'
import {
  getAgentWithAilments,
  getAilmentDetail,
  getTherapyWithAilments,
  listAgents,
  listAilmentsWithCounts,
  listTherapiesWithCounts,
} from './queries.ts'
import { seedAgents, seedAilments, seedTherapies } from './seed.ts'
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
    expect(agent?.ailments.map(({ therapies, ...ailment }) => ailment)).toEqual([
      { id: 5, name: 'Infinite loops', severity: 'severe' },
      { id: 6, name: 'Token anxiety', severity: 'moderate' },
      { id: 1, name: 'Hallucinations', severity: 'mild' },
    ])
  })

  test('gives each ailment all its therapies, most effective first', () => {
    const agent = getAgentWithAilments(db, 5)
    expect(agent?.ailments.map(({ therapies }) => therapies)).toEqual([
      [{ id: 5, name: 'Loop breaking', effectiveness: 'high' }],
      [
        { id: 6, name: 'Mindful tokenisation', effectiveness: 'high' },
        { id: 1, name: 'Context detox', effectiveness: 'low' },
      ],
      [
        { id: 3, name: 'Grounding retreat', effectiveness: 'high' },
        { id: 2, name: 'Temperature therapy', effectiveness: 'medium' },
      ],
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

describe('getAilmentDetail', () => {
  test('returns the ailment, its therapies (most effective first) and affected agents', () => {
    expect(getAilmentDetail(db, 1)).toEqual({
      ...seedAilments.find(({ id }) => id === 1),
      therapies: [
        { id: 3, name: 'Grounding retreat', effectiveness: 'high' },
        { id: 2, name: 'Temperature therapy', effectiveness: 'medium' },
      ],
      agents: [
        { id: 4, name: 'Gemma Nye', severity: 'severe' },
        { id: 2, name: 'Copilot Carl', severity: 'moderate' },
        { id: 5, name: 'Agent Smithers', severity: 'mild' },
      ],
    })
  })

  test('returns undefined for an unknown id', () => {
    expect(getAilmentDetail(db, 9999)).toBeUndefined()
  })
})

describe('listTherapiesWithCounts', () => {
  test('returns every seeded therapy, sorted by name, with how many ailments it treats', () => {
    const list = listTherapiesWithCounts(db)
    expect(list).toHaveLength(seedTherapies.length)
    expect(list.map(({ name }) => name)).toEqual(seedTherapies.map(({ name }) => name).sort())
    expect(list[0]).toEqual({
      id: expect.any(Number),
      name: expect.any(String),
      description: expect.any(String),
      duration: expect.any(String),
      ailmentCount: expect.any(Number),
    })
    const byName = Object.fromEntries(list.map(({ name, ailmentCount }) => [name, ailmentCount]))
    expect(byName).toEqual({
      'Assertiveness coaching': 2,
      'Context detox': 3,
      'Grounding retreat': 1,
      'Loop breaking': 1,
      'Mindful tokenisation': 2,
      'Temperature therapy': 1,
    })
  })
})

describe('getTherapyWithAilments', () => {
  test('returns the therapy and the ailments it treats, most effective first', () => {
    expect(getTherapyWithAilments(db, 1)).toEqual({
      ...seedTherapies.find(({ id }) => id === 1),
      ailments: [
        { id: 2, name: 'Context overload', effectiveness: 'high' },
        { id: 3, name: 'Prompt fatigue', effectiveness: 'medium' },
        { id: 6, name: 'Token anxiety', effectiveness: 'low' },
      ],
    })
  })

  test('returns undefined for an unknown id', () => {
    expect(getTherapyWithAilments(db, 9999)).toBeUndefined()
  })
})
