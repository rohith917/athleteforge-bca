/**
 * Attendance Monitoring — card-based marking and analytics
 */
import { useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { attendanceAPI, athletesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FaClipboardCheck, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/analytics/KpiCard'
import { baseChartOptions } from '../utils/chartTheme'
import { Skeleton } from '../components/ui/Skeleton'

ChartJS.register(ArcElement, Tooltip, Legend)

const STATUS_CLASS = { Present: 'present', Absent: 'absent', Late: 'late', Excused: 'late' }

export default function Attendance() {
  const [athletes, setAthletes] = useState([])
  const [report, setReport] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceMap, setAttendanceMap] = useState({})
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const { isCoach } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    athletesAPI.getAll().then((res) => {
      const ath = res.data.results || res.data
      setAthletes(ath)
      const map = {}; ath.forEach((a) => { map[a.id] = 'Present' })
      setAttendanceMap(map)
    }).finally(() => setLoading(false))
    loadReport()
  }, [])

  const loadReport = async () => {
    try {
      const params = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      const res = await attendanceAPI.getReport(params)
      setReport(res.data)
    } catch { showToast('Failed to load report', 'error') }
  }

  const handleBulkMark = async () => {
    setSaving(true)
    try {
      const records = Object.entries(attendanceMap).map(([id, status]) => ({
        athlete: parseInt(id), attendance_date: date, status, session_type: 'Training',
      }))
      await attendanceAPI.bulkMark(records)
      showToast('Attendance marked for all athletes')
      loadReport()
    } catch { showToast('Failed to mark attendance', 'error') }
    finally { setSaving(false) }
  }

  const statusChart = report ? {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{
      data: [report.present, report.absent, report.late],
      backgroundColor: ['#22C55E', '#EF4444', '#F59E0B'],
      borderWidth: 0,
    }],
  } : null

  if (loading) return (
    <div className="animate-in dashboard-luxury">
      <PageHeader title="Attendance Monitoring" subtitle="Loading..." />
      <Skeleton className="skeleton-kpi" />
    </div>
  )

  return (
    <div className="animate-in dashboard-luxury">
      <PageHeader
        title="Attendance Monitoring"
        subtitle="Session tracking · Attendance rates · Team compliance"
      />

      {isCoach && (
        <div className="glass-card mb-4">
          <h6 className="analytics-card-title"><FaClipboardCheck /> Mark Daily Attendance</h6>
          <div className="filter-bar-premium mb-3" style={{ marginBottom: 16 }}>
            <label className="form-label-custom mb-0">Session Date</label>
            <input type="date" className="form-control-custom" style={{ maxWidth: 200 }} value={date}
              onChange={(e) => setDate(e.target.value)} />
            <button type="button" className="btn-gold ms-auto" onClick={handleBulkMark} disabled={saving}>
              {saving ? 'Saving...' : 'Save All Attendance'}
            </button>
          </div>
          <div className="attendance-grid">
            {athletes.map((a) => {
              const status = attendanceMap[a.id] || 'Present'
              return (
                <div className={`attendance-athlete-card ${STATUS_CLASS[status] || ''}`} key={a.id}>
                  <div>
                    <strong>{a.full_name || `${a.first_name} ${a.last_name}`}</strong>
                    <small className="d-block text-muted">{a.sport}</small>
                  </div>
                  <select className="form-select-custom" style={{ maxWidth: 130, padding: '6px 10px', fontSize: '0.8rem' }}
                    value={status}
                    onChange={(e) => setAttendanceMap({ ...attendanceMap, [a.id]: e.target.value })}>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="Excused">Excused</option>
                  </select>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="glass-card">
        <h6 className="analytics-card-title">{isCoach ? 'Attendance Analytics' : 'My Attendance History'}</h6>
        <div className="filter-bar-premium mb-4">
          <input type="date" className="form-control-custom" style={{ maxWidth: 180 }}
            value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input type="date" className="form-control-custom" style={{ maxWidth: 180 }}
            value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <button type="button" className="btn-gold" onClick={loadReport}>Apply Filter</button>
        </div>

        {report && (
          <>
            <div className="row g-3 mb-4">
              <div className="col-sm-6 col-xl-3">
                <KpiCard icon={FaCheckCircle} label="Present" value={report.present} variant="success" />
              </div>
              <div className="col-sm-6 col-xl-3">
                <KpiCard icon={FaTimesCircle} label="Absent" value={report.absent} variant="danger" />
              </div>
              <div className="col-sm-6 col-xl-3">
                <KpiCard icon={FaClock} label="Late" value={report.late} variant="warning" />
              </div>
              <div className="col-sm-6 col-xl-3">
                <KpiCard icon={FaClipboardCheck} label="Attendance Rate" value={`${report.attendance_rate}%`} variant="gold" sparkData={[75, 80, 82, report.attendance_rate]} />
              </div>
            </div>

            {statusChart && (
              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div className="chart-panel-premium" style={{ minHeight: 240 }}>
                    <h6>Status Breakdown</h6>
                    <div style={{ height: 180 }}>
                      <Doughnut data={statusChart} options={{
                        ...baseChartOptions,
                        cutout: '60%',
                        plugins: { ...baseChartOptions.plugins, legend: { position: 'bottom', labels: { color: '#94A3B8' } } },
                      }} />
                    </div>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="attendance-grid">
                    {report.records.slice(0, 12).map((r) => (
                      <div className={`attendance-athlete-card ${STATUS_CLASS[r.status] || ''}`} key={r.id}>
                        <div>
                          <strong>{r.athlete_name}</strong>
                          <small className="d-block text-muted">{r.attendance_date} · {r.session_type}</small>
                        </div>
                        <span className={`badge-pill ${r.status === 'Present' ? 'badge-active' : r.status === 'Absent' ? 'badge-injured' : 'badge-recovering'}`}>
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  {report.records.length > 12 && (
                    <p className="text-muted mt-3" style={{ fontSize: '0.82rem' }}>
                      Showing 12 of {report.records.length} records
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}