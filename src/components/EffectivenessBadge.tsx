import type { Effectiveness } from '../db/schema.ts'
import { Badge } from './Badge.tsx'

export type EffectivenessBadgeProps = {
  effectiveness: Effectiveness
}

const labels: Record<Effectiveness, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const EffectivenessBadge = ({ effectiveness }: EffectivenessBadgeProps) => (
  <Badge level={effectiveness} label={labels[effectiveness]} measure="Effectiveness" />
)
