import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip } from 'chart.js'
import { ACCENT, baseChartOptions, SUCCESS } from '../../utils/chartTheme'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip)

const ATHLETE_IMG = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80'

export default function HeroShowcase() {
  const [chartsReady, setChartsReady] = useState(false)

  useEffect(() => {
    setChartsReady(true)
  }, [])

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
    <motion.div
      className="hero-showcase"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="hero-showcase-image-wrap">
        <img src={ATHLETE_IMG} alt="Elite athlete training" className="hero-showcase-image" />
      </div>

      <div className="hero-float-grid">
        {[
          { label: 'Readiness', value: '87', cls: 'success' },
          { label: 'Recovery', value: '74%', cls: 'accent' },
          { label: 'Injury Risk', value: '22%', cls: 'danger' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            className="hero-float-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.15, duration: 0.5 }}
          >
            <span className="label">{card.label}</span>
            <span className={`value ${card.cls}`}>{card.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="hero-mini-charts">
        <div className="hero-mini-chart-card">
          <span className="chart-label">Weight Tracking</span>
          <div style={{ height: 72 }}>
            {chartsReady ? <Line data={weightChart} options={chartOpts} /> : null}
          </div>
        </div>
        <div className="hero-mini-chart-card">
          <span className="chart-label">Performance Analytics</span>
          <div style={{ height: 72 }}>
            {chartsReady ? <Line data={perfChart} options={chartOpts} /> : null}
          </div>
        </div>
      </div>
    </motion.div>
  )
}