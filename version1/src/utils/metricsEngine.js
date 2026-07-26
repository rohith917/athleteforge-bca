/** Sports science metrics — readiness, recovery, injury risk */

const DAY_MS = 86400000

export function calcReadiness(wellness = {}) {
  const sleep = Math.min((wellness.sleep ?? 7) / 8, 1) * 20
  const fatigue = 20 - (wellness.fatigue ?? 3) * 4
  const stress = 15 - (wellness.stress ?? 3) * 3
  const soreness = 15 - (wellness.soreness ?? 3) * 3
  const mood = (wellness.mood ?? 3) * 5
  const hydration = Math.min((wellness.hydration ?? 2.5) / 3, 1) * 15
  const score = Math.round(Math.max(0, Math.min(100, sleep + fatigue + stress + soreness + mood + hydration)))
  let status = 'Recovery Recommended'
  let level = 'low'
  if (score >= 80) { status = 'Ready to Train'; level = 'high' }
  else if (score >= 60) { status = 'Moderate Readiness'; level = 'medium' }
  return { score, status, level }
}

export function calcInjuryRisk(stats = {}) {
  const load = stats.trainingLoad ?? 65
  const history = stats.injuryHistory ?? stats.active_injuries ?? 0
  const recovery = stats.recoveryScore ?? 70
  const attendance = stats.attendanceRate ?? 85
  const risk = Math.round(
    Math.min(100, Math.max(0,
      load * 0.3 + history * 8 + (100 - recovery) * 0.25 + (100 - attendance) * 0.2
    ))
  )
  let level = 'Low'
  if (risk >= 70) level = 'High'
  else if (risk >= 40) level = 'Medium'
  return { risk, level }
}

export function calcRecoveryScore(stats = {}) {
  const injured = stats.active_injuries ?? 0
  const athletes = Math.max(stats.total_athletes ?? 1, 1)
  const att = stats.monthly_attendance?.slice(-1)[0]?.rate ?? 80
  const base = 100 - (injured / athletes) * 35
  const score = Math.round(Math.max(0, Math.min(100, base * 0.6 + att * 0.4)))
  const daysUntilReturn = injured > 0 ? Math.max(3, 21 - score / 5) : 0
  return { score, daysUntilReturn }
}

export function deriveTeamOverview(stats) {
  const total = stats.total_athletes || 0
  const injured = stats.active_injuries || 0
  const att = stats.monthly_attendance?.slice(-1)[0]?.rate ?? 0
  const recovery = calcRecoveryScore(stats)
  return {
    totalAthletes: total,
    readyToTrain: Math.max(0, total - injured - Math.floor(total * 0.1)),
    highInjuryRisk: Math.min(injured + Math.floor(total * 0.08), total),
    competitionReady: stats.active_athletes || Math.max(0, total - injured),
    poorRecovery: Math.floor(injured * 0.6),
    attendanceSummary: att,
    avgRecovery: recovery.score,
  }
}

/** Training Load = Duration × RPE */
export function calcTrainingLoads(sessions = []) {
  const now = new Date()

  const loads = sessions.map((s) => ({
    ...s,
    load: s.load ?? (s.duration || 0) * (s.rpe || 0),
    ts: new Date(s.date).getTime(),
  }))

  const weekAgo = now.getTime() - 7 * DAY_MS
  const monthAgo = now.getTime() - 28 * DAY_MS

  const weeklyTotal = loads.filter((s) => s.ts >= weekAgo).reduce((a, s) => a + s.load, 0)
  const monthlyTotal = loads.filter((s) => s.ts >= monthAgo).reduce((a, s) => a + s.load, 0)
  const acute = weeklyTotal
  const chronic = monthlyTotal / 4 || 1
  const acr = acute / chronic

  const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weeklyLoads = weeklyLabels.map((_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().split('T')[0]
    return loads.filter((s) => s.date === key).reduce((a, s) => a + s.load, 0)
  })

  const trendLabels = Array.from({ length: 6 }, (_, i) => `W${i + 1}`)
  const acuteTrend = trendLabels.map((_, i) => Math.round(weeklyTotal * (0.7 + i * 0.05)))
  const chronicTrend = trendLabels.map((_, i) => Math.round(chronic * (0.85 + i * 0.03)))

  return { weeklyTotal, monthlyTotal, acr, weeklyLabels, weeklyLoads, trendLabels, acuteTrend, chronicTrend }
}

export function calcWeightCutProgress(records = [], targetWeight = null) {
  const sorted = [...records].sort((a, b) => new Date(b.record_date) - new Date(a.record_date))
  const latest = sorted[0]
  if (!latest) return { percent: 0, target: 0, remaining: 0, daysLeft: 0, estimatedDate: '—' }

  const start = sorted[sorted.length - 1]
  const startWeight = parseFloat(start.weight_kg)
  const current = parseFloat(latest.weight_kg)
  const target = targetWeight ?? Math.max(current - 3, startWeight * 0.92)
  const totalToCut = Math.max(startWeight - target, 0.1)
  const cutSoFar = Math.max(startWeight - current, 0)
  const percent = Math.min(100, Math.round((cutSoFar / totalToCut) * 100))
  const remaining = Math.max(target - current, 0)

  let daysLeft = 0
  if (sorted.length >= 2 && remaining > 0) {
    const prev = sorted[1]
    const rate = (parseFloat(prev.weight_kg) - current) / Math.max(1,
      (new Date(latest.record_date) - new Date(prev.record_date)) / DAY_MS)
    daysLeft = rate > 0 ? Math.ceil(remaining / rate) : 14
  } else {
    daysLeft = remaining > 0 ? 14 : 0
  }

  const est = new Date()
  est.setDate(est.getDate() + daysLeft)
  const estimatedDate = remaining > 0 ? est.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Achieved'

  return { percent, target: target.toFixed(1), remaining, daysLeft, estimatedDate }
}