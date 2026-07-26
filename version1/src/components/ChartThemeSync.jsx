/**
 * Keeps Chart.js default colors in sync with light/dark theme.
 */
import { useEffect } from 'react'
import { Chart as ChartJS } from 'chart.js'
import { useTheme } from '../context/ThemeContext'

export default function ChartThemeSync() {
  const { isDark } = useTheme()

  useEffect(() => {
    ChartJS.defaults.color = isDark ? '#9CA3AF' : '#6B7280'
    ChartJS.defaults.borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'
  }, [isDark])

  return null
}