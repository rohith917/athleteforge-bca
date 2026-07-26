import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Mail, Phone, Ruler, Cake, AlertTriangle, Target } from 'lucide-react'
import { athletesAPI, goalsAPI } from '@/services/api'
import { parseListResponse } from '@/lib/apiHelpers'
import { useAuth } from '@/context/AuthContext'
import type { AthleteProfileData, Goal } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FullScreenLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/dashboard/EmptyState'

const STATUS_VARIANT = { Active: 'success', Injured: 'danger', Inactive: 'default' } as const
const SEVERITY_VARIANT = { Minor: 'warning', Moderate: 'warning', Severe: 'danger' } as const

export default function AthleteProfile() {
  const { id } = useParams()
  const { isStudent, isStaff, user } = useAuth()
  const [profile, setProfile] = useState<AthleteProfileData | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const studentOwnsProfile = !isStudent || (Boolean(user?.athlete_id) && String(user?.athlete_id) === String(id))

  useEffect(() => {
    if (!studentOwnsProfile || !id) {
      setLoading(false)
      return
    }
    Promise.all([
      athletesAPI.getProfile(Number(id)),
      goalsAPI.getAll({ athlete: id }).catch(() => ({ data: [] })),
    ])
      .then(([profileRes, goalsRes]) => {
        setProfile(profileRes.data as AthleteProfileData)
        setGoals(parseListResponse<Goal>(goalsRes.data))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id, studentOwnsProfile])

  if (isStudent && !user?.athlete_id) return <Navigate to="/dashboard" replace />
  if (isStudent && !studentOwnsProfile) return <Navigate to={`/dashboard/athletes/${user?.athlete_id}`} replace />
  if (loading) return <FullScreenLoader message="Loading athlete profile..." />
  if (!profile) return <Card className="p-6"><p className="font-body text-sm text-accent-hover">Athlete not found.</p></Card>

  const lp = profile.latest_performance
  const backTo = isStudent ? '/dashboard' : '/dashboard/athletes'
  const backLabel = isStudent ? 'My Dashboard' : 'Back to Roster'

  const infoItems = [
    { icon: Mail, label: 'Email', val: profile.email },
    { icon: Phone, label: 'Phone', val: profile.phone },
    { icon: Cake, label: 'Age', val: profile.age ? `${profile.age} yrs` : null },
    { icon: Ruler, label: 'Height', val: profile.height_cm ? `${profile.height_cm} cm` : null },
  ]

  const metrics = [
    { label: 'Performance', val: profile.performance_count },
    { label: 'Injuries', val: profile.injury_count },
    { label: 'Competitions', val: profile.competition_count },
    { label: 'Attendance', val: profile.attendance_count },
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to={backTo}>
          <Button variant="outline" size="sm" magnetic={false}><ArrowLeft size={15} /> {backLabel}</Button>
        </Link>
        {isStaff && (
          <Link to={`/dashboard/athletes/${id}/edit`}>
            <Button size="sm" magnetic={false}><Pencil size={15} /> Edit Profile</Button>
          </Link>
        )}
      </div>

      <Card className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <Avatar src={profile.avatar_url} name={profile.full_name} size="lg" className="size-24" />
        <div className="flex-1">
          <h1 className="font-display text-2xl font-extrabold text-text">{profile.full_name}</h1>
          <p className="mt-1 font-body text-sm text-text-secondary">{profile.sport} · {profile.team || 'Independent'}</p>
          <Badge variant={STATUS_VARIANT[profile.status]} className="mt-2">{profile.status}</Badge>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <div className="font-display text-xl font-extrabold text-text">{m.val}</div>
              <div className="mt-0.5 font-body text-[10px] uppercase tracking-widest text-text-muted">{m.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <item.icon size={16} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="font-body text-[11px] uppercase tracking-widest text-text-muted">{item.label}</p>
                  <p className="font-body text-sm font-medium text-text">{item.val || '—'}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Latest Performance</CardTitle></CardHeader>
          <CardContent>
            {lp ? (
              <div className="grid grid-cols-5 gap-3">
                {(['speed_score', 'strength_score', 'endurance_score', 'flexibility_score', 'agility_score'] as const).map((k) => (
                  <div key={k} className="rounded-xl bg-white/5 py-3 text-center">
                    <div className="font-display text-lg font-extrabold text-text">{lp[k] ?? '—'}</div>
                    <div className="mt-0.5 font-body text-[10px] uppercase tracking-widest text-text-muted">{k.replace('_score', '')}</div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Target} title="No performance records yet" />
            )}
          </CardContent>
        </Card>
      </div>

      {profile.active_injuries.length > 0 && (
        <Card className="mt-6">
          <CardHeader><CardTitle>Active Injuries</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {profile.active_injuries.map((injury) => (
              <div key={injury.id} className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent" />
                <div className="flex-1">
                  <p className="font-body text-sm font-semibold text-text">{injury.injury_type} · {injury.body_part}</p>
                  <p className="mt-1 font-body text-xs text-text-secondary">{injury.recovery_status}</p>
                </div>
                <Badge variant={SEVERITY_VARIANT[injury.severity]}>{injury.severity}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader><CardTitle>Goals</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {goals.length === 0 ? (
            <EmptyState icon={Target} title="No goals set" />
          ) : (
            goals.map((g) => (
              <div key={g.id} className="rounded-xl bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-body text-sm font-semibold text-text">{g.title}</p>
                  <Badge variant={g.status === 'achieved' ? 'success' : g.status === 'missed' ? 'danger' : 'accent'}>{g.status}</Badge>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-accent" style={{ width: `${Math.min(100, Math.max(0, g.progress?.percent || 0))}%` }} />
                </div>
                <p className="mt-1.5 font-body text-xs text-text-muted">{g.progress?.percent ?? 0}% toward {g.target_value} {g.metric_label}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
