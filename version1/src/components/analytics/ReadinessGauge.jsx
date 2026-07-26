import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'
import { calcReadiness } from '../../utils/metricsEngine'
import { SUCCESS, WARNING, DANGER } from '../../utils/chartTheme'
import { useTheme } from '../../context/ThemeContext'
import ChartMount from '../charts/ChartMount'

ChartJS.register(ArcElement, Tooltip)

export default function ReadinessGauge({ wellness, score: fixedScore }) {
  const { isDark } = useTheme()
  const trackColor = isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'
  const { score, status, level } = fixedScore != null
    ? { score: fixedScore, status: fixedScore >= 80 ? 'Ready to Train' : fixedScore >= 60 ? 'Moderate Readiness' : 'Recovery Recommended', level: fixedScore >= 80 ? 'high' : fixedScore >= 60 ? 'medium' : 'low' }
    : calcReadiness(wellness || {})

  const color = level === 'high' ? SUCCESS : level === 'medium' ? WARNING : DANGER

  return (
    <div className="analytics-gauge-card glass-card">
      <h6 className="analytics-card-title">Athlete Readiness</h6>
      <div className="gauge-wrap">
        <ChartMount height={160} key={`readiness-${isDark}-${score}`}>
          <Doughnut
            data={{ datasets: [{ data: [score, 100 - score], backgroundColor: [color, trackColor], borderWidth: 0, circumference: 270, rotation: 225 }] }}
            options={{ cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }}
          />
        </ChartMount>
        <div className="gauge-center">
          <span className="gauge-score">{score}</span>
          <span className="gauge-unit">/ 100</span>
        </div>
      </div>
      <span className={`status-pill status-${level}`}>{status}</span>
      <div className="readiness-inputs">
        {['Sleep', 'Fatigue', 'Stress', 'Soreness', 'Mood', 'Hydration'].map((l) => (
          <span key={l} className="readiness-chip">{l}</span>
        ))}
      </div>
    </div>
  )
}