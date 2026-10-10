// Data access for pages: plain objects in, plain objects out, so pages don't depend on Drizzle.
import { asc, count, eq, sql } from 'drizzle-orm'
import type { Db } from './client.ts'
import { agentAilments, agents, ailments, therapies, type Severity } from './schema.ts'

export type AgentSummary = {
  id: number
  name: string
  model: string
}

export type AgentAilment = {
  id: number
  name: string
  severity: Severity
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

/** The agent and their ailments, most severe first; `undefined` for an unknown id. */
export const getAgentWithAilments = (db: Db, id: number): AgentWithAilments | undefined => {
  const agent = db.select().from(agents).where(eq(agents.id, id)).get()
  if (!agent) return undefined

  const severityRank = sql`case ${agentAilments.severity}
    when 'severe' then 0 when 'moderate' then 1 else 2 end`
  const agentAilmentRows = db
    .select({ id: ailments.id, name: ailments.name, severity: agentAilments.severity })
    .from(agentAilments)
    .innerJoin(ailments, eq(ailments.id, agentAilments.ailmentId))
    .where(eq(agentAilments.agentId, id))
    .orderBy(severityRank, asc(ailments.name))
    .all()

  return { ...agent, ailments: agentAilmentRows }
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

export const listTherapies = (db: Db): Therapy[] =>
  db.select().from(therapies).orderBy(asc(therapies.name)).all()

/** The therapy; `undefined` for an unknown id. */
export const getTherapy = (db: Db, id: number): Therapy | undefined =>
  db.select().from(therapies).where(eq(therapies.id, id)).get()
