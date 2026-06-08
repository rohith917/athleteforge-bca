/**
 * Attendance tracking — bulk mark and reports.
 */
import { useState, useEffect } from 'react'
import { attendanceAPI, athletesAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import { FaClipboardCheck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Attendance() {
  const [athletes, setAthletes] = useState([])
  const [report, setReport] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceMap, setAttendanceMap] = useState({})
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    athletesAPI.getAll().then(res => {
      const ath = res.data.results || res.data
      setAthletes(ath)
      const map = {}; ath.forEach(a => { map[a.id] = 'Present' })
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

  if (loading) return <LoadingSpinner message="Loading..." fullScreen />

  return (
    <div className="animate-in">
      <PageHeader title="Attendance Tracking" subtitle="Mark daily attendance and view reports" />

      <div className="card-panel">
        <h5 className="card-panel-title"><FaClipboardCheck /> Mark Attendance</h5>
        <div className="mb-3" style={{ maxWidth: 220 }}>
          <label className="form-label-custom">Date</label>
          <input type="date" className="form-control-custom" value={date}
            onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="table-responsive">
          <table className="table-custom">
            <thead><tr><th>Athlete</th><th>Sport</th><th>Status</th></tr></thead>
            <tbody>
              {athletes.map(a => (
                <tr key={a.id}>
                  <td>{a.full_name || `${a.first_name} ${a.last_name}`}</td>
                  <td>{a.sport}</td>
                  <td>
                    <select className="form-select-custom" style={{ maxWidth: 150, padding: '6px 10px' }}
                      value={attendanceMap[a.id] || 'Present'}
                      onChange={(e) => setAttendanceMap({ ...attendanceMap, [a.id]: e.target.value })}>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                      <option value="Excused">Excused</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn-gold mt-3" onClick={handleBulkMark} disabled={saving}>
          {saving ? 'Saving...' : 'Mark Attendance for All'}
        </button>
      </div>

      <div className="card-panel">
        <h5 className="card-panel-title">Attendance Reports</h5>
        <div className="search-bar mb-4">
          <input type="date" className="form-control-custom" style={{ maxWidth: 200 }}
            value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input type="date" className="form-control-custom" style={{ maxWidth: 200 }}
            value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <button className="btn-navy" onClick={loadReport}>Filter</button>
        </div>

        {report && (
          <>
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3"><StatCard icon={FaCheckCircle} value={report.present} label="Present" variant="success" /></div>
              <div className="col-6 col-md-3"><StatCard icon={FaTimesCircle} value={report.absent} label="Absent" variant="danger" /></div>
              <div className="col-6 col-md-3"><StatCard icon={FaClipboardCheck} value={report.late} label="Late" variant="gold" /></div>
              <div className="col-6 col-md-3"><StatCard icon={FaClipboardCheck} value={`${report.attendance_rate}%`} label="Rate" variant="primary" /></div>
            </div>
            <div className="table-responsive">
              <table className="table-custom">
                <thead><tr><th>Athlete</th><th>Date</th><th>Status</th><th>Session</th></tr></thead>
                <tbody>
                  {report.records.map(r => (
                    <tr key={r.id}>
                      <td>{r.athlete_name}</td><td>{r.attendance_date}</td>
                      <td><span className={`badge-pill ${r.status === 'Present' ? 'badge-active' : r.status === 'Absent' ? 'badge-injured' : 'badge-recovering'}`}>{r.status}</span></td>
                      <td>{r.session_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}