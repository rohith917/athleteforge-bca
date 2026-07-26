import { Radar } from 'react-chartjs-2'
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js'
import { ACCENT, baseChartOptions } from '../../utils/chartTheme'
import { useTheme } from '../../context/ThemeContext'
import useChartsReady from '../../hooks/useChartsReady'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler)

export default function PerformanceRadar({ scores = {}, bare = false }) {
  const ready = useChartsReady()
  const { isDark } = useTheme()
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'
  const angleColor = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'
  const labelColor = isDark ? '#9CA3AF' : '#6B7280'
  const data = {
    labels: ['Speed', 'Strength', 'Power', 'Endurance', 'Flexibility', 'Agility', 'Recovery'],
    datasets: [{
      data: [
        scores.speed ?? 78,
        scores.strength ?? 82,
        scores.power ?? 75,
        scores.endurance ?? 80,
        scores.flexibility ?? 70,
        scores.agility ?? 85,
        scores.recovery ?? 72,
      ],
      borderColor: ACCENT,
      backgroundColor: 'rgba(255, 61, 61, 0.12)',
      pointBackgroundColor: ACCENT,
    }],
  }

  const chart = (
    <div style={{ height: 280 }}>
      {ready && (
        <Radar
          data={data}
          options={{
            ...baseChartOptions,
            scales: {
              r: {
                min: 0, max: 100,
                ticks: { display: false, stepSize: 20 },
                grid: { color: gridColor },
                angleLines: { color: angleColor },
                pointLabels: { color: labelColor, font: { size: 11, family: 'Inter' } },
              },
            },
          }}
        />
      )}
    </div>
  )

  if (bare) return chart

  return (
    <div className="performance-radar glass-card">
      <h6 className="analytics-card-title">Performance Analytics</h6>
      {chart}
    </div>
  )
}