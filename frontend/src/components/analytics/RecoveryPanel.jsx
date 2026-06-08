import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Filler } from 'chart.js'
import { calcRecoveryScore } from '../../utils/metricsEngine'
import { baseChartOptions, SUCCESS } from '../../utils/chartTheme'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler)

export default function RecoveryPanel({ stats }) {
  const { score, daysUntilReturn } = calcRecoveryScore(stats)
  const trend = stats?.monthly_attendance?.map((m) => m.rate) || [65, 68, 72, 70, 75, score]

  const chartData = {
    labels: trend.map((_, i) => `W${i + 1}`),
    datasets: [{
      data: trend,
      borderColor: SUCCESS,
      backgroundColor: 'rgba(34, 197, 94, 0.12)',
      fill: true,
      tension: 0.4,
    }],
  }

  return (
    <div className="recovery-panel glass-card">
      <h6 className="analytics-card-title">Recovery Dashboard</h6>
      <div className="recovery-score-row">
        <div>
          <span className="recovery-big">{score}%</span>
          <span className="recovery-label">Recovery Score</span>
        </div>
        {daysUntilReturn > 0 && (
          <div className="recovery-rtp">
            <span className="rtp-val">{Math.round(daysUntilReturn)}</span>
            <span className="rtp-lbl">Days to Return</span>
          </div>
        )}
      </div>
      <div className="progress-luxury">
        <div className="progress-luxury-fill" style={{ width: `${score}%` }} />
      </div>
      <div style={{ height: 120 }} className="mt-3">
        <Line data={chartData} options={{ ...baseChartOptions, scales: { x: { ticks: { color: '#9CA3AF', maxTicksLimit: 6 }, grid: { display: false } }, y: { min: 0, max: 100, ticks: { color: '#9CA3AF' }, grid: { color: '#F3F4F6' } } } }} />
      </div>
      <div className="rtp-workflow">
        {['Injured', 'Rehab', 'Light', 'Modified', 'Full', 'Comp Ready'].map((s, i) => (
          <span key={s} className={`rtp-step ${i <= 3 ? 'active' : ''}`}>{s}</span>
        ))}
      </div>
    </div>
  )
}