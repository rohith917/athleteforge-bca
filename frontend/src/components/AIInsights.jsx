/**
 * Rich AI insights — readiness, metrics, injury, plan, competition, weight
 */
import { useState, useEffect } from 'react'
import { aiAPI } from '../services/api'
import {
  FaBrain, FaChartLine, FaExclamationTriangle, FaClipboardList,
  FaTrophy, FaWeight, FaCalendarCheck, FaBolt, FaChevronDown, FaChevronUp,
} from 'react-icons/fa'
import LoadingSpinner from './LoadingSpinner'

function FactorBar({ label, value, color }) {
  return (
    <div className="ai-factor-bar">
      <div className="ai-factor-label">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="ai-factor-track">
        <div className="ai-factor-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}

function PriorityBadge({ priority }) {
  const colors = { high: '#ff3d3d', medium: '#ff9f43', low: '#c8f542' }
  return (
    <span className="ai-priority-badge" style={{ borderColor: colors[priority] || colors.low, color: colors[priority] }}>
      {priority}
    </span>
  )
}

export default function AIInsights({ athleteId = null, compact = false }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    setLoading(true)
    aiAPI.getInsights(athleteId ? { athlete_id: athleteId } : {})
      .then(res => setInsights(res.data))
      .catch(() => setError('Unable to load AI insights.'))
      .finally(() => setLoading(false))
  }, [athleteId])

  if (loading) return <LoadingSpinner message="Running deep AI analysis on performance data..." />
  if (error) return <div className="alert-custom alert-danger-custom">{error}</div>
  if (!insights) return null

  const readiness = insights.readiness_analysis
  const perf = insights.performance_insights
  const injury = insights.injury_risk
  const progress = insights.progress_summary
  const attendance = insights.attendance_analysis
  const competition = insights.competition_intel
  const weight = insights.weight_analysis
  const plan = insights.training_plan
  const brief = insights.coaching_brief

  if (compact) {
    return (
      <div className="ai-insight-card ai-risk-low">
        <strong>{insights.athlete_name}</strong>
        <p className="mb-1 mt-2" style={{ fontSize: '0.88rem' }}>{readiness?.summary || progress?.summary}</p>
        {injury?.alert && (
          <p className="mb-0" style={{ fontSize: '0.82rem', color: 'var(--af-warning)' }}>
            <FaExclamationTriangle className="me-1" />{injury.message}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="ai-panel ai-panel-rich animate-in">
      <div className="ai-panel-header">
        <div>
          <FaBrain /> AI Intelligence Report — {insights.athlete_name}
          <small className="d-block mt-1" style={{ opacity: 0.7, fontWeight: 400 }}>
            {insights.athlete_sport} · {insights.athlete_team || 'Team'} · Generated {insights.generated_at}
          </small>
        </div>
        <button type="button" className="ai-expand-btn" onClick={() => setExpanded(v => !v)}>
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {expanded && (
        <div className="ai-panel-body">
          {/* Executive brief */}
          <div className="ai-brief-block">
            <h6><FaBolt className="me-2" />Executive AI Brief</h6>
            <p>{brief}</p>
          </div>

          {/* Readiness + factors */}
          {readiness && (
            <div className="row g-3 mb-4">
              <div className="col-lg-4">
                <div className="ai-insight-card ai-readiness-card">
                  <h6>Readiness Score</h6>
                  <div className="ai-readiness-big">{readiness.score}%</div>
                  <div className="ai-readiness-status">{readiness.status}</div>
                  <p className="ai-readiness-verdict">{readiness.verdict}</p>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="ai-insight-card">
                  <h6>Factor Breakdown</h6>
                  {readiness.factors && (
                    <>
                      <FactorBar label="Performance" value={readiness.factors.performance} color="#ff3d3d" />
                      <FactorBar label="Attendance" value={readiness.factors.attendance} color="#c8f542" />
                      <FactorBar label="Injury Safety" value={readiness.factors.injury_safety} color="#60a5fa" />
                      <FactorBar label="Momentum" value={Math.min(100, 50 + (readiness.factors.momentum_bonus || 0) * 5)} color="#ff9f43" />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="row g-3 mb-4">
            {/* Performance */}
            <div className="col-lg-6">
              <div className="ai-insight-card">
                <h6><FaChartLine className="me-2" />Performance Analysis</h6>
                {perf?.available ? (
                  <>
                    <p><strong>{perf.headline}</strong></p>
                    <p className="ai-detail-text">{perf.recommendation}</p>
                    <small className="text-muted d-block mb-2">
                      {perf.sessions_analyzed} sessions · {perf.improving_count} improving · {perf.declining_count} declining
                    </small>
                    {perf.metrics?.map(m => (
                      <div key={m.metric} className="ai-metric-row ai-metric-rich">
                        <span>{m.label}</span>
                        <span>
                          <strong>{m.current}</strong>
                          <small className="ms-1 text-muted">(was {m.previous})</small>
                          <span className={`ms-2 ${m.trend === 'up' ? 'trend-up' : m.trend === 'down' ? 'trend-down' : ''}`}>
                            {m.change_percent > 0 ? '+' : ''}{m.change_percent}%
                          </span>
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="ai-detail-text">{perf?.message}</p>
                )}
              </div>
            </div>

            {/* Injury */}
            <div className="col-lg-6">
              <div className={`ai-insight-card ai-risk-${injury?.risk_level || 'low'}`}>
                <h6><FaExclamationTriangle className="me-2" />Injury Risk Engine</h6>
                <p className="ai-detail-text">{injury?.message}</p>
                <div className="ai-risk-score">Risk score: <strong>{injury?.risk_score}/100</strong></div>
                {injury?.risk_factors?.map((f, i) => (
                  <div key={i} className="ai-bullet">• {f}</div>
                ))}
                {injury?.injury_history?.length > 0 && (
                  <div className="ai-history-block mt-3">
                    <strong>Recent injury history</strong>
                    {injury.injury_history.map((h, i) => (
                      <div key={i} className="ai-history-item">
                        {h.type} ({h.body_part}) — {h.severity}, {h.status} · {h.date}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3">
                  <strong style={{ fontSize: '0.78rem' }}>Prevention protocol</strong>
                  {injury?.prevention_tips?.map((t, i) => (
                    <div key={i} className="ai-bullet">{i + 1}. {t}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            {/* Training plan */}
            <div className="col-lg-4">
              <div className="ai-insight-card">
                <h6><FaClipboardList className="me-2" />Weekly AI Training Plan</h6>
                <p className="ai-plan-priority">{plan?.priority}</p>
                <ul className="ai-plan-list">
                  {plan?.items?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <small className="text-muted">Recommended sessions: {plan?.session_count_recommended}/week</small>
              </div>
            </div>

            {/* Attendance */}
            <div className="col-lg-4">
              <div className="ai-insight-card">
                <h6><FaCalendarCheck className="me-2" />Attendance Intelligence</h6>
                <div className="ai-stat-row">
                  <span className="ai-stat-big">{attendance?.rate_60d}%</span>
                  <span className="ai-stat-label">{attendance?.grade}</span>
                </div>
                <p className="ai-detail-text">{attendance?.recommendation}</p>
                <div className="ai-mini-stats">
                  <span>Present: {attendance?.present}</span>
                  <span>Absent: {attendance?.absent}</span>
                  <span>Late: {attendance?.late}</span>
                </div>
              </div>
            </div>

            {/* Competition */}
            <div className="col-lg-4">
              <div className="ai-insight-card">
                <h6><FaTrophy className="me-2" />Competition Intel</h6>
                <p className="ai-detail-text">{competition?.summary}</p>
                {competition?.medals && (
                  <div className="ai-mini-stats">
                    <span>🥇 {competition.medals.Gold}</span>
                    <span>🥈 {competition.medals.Silver}</span>
                    <span>🥉 {competition.medals.Bronze}</span>
                  </div>
                )}
                {competition?.recent_results?.slice(0, 2).map((r, i) => (
                  <div key={i} className="ai-history-item">
                    {r.event} ({r.level}) — {r.medal !== 'None' ? r.medal : `P${r.position || '?'}`}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weight + action items + progress */}
          <div className="row g-3">
            {weight?.available && (
              <div className="col-lg-4">
                <div className="ai-insight-card">
                  <h6><FaWeight className="me-2" />Body Composition</h6>
                  <p className="ai-detail-text">{weight.summary}</p>
                  <div className="ai-mini-stats">
                    <span>{weight.weight_kg} kg</span>
                    {weight.bmi && <span>BMI {weight.bmi}</span>}
                    {weight.body_fat && <span>{weight.body_fat}% fat</span>}
                  </div>
                </div>
              </div>
            )}
            <div className={weight?.available ? 'col-lg-8' : 'col-12'}>
              <div className="ai-insight-card">
                <h6>Priority Action Items</h6>
                <div className="ai-action-list">
                  {insights.action_items?.map((item, i) => (
                    <div key={i} className="ai-action-item">
                      <PriorityBadge priority={item.priority} />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="row g-2 mt-3">
                  <div className="col-4">
                    <div className="metric-pill">
                      <div className="value">{progress?.overall_average}</div>
                      <div className="label">Avg Score</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="metric-pill">
                      <div className="value">{progress?.performance_grade}</div>
                      <div className="label">Grade</div>
                    </div>
                  </div>
                  <div className="col-4">
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
      )}
    </div>
  )
}