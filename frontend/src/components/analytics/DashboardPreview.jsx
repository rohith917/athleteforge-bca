import { Line, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip } from 'chart.js'
import { baseChartOptions, GOLD, SUCCESS, WARNING, DANGER } from '../../utils/chartTheme'

ChartJS.register(ArcElement, CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip)

export default function DashboardPreview() {
  const weightTrend = {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
    datasets: [{
      data: [78.2, 77.8, 77.1, 76.5, 76.0, 75.4],
      borderColor: GOLD,
      backgroundColor: 'rgba(212, 175, 55, 0.12)',
      fill: true,
      tension: 0.4,
    }],
  }

  const perfTrend = {
    labels: ['M', 'T', 'W', 'T', 'F', 'S'],
    datasets: [{
      data: [72, 74, 76, 75, 78, 81],
      borderColor: SUCCESS,
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  }

  const gauge = (score, color, label) => (
    <div className="preview-gauge" key={label}>
      <Doughnut
        data={{
          datasets: [{
            data: [score, 100 - score],
            backgroundColor: [color, 'rgba(255,255,255,0.06)'],
            borderWidth: 0,
            circumference: 270,
            rotation: 225,
          }],
        }}
        options={{ cutout: '78%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }}
      />
      <div className="preview-gauge-center">
        <strong>{score}</strong>
        <small>{label}</small>
      </div>
    </div>
  )

  return (
    <div className="dashboard-preview glass-card">
      <div className="preview-header">
        <span className="preview-live"><span className="live-dot" /> Live Analytics</span>
        <span className="preview-badge">Performance Intelligence</span>
      </div>
      <div className="preview-gauges">
        {gauge(87, SUCCESS, 'Readiness')}
        {gauge(74, GOLD, 'Recovery')}
        {gauge(22, DANGER, 'Injury Risk')}
      </div>
      <div className="preview-charts">
        <div className="preview-mini-chart">
          <span className="preview-chart-label">Weight Trend (kg)</span>
          <div style={{ height: 90 }}>
            <Line data={weightTrend} options={{ ...baseChartOptions, scales: { x: { display: false }, y: { display: false } }, elements: { point: { radius: 0 } } }} />
          </div>
        </div>
        <div className="preview-mini-chart">
          <span className="preview-chart-label">Performance Analytics</span>
          <div style={{ height: 90 }}>
            <Line data={perfTrend} options={{ ...baseChartOptions, scales: { x: { display: false }, y: { display: false } }, elements: { point: { radius: 0 } } }} />
          </div>
        </div>
      </div>
      <div className="preview-footer-stats">
        <div><span className="val">94%</span><span className="lbl">Attendance</span></div>
        <div><span className="val" style={{ color: WARNING }}>3</span><span className="lbl">High Risk</span></div>
        <div><span className="val" style={{ color: SUCCESS }}>12</span><span className="lbl">Comp. Ready</span></div>
      </div>
    </div>
  )
}