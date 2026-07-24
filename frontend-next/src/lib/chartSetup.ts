import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Filler, Tooltip, Legend, RadialLinearScale,
} from 'chart.js'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Filler, Tooltip, Legend, RadialLinearScale,
)

const TICK_COLOR = '#9ca3af'
const GRID_COLOR = 'rgba(255,255,255,0.06)'

export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#171717',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: '#ffffff',
      bodyColor: '#9ca3af',
      padding: 10,
      cornerRadius: 8,
    },
  },
}

export const axisChartOptions = {
  ...baseChartOptions,
  scales: {
    x: { ticks: { color: TICK_COLOR }, grid: { display: false } },
    y: { ticks: { color: TICK_COLOR }, grid: { color: GRID_COLOR } },
  },
}

export const donutLegendOptions = {
  ...baseChartOptions,
  cutout: '68%',
  plugins: {
    ...baseChartOptions.plugins,
    legend: { display: true, position: 'bottom' as const, labels: { color: TICK_COLOR, padding: 12, font: { size: 11 } } },
  },
}

export const CHART_PALETTE = ['#b11226', '#d7263d', '#ffffff', '#9ca3af', '#4b5563', '#6b7280']
