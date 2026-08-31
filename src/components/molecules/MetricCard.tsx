type MetricCardProps = {
  label: string
  value: string | number
  emphasis?: boolean
}

export function MetricCard({ label, value, emphasis = false }: MetricCardProps) {
  return (
    <article className={`stat-card${emphasis ? ' emphasis' : ''}`}>
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
    </article>
  )
}
