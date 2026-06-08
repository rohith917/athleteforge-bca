/**
 * Coach tips for recording exercises and athlete performance.
 */
import { FaClipboardList, FaLightbulb } from 'react-icons/fa'

const tips = [
  {
    title: 'Record baseline metrics first',
    text: 'Capture speed, strength, endurance, flexibility, and agility scores before starting any new program.',
  },
  {
    title: 'Use consistent test conditions',
    text: 'Run drills at the same time of day, surface, and warm-up routine so progress comparisons stay reliable.',
  },
  {
    title: 'Log injuries immediately',
    text: 'Document injury type, severity, and recovery status the same day — delays make trend analysis inaccurate.',
  },
  {
    title: 'Track attendance with context',
    text: 'Mark present/absent and add short notes for missed sessions (illness, travel, rest day).',
  },
  {
    title: 'Review AI insights weekly',
    text: 'Use AthleteForge AI suggestions to spot fatigue patterns and adjust training load before competitions.',
  },
  {
    title: 'Export reports before events',
    text: 'Download PDF/Excel reports from the Reports module to share readiness data with staff and selectors.',
  },
]

export default function CoachTips() {
  return (
    <div className="card-panel dashboard-feature-panel animate-in">
      <div className="dashboard-feature-header">
        <h5 className="card-panel-title mb-0"><FaLightbulb /> Coach Tips & Guides</h5>
        <span className="feature-badge"><FaClipboardList /> Best Practices</span>
      </div>
      <div className="coach-tips-list">
        {tips.map((tip, i) => (
          <div className="coach-tip-item" key={tip.title}>
            <span className="coach-tip-num">{i + 1}</span>
            <div>
              <strong>{tip.title}</strong>
              <p>{tip.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}