/**
 * Theme context — dark / light mode. Only admins may toggle; others always see light.
 */
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('athleteforge-theme') || 'dark')
  const [forcedLight, setForcedLight] = useState(false)

  const effectiveTheme = forcedLight ? 'light' : theme

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', effectiveTheme)
    root.style.colorScheme = effectiveTheme
    document.body.setAttribute('data-theme', effectiveTheme)
    root.classList.toggle('theme-dark', effectiveTheme === 'dark')
    root.classList.toggle('theme-light', effectiveTheme === 'light')
    if (!forcedLight) localStorage.setItem('athleteforge-theme', theme)
  }, [effectiveTheme, forcedLight, theme])

  const toggleTheme = () => {
    if (forcedLight) return
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }

  const setThemeMode = (next) => {
    if (forcedLight) return
    setTheme(next === 'light' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{
      theme: effectiveTheme,
      toggleTheme,
      setTheme: setThemeMode,
      isDark: effectiveTheme === 'dark',
      setForcedLight,
      canToggleTheme: !forcedLight,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}