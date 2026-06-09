import { FaLightbulb, FaHeartbeat, FaClipboardCheck, FaBandAid } from 'react-icons/fa'

const tips = [
  { icon: FaHeartbeat, title: 'Log wellness daily', text: 'Update sleep, soreness, and readiness scores before each session.' },
  { icon: FaClipboardCheck, title: 'Check attendance streak', text: 'Consistent attendance improves recovery scores and coach visibility.' },
  { icon: FaLightbulb, title: 'Review performance trends', text: 'Compare speed and endurance charts weekly to spot progress or fatigue.' },
  { icon: FaBandAid, title: 'Report pain early', text: 'Notify your coach at the first sign of discomfort to prevent serious injury.' },
]

export default function StudentTrainingTips() {
  return (
    <div className="glass-card student-tips-panel">
      <h6 className="analytics-card-title mb-3"><FaLightbulb className="me-2" />Training Tips</h6>
      <div className="student-tips-list">
        {tips.map((tip) => (
          <div key={tip.title} className="student-tip-item">
            <tip.icon className="student-tip-icon" />
            <div>
              <strong>{tip.title}</strong>
              <p className="mb-0">{tip.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}