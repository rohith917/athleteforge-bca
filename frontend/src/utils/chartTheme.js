/** Shared Chart.js theme — luxury sports analytics */
export const GOLD = '#D4AF37'
export const GOLD_HOVER = '#F5C542'
export const TEXT = '#94A3B8'
export const GRID = 'rgba(148, 163, 184, 0.08)'
export const SUCCESS = '#22C55E'
export const WARNING = '#F59E0B'
export const DANGER = '#EF4444'

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
      backgroundColor: '#1A1A1A',
      borderColor: 'rgba(212, 175, 55, 0.3)',
      borderWidth: 1,
      titleColor: '#F8FAFC',
      bodyColor: TEXT,
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