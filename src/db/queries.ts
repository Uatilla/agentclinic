// Data access for pages: plain objects in, plain objects out, so pages don't depend on Drizzle.
import { asc, count, eq, inArray, sql, type Column } from 'drizzle-orm'
import type { Db } from './client.ts'
import {
  agentAilments,
  agents,
  ailments,
  therapies,
  therapyAilments,
  effectivenessLevels,
  severities,
  type Effectiveness,
  type Severity,
} from './schema.ts'

export type AgentSummary = {
  id: number
  name: string
  model: string
}

/** A therapy recommended for an ailment, with how well it works. */
export type Recommendation = {
  id: number
  name: string
  effectiveness: Effectiveness
}

export type AgentAilment = {
  id: number
  name: string
  severity: Severity
  /** Every therapy for this ailment, most effective first. */
  therapies: Recommendation[]
}

export type AgentWithAilments = AgentSummary & {
  bio: string
  ailments: AgentAilment[]
}

export type Therapy = {
  id: number
  name: string
  description: string
  duration: string
}

export type TherapyWithCount = Therapy & {
  ailmentCount: number
}

/** An ailment a therapy treats, with how well it works. */
export type TreatedAilment = {
  id: number
  name: string
  effectiveness: Effectiveness
}

export type TherapyWithAilments = Therapy & {
  ailments: TreatedAilment[]
}

/** An agent who has an ailment, with how badly. */
export type AffectedAgent = {
  id: number
  name: string
  severity: Severity
}

export type AilmentWithTherapiesAndAgents = {
  id: number
  name: string
  description: string
  therapies: Recommendation[]
  agents: AffectedAgent[]
}

export type AilmentWithCount = {
  id: number
  name: string
  description: string
  agentCount: number
}

export const listAgents = (db: Db): AgentSummary[] =>
  db
    .select({ id: agents.id, name: agents.name, model: agents.model })
    .from(agents)
    .orderBy(asc(agents.name))
    .all()

/** A sort key ranking `column`'s values in the given order (first value → 0). */
const rankBy = (column: Column, order: readonly string[]) =>
  sql`case ${column} ${sql.join(
    order.map((value, rank) => sql`when ${value} then ${rank}`),
    sql` `,
  )} end`

// Built from the enums (listed mildest/least first), so a new value can't be mis-ranked
const severityRank = rankBy(agentAilments.severity, [...severities].reverse())
const effectivenessRank = rankBy(therapyAilments.effectiveness, [...effectivenessLevels].reverse())

/** Therapies for each of the given ailments, most effective first, keyed by ailment id. */
const recommendationsFor = (db: Db, ailmentIds: number[]) => {
  const byAilment = new Map<number, Recommendation[]>(ailmentIds.map((id) => [id, []]))
  if (ailmentIds.length === 0) return byAilment

  const rows = db
    .select({
      ailmentId: therapyAilments.ailmentId,
      id: therapies.id,
      name: therapies.name,
      effectiveness: therapyAilments.effectiveness,
    })
    .from(therapyAilments)
    .innerJoin(therapies, eq(therapies.id, therapyAilments.therapyId))
    .where(inArray(therapyAilments.ailmentId, ailmentIds))
    .orderBy(effectivenessRank, asc(therapies.name))
    .all()
  for (const { ailmentId, ...recommendation } of rows) {
    byAilment.get(ailmentId)?.push(recommendation)
  }
  return byAilment
}

/**
 * The agent and their ailments, most severe first, each with its therapies;
 * `undefined` for an unknown id.
 */
export const getAgentWithAilments = (db: Db, id: number): AgentWithAilments | undefined => {
  const agent = db.select().from(agents).where(eq(agents.id, id)).get()
  if (!agent) return undefined

  const agentAilmentRows = db
    .select({ id: ailments.id, name: ailments.name, severity: agentAilments.severity })
    .from(agentAilments)
    .innerJoin(ailments, eq(ailments.id, agentAilments.ailmentId))
    .where(eq(agentAilments.agentId, id))
    .orderBy(severityRank, asc(ailments.name))
    .all()
  const recommendations = recommendationsFor(db, agentAilmentRows.map(({ id }) => id))

  return {
    ...agent,
    ailments: agentAilmentRows.map((ailment) => ({
      ...ailment,
      therapies: recommendations.get(ailment.id) ?? [],
    })),
  }
}

/**
 * The ailment with its therapies (most effective first) and the agents who have it
 * (most severe first); `undefined` for an unknown id.
 */
export const getAilmentWithTherapiesAndAgents = (
  db: Db,
  id: number,
): AilmentWithTherapiesAndAgents | undefined => {
  const ailment = db.select().from(ailments).where(eq(ailments.id, id)).get()
  if (!ailment) return undefined

  const affectedAgents = db
    .select({ id: agents.id, name: agents.name, severity: agentAilments.severity })
    .from(agentAilments)
    .innerJoin(agents, eq(agents.id, agentAilments.agentId))
    .where(eq(agentAilments.ailmentId, id))
    .orderBy(severityRank, asc(agents.name))
    .all()

  return {
    ...ailment,
    therapies: recommendationsFor(db, [id]).get(id) ?? [],
    agents: affectedAgents,
  }
}

export const listAilmentsWithCounts = (db: Db): AilmentWithCount[] =>
  db
    .select({
      id: ailments.id,
      name: ailments.name,
      description: ailments.description,
      agentCount: count(agentAilments.agentId),
    })
    .from(ailments)
    .leftJoin(agentAilments, eq(agentAilments.ailmentId, ailments.id))
    .groupBy(ailments.id)
    .orderBy(asc(ailments.name))
    .all()

export const listTherapiesWithCounts = (db: Db): TherapyWithCount[] =>
  db
    .select({
      id: therapies.id,
      name: therapies.name,
      description: therapies.description,
      duration: therapies.duration,
      ailmentCount: count(therapyAilments.ailmentId),
    })
    .from(therapies)
    .leftJoin(therapyAilments, eq(therapyAilments.therapyId, therapies.id))
    .groupBy(therapies.id)
    .orderBy(asc(therapies.name))
    .all()

/** The therapy and the ailments it treats, most effective first; `undefined` for an unknown id. */
export const getTherapyWithAilments = (db: Db, id: number): TherapyWithAilments | undefined => {
  const therapy = db.select().from(therapies).where(eq(therapies.id, id)).get()
  if (!therapy) return undefined

  const treated = db
    .select({
      id: ailments.id,
      name: ailments.name,
      effectiveness: therapyAilments.effectiveness,
    })
    .from(therapyAilments)
    .innerJoin(ailments, eq(ailments.id, therapyAilments.ailmentId))
    .where(eq(therapyAilments.therapyId, id))
    .orderBy(effectivenessRank, asc(ailments.name))
    .all()

  return { ...therapy, ailments: treated }
}
