import type { Severity } from '../db/schema.ts'

export type SeverityBadgeProps = {
  severity: Severity
}

const labels: Record<Severity, string> = {
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe',
}

// The text label carries the meaning; the modifier class only adds emphasis
export const SeverityBadge = ({ severity }: SeverityBadgeProps) => (
  <span class={`badge badge-${severity}`}>{labels[severity]}</span>
)
