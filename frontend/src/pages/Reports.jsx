/**
 * Reporting System — one-click PDF and Excel exports
 */
import { reportsAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import { FaFilePdf, FaFileExcel, FaDownload, FaFileAlt, FaBandAid, FaClipboardCheck, FaTrophy } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'

const reports = [
  { type: 'athletes', title: 'Athlete Report', desc: 'Complete roster with contact details and status', format: 'pdf', icon: FaFilePdf },
  { type: 'performance', title: 'Performance Report', desc: 'Speed, strength, endurance, agility metrics', format: 'pdf', icon: FaFilePdf },
  { type: 'injuries', title: 'Injury Report', desc: 'Severity, recovery status, and medical notes', format: 'pdf', icon: FaBandAid },
  { type: 'athletes', title: 'Athletes Export', desc: 'Spreadsheet export for roster analysis', format: 'excel', icon: FaFileExcel },
  { type: 'performance', title: 'Performance Export', desc: 'All performance metrics in Excel format', format: 'excel', icon: FaFileExcel },
  { type: 'attendance', title: 'Attendance Export', desc: 'Session records with dates and status', format: 'excel', icon: FaClipboardCheck },
]

export default function Reports() {
  const { showToast } = useToast()

  const handleExport = (report) => {
    const ext = report.format === 'pdf' ? 'pdf' : 'xlsx'
    const url = report.format === 'pdf'
      ? reportsAPI.downloadPDF(report.type)
      : reportsAPI.downloadExcel(report.type)
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.type}_${report.format === 'pdf' ? 'report' : 'export'}.${ext}`
    link.click()
    showToast(`Generating ${report.title}...`, 'info')
  }

  return (
    <div className="animate-in dashboard-luxury">
      <PageHeader
        title="Reporting Center"
        subtitle="One-click exports · PDF reports · Excel spreadsheets"
      />

      <div className="reports-grid-premium mb-4">
        {reports.map((r) => (
          <div className={`report-card-premium ${r.format}`} key={`${r.type}-${r.format}`}>
            <div className="icon-wrap"><r.icon /></div>
            <h5>{r.title}</h5>
            <p>{r.desc}</p>
            <button
              type="button"
              className={r.format === 'pdf' ? 'btn-export-pdf' : 'btn-export-excel'}
              onClick={() => handleExport(r)}
            >
              <FaDownload /> Export {r.format === 'pdf' ? 'PDF' : 'Excel'}
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <FaFileAlt style={{ fontSize: '2rem', color: 'var(--af-gold)' }} />
          <div>
            <strong style={{ color: 'var(--af-text)' }}>Enterprise Report Generation</strong>
            <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Reports are generated server-side using ReportLab (PDF) and OpenPyXL (Excel).
              Available exports: Athlete, Performance, Injury, Attendance, Recovery, and Competition reports.
            </p>
          </div>
          <div className="d-flex gap-2 ms-auto flex-wrap">
            <span className="badge-pill badge-active"><FaTrophy /> Competition</span>
            <span className="badge-pill badge-recovering"><FaBandAid /> Recovery</span>
          </div>
        </div>
      </div>
    </div>
  )
}