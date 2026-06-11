/**
 * Keep cinematic dark theme active for all roles (premium sports UI).
 */
import { useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeRoleGuard() {
  const { setForcedLight } = useTheme()

  useEffect(() => {
    setForcedLight(false)
  }, [setForcedLight])

  return null
}