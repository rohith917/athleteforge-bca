import Sparkline from './Sparkline'

const variants = {
  gold: { accent: '#ff3d3d', glow: 'rgba(255, 61, 61, 0.12)' },
  success: { accent: '#b8ff3c', glow: 'rgba(184, 255, 60, 0.12)' },
  danger: { accent: '#ff3d3d', glow: 'rgba(255, 61, 61, 0.12)' },
  warning: { accent: '#ff9f43', glow: 'rgba(255, 159, 67, 0.12)' },
  info: { accent: '#b8ff3c', glow: 'rgba(184, 255, 60, 0.08)' },
}

export default function KpiCard({
  icon: Icon, label, value, change, trend = 'up', sparkData, variant = 'gold', delay = 0,
}) {
  const v = variants[variant] || variants.gold
  const changeClass = trend === 'down' ? 'kpi-change-down' : trend === 'neutral' ? 'kpi-change-neutral' : 'kpi-change-up'

  return (
    <div
      className="kpi-card luxury-card animate-in"
      style={{ '--kpi-accent': v.accent, '--kpi-glow': v.glow, animationDelay: `${delay}ms` }}
    >
      <div className="kpi-card-top">
        <div className="kpi-icon"><Icon /></div>
        {change != null && (
          <span className={`kpi-change ${changeClass}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '·'} {change}%
          </span>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {sparkData && <Sparkline data={sparkData} color={v.accent} />}
    </div>
  )
}