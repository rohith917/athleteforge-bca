import { useEffect, useState } from 'react'
import { FaBell, FaBandAid, FaTrophy, FaClipboardCheck, FaBullhorn, FaCheckDouble } from 'react-icons/fa'
import { notificationsAPI } from '../../services/api'

const TYPE_ICON = {
  injury: FaBandAid,
  competition: FaTrophy,
  attendance: FaClipboardCheck,
  announcement: FaBullhorn,
  goal: FaTrophy,
  system: FaBell,
}

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export default function NotificationCenter() {
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await notificationsAPI.getAll()
      setItems(res.data?.results || [])
      setUnread(res.data?.unread_count || 0)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleClick = async (item) => {
    if (item.live || item.is_read) return
    setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)))
    setUnread((prev) => Math.max(0, prev - 1))
    try {
      await notificationsAPI.markRead(item.id)
    } catch {
      /* optimistic — ignore */
    }
  }

  const handleMarkAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnread(0)
    try {
      await notificationsAPI.markAllRead()
    } catch {
      /* optimistic — ignore */
    }
  }

  return (
    <div className="notification-center glass-card">
      <div className="notif-header">
        <h6 className="analytics-card-title mb-0"><FaBell /> Notifications</h6>
        <div className="d-flex align-items-center gap-2">
          {unread > 0 && (
            <button type="button" className="notif-mark-all" onClick={handleMarkAll} title="Mark all read">
              <FaCheckDouble />
            </button>
          )}
          <span className="notif-count">{unread}</span>
        </div>
      </div>
      <div className="notif-list">
        {loading && <p className="text-muted small mb-0">Loading...</p>}
        {!loading && items.length === 0 && <p className="text-muted small mb-0">No notifications yet.</p>}
        {items.map((n) => {
          const Icon = TYPE_ICON[n.notif_type] || FaBell
          return (
            <div
              key={n.id}
              className={`notif-item notif-${n.severity} ${!n.is_read ? 'notif-unread' : ''}`}
              onClick={() => handleClick(n)}
              role={n.live || n.is_read ? undefined : 'button'}
            >
              <Icon />
              <div>
                <p>{n.title}</p>
                {n.message && <small className="d-block mb-1">{n.message}</small>}
                <small>{timeAgo(n.created_at)} ago</small>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
