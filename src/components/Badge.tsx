export type BadgeProps = {
  /** Picks the color, e.g. `severe` or `high` (`.badge-severe`, `.badge-high`). */
  level: string
  label: string
  /** What the badge measures, read out before the label (e.g. "Severity"). */
  measure: string
}

// The text label carries the meaning; the level class only adds emphasis
export const Badge = ({ level, label, measure }: BadgeProps) => (
  <span class={`badge badge-${level}`}>
    <span class="visually-hidden">{measure}: </span>
    {label}
  </span>
)
