/**
 * MDNT-style technology command center — AI, voice, live readiness, recovery AI
 */
import { FaBrain, FaMicrophone, FaWaveSquare, FaRobot } from 'react-icons/fa'
import MarqueeBand from '../landing/MarqueeBand'
import LiveReadinessOrb from '../landing/LiveReadinessOrb'
import VoiceCoachTip from './VoiceCoachTip'
import SmartRecoveryTimeline from './SmartRecoveryTimeline'

export default function TechCommandHub({ athleteId = null, role = 'coach', readinessScore = null }) {
  const marqueeItems = role === 'student'
    ? ['My Readiness', 'AI Coach', 'Voice Tips', 'Recovery AI']
    : role === 'admin'
      ? ['System AI', 'Live Analytics', 'Risk Engine', 'Voice Alerts']
      : ['Team AI', 'Live Readiness', 'Injury Predict', 'Voice Coach']

  return (
    <section className="tech-command-hub animate-in">
      <MarqueeBand items={marqueeItems} duration={22} accent />

      <div className="tech-command-hub-header">
        <h3>AI Command Center</h3>
        <div className="tech-badges">
          <span className="tech-badge ai"><FaBrain /> Neural Insights</span>
          <span className="tech-badge live"><FaWaveSquare /> Live Fusion</span>
          <span className="tech-badge"><FaMicrophone /> Voice API</span>
          <span className="tech-badge"><FaRobot /> Risk Engine</span>
        </div>
      </div>

      <div className="tech-command-grid">
        <div className="tech-command-cell mdnt-readiness-compact">
          <h4>Live Readiness Orb</h4>
          <LiveReadinessOrb initialScore={readinessScore ?? (role === 'student' ? 82 : 78)} />
        </div>
        <div className="tech-command-cell">
          <h4>Voice Coach Tip</h4>
          <VoiceCoachTip athleteId={athleteId} />
        </div>
        <div className="tech-command-cell">
          <h4>Smart Recovery Timeline</h4>
          <SmartRecoveryTimeline athleteId={athleteId} />
        </div>
      </div>
    </section>
  )
}