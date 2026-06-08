/** Light luxury chart theme */
export const ACCENT = '#5B5CF6'
export const GOLD = ACCENT
export const GOLD_HOVER = '#818CF8'
export const MEDAL_GOLD = '#D4AF37'
export const TEXT = '#6B7280'
export const GRID = '#F3F4F6'
export const SUCCESS = '#22C55E'
export const WARNING = '#F59E0B'
export const DANGER = '#EF4444'
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
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      titleColor: '#111827',
      bodyColor: '#6B7280',
      padding: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
  },
}

export const sparklineOptions = {
  ...baseChartOptions,
  scales: { x: { display: false }, y: { display: false } },
  elements: { point: { radius: 0 }, line: { tension: 0.4, borderWidth: 2 } },
  plugins: { ...baseChartOptions.plugins, tooltip: { enabled: false } },
}