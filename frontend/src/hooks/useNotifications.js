/**
 * Derives in-app alerts from existing data: competitions coming up soon,
 * and injuries that need a recovery follow-up.
 */
import { useState, useEffect, useCallback } from 'react'
import { competitionsAPI, injuriesAPI, withApiReady } from '../services/api'
import { parseListResponse } from '../utils/apiHelpers'
import { useAuth } from '../context/AuthContext'

const UPCOMING_DAYS = 7
const OVERDUE_GRACE_DAYS = 0

function daysBetween(dateStr) {
  const target = new Date(dateStr)
  if (Number.isNaN(target.getTime())) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - now) / 86400000)
}

export function useNotifications() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) { setAlerts([]); return }
    setLoading(true)
    try {
      const [compRes, injRes] = await Promise.all([
        withApiReady(() => competitionsAPI.getAll()).catch(() => null),
        withApiReady(() => injuriesAPI.getAll()).catch(() => null),
      ])

      const next = []

      if (compRes) {
        const competitions = parseListResponse(compRes.data)
        competitions.forEach((c) => {
          const d = daysBetween(c.competition_date)
          if (d !== null && d >= 0 && d <= UPCOMING_DAYS) {
            next.push({
              id: `comp-${c.id}`,
              type: 'competition',
              severity: d <= 2 ? 'high' : 'medium',
              message: d === 0 ? `${c.name} is today` : `${c.name} in ${d} day${d === 1 ? '' : 's'}`,
              link: '/dashboard/competitions',
            })
          }
        })
      }

      if (injRes) {
        const injuries = parseListResponse(injRes.data)
        injuries.forEach((inj) => {
          if (inj.recovery_status === 'Recovered') return
          const athleteName = inj.athlete_name || 'Athlete'
          if (inj.expected_recovery_date) {
            const d = daysBetween(inj.expected_recovery_date)
            if (d !== null && d <= OVERDUE_GRACE_DAYS) {
              next.push({
                id: `injury-overdue-${inj.id}`,
                type: 'injury',
                severity: 'high',
                message: `${athleteName}'s recovery follow-up is overdue (${inj.injury_type})`,
                link: '/dashboard/injuries',
              })
              return
            }
          }
          if (inj.severity === 'Severe') {
            next.push({
              id: `injury-severe-${inj.id}`,
              type: 'injury',
              severity: 'medium',
              message: `${athleteName} has a severe ${inj.injury_type} injury in recovery`,
              link: '/dashboard/injuries',
            })
          }
        })
      }

      setAlerts(next)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  return { alerts, loading, refresh }
}
