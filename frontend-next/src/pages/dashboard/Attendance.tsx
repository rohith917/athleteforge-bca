import { useState, useEffect } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { CheckCircle2, XCircle, Clock, ClipboardCheck } from 'lucide-react'
import '@/lib/chartSetup'
import { donutLegendOptions } from '@/lib/chartSetup'
import { attendanceAPI, athletesAPI } from '@/services/api'
import { parseListResponse, getLoadErrorMessage } from '@/lib/apiHelpers'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { AthleteListItem, AttendanceReport, AttendanceStatus } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

const STATUS_VARIANT = { Present: 'success', Absent: 'danger', Late: 'warning', Excused: 'default' } as const

export default function Attendance() {
  const [athletes, setAthletes] = useState<AthleteListItem[]>([])
  const [report, setReport] = useState<AttendanceReport | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceMap, setAttendanceMap] = useState<Record<number, AttendanceStatus>>({})
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const { isStaff, isStudent } = useAuth()
  const { showToast } = useToast()

  const loadAthletes = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await athletesAPI.getAll()
      const ath = parseListResponse(res.data)
      setAthletes(ath)
      const map: Record<number, AttendanceStatus> = {}
      ath.forEach((a) => { map[a.id] = 'Present' })
      setAttendanceMap(map)
    } catch (err) {
      setLoadError(getLoadErrorMessage(err, 'attendance'))
    } finally {
      setLoading(false)
    }
  }

  const loadReport = async () => {
    try {
      const params: Record<string, string> = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      const res = await attendanceAPI.getReport(params)
      setReport(res.data)
    } catch {
      showToast('Failed to load report', 'error')
    }
  }

  useEffect(() => { loadAthletes(); loadReport() }, [])

  const handleBulkMark = async () => {
    setSaving(true)
    try {
      const records = Object.entries(attendanceMap).map(([id, status]) => ({
        athlete: Number(id), attendance_date: date, status, session_type: 'Training' as const,
      }))
      await attendanceAPI.bulkMark(records)
      showToast('Attendance marked for all athletes', 'success')
      loadReport()
    } catch {
      showToast('Failed to mark attendance', 'error')
    } finally {
      setSaving(false)
    }
  }

  const statusChart = report ? {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{ data: [report.present, report.absent, report.late], backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'], borderWidth: 0 }],
  } : null

  if (loading) {
    return (
      <div>
        <PageHeader title={isStudent ? 'My Attendance' : 'Attendance Monitoring'} description="Loading..." />
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={isStudent ? 'My Attendance' : 'Attendance Monitoring'}
        description={isStudent ? 'Your session history and attendance rate' : 'Session tracking · Attendance rates · Team compliance'}
      />

      {loadError && (
        <Card className="mb-6 flex items-center justify-between p-4">
          <p className="font-body text-sm text-accent-hover">{loadError}</p>
          <button onClick={loadAthletes} className="font-body text-xs font-semibold uppercase text-accent hover:text-accent-hover">Retry</button>
        </Card>
      )}

      {isStaff && (
        <Card className="mb-6 p-6">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-widest text-text-muted">Session Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-3 block rounded-xl border border-border bg-surface px-4 py-2.5 font-body text-sm text-text outline-none focus:border-accent" />
            </div>
            <Button size="sm" magnetic={false} className="ml-auto" onClick={handleBulkMark} disabled={saving}>
              {saving ? 'Saving...' : 'Save All Attendance'}
            </Button>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {athletes.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-border bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-body text-sm font-semibold text-text">{a.full_name}</p>
                  <p className="truncate font-body text-xs text-text-muted">{a.sport}</p>
                </div>
                <select
                  value={attendanceMap[a.id] || 'Present'}
                  onChange={(e) => setAttendanceMap({ ...attendanceMap, [a.id]: e.target.value as AttendanceStatus })}
                  className="rounded-lg border border-border bg-background px-2 py-1.5 font-body text-xs text-text outline-none focus:border-accent"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Excused">Excused</option>
                </select>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="mb-4 font-display text-base font-bold text-text">{isStaff ? 'Attendance Analytics' : 'My Attendance History'}</h3>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-xl border border-border bg-surface px-4 py-2.5 font-body text-sm text-text outline-none focus:border-accent" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-xl border border-border bg-surface px-4 py-2.5 font-body text-sm text-text outline-none focus:border-accent" />
          <Button size="sm" magnetic={false} onClick={loadReport}>Apply Filter</Button>
        </div>

        {report && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard icon={CheckCircle2} label="Present" value={report.present} accent />
              <StatCard icon={XCircle} label="Absent" value={report.absent} />
              <StatCard icon={Clock} label="Late" value={report.late} />
              <StatCard icon={ClipboardCheck} label="Attendance Rate" value={report.attendance_rate} suffix="%" />
            </div>

            {statusChart && (
              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                  <CardHeader><CardTitle>Status Breakdown</CardTitle></CardHeader>
                  <CardContent style={{ height: 220 }}><Doughnut data={statusChart} options={donutLegendOptions} /></CardContent>
                </Card>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-2">
                  {report.records.slice(0, 12).map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-white/[0.03] px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-body text-sm font-semibold text-text">{r.athlete_name}</p>
                        <p className="truncate font-body text-xs text-text-muted">{r.attendance_date} · {r.session_type}</p>
                      </div>
                      <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
