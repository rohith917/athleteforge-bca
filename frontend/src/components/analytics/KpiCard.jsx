import { motion } from 'framer-motion'
import Sparkline from './Sparkline'

const variants = {
  gold: { accent: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.15)' },
  success: { accent: '#22C55E', glow: 'rgba(34, 197, 94, 0.12)' },
  danger: { accent: '#EF4444', glow: 'rgba(239, 68, 68, 0.12)' },
  warning: { accent: '#F59E0B', glow: 'rgba(245, 158, 11, 0.12)' },
  info: { accent: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.12)' },
}

export default function KpiCard({
  icon: Icon, label, value, change, trend = 'up', sparkData, variant = 'gold', delay = 0,
}) {
  const v = variants[variant] || variants.gold
  const changeClass = trend === 'down' ? 'kpi-change-down' : trend === 'neutral' ? 'kpi-change-neutral' : 'kpi-change-up'

  return (
    <motion.div
      className="kpi-card glass-card"
      style={{ '--kpi-accent': v.accent, '--kpi-glow': v.glow }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
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
    </motion.div>
  )
}