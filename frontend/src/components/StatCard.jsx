/**
 * Dashboard statistics card with icon, value, and accent color.
 */
export default function StatCard({ icon: Icon, value, label, variant = 'primary', delay = 0 }) {
  return (
    <div className={`stat-card stat-${variant} animate-in`} style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-icon-wrap">
        <Icon />
      </div>
      <div className="stat-body">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  )
}