/**
 * Premium athlete profile — sports science intelligence
 */
import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { athletesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { FaEdit, FaArrowLeft, FaEnvelope, FaPhone, FaRulerVertical, FaBirthdayCake, FaChartLine, FaBandAid } from 'react-icons/fa'
import AthleteAvatar from '../components/AthleteAvatar'
import LoadingSpinner from '../components/LoadingSpinner'
import PerformanceRadar from '../components/analytics/PerformanceRadar'
import ReadinessGauge from '../components/analytics/ReadinessGauge'
import InjuryRiskGauge from '../components/analytics/InjuryRiskGauge'
import ActivityTimeline from '../components/analytics/ActivityTimeline'
import { calcRecoveryScore } from '../utils/metricsEngine'

export default function AthleteProfile() {
  const { id } = useParams()
  const { isStudent, isStaff, user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const studentOwnsProfile = !isStudent || (user?.athlete_id && String(user.athlete_id) === String(id))

  useEffect(() => {
    if (!studentOwnsProfile) {
      setLoading(false)
      return
    }
    athletesAPI.getProfile(id).then((res) => setProfile(res.data))
      .catch(console.error).finally(() => setLoading(false))
  }, [id, studentOwnsProfile])

  if (isStudent && !user?.athlete_id) {
    return <Navigate to="/dashboard" replace />
  }

  if (isStudent && !studentOwnsProfile) {
    return <Navigate to={`/dashboard/athletes/${user.athlete_id}`} replace />
  }

  if (loading) return <LoadingSpinner message="Loading athlete intelligence..." fullScreen />
  if (!profile) return <div className="alert-custom alert-danger-custom">Athlete not found.</div>

  const lp = profile.latest_performance || {}
  const radarScores = {
    speed: lp.speed_score, strength: lp.strength_score, endurance: lp.endurance_score,
    flexibility: lp.flexibility_score, agility: lp.agility_score,
    power: lp.strength_score, recovery: calcRecoveryScore({ active_injuries: profile.active_injuries?.length || 0, total_athletes: 1 }).score,
  }

  const infoItems = [
    { icon: FaEnvelope, label: 'Email', val: profile.email },
    { icon: FaPhone, label: 'Phone', val: profile.phone },
    { icon: FaBirthdayCake, label: 'Age', val: profile.age ? `${profile.age} yrs` : null },
    { icon: FaRulerVertical, label: 'Height', val: profile.height_cm ? `${profile.height_cm} cm` : null },
  ]

  const metrics = [
    { label: 'Performance', val: profile.performance_count },
    { label: 'Injuries', val: profile.injury_count },
    { label: 'Competitions', val: profile.competition_count },
    { label: 'Attendance', val: profile.attendance_count },
  ]

  const rtpSteps = ['Injured', 'Rehabilitation', 'Light Training', 'Modified', 'Full Training', 'Comp Ready']
  const activeInjury = profile.active_injuries?.[0]

  const backTo = isStudent ? '/dashboard' : '/dashboard/athletes'
  const backLabel = isStudent ? 'My Dashboard' : 'Back to Roster'

  return (
    <div className={`animate-in ${isStudent ? 'student-panel' : 'coach-panel'}`}>
      <div className="d-flex justify-content-between mb-3 flex-wrap gap-2">
        <Link to={backTo} className="btn-outline-gold text-decoration-none"><FaArrowLeft /> {backLabel}</Link>
        {isStaff && (
          <Link to={`/dashboard/athletes/${id}/edit`} className="btn-gold text-decoration-none"><FaEdit /> Edit Profile</Link>
        )}
      </div>

      <div className="profile-premium-hero glass-card">
        <AthleteAvatar athlete={profile} size={110} />
        <div className="flex-grow-1">
          <h2 className="page-heading mb-1">{profile.full_name}</h2>
          <p className="page-subtitle">{profile.sport} · {profile.team || 'Independent'}</p>
          <span className={`badge-pill badge-${profile.status === 'Active' ? 'active' : profile.status === 'Injured' ? 'injured' : 'inactive'}`}>
            {profile.status}
          </span>
        </div>
        <div className="profile-metrics-grid">
          {metrics.map((m) => (
            <div className="profile-metric-card" key={m.label}>
              <span className="val">{m.val}</span>
              <span className="lbl">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4"><ReadinessGauge score={82} /></div>
        <div className="col-lg-4"><InjuryRiskGauge stats={{ active_injuries: profile.active_injuries?.length || 0, attendanceRate: 90, recoveryScore: 78 }} /></div>
        <div className="col-lg-4"><PerformanceRadar scores={radarScores} /></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="glass-card">
            <h6 className="analytics-card-title">Personal Information</h6>
            <div className="info-grid-premium">
              {infoItems.map((item) => (
                <div className="info-item-premium" key={item.label}>
                  <item.icon />
                  <div>
                    <small>{item.label}</small>
                    <strong>{item.val || '—'}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <ActivityTimeline events={[
            { icon: FaEdit, title: `Profile viewed — ${profile.full_name}`, time: 'Just now', type: 'recovery' },
            ...(profile.latest_performance ? [{ icon: FaChartLine, title: 'Performance record updated', time: '2d ago', type: 'comp' }] : []),
            ...(activeInjury ? [{ icon: FaBandAid, title: `Injury — ${activeInjury.injury_type}`, time: '5d ago', type: 'injury' }] : []),
          ]} />
        </div>
      </div>

      {activeInjury && (
        <div className="glass-card mb-4">
          <h6 className="analytics-card-title">Return-to-Play Workflow</h6>
          <p className="mb-3" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            <strong>{activeInjury.injury_type}</strong> — {activeInjury.body_part} · {activeInjury.severity} · {activeInjury.recovery_status}
          </p>
          <div className="rtp-workflow">
            {rtpSteps.map((s, i) => (
              <span key={s} className={`rtp-step ${i <= 2 ? 'active' : ''}`}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {lp && Object.keys(lp).length > 0 && (
        <div className="glass-card">
          <h6 className="analytics-card-title">Latest Performance Metrics</h6>
          <div className="profile-metrics-grid">
            {['speed_score', 'strength_score', 'endurance_score', 'flexibility_score', 'agility_score'].map((k) => (
              <div className="profile-metric-card" key={k}>
                <span className="val">{lp[k] ?? '—'}</span>
                <span className="lbl">{k.replace('_score', '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}