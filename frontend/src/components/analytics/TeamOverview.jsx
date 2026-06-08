import { deriveTeamOverview } from '../../utils/metricsEngine'
import { FaUsers, FaHeartbeat, FaExclamationTriangle, FaTrophy, FaBed, FaClipboardCheck } from 'react-icons/fa'

export default function TeamOverview({ stats }) {
  const t = deriveTeamOverview(stats)
  const items = [
    { icon: FaUsers, label: 'Total Athletes', val: t.totalAthletes, color: '#D4AF37' },
    { icon: FaHeartbeat, label: 'Ready to Train', val: t.readyToTrain, color: '#22C55E' },
    { icon: FaExclamationTriangle, label: 'High Injury Risk', val: t.highInjuryRisk, color: '#EF4444' },
    { icon: FaTrophy, label: 'Competition Ready', val: t.competitionReady, color: '#D4AF37' },
    { icon: FaBed, label: 'Poor Recovery', val: t.poorRecovery, color: '#F59E0B' },
    { icon: FaClipboardCheck, label: 'Attendance %', val: `${t.attendanceSummary}%`, color: '#60A5FA' },
  ]

  return (
    <div className="team-overview glass-card">
      <h6 className="analytics-card-title">Team Overview</h6>
      <div className="team-grid">
        {items.map((item) => (
          <div className="team-stat" key={item.label}>
            <item.icon style={{ color: item.color }} />
            <div>
              <strong>{item.val}</strong>
              <small>{item.label}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}