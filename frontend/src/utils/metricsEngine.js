/** Sports science metrics — readiness, recovery, injury risk */

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