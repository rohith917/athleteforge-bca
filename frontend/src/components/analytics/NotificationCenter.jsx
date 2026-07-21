import { FaBell, FaBandAid, FaTrophy } from 'react-icons/fa'
import { useNotifications } from '../../hooks/useNotifications'

const ICONS = { competition: FaTrophy, injury: FaBandAid }
const SEVERITY_TYPE = { high: 'danger', medium: 'warning' }

export default function NotificationCenter() {
  const { alerts, loading } = useNotifications()

  return (
    <div className="notification-center glass-card">
      <div className="notif-header">
        <h6 className="analytics-card-title mb-0"><FaBell /> Notifications</h6>
        <span className="notif-count">{alerts.length}</span>
      </div>
      <div className="notif-list">
        {!loading && alerts.length === 0 && (
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>No active alerts right now.</p>
        )}
        {alerts.map((a) => {
          const Icon = ICONS[a.type] || FaBell
          return (
            <div className={`notif-item notif-${SEVERITY_TYPE[a.severity] || 'info'}`} key={a.id}>
              <Icon />
              <div>
                <p>{a.message}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
