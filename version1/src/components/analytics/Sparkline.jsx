import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Filler } from 'chart.js'
import { sparklineOptions, GOLD } from '../../utils/chartTheme'
import useChartsReady from '../../hooks/useChartsReady'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler)

export default function Sparkline({ data = [4, 6, 5, 8, 7, 9, 8], color = GOLD, height = 40 }) {
  const ready = useChartsReady()
  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [{
      data,
      borderColor: color,
      backgroundColor: `${color}22`,
      fill: true,
    }],
  }
  return (
    <div style={{ height }} className="sparkline-wrap">
      {ready ? <Line data={chartData} options={sparklineOptions} /> : null}
    </div>
  )
}