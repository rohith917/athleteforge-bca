import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement } from 'chart.js'
import { calcInjuryRisk } from '../../utils/metricsEngine'
import { SUCCESS, WARNING, DANGER } from '../../utils/chartTheme'

ChartJS.register(ArcElement)

export default function InjuryRiskGauge({ stats }) {
  const { risk, level } = calcInjuryRisk(stats)
  const color = level === 'High' ? DANGER : level === 'Medium' ? WARNING : SUCCESS

  return (
    <div className="analytics-gauge-card glass-card">
      <h6 className="analytics-card-title">Injury Risk Score</h6>
      <div className="gauge-wrap">
        <Doughnut
          data={{ datasets: [{ data: [risk, 100 - risk], backgroundColor: [color, 'rgba(255,255,255,0.06)'], borderWidth: 0, circumference: 270, rotation: 225 }] }}
          options={{ cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }}
        />
        <div className="gauge-center">
          <span className="gauge-score">{risk}</span>
          <span className="gauge-unit">%</span>
        </div>
      </div>
      <span className={`status-pill risk-${level.toLowerCase()}`}>{level} Risk</span>
      <ul className="risk-factors">
        <li>Training Load</li>
        <li>Injury History</li>
        <li>Recovery Status</li>
        <li>Attendance & Wellness</li>
      </ul>
    </div>
  )
}