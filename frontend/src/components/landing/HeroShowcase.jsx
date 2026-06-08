import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip } from 'chart.js'
import { ACCENT, baseChartOptions, SUCCESS, DANGER } from '../../utils/chartTheme'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip)

const ATHLETE_IMG = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80'

export default function HeroShowcase() {
  const weightChart = {
    labels: ['', '', '', '', '', ''],
    datasets: [{
      data: [78.2, 77.8, 77.1, 76.5, 76.0, 75.4],
      borderColor: ACCENT,
      backgroundColor: 'rgba(91, 92, 246, 0.06)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
    }],
  }

  const perfChart = {
    labels: ['', '', '', '', '', ''],
    datasets: [{
      data: [72, 74, 76, 75, 78, 81],
      borderColor: SUCCESS,
      backgroundColor: 'rgba(34, 197, 94, 0.06)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
    }],
  }

  const chartOpts = {
    ...baseChartOptions,
    scales: { x: { display: false }, y: { display: false } },
    elements: { point: { radius: 0 } },
  }

  return (
    <div className="hero-showcase">
      <div className="hero-showcase-image-wrap">
        <img src={ATHLETE_IMG} alt="Elite athlete training" className="hero-showcase-image" />
      </div>

      <div className="hero-float-grid">
        <div className="hero-float-card">
          <span className="label">Readiness</span>
          <span className="value success">87</span>
        </div>
        <div className="hero-float-card">
          <span className="label">Recovery</span>
          <span className="value accent">74%</span>
        </div>
        <div className="hero-float-card">
          <span className="label">Injury Risk</span>
          <span className="value danger">22%</span>
        </div>
      </div>

      <div className="hero-mini-charts">
        <div className="hero-mini-chart-card">
          <span className="chart-label">Weight Tracking</span>
          <div style={{ height: 72 }}>
            <Line data={weightChart} options={chartOpts} />
          </div>
        </div>
        <div className="hero-mini-chart-card">
          <span className="chart-label">Performance Analytics</span>
          <div style={{ height: 72 }}>
            <Line data={perfChart} options={chartOpts} />
          </div>
        </div>
      </div>
    </div>
  )
}