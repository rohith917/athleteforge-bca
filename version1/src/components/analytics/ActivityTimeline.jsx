import { FaWeight, FaBandAid, FaTrophy, FaClipboardCheck, FaHeart } from 'react-icons/fa'

const EVENTS = [
  { icon: FaHeart, title: 'Recovery milestone achieved', time: '2h ago', type: 'recovery' },
  { icon: FaWeight, title: 'Weight updated — 75.4 kg', time: '5h ago', type: 'weight' },
  { icon: FaBandAid, title: 'Injury reported — Knee strain', time: '1d ago', type: 'injury' },
  { icon: FaTrophy, title: 'Competition result added — Gold', time: '2d ago', type: 'comp' },
  { icon: FaClipboardCheck, title: 'Attendance logged — Present', time: '3d ago', type: 'attendance' },
]

export default function ActivityTimeline({ events = EVENTS }) {
  return (
    <div className="activity-timeline glass-card">
      <h6 className="analytics-card-title">Activity Timeline</h6>
      <div className="timeline-list">
        {events.map((e, i) => (
          <div className={`timeline-item type-${e.type}`} key={i}>
            <div className="timeline-icon"><e.icon /></div>
            <div className="timeline-body">
              <strong>{e.title}</strong>
              <small>{e.time}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}