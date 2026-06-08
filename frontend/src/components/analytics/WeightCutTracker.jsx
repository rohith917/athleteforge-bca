import { useMemo } from 'react'
import { FaWeight, FaBullseye } from 'react-icons/fa'
import { calcWeightCutProgress } from '../../utils/metricsEngine'

export default function WeightCutTracker({ records = [], targetWeight = null }) {
  const latest = records[0]
  const progress = useMemo(
    () => calcWeightCutProgress(records, targetWeight),
    [records, targetWeight]
  )

  if (!latest) return null

  return (
    <div className="glass-card weight-cut-panel">
      <h6 className="analytics-card-title"><FaWeight className="me-2" />Combat Sports — Weight Cut</h6>
      <div className="weight-cut-grid">
        <div className="wc-stat">
          <small>Current Weight</small>
          <strong>{latest.weight_kg} kg</strong>
        </div>
        <div className="wc-stat">
          <small>Target Weight</small>
          <strong>{progress.target} kg</strong>
        </div>
        <div className="wc-stat">
          <small>Progress</small>
          <strong className="text-gold">{progress.percent}%</strong>
        </div>
        <div className="wc-stat">
          <small>Est. Completion</small>
          <strong>{progress.estimatedDate}</strong>
        </div>
      </div>
      <div className="progress-luxury mt-3">
        <div className="progress-luxury-fill" style={{ width: `${progress.percent}%`, background: 'linear-gradient(90deg, #D4AF37, #F5C542)' }} />
      </div>
      <p className="weight-cut-note mt-2">
        <FaBullseye className="me-1" />
        {progress.remaining > 0
          ? `${progress.remaining.toFixed(1)} kg to cut · ${progress.daysLeft} days estimated`
          : 'Target weight achieved — competition ready'}
      </p>
    </div>
  )
}