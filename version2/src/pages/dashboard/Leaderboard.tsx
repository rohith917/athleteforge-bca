import { useState, useEffect, useMemo } from 'react'
import { Trophy } from 'lucide-react'
import { leaderboardAPI } from '@/services/api'
import { getLoadErrorMessage } from '@/lib/apiHelpers'
import { useAuth } from '@/context/AuthContext'
import type { LeaderboardEntry } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Avatar } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { cn } from '@/lib/utils'

const PODIUM_COLOR = ['#f5b301', '#c0c0c0', '#cd7f32']

export default function Leaderboard() {
  const { user, isStudent } = useAuth()
  const [rows, setRows] = useState<LeaderboardEntry[]>([])
  const [sports, setSports] = useState<string[]>([])
  const [sport, setSport] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setLoadError('')
    try {
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
    <div>
      <PageHeader
        title="Team Leaderboard"
        description="Ranked by performance average, medal points, and attendance"
        actions={
          <Select value={sport} onChange={(e) => setSport(e.target.value)} className="mt-0 min-w-[160px]">
            <option value="">All Sports</option>
            {sports.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        }
      />

      {loadError && (
        <Card className="mb-6 flex items-center justify-between p-4">
          <p className="font-body text-sm text-accent-hover">{loadError}</p>
          <button onClick={fetchData} className="font-body text-xs font-semibold uppercase text-accent hover:text-accent-hover">Retry</button>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : rows.length === 0 ? (
        <Card><EmptyState icon={Trophy} title="No athlete data yet for this sport" /></Card>
      ) : (
        <>
          {podium.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[podium[1], podium[0], podium[2]].filter(Boolean).map((row) => (
                <Card
                  key={row.athlete_id}
                  className={cn(
                    'flex flex-col items-center gap-2 p-6 text-center',
                    row.rank === 1 && 'sm:order-2 sm:-translate-y-3 border-accent',
                    row.rank === 2 && 'sm:order-1',
                    row.rank === 3 && 'sm:order-3',
                    row.athlete_id === myAthleteId && 'ring-2 ring-accent',
                  )}
                >
                  <Trophy size={22} style={{ color: PODIUM_COLOR[row.rank - 1] }} />
                  <Avatar src={row.avatar_url} name={row.name} size="lg" />
                  <strong className="font-body text-sm font-semibold text-text">{row.name}</strong>
                  <small className="font-body text-xs text-text-muted">{row.sport}</small>
                  <span className="font-display text-2xl font-extrabold text-accent">{row.composite_score}</span>
                  <span className="rounded-full bg-white/5 px-3 py-1 font-body text-[10px] font-semibold uppercase text-text-secondary">#{row.rank}</span>
                </Card>
              ))}
            </div>
          )}

          {rest.length > 0 && (
            <Card className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Rank', 'Athlete', 'Sport', 'Score', 'Medals', 'Attendance'].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 text-left font-body text-[11px] font-semibold uppercase tracking-widest text-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rest.map((row) => (
                    <tr key={row.athlete_id} className={cn('border-b border-border last:border-0', row.athlete_id === myAthleteId && 'bg-accent-soft')}>
                      <td className="px-5 py-3 font-body text-sm text-text-secondary">#{row.rank}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar src={row.avatar_url} name={row.name} size="xs" />
                          <span className="font-body text-sm text-text">{row.name}{row.athlete_id === myAthleteId ? ' (You)' : ''}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-body text-sm text-text-secondary">{row.sport}</td>
                      <td className="px-5 py-3 font-body text-sm font-semibold text-text">{row.composite_score}</td>
                      <td className="px-5 py-3 font-body text-xs text-text-secondary">{row.gold}G · {row.silver}S · {row.bronze}B</td>
                      <td className="px-5 py-3 font-body text-sm text-text-secondary">{row.attendance_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
