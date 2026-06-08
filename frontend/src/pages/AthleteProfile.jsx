/**
 * Athlete profile with large photo — AthleteForge theme.
 */
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { athletesAPI } from '../services/api'
import { FaEdit, FaArrowLeft, FaChartLine, FaBandAid, FaTrophy, FaClipboardCheck } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import AthleteAvatar from '../components/AthleteAvatar'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AthleteProfile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    athletesAPI.getProfile(id).then(res => setProfile(res.data))
      .catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner message="Loading profile..." fullScreen />
  if (!profile) return <div className="alert-custom alert-danger-custom">Athlete not found.</div>

  return (
    <div className="animate-in">
      <div className="d-flex justify-content-between mb-3">
        <Link to="/dashboard/athletes" className="btn-outline-navy text-decoration-none"><FaArrowLeft /> Back</Link>
        <Link to={`/dashboard/athletes/${id}/edit`} className="btn-gold text-decoration-none"><FaEdit /> Edit</Link>
      </div>

      <div className="profile-hero">
        <AthleteAvatar athlete={profile} size={100} />
        <div className="profile-hero-info">
          <h3>{profile.full_name}</h3>
          <p>{profile.sport} · {profile.team || 'No Team'}</p>
          <span className={`badge-pill badge-${profile.status === 'Active' ? 'active' : profile.status === 'Injured' ? 'injured' : 'inactive'}`}>
            {profile.status}
          </span>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3"><StatCard icon={FaChartLine} value={profile.performance_count} label="Performance" variant="primary" /></div>
        <div className="col-6 col-md-3"><StatCard icon={FaBandAid} value={profile.injury_count} label="Injuries" variant="danger" /></div>
        <div className="col-6 col-md-3"><StatCard icon={FaTrophy} value={profile.competition_count} label="Competitions" variant="gold" /></div>
        <div className="col-6 col-md-3"><StatCard icon={FaClipboardCheck} value={profile.attendance_count} label="Attendance" variant="success" /></div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card-panel">
            <h5 className="card-panel-title">Personal Info</h5>
            <table className="table-custom">
              <tbody>
                {[['Email', profile.email], ['Phone', profile.phone], ['DOB', profile.date_of_birth],
                  ['Age', `${profile.age} yrs`], ['Gender', profile.gender],
                  ['Height', profile.height_cm ? `${profile.height_cm} cm` : '—']
                ].map(([k, v]) => (
                  <tr key={k}><td style={{ color: 'var(--af-gold)', fontWeight: 600 }}>{k}</td><td>{v || '—'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-md-6">
          {profile.latest_performance && (
            <div className="card-panel">
              <h5 className="card-panel-title">Latest Performance</h5>
              <div className="row g-2">
                {['speed_score', 'strength_score', 'endurance_score', 'flexibility_score', 'agility_score'].map(k => (
                  <div className="col-4" key={k}>
                    <div className="metric-pill">
                      <div className="value">{profile.latest_performance[k] || '—'}</div>
                      <div className="label">{k.replace('_score', '')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.active_injuries?.length > 0 && (
            <div className="card-panel">
              <h5 className="card-panel-title">Active Injuries</h5>
              {profile.active_injuries.map(inj => (
                <div key={inj.id} className="p-3 mb-2" style={{ background: 'rgba(239,68,68,0.08)', borderRadius: 8, borderLeft: '3px solid #ef4444' }}>
                  <strong>{inj.injury_type}</strong> — {inj.body_part}
                  <br /><small style={{ color: 'var(--text-muted)' }}>{inj.recovery_status}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}