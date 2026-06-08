/**
 * Theme context — dark / light mode. Only admins may toggle; others always see light.
 */
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('athleteforge-theme') || 'light')
  const [forcedLight, setForcedLight] = useState(false)

  const effectiveTheme = forcedLight ? 'light' : theme

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme)
    if (!forcedLight) localStorage.setItem('athleteforge-theme', theme)
  }, [effectiveTheme, forcedLight, theme])

  const toggleTheme = () => {
    if (forcedLight) return
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{
      theme: effectiveTheme,
      toggleTheme,
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