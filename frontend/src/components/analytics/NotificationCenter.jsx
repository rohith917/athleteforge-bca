import { FaBell, FaUserClock, FaBandAid, FaTrophy, FaWeight } from 'react-icons/fa'

const NOTIFS = [
  { icon: FaUserClock, text: 'Athlete missed training session', time: '10m', type: 'warning' },
  { icon: FaBandAid, text: 'Injury risk increased for 2 athletes', time: '1h', type: 'danger' },
  { icon: FaTrophy, text: 'Competition approaching in 5 days', time: '3h', type: 'info' },
  { icon: FaWeight, text: 'Weight target achieved — Rahul S.', time: '6h', type: 'success' },
]

export default function NotificationCenter() {
  return (
    <div className="notification-center glass-card">
      <div className="notif-header">
        <h6 className="analytics-card-title mb-0"><FaBell /> Notifications</h6>
        <span className="notif-count">{NOTIFS.length}</span>
      </div>
      <div className="notif-list">
        {NOTIFS.map((n, i) => (
          <div className={`notif-item notif-${n.type}`} key={i}>
            <n.icon />
            <div>
              <p>{n.text}</p>
              <small>{n.time} ago</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}