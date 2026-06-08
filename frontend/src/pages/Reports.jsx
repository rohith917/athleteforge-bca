/**
 * Reports page — PDF and Excel export with premium cards.
 */
import { reportsAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import { FaFilePdf, FaFileExcel, FaDownload, FaFileAlt } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'

const pdfReports = [
  { type: 'athletes', title: 'Athletes Report', desc: 'Complete list of all registered athletes with contact details', icon: FaFilePdf },
  { type: 'performance', title: 'Performance Report', desc: 'All performance records with speed, strength, and agility scores', icon: FaFilePdf },
  { type: 'injuries', title: 'Injury Report', desc: 'Injury records with severity, recovery status, and medical notes', icon: FaFilePdf },
]

const excelReports = [
  { type: 'athletes', title: 'Athletes Export', desc: 'Export athlete data to Excel spreadsheet for analysis', icon: FaFileExcel },
  { type: 'performance', title: 'Performance Export', desc: 'Export performance metrics to Excel format', icon: FaFileExcel },
  { type: 'attendance', title: 'Attendance Export', desc: 'Export attendance records with dates and status', icon: FaFileExcel },
]

export default function Reports() {
  const { showToast } = useToast()

  const downloadFile = (url, filename) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    showToast(`Downloading ${filename}...`, 'info')
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="Reports"
        subtitle="AthleteForge — Export PDF reports and Excel spreadsheets"
      />

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card-panel" style={{ minHeight: 400 }}>
            <h5 className="card-panel-title"><FaFilePdf /> PDF Reports</h5>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
              Generate formatted PDF reports for printing and documentation.
            </p>
            {pdfReports.map(r => (
              <div className="report-card" key={r.type}>
                <div>
                  <strong style={{ color: 'var(--navy-800)' }}>{r.title}</strong>
                  <br /><small style={{ color: 'var(--text-muted)' }}>{r.desc}</small>
                </div>
                <button className="btn-export-pdf" onClick={() => downloadFile(reportsAPI.downloadPDF(r.type), `${r.type}_report.pdf`)}>
                  <FaDownload /> PDF
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card-panel" style={{ minHeight: 400 }}>
            <h5 className="card-panel-title"><FaFileExcel /> Excel Exports</h5>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
              Export data to Excel spreadsheets for further analysis.
            </p>
            {excelReports.map(r => (
              <div className="report-card" key={r.type}>
                <div>
                  <strong style={{ color: 'var(--navy-800)' }}>{r.title}</strong>
                  <br /><small style={{ color: 'var(--text-muted)' }}>{r.desc}</small>
                </div>
                <button className="btn-export-excel" onClick={() => downloadFile(reportsAPI.downloadExcel(r.type), `${r.type}_export.xlsx`)}>
                  <FaDownload /> Excel
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-panel mt-2">
        <div className="d-flex align-items-center gap-3">
          <FaFileAlt style={{ fontSize: '2rem', color: 'var(--gold-500)' }} />
          <div>
            <strong>Report Generation</strong>
            <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Reports are generated server-side using ReportLab (PDF) and OpenPyXL (Excel). Ensure the backend server is running before downloading.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}