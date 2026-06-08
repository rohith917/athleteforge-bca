/**
 * Founder credit — shown across public and dashboard UI.
 */
import { FaUserTie } from 'react-icons/fa'

const FOUNDER_NAME = 'Rohith Gowda V'

export function FounderBadge({ className = '' }) {
  return (
    <span className={`founder-badge ${className}`.trim()}>
      <FaUserTie /> Founder — {FOUNDER_NAME}
    </span>
  )
}

export function FounderLine({ className = '' }) {
  return (
    <p className={`founder-line ${className}`.trim()}>
      Founded by <strong>{FOUNDER_NAME}</strong>
    </p>
  )
}

export default function FounderCredit({ variant = 'line', className = '' }) {
  return variant === 'badge' ? <FounderBadge className={className} /> : <FounderLine className={className} />
}