import Sparkline from './Sparkline'

const variants = {
  gold: { accent: '#D4AF37', glow: 'rgba(212, 175, 55, 0.15)' },
  success: { accent: '#22C55E', glow: 'rgba(34, 197, 94, 0.12)' },
  danger: { accent: '#EF4444', glow: 'rgba(239, 68, 68, 0.12)' },
  warning: { accent: '#F59E0B', glow: 'rgba(245, 158, 11, 0.12)' },
  info: { accent: '#60A5FA', glow: 'rgba(96, 165, 250, 0.12)' },
}

export default function KpiCard({
  icon: Icon, label, value, change, trend = 'up', sparkData, variant = 'gold', delay = 0,
}) {
  const v = variants[variant] || variants.gold
  const changeClass = trend === 'down' ? 'kpi-change-down' : trend === 'neutral' ? 'kpi-change-neutral' : 'kpi-change-up'

  return (
    <div className="kpi-card glass-card animate-in" style={{ animationDelay: `${delay}ms`, '--kpi-accent': v.accent, '--kpi-glow': v.glow }}>
      <div className="kpi-card-top">
        <div className="kpi-icon"><Icon /></div>
        {change != null && (
          <span className={`kpi-change ${changeClass}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {change}%
          </span>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {sparkData && <Sparkline data={sparkData} color={v.accent} />}
    </div>
  )
}