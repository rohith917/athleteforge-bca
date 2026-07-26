/**
 * Compact announcements preview for dashboards — links out to the full board.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBullhorn, FaThumbtack } from 'react-icons/fa'
import { announcementsAPI } from '../../services/api'
import { parseListResponse } from '../../utils/apiHelpers'

export default function AnnouncementsFeed({ limit = 3 }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    announcementsAPI.getAll()
      .then((res) => setItems(parseListResponse(res.data).slice(0, limit)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [limit])

  return (
    <div className="glass-card h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="analytics-card-title mb-0"><FaBullhorn className="me-2" />Announcements</h6>
        <Link to="/dashboard/announcements" className="text-decoration-none small">View all</Link>
      </div>
      {loading && <p className="text-muted small mb-0">Loading...</p>}
      {!loading && items.length === 0 && <p className="text-muted small mb-0">Nothing posted yet.</p>}
      <div className="notif-list">
        {items.map((a) => (
          <div className="notif-item notif-info" key={a.id}>
            {a.pinned ? <FaThumbtack /> : <FaBullhorn />}
            <div>
              <p>{a.title}</p>
              <small>{a.message}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
