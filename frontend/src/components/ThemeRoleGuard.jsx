/**
 * Non-admin users and public pages always use light mode.
 * Only admins may switch to dark mode.
 */
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function ThemeRoleGuard() {
  const { user, isAdmin, loading } = useAuth()
  const { setForcedLight } = useTheme()

  useEffect(() => {
    if (loading) {
      setForcedLight(true)
      return
    }
    setForcedLight(!isAdmin)
  }, [user, isAdmin, loading, setForcedLight])

  return null
}