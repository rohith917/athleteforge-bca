/** MDNT-inspired chart theme — coral, lime, editorial dark */
export const ACCENT = '#ff3d3d'
export const GOLD = '#ff3d3d'
export const GOLD_HOVER = '#ff5555'
export const MEDAL_GOLD = '#c8f542'
export const TEXT = '#94a3b8'
export const GRID = 'rgba(255,255,255,0.06)'
export const SUCCESS = '#c8f542'
export const WARNING = '#ff9f43'
export const DANGER = '#ff3d3d'
export const BLUE = '#60A5FA'

export const chartDefaults = {
  color: TEXT,
  borderColor: GRID,
  font: { family: 'Inter, sans-serif' },
}

export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#161616',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: '#ffffff',
      bodyColor: '#94a3b8',
      padding: 12,
    },
  },
}

export const sparklineOptions = {
  ...baseChartOptions,
  scales: { x: { display: false }, y: { display: false } },
  elements: { point: { radius: 0 }, line: { tension: 0.4, borderWidth: 2 } },
  plugins: { ...baseChartOptions.plugins, tooltip: { enabled: false } },
}