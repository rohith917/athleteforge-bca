/**
 * MDNT marquee strips inside the dashboard — matches landing energy
 */
import MarqueeBand from '../landing/MarqueeBand'

const TRACK_ITEMS = [
  'READINESS', 'PERFORMANCE', 'RECOVERY', 'FORGE AI', 'INJURY INTEL',
  'ATTENDANCE', 'COMPETITION', 'TRAINING LOAD',
]

const LIVE_ITEMS = [
  'LIVE ANALYTICS', 'VOICE COACH', 'SMART PLAN', 'MDNT MODE', 'LIME ENERGY',
]

export default function DashboardMarquee() {
  return (
    <div className="dashboard-marquee-stack" aria-hidden="true">
      <MarqueeBand items={TRACK_ITEMS} duration={32} accent />
      <MarqueeBand items={LIVE_ITEMS} duration={22} reverse />
    </div>
  )
}