/**
 * Training courses and programs for coach/admin dashboards.
 */
import { FaRunning, FaDumbbell, FaHeartbeat, FaMountain, FaBolt, FaBookOpen } from 'react-icons/fa'

const programs = [
  {
    icon: FaBolt,
    title: 'Speed Training',
    desc: 'Sprint drills, acceleration work, and reaction-time sessions.',
    level: 'Intermediate',
    duration: '6 weeks',
  },
  {
    icon: FaDumbbell,
    title: 'Strength & Conditioning',
    desc: 'Power lifts, plyometrics, and sport-specific resistance training.',
    level: 'All Levels',
    duration: '8 weeks',
  },
  {
    icon: FaHeartbeat,
    title: 'Stamina Building',
    desc: 'VO2 max intervals, tempo runs, and recovery-paced sessions.',
    level: 'Beginner',
    duration: '5 weeks',
  },
  {
    icon: FaMountain,
    title: 'Endurance Program',
    desc: 'Long-distance conditioning with progressive overload planning.',
    level: 'Advanced',
    duration: '10 weeks',
  },
  {
    icon: FaRunning,
    title: 'Agility & Mobility',
    desc: 'Cone drills, ladder work, and dynamic flexibility routines.',
    level: 'Intermediate',
    duration: '4 weeks',
  },
  {
    icon: FaBookOpen,
    title: 'Recovery & Rehab',
    desc: 'Injury-safe return-to-play protocols and load management.',
    level: 'Coach Led',
    duration: 'Ongoing',
  },
]

export default function TrainingPrograms() {
  return (
    <div className="card-panel dashboard-feature-panel animate-in">
      <div className="dashboard-feature-header">
        <h5 className="card-panel-title mb-0"><FaDumbbell /> Training Courses & Programs</h5>
        <span className="feature-badge">6 Programs</span>
      </div>
      <div className="program-grid">
        {programs.map((p) => (
          <div className="program-card" key={p.title}>
            <div className="program-icon"><p.icon /></div>
            <div>
              <h6>{p.title}</h6>
              <p>{p.desc}</p>
              <div className="program-meta">
                <span>{p.level}</span>
                <span>{p.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}