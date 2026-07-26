const STEPS = [
  'Injured',
  'Rehabilitation',
  'Light Training',
  'Modified Training',
  'Full Training',
  'Competition Ready',
]

const STATUS_MAP = {
  Recovering: 1,
  'Ongoing Treatment': 0,
  Recovered: 5,
}

export function getRTPStep(recoveryStatus, severity) {
  if (recoveryStatus === 'Recovered') return 5
  let step = STATUS_MAP[recoveryStatus] ?? 1
  if (severity === 'Severe' && step > 0) step = Math.max(0, step - 1)
  if (severity === 'Minor' && step < 4) step = Math.min(4, step + 1)
  return step
}

export default function RTPWorkflow({ recoveryStatus = 'Recovering', severity = 'Moderate', compact = false }) {
  const activeStep = getRTPStep(recoveryStatus, severity)

  return (
    <div className={`rtp-workflow ${compact ? 'rtp-compact' : ''}`}>
      {STEPS.map((label, i) => (
        <span key={label} className={`rtp-step ${i <= activeStep ? 'active' : ''}`} title={label}>
          {compact ? label.split(' ')[0] : label}
        </span>
      ))}
    </div>
  )
}