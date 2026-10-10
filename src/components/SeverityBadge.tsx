import type { Severity } from '../db/schema.ts'
import { Badge } from './Badge.tsx'

export type SeverityBadgeProps = {
  severity: Severity
}

const labels: Record<Severity, string> = {
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe',
}

export const SeverityBadge = ({ severity }: SeverityBadgeProps) => (
  <Badge level={severity} label={labels[severity]} measure="Severity" />
)
