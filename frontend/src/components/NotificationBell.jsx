/**
 * Navbar notification bell — upcoming competitions & injury follow-ups.
 */
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FaBell, FaTrophy, FaBandAid } from 'react-icons/fa'
import { useNotifications } from '../hooks/useNotifications'

const DISMISSED_KEY = 'af_dismissed_alerts'

function getDismissed() {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

function saveDismissed(set) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]))
  } catch {
    /* ignore */
  }
}

export default function NotificationBell() {
  const { alerts } = useNotifications()
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(getDismissed)
  const ref = useRef(null)

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const visible = alerts.filter((a) => !dismissed.has(a.id))

  const dismiss = (id) => {
    const next = new Set(dismissed)
    next.add(id)
    setDismissed(next)
    saveDismissed(next)
  }

  return (
    <div className="notification-bell-wrap" ref={ref}>
      <button
        type="button"
        className="theme-toggle notification-bell-btn"
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
        aria-label="Notifications"
      >
        <FaBell />
        {visible.length > 0 && <span className="notification-badge">{visible.length}</span>}
      </button>
      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">Alerts</div>
          {visible.length === 0 ? (
            <p className="notification-empty">You're all caught up.</p>
          ) : (
            <div className="notification-list">
              {visible.map((a) => (
                <div className={`notification-item severity-${a.severity}`} key={a.id}>
                  <span className="notification-icon">
                    {a.type === 'competition' ? <FaTrophy /> : <FaBandAid />}
                  </span>
                  <Link to={a.link} className="notification-message" onClick={() => setOpen(false)}>
                    {a.message}
                  </Link>
                  <button
                    type="button"
                    className="notification-dismiss"
                    onClick={() => dismiss(a.id)}
                    aria-label="Dismiss"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
