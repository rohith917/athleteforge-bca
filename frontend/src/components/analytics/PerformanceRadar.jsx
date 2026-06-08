import { Radar } from 'react-chartjs-2'
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js'
import { ACCENT, baseChartOptions } from '../../utils/chartTheme'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler)

export default function PerformanceRadar({ scores = {} }) {
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
      backgroundColor: 'rgba(91, 92, 246, 0.08)',
      pointBackgroundColor: ACCENT,
    }],
  }

  return (
    <div className="performance-radar glass-card">
      <h6 className="analytics-card-title">Performance Analytics</h6>
      <div style={{ height: 280 }}>
        <Radar
          data={data}
          options={{
            ...baseChartOptions,
            scales: {
              r: {
                min: 0, max: 100,
                ticks: { display: false, stepSize: 20 },
                grid: { color: '#F3F4F6' },
                angleLines: { color: '#E5E7EB' },
                pointLabels: { color: '#6B7280', font: { size: 11, family: 'Inter' } },
              },
            },
          }}
        />
      </div>
    </div>
  )
}