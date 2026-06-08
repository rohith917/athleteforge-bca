/**
 * Rule-based AI insights widget — performance, injury risk, progress summary.
 */
import { useState, useEffect } from 'react'
import { aiAPI } from '../services/api'
import { FaBrain, FaChartLine, FaExclamationTriangle, FaClipboardList } from 'react-icons/fa'
import LoadingSpinner from './LoadingSpinner'

export default function AIInsights({ athleteId = null, compact = false }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    aiAPI.getInsights(athleteId ? { athlete_id: athleteId } : {})
      .then(res => setInsights(res.data))
      .catch(() => setError('Unable to load AI insights.'))
      .finally(() => setLoading(false))
  }, [athleteId])

  if (loading) return <LoadingSpinner message="Analyzing performance data..." />
  if (error) return <div className="alert-custom alert-danger-custom">{error}</div>
  if (!insights) return null

  const perf = insights.performance_insights
  const injury = insights.injury_risk
  const progress = insights.progress_summary

  if (compact) {
    return (
      <div className="ai-insight-card ai-risk-low">
        <strong style={{ color: 'var(--af-gold)' }}>{insights.athlete_name}</strong>
        <p className="mb-1 mt-2" style={{ fontSize: '0.88rem' }}>{progress?.summary}</p>
        {injury?.alert && (
          <p className="mb-0" style={{ fontSize: '0.82rem', color: 'var(--af-warning)' }}>
            <FaExclamationTriangle className="me-1" />{injury.message}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="ai-panel animate-in">
      <div className="ai-panel-header">
        <FaBrain /> AI Performance Assistant — {insights.athlete_name}
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="ai-insight-card">
            <h6 className="mb-3" style={{ color: 'var(--af-gold)' }}>
              <FaChartLine className="me-2" />Performance Insights
            </h6>
            {perf?.available ? (
              <>
                <p className="mb-2" style={{ fontSize: '0.9rem' }}><strong>{perf.headline}</strong></p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{perf.recommendation}</p>
                {perf.metrics?.slice(0, 3).map(m => (
                  <div key={m.metric} className="ai-metric-row">
                    <span>{m.label}</span>
                    <span className={m.trend === 'up' ? 'trend-up' : m.trend === 'down' ? 'trend-down' : ''}>
                      {m.change_percent > 0 ? '+' : ''}{m.change_percent}%
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{perf?.message}</p>
            )}
          </div>
        </div>

        <div className="col-md-4">
          <div className={`ai-insight-card ai-risk-${injury?.risk_level || 'low'}`}>
            <h6 className="mb-3" style={{ color: 'var(--af-warning)' }}>
              <FaExclamationTriangle className="me-2" />Injury Risk Alert
            </h6>
            <p style={{ fontSize: '0.85rem' }}>{injury?.message}</p>
            <div className="mt-2" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Risk level: <strong style={{ textTransform: 'uppercase' }}>{injury?.risk_level}</strong>
              {' · '}Active: {injury?.active_injuries} · Recent: {injury?.recent_injuries}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="ai-insight-card">
            <h6 className="mb-3" style={{ color: 'var(--af-success)' }}>
              <FaClipboardList className="me-2" />Progress Summary
            </h6>
            <p style={{ fontSize: '0.85rem' }}>{progress?.summary}</p>
            <div className="row g-2 mt-2">
              <div className="col-6">
                <div className="metric-pill">
                  <div className="value">{progress?.overall_average}</div>
                  <div className="label">Avg Score</div>
                </div>
              </div>
              <div className="col-6">
                <div className="metric-pill">
                  <div className="value">{progress?.attendance_rate}%</div>
                  <div className="label">Attendance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}