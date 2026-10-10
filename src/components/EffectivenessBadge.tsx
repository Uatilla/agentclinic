import type { Effectiveness } from '../db/schema.ts'

export type EffectivenessBadgeProps = {
  effectiveness: Effectiveness
}

const labels: Record<Effectiveness, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

// Same graded scale as severity: the text label carries the meaning, the class adds emphasis
export const EffectivenessBadge = ({ effectiveness }: EffectivenessBadgeProps) => (
  <span class={`badge badge-${effectiveness}`}>{labels[effectiveness]}</span>
)
