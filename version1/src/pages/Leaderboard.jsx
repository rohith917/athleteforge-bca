/**
 * Team Leaderboard — cross-athlete ranking by performance, medals, and attendance.
 * Visible to every role (students see where they stand, not just their own record).
 */
import { useState, useEffect, useMemo } from 'react'
import { FaTrophy, FaMedal, FaFire, FaClipboardCheck } from 'react-icons/fa'
import { leaderboardAPI, ensureApiSession } from '../services/api'
import { getLoadErrorMessage } from '../utils/apiHelpers'
import { useAuth } from '../context/AuthContext'
import DataErrorPanel from '../components/DataErrorPanel'
import PageHeader from '../components/PageHeader'
import Avatar from '../components/Avatar'
import { Skeleton } from '../components/ui/Skeleton'

const PODIUM_MEDAL = ['#FFD700', '#C0C0C0', '#CD7F32']

export default function Leaderboard() {
  const { user, isStudent } = useAuth()
  const [rows, setRows] = useState([])
  const [sports, setSports] = useState([])
  const [sport, setSport] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const ok = await ensureApiSession()
      if (!ok) {
        setLoadError('Session not verified — sign in again.')
        return
      }
      const res = await leaderboardAPI.get(sport ? { sport } : {})
      setRows(res.data?.leaderboard || [])
      setSports(res.data?.sports || [])
    } catch (err) {
      setLoadError(getLoadErrorMessage(err, 'leaderboard'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [sport])

  const podium = useMemo(() => rows.slice(0, 3), [rows])
  const rest = useMemo(() => rows.slice(3), [rows])
  const myAthleteId = isStudent ? user?.athlete_id : null

  return (
    <div className="animate-in dashboard-luxury">
      <PageHeader
        title="Team Leaderboard"
        subtitle="Ranked by performance average, medal points, and attendance"
        action={
          <select className="form-select form-select-sm" style={{ width: 180 }} value={sport} onChange={(e) => setSport(e.target.value)}>
            <option value="">All Sports</option>
            {sports.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        }
      />

      <DataErrorPanel message={loadError} onRetry={fetchData} />

      {loading && (
        <div className="row g-3">
          {[1, 2, 3, 4].map((i) => <div className="col-md-6 col-lg-3" key={i}><Skeleton style={{ height: 140, borderRadius: 14 }} /></div>)}
        </div>
      )}

      {!loading && !loadError && rows.length === 0 && (
        <div className="glass-card text-center py-5">
          <FaTrophy size={32} className="mb-2 text-muted" />
          <p className="text-muted mb-0">No athlete data yet for this sport.</p>
        </div>
      )}

      {!loading && podium.length > 0 && (
        <div className="leaderboard-podium">
          {[podium[1], podium[0], podium[2]].filter(Boolean).map((row) => (
            <div
              key={row.athlete_id}
              className={`podium-card podium-rank-${row.rank} ${row.athlete_id === myAthleteId ? 'podium-me' : ''}`}
            >
              <div className="podium-crown" style={{ color: PODIUM_MEDAL[row.rank - 1] }}>
                <FaTrophy />
              </div>
              <Avatar src={row.avatar_url} name={row.name} size="lg" />
              <strong>{row.name}</strong>
              <small className="text-muted">{row.sport}</small>
              <span className="podium-score">{row.composite_score}</span>
              <span className="podium-rank-badge">#{row.rank}</span>
            </div>
          ))}
        </div>
      )}

      {!loading && rest.length > 0 && (
        <div className="glass-card leaderboard-table-wrap">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Athlete</th>
                <th>Sport</th>
                <th><FaFire className="me-1" />Score</th>
                <th><FaMedal className="me-1" />Medals</th>
                <th><FaClipboardCheck className="me-1" />Attendance</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((row) => (
                <tr key={row.athlete_id} className={row.athlete_id === myAthleteId ? 'leaderboard-row-me' : ''}>
                  <td>#{row.rank}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Avatar src={row.avatar_url} name={row.name} size="xs" />
                      <span>{row.name}{row.athlete_id === myAthleteId ? ' (You)' : ''}</span>
                    </div>
                  </td>
                  <td>{row.sport}</td>
                  <td>{row.composite_score}</td>
                  <td>{row.gold}G · {row.silver}S · {row.bronze}B</td>
                  <td>{row.attendance_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
